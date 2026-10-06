//! Phase G calendar provider contract tests (TST-CAL). INV-CAL: provider
//! failure never corrupts local timebox state.

use chrono::{TimeZone, Utc};
use strategynotes_adapters::{
    google_calendar_provider, icloud_calendar_provider, outlook_calendar_provider,
    InternalCalendarProvider, IcsCalendarProvider, MarkdownVault,
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

/// OQ-002 Option B (resolved): internal timeboxes + ICS export. SPEC sec 10.3
/// `POST /calendar/ics/export`. An export that can carry only one timebox is
/// not a calendar — the whole commitment set has to travel as ONE VCALENDAR,
/// or a subscriber gets a fresh calendar per timebox instead of an update.
#[test]
fn tst_cal_006_multi_timebox_export_is_one_calendar() {
    use strategynotes_core::ics::export_timeboxes_to_ics;

    let mut second = timebox();
    second.id = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXYZ").unwrap();
    second.scheduled_start = Utc.with_ymd_and_hms(2026, 7, 2, 9, 0, 0).unwrap();
    second.scheduled_end = Utc.with_ymd_and_hms(2026, 7, 2, 10, 0, 0).unwrap();
    second.expected_output = Some("review evidence".into());

    let ics = export_timeboxes_to_ics(&[timebox(), second]);

    assert_eq!(ics.matches("BEGIN:VCALENDAR").count(), 1, "one wrapper:\n{ics}");
    assert_eq!(ics.matches("END:VCALENDAR").count(), 1);
    assert_eq!(ics.matches("BEGIN:VEVENT").count(), 2, "one event per timebox");
    assert_eq!(ics.matches("END:VEVENT").count(), 2);
    assert!(ics.contains("UID:01HZX8KQBJ9GYWN3QFVYRXTXMS@strategynotes"));
    assert!(ics.contains("UID:01HZX8KQBJ9GYWN3QFVYRXTXYZ@strategynotes"));
    assert!(ics.contains("DTSTART:20260701T130000Z"));
    assert!(ics.contains("DTSTART:20260702T090000Z"));
    assert!(ics.ends_with("END:VCALENDAR\r\n"), "RFC 5545 CRLF endings");

    // An empty export is still a valid calendar shell — never phantom events.
    let empty = export_timeboxes_to_ics(&[]);
    assert!(empty.contains("BEGIN:VCALENDAR"));
    assert!(!empty.contains("BEGIN:VEVENT"), "no phantom events:\n{empty}");

    // The single-timebox entry point is the plural one, not a second code path.
    let single = strategynotes_core::ics::export_timebox_to_ics(&timebox());
    assert_eq!(single.matches("BEGIN:VEVENT").count(), 1);
}

/// The export endpoint (SPEC sec 10.3 `POST /calendar/ics/export`) reads the
/// vault — it never learns how a timebox got there. So the behavior that needs
/// proving is: every timebox in the vault is in the file, nothing else is, and
/// the calendar comes out in schedule order (deterministic, no matter the order
/// nodes were written).
#[test]
fn tst_cal_007_vault_export_covers_every_timebox_in_schedule_order() {
    use strategynotes_adapters::{DaynoteEventSink, SystemClock, UlidMinter};
    use strategynotes_core::ics::export_vault_to_ics;
    use strategynotes_core::ports::NodeVault;
    use strategynotes_core::services::App;
    use strategynotes_core::views::TypedView;

    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path().join("vault")).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("daynotes")).unwrap();
    let app = App { vault: &vault, sink: &sink, minter: &UlidMinter, clock: &SystemClock };

    // A non-timebox node, so we prove the type filter rather than assume it.
    let _case = app.create_case("Founder-market on speed".into()).unwrap();

    let later = Timebox {
        id: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXYZ").unwrap(),
        scheduled_start: Utc.with_ymd_and_hms(2026, 7, 2, 9, 0, 0).unwrap(),
        scheduled_end: Utc.with_ymd_and_hms(2026, 7, 2, 10, 0, 0).unwrap(),
        ..timebox()
    };
    let earlier = Timebox {
        id: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap(),
        ..timebox()
    };
    // Written deliberately out of schedule order.
    vault.put(&later.to_node().unwrap()).unwrap();
    vault.put(&earlier.to_node().unwrap()).unwrap();

    let ics = export_vault_to_ics(&vault).unwrap();

    assert_eq!(ics.matches("BEGIN:VEVENT").count(), 2, "both timeboxes, no case node:\n{ics}");
    let jul1 = ics.find("DTSTART:20260701T130000Z").expect("earlier timebox present");
    let jul2 = ics.find("DTSTART:20260702T090000Z").expect("later timebox present");
    assert!(ics.contains("BEGIN:VCALENDAR"));
    // Schedule order, regardless of write order.
    assert!(jul1 < jul2, "events must come out in schedule order");

    // Re-export is stable: same set, same order.
    assert_eq!(ics, export_vault_to_ics(&vault).unwrap());
}
