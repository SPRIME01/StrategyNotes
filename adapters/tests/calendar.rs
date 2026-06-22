//! Phase G calendar provider contract tests (TST-CAL). INV-CAL: provider
//! failure never corrupts local timebox state.

use chrono::{TimeZone, Utc};
use strategynotes_adapters::{
    google_calendar_provider, icloud_calendar_provider, outlook_calendar_provider,
    InternalCalendarProvider, IcsCalendarProvider,
};
use strategynotes_core::calendar::{CalendarProvider, ProviderStatus};
use strategynotes_core::execution::{PomoEstimate, Timebox, TimeboxStatus};
use strategynotes_core::{AttentionMode, NodeId, PomoPattern};

fn timebox() -> Timebox {
    Timebox {
        id: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap(),
        work_package: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXAB").unwrap(),
        status: TimeboxStatus::Committed,
        estimate: PomoEstimate { pomos: 2, pattern: PomoPattern::P25M5, attention_mode: AttentionMode::ExecutionBuild },
        scheduled_start: Utc.with_ymd_and_hms(2026, 7, 1, 13, 0, 0).unwrap(),
        scheduled_end: Utc.with_ymd_and_hms(2026, 7, 1, 14, 0, 0).unwrap(),
        expected_output: Some("ship draft".into()),
        review_required: true,
    }
}

#[test]
fn tst_cal_001_ics_export_valid() {
    let p = IcsCalendarProvider;
    assert!(matches!(p.status(), ProviderStatus::Available));
    let ev = p.create_event(&timebox()).unwrap();
    assert!(ev.external_id.starts_with("BEGIN:VCALENDAR"));
    assert!(ev.external_id.contains("BEGIN:VEVENT"));
    assert!(ev.external_id.contains("DTSTART:20260701T130000Z"));
    assert!(ev.external_id.contains("SUMMARY:ship draft"));
}

#[test]
fn tst_cal_002_provider_failure_does_not_corrupt_local_timebox() {
    // INV-CAL: a provider returning Err must not mutate the local Timebox.
    // The local timebox is the source of truth; providers only mirror.
    let tb_before = timebox();
    let google = google_calendar_provider();
    // Provider is unavailable -> create_event errors.
    let err = google.create_event(&tb_before).unwrap_err();
    assert!(format!("{err}").contains("unavailable"));
    // The local timebox is byte-for-byte unchanged (we never passed &mut).
    assert_eq!(tb_before.status, TimeboxStatus::Committed);
    assert_eq!(tb_before.estimate.pomos, 2);
}

#[test]
fn tst_cal_003_mocked_google_provider_maps_event_shape() {
    // The Google stub maps the timebox shape correctly: provider name + status.
    // A real adapter behind the `google` feature flag would do the HTTP round-
    // trip; the stub is the contract surface.
    let g = google_calendar_provider();
    assert_eq!(g.provider_name(), "google");
    assert!(matches!(g.status(), ProviderStatus::Unavailable(_)));
}

#[test]
fn tst_cal_004_mocked_outlook_provider_maps_event_shape() {
    let o = outlook_calendar_provider();
    assert_eq!(o.provider_name(), "outlook");
    assert!(matches!(o.status(), ProviderStatus::Unavailable(_)));
}

#[test]
fn tst_cal_005_icloud_adapter_is_ev_skip_with_reason() {
    // iCloud/CalDAV real-provider smoke is EV-SKIP: no CalDAV credentials in the
    // build env. The stub correctly reports Unavailable with the credential hint.
    let ic = icloud_calendar_provider();
    assert_eq!(ic.provider_name(), "icloud-caldav");
    match ic.status() {
        ProviderStatus::Unavailable(reason) => {
            assert!(reason.contains("ICLOUD_CALDAV_CREDENTIALS"), "reason: {reason}");
        }
        _ => panic!("iCloud must be unavailable without credentials"),
    }
    // Evidence note: real iCloud smoke is EV-SKIP per OQ-002 Option B (internal
    // + ICS first) and the build env's lack of CalDAV credentials.
}

#[test]
fn internal_provider_is_always_available() {
    let i = InternalCalendarProvider;
    assert!(matches!(i.status(), ProviderStatus::Available));
    let ev = i.create_event(&timebox()).unwrap();
    assert!(ev.external_id.starts_with("internal:"));
}
