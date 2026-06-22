//! DaynoteEventSink tests (TST-DAY, Phase 4). Guards INV-DAY: activity is
//! captured from core-emitted events into per-day markdown, not fabricated.

use chrono::{NaiveDate, TimeZone, Utc};
use strategynotes_adapters::DaynoteEventSink;
use strategynotes_core::governance::{ActivityEvent, ActivityKind, EventSource};
use strategynotes_core::ports::EventSink;
use strategynotes_core::NodeId;

fn event_at(hour: u32, kind: ActivityKind, source: EventSource) -> ActivityEvent {
    ActivityEvent {
        at: Utc.with_ymd_and_hms(2026, 6, 21, hour, 0, 0).unwrap(),
        node: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap(),
        kind,
        source: Some(source),
    }
}

#[test]
fn records_events_into_a_per_day_file() {
    let tmp = tempfile::tempdir().unwrap();
    let sink = DaynoteEventSink::open(tmp.path()).unwrap();
    sink.record(event_at(9, ActivityKind::Created, EventSource::User));
    sink.record(event_at(10, ActivityKind::Modified, EventSource::User));

    let day = sink.read(NaiveDate::from_ymd_opt(2026, 6, 21).unwrap()).unwrap();
    assert!(day.contains("created"), "daynote: {day}");
    assert!(day.contains("modified"), "daynote: {day}");
    assert!(day.contains("(user)"), "source captured: {day}");
}

#[test]
fn events_on_different_dates_land_in_different_files() {
    let tmp = tempfile::tempdir().unwrap();
    let sink = DaynoteEventSink::open(tmp.path()).unwrap();
    let mut a = event_at(9, ActivityKind::Created, EventSource::User);
    a.at = Utc.with_ymd_and_hms(2026, 6, 21, 9, 0, 0).unwrap();
    let mut b = event_at(9, ActivityKind::Created, EventSource::User);
    b.at = Utc.with_ymd_and_hms(2026, 6, 22, 9, 0, 0).unwrap();
    sink.record(a);
    sink.record(b);

    let d1 = sink.read(NaiveDate::from_ymd_opt(2026, 6, 21).unwrap()).unwrap();
    let d2 = sink.read(NaiveDate::from_ymd_opt(2026, 6, 22).unwrap()).unwrap();
    assert!(d1.contains("created") && !d1.is_empty());
    assert!(d2.contains("created") && !d2.is_empty());
    // Distinct content - one event each, different files.
    assert_eq!(d1.lines().count(), 1);
    assert_eq!(d2.lines().count(), 1);
}

#[test]
fn reading_a_missing_day_returns_empty_not_error() {
    let tmp = tempfile::tempdir().unwrap();
    let sink = DaynoteEventSink::open(tmp.path()).unwrap();
    let day = sink
        .read(NaiveDate::from_ymd_opt(2024, 1, 1).unwrap())
        .unwrap();
    assert!(day.is_empty());
}

#[test]
fn agent_and_external_sources_are_distinguished() {
    // OQ-005 (recommended Option A): external edits count as modifications with
    // event-source metadata. INV-DAY: provenance is captured.
    let tmp = tempfile::tempdir().unwrap();
    let sink = DaynoteEventSink::open(tmp.path()).unwrap();
    sink.record(event_at(9, ActivityKind::Modified, EventSource::Agent));
    sink.record(event_at(10, ActivityKind::Modified, EventSource::ExternalFile));

    let day = sink.read(NaiveDate::from_ymd_opt(2026, 6, 21).unwrap()).unwrap();
    assert!(day.contains("(agent)"), "agent source captured: {day}");
    assert!(day.contains("(external-file)"), "external source captured: {day}");
}
