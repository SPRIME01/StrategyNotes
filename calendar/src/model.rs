//! Sync metadata model (Phase calendar). The non-strategy-critical state that
//! tracks how a local Timebox maps to a remote provider event. Markdown remains
//! the source of truth for the event itself; this is sync bookkeeping only.

use serde::{Deserialize, Serialize};

/// Where a timebox stands relative to a provider. Mirrors the spec's values.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SyncStatus {
    #[default]
    Synced,
    PendingCreate,
    PendingUpdate,
    PendingDelete,
    Conflict,
    Error,
}

/// Per-(timebox, provider) sync bookkeeping. None of these fields are
/// strategy-critical - losing them means a full re-sync, not data loss.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SyncMetadata {
    /// Lexical NodeId of the local timebox (markdown source of truth).
    pub timebox_id: String,
    /// google | microsoft | caldav | ics
    pub provider: String,
    pub provider_event_id: Option<String>,
    /// CalDAV object URL / Graph event id href.
    pub provider_href: Option<String>,
    /// iCalendar UID (NOT the local primary key).
    pub uid: Option<String>,
    /// Remote version / concurrency token.
    pub etag: Option<String>,
    pub sync_status: SyncStatus,
    pub last_synced_at: Option<String>,
}

/// A reference to a remote event returned by a provider adapter on create/update.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteEventRef {
    pub provider_event_id: Option<String>,
    pub provider_href: Option<String>,
    pub etag: Option<String>,
    pub uid: Option<String>,
}

/// Provider-side sync cursor (Google syncToken / Microsoft deltaLink / CalDAV
/// sync-token). Opaque to the engine; stored as-is per calendar.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SyncCursor {
    pub value: Option<String>,
}
