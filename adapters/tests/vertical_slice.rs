//! PLAN sec 15 first vertical slice - the end-to-end integration proof.
//!
//! Exercises the FULL spine against REAL adapters (MarkdownVault, SQLiteIndex,
//! DaynoteEventSink, UlidMinter, SystemClock) in a tempdir:
//!   create case -> source -> evidence -> accept (gate)
//!   -> claim -> bet -> FAIL approve (gate) -> fill fields -> approve + SDR
//!   -> work package -> fill fields -> commit (gate) -> timebox -> ICS export
//!   -> review + verify (gate) -> value claim -> validate (gate)
//!   -> rebuild index -> trace source->value -> read daynote.
//!
//! This single test proves Phases 0-7 + the service wiring work together.

use chrono::{Duration, TimeZone, Utc};
use strategynotes_adapters::{DaynoteEventSink, MarkdownVault, SQLiteIndex, SystemClock, UlidMinter};
use strategynotes_core::evidence::{EvidenceKind, ProofLevel};
use strategynotes_core::execution::{Completion, PomoEstimate};
use strategynotes_core::ics::export_timebox_to_ics;
use strategynotes_core::ports::DerivedIndex;
use strategynotes_core::services::App;
use strategynotes_core::trace::reachable_via_spine;
use strategynotes_core::{AttentionMode, EdgeType, GateResult, PomoPattern};

#[test]
fn full_strategy_spine_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path().join("vault")).unwrap();
    let index = SQLiteIndex::open_file(tmp.path().join("index.db")).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("daynotes")).unwrap();
    let minter = UlidMinter;
    let clock = SystemClock;
    let app = App {
        vault: &vault,
        sink: &sink,
        minter: &minter,
        clock: &clock,
    };

    // 1. Create the strategy case.
    let case = app.create_case("GodSpeed founder-market bet".into()).unwrap();

    // 2-3. Source + chunk + evidence linked to the chunk.
    let source = app
        .add_source("Customer discovery interview batch".into(), Some("field notes 2026-06".into()))
        .unwrap();
    let chunk = app
        .add_source_chunk(source.id, "interview #4".into(), "ICP cares about speed over features".into())
        .unwrap();
    let evidence = app
        .extract_evidence(
            chunk.id,
            "Speed is the primary buying criterion for our ICP".into(),
            ProofLevel::Observed,
            EvidenceKind::DirectQuote,
        )
        .unwrap();
    // Spine edge: source chunk --supports--> evidence extracted from it.
    app.link(chunk.id, evidence.id, EdgeType::Supports).unwrap();

    // 4. Accept the evidence - INV-EVID gate must pass (it has a source link).
    let ev_result = app.accept_evidence(evidence.id).unwrap();
    assert!(matches!(ev_result, GateResult::Approved), "evidence with source must pass INV-EVID");

    // 5. Strategic claim supported by the evidence.
    let claim = app
        .create_claim(
            "Speed-of-delivery is our defensible advantage".into(),
            ProofLevel::Supported,
            vec![evidence.id],
        )
        .unwrap();
    // Wire the spine edge: evidence --supports--> claim.
    app.link(evidence.id, claim.id, EdgeType::Supports).unwrap();

    // 6. Draft the bet.
    let mut bet = app.draft_bet(case.id, "Win founder-market on speed".into()).unwrap();

    // 7. FAIL the INV-BET gate - the bet is missing required fields.
    let blocked = app.approve_bet(bet.id).unwrap();
    match &blocked {
        GateResult::Blocked { failed_gates } => {
            assert!(!failed_gates.is_empty(), "incomplete bet must be blocked");
            assert!(failed_gates.iter().any(|s| s.contains("assumptions")));
            assert!(failed_gates.iter().any(|s| s.contains("kill criteria")));
            assert!(failed_gates.iter().any(|s| s.contains("owner")));
        }
        GateResult::Approved => panic!("empty bet must NOT be approved"),
    }

    // 8. Fill the required bet fields.
    bet = app
        .mutate_bet(bet.id, |b| {
            b.linked_choice = Some(claim.id); // simplified: claim stands in for the cascade
            b.assumptions.push(claim.id);
            b.counterevidence_reviewed = true;
            b.success_metric = Some("3 paying customers in 60 days".into());
            b.kill_criteria = Some("<1% conversion after 100 demos".into());
            b.owner = Some("Sam".into());
        })
        .unwrap();
    // Wire spine edge: claim --derives_from--> bet.
    app.link(claim.id, bet.id, EdgeType::DerivesFrom).unwrap();

    // 9. Approve the bet now - INV-BET must pass; an SDR is created.
    let approved = app.approve_bet(bet.id).unwrap();
    assert!(matches!(approved, GateResult::Approved), "complete bet must pass INV-BET");

    // 10-11. Work package + fill action ingredients.
    let mut wp = app.create_work_package(case.id, bet.id, "Ship 1-day onboarding".into()).unwrap();
    let blocked_wp = app.commit_work_package(wp.id).unwrap();
    assert!(matches!(blocked_wp, GateResult::Blocked { .. }), "empty work package must be blocked");

    wp = app
        .mutate_work_package(wp.id, |w| {
            w.inputs.push(evidence.id);
            w.expected_outputs.push("1-day onboarding flow".into());
            w.tools.push("code editor".into());
            w.technique = Some("build the smallest end-to-end path".into());
            w.exception_policy = Some("capture ideas; solve only local blockers".into());
            w.evidence_required.push("EV-MAN".into());
        })
        .unwrap();
    app.link(bet.id, wp.id, EdgeType::Requires).unwrap();

    // 12. Commit the work package - INV-WORK must pass.
    let committed = app.commit_work_package(wp.id).unwrap();
    assert!(matches!(committed, GateResult::Approved), "complete work package must pass INV-WORK");

    // 13. Schedule the timebox (pomo estimate + calendar slot).
    let start = Utc.with_ymd_and_hms(2026, 7, 1, 13, 0, 0).unwrap();
    let timebox = app
        .schedule_timebox(
            wp.id,
            PomoEstimate {
                pomos: 2,
                pattern: PomoPattern::P25M5,
                attention_mode: AttentionMode::ExecutionBuild,
            },
            start,
            start + Duration::hours(1),
            "Ship onboarding draft".into(),
        )
        .unwrap();
    app.link(wp.id, timebox.id, EdgeType::ScheduledBy).unwrap();

    // 14. Export the timebox as ICS (INV-CAL: local-first, no provider needed).
    let ics = export_timebox_to_ics(&timebox);
    assert!(ics.starts_with("BEGIN:VCALENDAR\r\n"));
    assert!(ics.contains("BEGIN:VEVENT"));
    assert!(ics.contains(&format!("UID:{}@strategynotes", timebox.id)));
    assert!(ics.contains("DTSTART:20260701T130000Z"));
    assert!(ics.contains("END:VCALENDAR\r\n"));

    // 15-18. Execute + review + verify - INV-REVIEW gate.
    let (review, verify_result) = app
        .review_and_verify_timebox(
            timebox.id,
            3, // actual pomos
            Completion::Partial,
            vec![evidence.id], // evidence attached
            None,
            "ship v0.2; schedule integration test block".into(),
        )
        .unwrap();
    assert!(matches!(verify_result, GateResult::Approved), "complete review must pass INV-REVIEW");
    app.link(timebox.id, review.id, EdgeType::ReviewedBy).unwrap();

    // 19. Value claim - INV-VALUE gate.
    let outcome = claim.id; // simplified: the claim stands in for an ORD outcome id
    let value = app
        .claim_value(
            case.id,
            "Shipped onboarding; 2 of 5 prospects converted".into(),
            ProofLevel::Validated,
            vec![evidence.id, review.id],
            outcome,
        )
        .unwrap();
    app.link(review.id, value.id, EdgeType::Validates).unwrap();
    let value_result = app.validate_value(value.id).unwrap();
    assert!(matches!(value_result, GateResult::Approved), "value claim with proof must pass INV-VALUE");

    // 20. Rebuild the index from markdown, then trace source -> value claim.
    index.rebuild(&vault).unwrap();
    let reachable = reachable_via_spine(&index, chunk.id).unwrap();
    assert!(reachable.contains(&value.id), "trace must reach the value claim from the source chunk");
    assert!(reachable.contains(&bet.id));
    assert!(reachable.contains(&timebox.id));

    // 21. The daynote ledger captured the activity (INV-DAY).
    let today = sink.read(Utc::now().date_naive()).unwrap();
    assert!(!today.is_empty(), "daynote must record the session's activity");
    assert!(today.contains("created"));
    assert!(today.contains("accepted") || today.contains("verified"));
}

