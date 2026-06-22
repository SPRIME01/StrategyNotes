//! StrategyNotes driving layer - CLI + HTTP entry.
//!
//! - `strategynotes <data-dir>`        runs the spine as a CLI demo.
//! - `strategynotes serve [data-dir]`  starts the HTTP API (Phase 12 bridge).

use std::path::PathBuf;

use chrono::{Duration, TimeZone, Utc};
use strategynotes_adapters::{DaynoteEventSink, MarkdownVault, SQLiteIndex, SystemClock, UlidMinter};
use strategynotes_core::evidence::{EvidenceKind, ProofLevel};
use strategynotes_core::execution::{Completion, PomoEstimate};
use strategynotes_core::ics::export_timebox_to_ics;
use strategynotes_core::ports::DerivedIndex;
use strategynotes_core::services::App;
use strategynotes_core::trace::reachable_via_spine;
use strategynotes_core::{AttentionMode, EdgeType, GateResult, PomoPattern};

mod http;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let result = if args.first().map(String::as_str) == Some("serve") {
        let data_dir = args
            .get(1)
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("strategynotes-data"));
        let port = args.get(2).and_then(|s| s.parse::<u16>().ok()).unwrap_or(8787);
        // tokio runtime for the HTTP server.
        let rt = tokio::runtime::Runtime::new().expect("tokio runtime");
        rt.block_on(http::serve(&data_dir, port))
    } else {
        let data_dir = args
            .first()
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("strategynotes-data"));
        run_spine(&data_dir)
    };
    if let Err(e) = result {
        eprintln!("error: {e}");
        std::process::exit(1);
    }
}

fn run_spine(data_dir: &std::path::Path) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== StrategyNotes - end-to-end spine ===");
    println!("data dir: {}", data_dir.display());

    let vault = MarkdownVault::open(data_dir.join("vault"))?;
    let index = SQLiteIndex::open_file(data_dir.join("index.db"))?;
    let sink = DaynoteEventSink::open(data_dir.join("daynotes"))?;
    let minter = UlidMinter;
    let clock = SystemClock;
    let app = App {
        vault: &vault,
        sink: &sink,
        minter: &minter,
        clock: &clock,
    };

    let case = app.create_case("GodSpeed founder-market bet".into())?;
    println!("\n[case] created: {} ({})", case.id, case.title);

    let source = app.add_source("Customer discovery batch".into(), None)?;
    let chunk = app.add_source_chunk(source.id, "interview #4".into(), "ICP wants speed".into())?;
    let evidence = app.extract_evidence(
        chunk.id,
        "Speed is the primary buying criterion".into(),
        ProofLevel::Observed,
        EvidenceKind::DirectQuote,
    )?;
    app.link(chunk.id, evidence.id, EdgeType::Supports)?;
    println!("[evidence] drafted: {} (linked to chunk {})", evidence.id, chunk.id);

    let ev = app.accept_evidence(evidence.id)?;
    print_gate("accept evidence", &ev);

    let claim = app.create_claim(
        "Speed-of-delivery is our defensible advantage".into(),
        ProofLevel::Supported,
        vec![evidence.id],
    )?;
    app.link(evidence.id, claim.id, EdgeType::Supports)?;
    println!("[claim] created: {} ({})", claim.id, claim.statement);

    let bet = app.draft_bet(case.id, "Win founder-market on speed".into())?;
    app.link(claim.id, bet.id, EdgeType::DerivesFrom)?;
    println!("[bet] drafted: {} ({})", bet.id, bet.thesis);

    let blocked = app.approve_bet(bet.id)?;
    print_gate("approve bet (empty)", &blocked);

    let bet = app.mutate_bet(bet.id, |b| {
        b.linked_choice = Some(claim.id);
        b.assumptions.push(claim.id);
        b.counterevidence_reviewed = true;
        b.success_metric = Some("3 paying customers in 60 days".into());
        b.kill_criteria = Some("<1% conversion after 100 demos".into());
        b.owner = Some("Sam".into());
    })?;
    let approved = app.approve_bet(bet.id)?;
    print_gate("approve bet (complete)", &approved);

    let wp = app.create_work_package(case.id, bet.id, "Ship 1-day onboarding".into())?;
    let wp = app.mutate_work_package(wp.id, |w| {
        w.inputs.push(evidence.id);
        w.expected_outputs.push("onboarding flow".into());
        w.tools.push("editor".into());
        w.technique = Some("smallest end-to-end path".into());
        w.exception_policy = Some("capture ideas; local blockers only".into());
        w.evidence_required.push("EV-MAN".into());
    })?;
    app.link(bet.id, wp.id, EdgeType::Requires)?;
    let committed = app.commit_work_package(wp.id)?;
    print_gate("commit work package", &committed);

    let start = Utc.with_ymd_and_hms(2026, 7, 1, 13, 0, 0).unwrap();
    let timebox = app.schedule_timebox(
        wp.id,
        PomoEstimate {
            pomos: 2,
            pattern: PomoPattern::P25M5,
            attention_mode: AttentionMode::ExecutionBuild,
        },
        start,
        start + Duration::hours(1),
        "Ship onboarding draft".into(),
    )?;
    app.link(wp.id, timebox.id, EdgeType::ScheduledBy)?;
    let ics = export_timebox_to_ics(&timebox);
    println!("[timebox] scheduled: {} (ICS {} bytes)", timebox.id, ics.len());

    let (_review, verified) = app.review_and_verify_timebox(
        timebox.id,
        3,
        Completion::Partial,
        vec![evidence.id],
        None,
        "ship v0.2; schedule integration test".into(),
    )?;
    print_gate("verify timebox", &verified);

    let value = app.claim_value(
        case.id,
        "Shipped onboarding; 2 of 5 prospects converted".into(),
        ProofLevel::Validated,
        vec![evidence.id],
        claim.id,
    )?;
    app.link(timebox.id, value.id, EdgeType::Validates)?;
    let v = app.validate_value(value.id)?;
    print_gate("validate value", &v);

    index.rebuild(&vault)?;
    let reach = reachable_via_spine(&index, chunk.id)?;
    println!(
        "\n[trace] from source chunk {} -> {} nodes reachable (value claim {} reached: {})",
        chunk.id,
        reach.len(),
        value.id,
        reach.contains(&value.id)
    );

    let today = sink.read(Utc::now().date_naive())?;
    println!("[daynote] {} activity lines captured today", today.lines().count());

    println!("\n=== spine complete ===");
    Ok(())
}

fn print_gate(label: &str, r: &GateResult) {
    match r {
        GateResult::Approved => println!("[gate] {label}: APPROVED"),
        GateResult::Blocked { failed_gates } => {
            println!("[gate] {label}: BLOCKED - {}", failed_gates.join("; "));
        }
    }
}
