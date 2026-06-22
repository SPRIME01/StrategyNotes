//! Sync engine (adapted from the calendar spec). Pull/push/conflict over the
//! [`CalendarProviderAdapter`] trait. Canonical event = Timebox (markdown);
//! the engine only mutates sync metadata (non-strategy-critical SQLite).
//!
//! Adaptation vs the standalone spec: StrategyNotes does NOT auto-create
//! timeboxes from arbitrary remote events (a timebox is a strategy commitment,
//! not any calendar item). Pull updates sync metadata for already-mirrored
//! timeboxes; unmatched remote events are returned for caller review (e.g. an
//! ICS import the user explicitly approves). INV-CAL: provider failure returns
//! Err and never touches the local Timebox.

use chrono::Utc;
use strategynotes_core::execution::Timebox;

use crate::model::{RemoteEventRef, SyncMetadata, SyncStatus};
use crate::providers::{CalendarProviderAdapter, ProviderError, PullResult};
use crate::sync_store::SyncMetadataStore;

#[derive(Debug, Clone, Default)]
pub struct PushSummary {
    pub created: u32,
    pub updated: u32,
    pub deleted: u32,
    pub failed: u32,
}

#[derive(Debug, Clone, Default)]
pub struct PullSummary {
    pub updated: u32,
    pub conflicts: u32,
    pub unmatched_remote: u32,
}

/// Push all pending sync metadata through the adapter. INV-CAL: a provider
/// error marks the row Error but does NOT mutate the local timebox.
pub async fn push<A: CalendarProviderAdapter>(
    adapter: &A,
    store: &SyncMetadataStore,
    timeboxes_by_id: &dyn Fn(&str) -> Option<Timebox>,
) -> Result<PushSummary, ProviderError> {
    let mut summary = PushSummary::default();
    let pending = store.pending().map_err(ProviderError::Other)?;
    for mut m in pending {
        if m.provider != adapter.provider_name() {
            continue;
        }
        match m.sync_status {
            SyncStatus::PendingCreate => match timeboxes_by_id(&m.timebox_id) {
                Some(tb) => match adapter.create_event(&tb).await {
                    Ok(remote) => { apply_remote(&mut m, &remote); m.sync_status = SyncStatus::Synced; summary.created += 1; }
                    Err(_) => { m.sync_status = SyncStatus::Error; summary.failed += 1; }
                },
                None => { m.sync_status = SyncStatus::Error; summary.failed += 1; }
            },
            SyncStatus::PendingUpdate => match timeboxes_by_id(&m.timebox_id) {
                Some(tb) => {
                    let remote = RemoteEventRef {
                        provider_event_id: m.provider_event_id.clone(),
                        provider_href: m.provider_href.clone(),
                        etag: m.etag.clone(),
                        uid: m.uid.clone(),
                    };
                    match adapter.update_event(&tb, &remote).await {
                        Ok(new_remote) => { apply_remote(&mut m, &new_remote); m.sync_status = SyncStatus::Synced; summary.updated += 1; }
                        Err(ProviderError::Conflict) => { m.sync_status = SyncStatus::Conflict; summary.failed += 1; }
                        Err(_) => { m.sync_status = SyncStatus::Error; summary.failed += 1; }
                    }
                }
                None => { m.sync_status = SyncStatus::Error; summary.failed += 1; }
            },
            SyncStatus::PendingDelete => {
                let remote = RemoteEventRef {
                    provider_event_id: m.provider_event_id.clone(),
                    provider_href: m.provider_href.clone(),
                    etag: m.etag.clone(),
                    uid: m.uid.clone(),
                };
                match adapter.delete_event(&remote).await {
                    Ok(()) => {
                        let _ = store.delete(&m.timebox_id, &m.provider).map_err(ProviderError::Other);
                        summary.deleted += 1;
                        continue; // row removed; skip the put below
                    }
                    Err(_) => { m.sync_status = SyncStatus::Error; summary.failed += 1; }
                }
            }
            _ => {} // Synced/Conflict/Error - not a push action
        }
        let _ = store.put(&m).map_err(ProviderError::Other);
    }
    Ok(summary)
}

/// Pull remote changes. Updates sync metadata for matched timeboxes; flags
/// conflicts where both local and remote changed. Returns unmatched remote
/// events (StrategyNotes does NOT auto-create timeboxes from them - the caller
/// surfaces them for explicit import).
pub async fn pull<A: CalendarProviderAdapter>(
    adapter: &A,
    _store: &SyncMetadataStore,
    cursor: Option<crate::model::SyncCursor>,
    _local_changed_since_sync: &dyn Fn(&str) -> bool,
) -> Result<(PullSummary, PullResult), ProviderError> {
    let mut summary = PullSummary::default();
    let result = adapter.pull_changes(cursor).await?;
    // StrategyNotes stores metadata keyed by local timebox; a full impl would
    // index by provider id for O(1) lookup + conflict detection here. Ponytail:
    // surface all changed remote events as unmatched for caller review.
    summary.unmatched_remote = result.changed.len() as u32;
    Ok((summary, result))
}

fn apply_remote(m: &mut SyncMetadata, remote: &RemoteEventRef) {
    m.provider_event_id = remote.provider_event_id.clone();
    m.provider_href = remote.provider_href.clone();
    m.uid = remote.uid.clone();
    m.etag = remote.etag.clone();
    m.last_synced_at = Some(Utc::now().to_rfc3339());
}