#[test]
fn index_loss_does_not_break_the_spine() {
    // INV-DUR: the vault is the only durable store. Drop the index, rebuild,
    // trace still works.
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path().join("vault")).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("daynotes")).unwrap();
    let minter = UlidMinter;
    let clock = SystemClock;
    let app = App {
        vault: &vault,
        sink: &sink,
        minter: &minter,
        clock: &clock,
    };
    let case = app.create_case("durability case".into()).unwrap();
    let src = app.add_source("s".into(), None).unwrap();
    let chunk = app.add_source_chunk(src.id, "l".into(), "t".into()).unwrap();
    let ev = app
        .extract_evidence(chunk.id, "e".into(), ProofLevel::Observed, EvidenceKind::DirectQuote)
        .unwrap();
    app.link(chunk.id, ev.id, EdgeType::Supports).unwrap();
    let _ = case;

    let db_path = tmp.path().join("index.db");
    {
        let idx = SQLiteIndex::open_file(&db_path).unwrap();
        idx.rebuild(&vault).unwrap();
        assert!(reachable_via_spine(&idx, chunk.id).unwrap().contains(&ev.id));
    }
    std::fs::remove_file(&db_path).unwrap();
    let idx2 = SQLiteIndex::open_file(&db_path).unwrap();
    idx2.rebuild(&vault).unwrap();
    assert!(
        reachable_via_spine(&idx2, chunk.id).unwrap().contains(&ev.id),
        "trace survives index loss (INV-DUR)"
    );
}
