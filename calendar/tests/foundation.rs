//! Foundation tests for the calendar subsystem: secrets, sync metadata store,
//! ICS import. No HTTP (real providers are feature-flagged + mocked elsewhere).

use strategynotes_calendar::{
    parse_ics, FileSecretStore, SecretStore, SyncMetadata, SyncMetadataStore, SyncStatus,
};

// ---- secrets ----

#[test]
fn secrets_round_trip_and_delete() {
    let tmp = tempfile::tempdir().unwrap();
    let store = FileSecretStore::open(tmp.path().join("secrets.json")).unwrap();
    store.put_secret("google:acc1:refresh", "rtoken").unwrap();
    assert_eq!(store.get_secret("google:acc1:refresh").unwrap().as_deref(), Some("rtoken"));
    store.delete_secret("google:acc1:refresh").unwrap();
    assert!(store.get_secret("google:acc1:refresh").unwrap().is_none());
}

// ---- sync metadata store ----

fn meta(timebox: &str, provider: &str, status: SyncStatus) -> SyncMetadata {
    SyncMetadata {
        timebox_id: timebox.into(),
        provider: provider.into(),
        provider_event_id: Some("evt-123".into()),
        provider_href: None,
        uid: Some("uid-abc".into()),
        etag: Some("etag-1".into()),
        sync_status: status,
        last_synced_at: Some("2026-07-01T13:00:00Z".into()),
    }
}

#[test]
fn sync_store_put_get_delete() {
    let store = SyncMetadataStore::in_memory().unwrap();
    let m = meta("01HZX8KQBJ9GYWN3QFVYRXTX01", "google", SyncStatus::Synced);
    store.put(&m).unwrap();
    let got = store.get(&m.timebox_id, &m.provider).unwrap().unwrap();
    assert_eq!(got, m);
    store.delete(&m.timebox_id, &m.provider).unwrap();
    assert!(store.get(&m.timebox_id, &m.provider).unwrap().is_none());
}

#[test]
fn sync_store_pending_queue_excludes_synced() {
    let store = SyncMetadataStore::in_memory().unwrap();
    store.put(&meta("01HZX8KQBJ9GYWN3QFVYRXTX01", "google", SyncStatus::Synced)).unwrap();
    store.put(&meta("01HZX8KQBJ9GYWN3QFVYRXTX02", "google", SyncStatus::PendingCreate)).unwrap();
    store.put(&meta("01HZX8KQBJ9GYWN3QFVYRXTX03", "outlook", SyncStatus::PendingDelete)).unwrap();
    let pending = store.pending().unwrap();
    assert_eq!(pending.len(), 2, "only non-synced rows are pending");
    assert!(pending.iter().all(|m| m.sync_status != SyncStatus::Synced));
}

// ---- ICS import ----

#[test]
fn parse_ics_extracts_vevents() {
    let ics = "BEGIN:VCALENDAR\r\n\
BEGIN:VEVENT\r\n\
UID:event-1@strategynotes\r\n\
SUMMARY:Ship onboarding draft\r\n\
DTSTART:20260701T130000Z\r\n\
DTEND:20260701T140000Z\r\n\
DESCRIPTION:deep work block\r\n\
LOCATION:home\r\n\
END:VEVENT\r\n\
BEGIN:VEVENT\r\n\
UID:event-2@strategynotes\r\n\
SUMMARY:Customer call\r\n\
DTSTART:20260702T100000Z\r\n\
DTEND:20260702T103000Z\r\n\
END:VEVENT\r\n\
END:VCALENDAR\r\n";
    let events = parse_ics(ics);
    assert_eq!(events.len(), 2);
    assert_eq!(events[0].summary.as_deref(), Some("Ship onboarding draft"));
    assert_eq!(events[0].uid.as_deref(), Some("event-1@strategynotes"));
    assert_eq!(events[0].dtstart.as_deref(), Some("20260701T130000Z"));
    assert_eq!(events[0].dtend.as_deref(), Some("20260701T140000Z"));
    assert_eq!(events[0].description.as_deref(), Some("deep work block"));
    assert_eq!(events[1].summary.as_deref(), Some("Customer call"));
}

#[test]
fn parse_ics_handles_parametrized_properties() {
    // DTSTART;TZID=America/New_York:20260701T090000  -> value extracted past ';'
    let ics = "BEGIN:VEVENT\r\nDTSTART;TZID=America/New_York:20260701T090000\r\nSUMMARY:X\r\nEND:VEVENT\r\n";
    let events = parse_ics(ics);
    assert_eq!(events[0].dtstart.as_deref(), Some("20260701T090000"));
}

#[test]
fn parse_ics_empty_or_no_vevents() {
    assert!(parse_ics("").is_empty());
    assert!(parse_ics("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n").is_empty());
}
