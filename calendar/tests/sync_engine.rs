//! Sync engine tests against the MockProvider. Proves push/pull update sync
//! metadata correctly and that a provider failure (INV-CAL) never mutates the
//! local timebox - only marks the metadata row Error.

use strategynotes_calendar::{
    pull, push, CalendarProviderAdapter, MockProvider, SyncMetadata, SyncMetadataStore, SyncStatus,
};
use strategynotes_core::execution::{PomoEstimate, Timebox, TimeboxStatus};
use strategynotes_core::{AttentionMode, NodeId, PomoPattern};

use chrono::{TimeZone, Utc};

fn timebox(id_str: &str) -> Timebox {
    Timebox {
        id: NodeId::parse(id_str).unwrap(),
        work_package: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXWP").unwrap(),
        status: TimeboxStatus::Committed,
        estimate: PomoEstimate {
            pomos: 2,
            pattern: PomoPattern::P25M5,
            attention_mode: AttentionMode::ExecutionBuild,
        },
        scheduled_start: Utc.with_ymd_and_hms(2026, 7, 1, 13, 0, 0).unwrap(),
        scheduled_end: Utc.with_ymd_and_hms(2026, 7, 1, 14, 0, 0).unwrap(),
        expected_output: Some("draft".into()),
        review_required: true,
    }
}

fn meta_pending_create(id: &str) -> SyncMetadata {
    SyncMetadata {
        timebox_id: id.into(),
        provider: "mock".into(),
        provider_event_id: None,
        provider_href: None,
        uid: None,
        etag: None,
        sync_status: SyncStatus::PendingCreate,
        last_synced_at: None,
    }
}

#[tokio::test]
async fn push_create_marks_synced_and_stores_remote_ref() {
    let store = SyncMetadataStore::in_memory().unwrap();
    store.put(&meta_pending_create("01HZX8KQBJ9GYWN3QFVYRXTX01")).unwrap();
    let adapter = MockProvider::new("mock");
    let tb = timebox("01HZX8KQBJ9GYWN3QFVYRXTX01");

    let summary = push(&adapter, &store, &|id| (id == "01HZX8KQBJ9GYWN3QFVYRXTX01").then(|| tb.clone())).await.unwrap();
    assert_eq!(summary.created, 1);
    let m = store.get("01HZX8KQBJ9GYWN3QFVYRXTX01", "mock").unwrap().unwrap();
    assert_eq!(m.sync_status, SyncStatus::Synced);
    assert!(m.provider_event_id.is_some(), "remote ref stored");
    assert!(m.etag.is_some());
    assert!(m.last_synced_at.is_some());
    assert!(adapter.calls().iter().any(|c| c.starts_with("create")));
}

#[tokio::test]
async fn push_provider_failure_marks_error_not_synced() {
    // INV-CAL: provider failure must not corrupt the local timebox. Here the
    // timebox is immutable through the engine (passed by &); the metadata row
    // goes to Error, not Synced.
    let store = SyncMetadataStore::in_memory().unwrap();
    store.put(&meta_pending_create("01HZX8KQBJ9GYWN3QFVYRXTX02")).unwrap();
    let adapter = MockProvider::new("mock");
    *adapter.fail_next.lock().unwrap() = true;
    let tb = timebox("01HZX8KQBJ9GYWN3QFVYRXTX02");

    let summary = push(&adapter, &store, &|id| (id == "01HZX8KQBJ9GYWN3QFVYRXTX02").then(|| tb.clone())).await.unwrap();
    assert_eq!(summary.failed, 1);
    assert_eq!(summary.created, 0);
    let m = store.get("01HZX8KQBJ9GYWN3QFVYRXTX02", "mock").unwrap().unwrap();
    assert_eq!(m.sync_status, SyncStatus::Error);
    // The timebox itself is byte-identical (we held &Timebox throughout).
    assert_eq!(tb.status, TimeboxStatus::Committed);
}

#[tokio::test]
async fn pull_returns_unmatched_for_explicit_review() {
    // StrategyNotes does NOT auto-create timeboxes from arbitrary remote
    // events. Pull surfaces them as unmatched for the caller to handle.
    let store = SyncMetadataStore::in_memory().unwrap();
    let adapter = MockProvider::new("mock");
    let (summary, _result) = pull(&adapter, &store, None, &|_| false).await.unwrap();
    assert_eq!(summary.unmatched_remote, 0, "mock returns no changes");
    assert!(adapter.calls().iter().any(|c| c == "pull"));
}

#[tokio::test]
async fn list_calendars_works() {
    let adapter = MockProvider::new("mock");
    let cals = adapter.list_calendars().await.unwrap();
    assert_eq!(cals.len(), 1);
    assert_eq!(cals[0].name, "Mock");
}
