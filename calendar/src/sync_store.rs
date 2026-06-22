//! Sync metadata store (non-strategy-critical SQLite). Tracks how each local
//! timebox maps to each provider. Losing this DB = full re-sync, not data loss,
//! so it does NOT violate INV-DUR (markdown stays the event source of truth).

use std::path::Path;
use std::sync::Mutex;

use rusqlite::{params, Connection};

use crate::model::{SyncMetadata, SyncStatus};

pub struct SyncMetadataStore {
    conn: Mutex<Connection>,
}

impl SyncMetadataStore {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, String> {
        let conn = Connection::open(path).map_err(|e| e.to_string())?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS sync_metadata (
                timebox_id        TEXT NOT NULL,
                provider          TEXT NOT NULL,
                provider_event_id TEXT,
                provider_href     TEXT,
                uid               TEXT,
                etag              TEXT,
                sync_status       TEXT NOT NULL DEFAULT 'synced',
                last_synced_at    TEXT,
                PRIMARY KEY (timebox_id, provider)
            );",
        )
        .map_err(|e| e.to_string())?;
        Ok(Self { conn: Mutex::new(conn) })
    }

    pub fn in_memory() -> Result<Self, String> {
        let conn = Connection::open_in_memory().map_err(|e| e.to_string())?;
        conn.execute_batch(
            "CREATE TABLE sync_metadata (
                timebox_id        TEXT NOT NULL,
                provider          TEXT NOT NULL,
                provider_event_id TEXT,
                provider_href     TEXT,
                uid               TEXT,
                etag              TEXT,
                sync_status       TEXT NOT NULL DEFAULT 'synced',
                last_synced_at    TEXT,
                PRIMARY KEY (timebox_id, provider)
            );",
        )
        .map_err(|e| e.to_string())?;
        Ok(Self { conn: Mutex::new(conn) })
    }

    pub fn put(&self, m: &SyncMetadata) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO sync_metadata
             (timebox_id, provider, provider_event_id, provider_href, uid, etag,
              sync_status, last_synced_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                m.timebox_id, m.provider, m.provider_event_id, m.provider_href,
                m.uid, m.etag, status_str(m.sync_status), m.last_synced_at,
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get(&self, timebox_id: &str, provider: &str) -> Result<Option<SyncMetadata>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT timebox_id, provider, provider_event_id, provider_href, uid,
                        etag, sync_status, last_synced_at
                 FROM sync_metadata WHERE timebox_id = ?1 AND provider = ?2",
            )
            .map_err(|e| e.to_string())?;
        let row = stmt
            .query_row(params![timebox_id, provider], |r| {
                Ok(SyncMetadata {
                    timebox_id: r.get(0)?,
                    provider: r.get(1)?,
                    provider_event_id: r.get(2)?,
                    provider_href: r.get(3)?,
                    uid: r.get(4)?,
                    etag: r.get(5)?,
                    sync_status: parse_status(&r.get::<_, String>(6)?),
                    last_synced_at: r.get(7)?,
                })
            });
        match row {
            Ok(m) => Ok(Some(m)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    /// All metadata rows whose sync_status is not Synced (the push queue).
    pub fn pending(&self) -> Result<Vec<SyncMetadata>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT timebox_id, provider, provider_event_id, provider_href, uid,
                        etag, sync_status, last_synced_at
                 FROM sync_metadata WHERE sync_status != 'synced'",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |r| {
                Ok(SyncMetadata {
                    timebox_id: r.get(0)?,
                    provider: r.get(1)?,
                    provider_event_id: r.get(2)?,
                    provider_href: r.get(3)?,
                    uid: r.get(4)?,
                    etag: r.get(5)?,
                    sync_status: parse_status(&r.get::<_, String>(6)?),
                    last_synced_at: r.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r.map_err(|e| e.to_string())?);
        }
        Ok(out)
    }

    pub fn delete(&self, timebox_id: &str, provider: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM sync_metadata WHERE timebox_id = ?1 AND provider = ?2",
            params![timebox_id, provider],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }
}

fn status_str(s: SyncStatus) -> &'static str {
    match s {
        SyncStatus::Synced => "synced",
        SyncStatus::PendingCreate => "pending_create",
        SyncStatus::PendingUpdate => "pending_update",
        SyncStatus::PendingDelete => "pending_delete",
        SyncStatus::Conflict => "conflict",
        SyncStatus::Error => "error",
    }
}

fn parse_status(s: &str) -> SyncStatus {
    match s {
        "pending_create" => SyncStatus::PendingCreate,
        "pending_update" => SyncStatus::PendingUpdate,
        "pending_delete" => SyncStatus::PendingDelete,
        "conflict" => SyncStatus::Conflict,
        "error" => SyncStatus::Error,
        _ => SyncStatus::Synced,
    }
}
