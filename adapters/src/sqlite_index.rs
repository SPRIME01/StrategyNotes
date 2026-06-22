//! SQLite derived index (Phase 3). Implements [`DerivedIndex`] as a rebuildable
//! cache over the markdown vault. Guards INV-DUR: the index holds no truth the
//! markdown lacks; deleting it and rebuilding yields equivalent query results.
//!
//! Concurrency: a single `Mutex<Connection>`. Ponytail: global lock is fine for
//! a local-first single-user app; per-collection locks if throughput matters later.

use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::{params, Connection};

use strategynotes_core::body::{parse_body, BodyRef, BodyRefKind};
use strategynotes_core::format;
use strategynotes_core::naming::{from_snake_case, snake_case_name};
use strategynotes_core::node::{NodeType, TypedEdge};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::{EdgeStatus, EdgeType, Error, NodeId};

#[derive(Debug)]
pub struct SQLiteIndex {
    conn: Mutex<Connection>,
    path: Option<PathBuf>, // None = in-memory
}

impl SQLiteIndex {
    /// Open an in-memory index (tests, ephemeral sessions).
    pub fn open_in_memory() -> Result<Self, Error> {
        let conn = Connection::open_in_memory().map_err(rusqlite_err)?;
        Self::init(&conn)?;
        Ok(Self { conn: Mutex::new(conn), path: None })
    }

    /// Open (or create) a file-backed index.
    pub fn open_file(path: impl AsRef<std::path::Path>) -> Result<Self, Error> {
        let path = path.as_ref().to_path_buf();
        let conn = Connection::open(&path).map_err(rusqlite_err)?;
        Self::init(&conn)?;
        Ok(Self { conn: Mutex::new(conn), path: Some(path) })
    }

    fn init(conn: &Connection) -> Result<(), Error> {
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS nodes (
                id   TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                body TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS edges (
                from_id   TEXT NOT NULL,
                to_id     TEXT NOT NULL,
                edge_type TEXT NOT NULL,
                status    TEXT NOT NULL,
                PRIMARY KEY (from_id, to_id, edge_type)
            );
            CREATE INDEX IF NOT EXISTS idx_edges_to   ON edges(to_id);
            CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
            CREATE TABLE IF NOT EXISTS body_refs (
                from_id TEXT NOT NULL,
                kind    TEXT NOT NULL,
                target  TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_body_target ON body_refs(target);",
        )
        .map_err(rusqlite_err)?;
        Ok(())
    }
}

impl DerivedIndex for SQLiteIndex {
    fn rebuild(&self, vault: &dyn NodeVault) -> Result<(), Error> {
        let nodes = vault.all()?;
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction().map_err(rusqlite_err)?;
        tx.execute_batch("DELETE FROM edges; DELETE FROM nodes; DELETE FROM body_refs;")
            .map_err(rusqlite_err)?;
        for node in &nodes {
            let id = node.id.to_lexical();
            let ty = snake_case_name(node.ty);
            tx.execute(
                "INSERT OR REPLACE INTO nodes (id, type, body) VALUES (?1, ?2, ?3)",
                params![id, ty, node.body],
            )
            .map_err(rusqlite_err)?;
            for edge in format::edges_of(node)? {
                tx.execute(
                    "INSERT OR REPLACE INTO edges (from_id, to_id, edge_type, status)
                     VALUES (?1, ?2, ?3, ?4)",
                    params![
                        edge.from.to_lexical(),
                        edge.to.to_lexical(),
                        snake_case_name(edge.edge_type),
                        snake_case_name(edge.status),
                    ],
                )
                .map_err(rusqlite_err)?;
            }
            // INV-BODY: body parsing is authoritative for inline refs/tags.
            for br in parse_body(&node.body) {
                tx.execute(
                    "INSERT INTO body_refs (from_id, kind, target) VALUES (?1, ?2, ?3)",
                    params![id, snake_case_name(br.kind), br.target],
                )
                .map_err(rusqlite_err)?;
            }
        }
        tx.commit().map_err(rusqlite_err)?;
        Ok(())
    }

    fn backlinks(&self, id: &NodeId) -> Result<Vec<NodeId>, Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT from_id FROM edges WHERE to_id = ?1
                 UNION
                 SELECT from_id FROM body_refs WHERE target = ?1",
            )
            .map_err(rusqlite_err)?;
        let rows: Result<Vec<NodeId>, Error> = stmt
            .query_map([id.to_lexical()], |r| r.get::<_, String>(0))
            .map_err(rusqlite_err)?
            .map(|r| {
                let s = r.map_err(rusqlite_err)?;
                NodeId::parse(&s).map_err(Error::from)
            })
            .collect();
        rows
    }

    fn out_edges(&self, id: &NodeId) -> Result<Vec<TypedEdge>, Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT to_id, edge_type, status FROM edges WHERE from_id = ?1")
            .map_err(rusqlite_err)?;
        let from = *id;
        let rows: Result<Vec<TypedEdge>, Error> = stmt
            .query_map([id.to_lexical()], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                ))
            })
            .map_err(rusqlite_err)?
            .map(|row| {
                let (to_s, ty_s, st_s) = row.map_err(rusqlite_err)?;
                Ok(TypedEdge {
                    from,
                    to: NodeId::parse(&to_s).map_err(Error::from)?,
                    edge_type: from_snake_case::<EdgeType>(&ty_s)?,
                    status: from_snake_case::<EdgeStatus>(&st_s)?,
                })
            })
            .collect();
        rows
    }

    fn nodes_by_type(&self, ty: NodeType) -> Result<Vec<NodeId>, Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id FROM nodes WHERE type = ?1")
            .map_err(rusqlite_err)?;
        let rows: Result<Vec<NodeId>, Error> = stmt
            .query_map([snake_case_name(ty)], |r| r.get::<_, String>(0))
            .map_err(rusqlite_err)?
            .map(|r| {
                let s = r.map_err(rusqlite_err)?;
                NodeId::parse(&s).map_err(Error::from)
            })
            .collect();
        rows
    }

    fn body_refs_of(&self, id: &NodeId) -> Result<Vec<BodyRef>, Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT kind, target FROM body_refs WHERE from_id = ?1")
            .map_err(rusqlite_err)?;
        let rows: Result<Vec<BodyRef>, Error> = stmt
            .query_map([id.to_lexical()], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, String>(1)?,
                ))
            })
            .map_err(rusqlite_err)?
            .map(|row| {
                let (k, t) = row.map_err(rusqlite_err)?;
                Ok(BodyRef {
                    kind: from_snake_case::<BodyRefKind>(&k)?,
                    target: t,
                })
            })
            .collect();
        rows
    }
}

// Drop the unused-path warning until the corrupt-recovery slice uses it.
impl SQLiteIndex {
    #[allow(dead_code)]
    pub fn path(&self) -> Option<&std::path::Path> {
        self.path.as_deref()
    }
}

fn rusqlite_err(e: rusqlite::Error) -> Error {
    Error::Contract(format!("sqlite: {e}"))
}
