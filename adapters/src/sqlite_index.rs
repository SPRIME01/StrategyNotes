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
            "            CREATE TABLE IF NOT EXISTS nodes (
                id    TEXT PRIMARY KEY,
                type  TEXT NOT NULL,
                body  TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS edges (
                from_id   TEXT NOT NULL,
                to_id     TEXT NOT NULL,
                edge_type TEXT NOT NULL,
                status    TEXT NOT NULL,
                PRIMARY KEY (from_id, to_id, edge_type)
            );
            CREATE INDEX IF NOT EXISTS idx_edges_to     ON edges(to_id);
            CREATE INDEX IF NOT EXISTS idx_nodes_type   ON nodes(type);
            CREATE INDEX IF NOT EXISTS idx_nodes_title  ON nodes(title);
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
        // FTS5 index is rebuilt from scratch each time (contentless virtual table).
        tx.execute_batch(
            "DELETE FROM edges; DELETE FROM nodes; DELETE FROM body_refs;
             DROP TABLE IF EXISTS nodes_fts;
             CREATE VIRTUAL TABLE nodes_fts USING fts5(
                 node_id UNINDEXED, type UNINDEXED, content,
                 tokenize = 'unicode61'
             );",
        )
        .map_err(rusqlite_err)?;
        for node in &nodes {
            let id = node.id.to_lexical();
            let ty = snake_case_name(node.ty);
            let title = node
                .frontmatter
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            // FTS5 content = body + key frontmatter fields (title/thesis/
            // statement/objective/...). unicode61 handles case-folding.
            let fts_content = strategynotes_core::search::search_text_of(node);
            tx.execute(
                "INSERT OR REPLACE INTO nodes (id, type, body, title) VALUES (?1, ?2, ?3, ?4)",
                params![id, ty, node.body, title],
            )
            .map_err(rusqlite_err)?;
            tx.execute(
                "INSERT INTO nodes_fts (node_id, type, content) VALUES (?1, ?2, ?3)",
                params![id, ty, fts_content],
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
        let id_lex = id.to_lexical();
        // Title of the target node, so [[Title]] wikilinks resolve to it.
        let title: String = conn
            .query_row(
                "SELECT title FROM nodes WHERE id = ?1",
                [&id_lex],
                |r| r.get::<_, String>(0),
            )
            .unwrap_or_default();
        // Backlinks = typed edges + body refs by id + body refs by title
        // (so [[GodSpeed MVP]] in a body surfaces as a backlink on the node
        // whose title is "GodSpeed MVP").
        let sql = if title.is_empty() {
            "SELECT from_id FROM edges WHERE to_id = ?1
             UNION
             SELECT from_id FROM body_refs WHERE target = ?1"
        } else {
            "SELECT from_id FROM edges WHERE to_id = ?1
             UNION
             SELECT from_id FROM body_refs WHERE target = ?1
             UNION
             SELECT from_id FROM body_refs WHERE target = ?2"
        };
        let mut stmt = conn.prepare(sql).map_err(rusqlite_err)?;
        let rows: Result<Vec<NodeId>, Error> = if title.is_empty() {
            stmt.query_map([&id_lex], |r| r.get::<_, String>(0))
                .map_err(rusqlite_err)?
                .map(|r| { let s = r.map_err(rusqlite_err)?; NodeId::parse(&s).map_err(Error::from) })
                .collect()
        } else {
            stmt.query_map(params![&id_lex, &title], |r| r.get::<_, String>(0))
                .map_err(rusqlite_err)?
                .map(|r| { let s = r.map_err(rusqlite_err)?; NodeId::parse(&s).map_err(Error::from) })
                .collect()
        };
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

    fn search(&self, query: &str) -> Result<Vec<strategynotes_core::search::SearchResult>, Error> {
        // FTS5 MATCH. node_id/type UNINDEXED (col 0/1); content=2.
        // snippet() excerpts the content blob (col 2) around the match.
        let conn = self.conn.lock().unwrap();
        let sql = "SELECT node_id, type, snippet(nodes_fts, 2, '«', '»', '…', 12) \
                   FROM nodes_fts WHERE nodes_fts MATCH ?1 ORDER BY rank";
        let mut stmt = match conn.prepare(sql) {
            Ok(s) => s,
            // Malformed FTS5 query (special chars) -> empty results, not a crash.
            Err(_) => return Ok(Vec::new()),
        };
        let rows = match stmt.query_map(params![query], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?))
        }) {
            Ok(rs) => rs,
            Err(_) => return Ok(Vec::new()),
        };
        let mut out = Vec::new();
        for row in rows {
            let (id_s, ty_s, excerpt) = match row {
                Ok(v) => v,
                Err(_) => continue,
            };
            let ty: NodeType = from_snake_case::<NodeType>(&ty_s).unwrap_or(NodeType::Note);
            out.push(strategynotes_core::search::SearchResult {
                id: id_s,
                ty,
                excerpt,
            });
        }
        Ok(out)
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
