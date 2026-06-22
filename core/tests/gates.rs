//! Phase 7 gate engine tests (TST-GATE). The critical proof that StrategyNotes
//! has "teeth": each gate blocks when required fields are missing and approves
//! only when the full SPEC sec 9 contract holds.
//!
//! Guards: INV-EVID, INV-CLAIM, INV-BET, INV-WORK, INV-REVIEW, INV-VALUE.

use strategynotes_core::evidence::{EvidenceItem, EvidenceKind, EvidenceStatus, ProofLevel};
use strategynotes_core::execution::{
    Completion, TimeboxReview, ValueClaim, ValueStatus, WorkPackage, WorkStatus,
};
use strategynotes_core::gates::{
    can_accept_claim, can_accept_evidence, can_approve_bet, can_claim_value,
    can_commit_work_package, can_verify_timebox,
};
use strategynotes_core::gate::GateResult;
use strategynotes_core::strategy::{BetStatus, StrategicClaim};
use strategynotes_core::{NodeId, StrategyBet};

fn id(s: &str) -> NodeId {
    NodeId::parse(s).unwrap()
}

fn blocked_reasons(r: &GateResult) -> Vec<String> {
    match r {
        GateResult::Blocked { failed_gates } => failed_gates.clone(),
        _ => panic!("expected Blocked, got Approved"),
    }
}

// ---------- INV-EVID ----------

fn evidence(source: Option<&str>, reviewer: Option<&str>) -> EvidenceItem {
    EvidenceItem {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX10"),
        kind: EvidenceKind::DirectQuote,
        status: EvidenceStatus::Drafted,
        proof_level: ProofLevel::Observed,
        source_chunk: source.map(id),
        manual_basis_reviewer: reviewer.map(str::to_string),
        text: "quote".into(),
        supports: vec![],
        contradicts: vec![],
    }
}

#[test]
fn evidence_gate_approves_with_source() {
    assert!(matches!(
        can_accept_evidence(&evidence(Some("01HZX8KQBJ9GYWN3QFVYRXTX20"), None)),
        GateResult::Approved
    ));
}

#[test]
fn evidence_gate_blocks_without_source_or_manual_basis() {
    let r = can_accept_evidence(&evidence(None, None));
    assert!(matches!(r, GateResult::Blocked { .. }));
    let reasons = blocked_reasons(&r);
    assert!(reasons.iter().any(|s| s.contains("source") || s.contains("manual")));
}

// ---------- INV-CLAIM ----------

fn claim(proof: ProofLevel, supports: Vec<&str>) -> StrategicClaim {
    StrategicClaim {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX30"),
        statement: "thesis".into(),
        proof_level: proof,
        supports: supports.into_iter().map(id).collect(),
        contradicts: vec![],
    }
}

#[test]
fn claim_gate_approves_supported_non_rejected() {
    assert!(matches!(
        can_accept_claim(&claim(ProofLevel::Supported, vec!["01HZX8KQBJ9GYWN3QFVYRXTX31"])),
        GateResult::Approved
    ));
}

#[test]
fn claim_gate_blocks_rejected_proof_level() {
    let r = can_accept_claim(&claim(ProofLevel::Rejected, vec!["01HZX8KQBJ9GYWN3QFVYRXTX31"]));
    assert!(reasons_include(&r, "Rejected"));
}

#[test]
fn claim_gate_blocks_unsupported_claim() {
    let r = can_accept_claim(&claim(ProofLevel::Inferred, vec![]));
    assert!(reasons_include(&r, "supporting evidence"));
}

// ---------- INV-BET ----------

fn full_bet() -> StrategyBet {
    StrategyBet {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX40"),
        case: id("01HZX8KQBJ9GYWN3QFVYRXTX41"),
        thesis: "go founder-market".into(),
        linked_choice: Some(id("01HZX8KQBJ9GYWN3QFVYRXTX42")),
        assumptions: vec![id("01HZX8KQBJ9GYWN3QFVYRXTX43")],
        counterevidence_reviewed: true,
        success_metric: Some("3 paying customers in 60 days".into()),
        kill_criteria: Some("<1% conversion after 100 demos".into()),
        owner: Some("Sam".into()),
        status: BetStatus::Draft,
    }
}

#[test]
fn bet_gate_approves_complete_bet() {
    assert!(matches!(can_approve_bet(&full_bet()), GateResult::Approved));
}

#[test]
fn bet_gate_blocks_incomplete_bet_listing_every_missing_field() {
    let mut bet = full_bet();
    bet.linked_choice = None;
    bet.assumptions.clear();
    bet.counterevidence_reviewed = false;
    bet.success_metric = None;
    bet.kill_criteria = None;
    bet.owner = None;

    let r = can_approve_bet(&bet);
    let reasons = blocked_reasons(&r);
    for needle in [
        "choice cascade",
        "assumptions",
        "counterevidence",
        "success metric",
        "kill criteria",
        "owner",
    ] {
        assert!(
            reasons.iter().any(|s| s.contains(needle)),
            "expected failure mentioning '{needle}', got {reasons:?}"
        );
    }
}

#[test]
fn bet_gate_blocks_on_empty_strings_not_just_none() {
    // Empty-string owner must trip the gate just like None (guards UI theater).
    let mut bet = full_bet();
    bet.owner = Some("   ".into());
    let r = can_approve_bet(&bet);
    assert!(reasons_include(&r, "owner"));
}

// ---------- INV-WORK ----------

fn full_work_package() -> WorkPackage {
    WorkPackage {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX50"),
        case: id("01HZX8KQBJ9GYWN3QFVYRXTX51"),
        objective: "Draft SLD thesis".into(),
        linked_bet: Some(id("01HZX8KQBJ9GYWN3QFVYRXTX52")),
        inputs: vec![id("01HZX8KQBJ9GYWN3QFVYRXTX53")],
        expected_outputs: vec!["thesis doc".into()],
        tools: vec!["SLD workspace".into()],
        technique: Some("compare two alternatives".into()),
        exception_policy: Some("capture ideas; solve local blockers only".into()),
        evidence_required: vec!["EV-MAN".into()],
        status: WorkStatus::Intent,
    }
}

#[test]
fn work_gate_approves_complete_package() {
    assert!(matches!(
        can_commit_work_package(&full_work_package()),
        GateResult::Approved
    ));
}

#[test]
fn work_gate_blocks_missing_inputs_and_outputs() {
    let mut wp = full_work_package();
    wp.inputs.clear();
    wp.expected_outputs.clear();
    let r = can_commit_work_package(&wp);
    assert!(reasons_include(&r, "inputs"));
    assert!(reasons_include(&r, "outputs"));
}

// ---------- INV-REVIEW ----------

fn review(evidence: Vec<&str>, no_evidence_reason: Option<&str>) -> TimeboxReview {
    TimeboxReview {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX60"),
        timebox: id("01HZX8KQBJ9GYWN3QFVYRXTX61"),
        executed: true,
        actual_pomos: 3,
        completed_expected_output: Completion::Full,
        evidence_links: evidence.into_iter().map(id).collect(),
        no_evidence_reason: no_evidence_reason.map(str::to_string),
        friction_notes: None,
        hypothesis_update: None,
        next_action: Some("schedule next block".into()),
    }
}

#[test]
fn review_gate_approves_with_evidence() {
    assert!(matches!(
        can_verify_timebox(&review(vec!["01HZX8KQBJ9GYWN3QFVYRXTX62"], None)),
        GateResult::Approved
    ));
}

#[test]
fn review_gate_approves_with_explicit_no_evidence_reason() {
    assert!(matches!(
        can_verify_timebox(&review(vec![], Some("interruption; nothing produced"))),
        GateResult::Approved
    ));
}

#[test]
fn review_gate_blocks_without_evidence_or_reason() {
    let r = can_verify_timebox(&review(vec![], None));
    assert!(reasons_include(&r, "evidence link or explicit no-evidence"));
}

#[test]
fn review_gate_blocks_unexecuted_timebox() {
    let mut r = review(vec!["01HZX8KQBJ9GYWN3QFVYRXTX62"], None);
    r.executed = false;
    assert!(reasons_include(&can_verify_timebox(&r), "not executed"));
}

// ---------- INV-VALUE ----------

#[test]
fn value_gate_blocks_without_evidence_or_outcome() {
    let vc = ValueClaim {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX70"),
        case: id("01HZX8KQBJ9GYWN3QFVYRXTX71"),
        statement: "created $10k value".into(),
        proof_level: ProofLevel::Inferred,
        evidence_links: vec![],
        linked_outcome: None,
        status: ValueStatus::Drafted,
    };
    let r = can_claim_value(&vc);
    assert!(reasons_include(&r, "evidence links"));
    assert!(reasons_include(&r, "linked ORD outcome"));
}

#[test]
fn value_gate_approves_with_evidence_and_outcome() {
    let vc = ValueClaim {
        id: id("01HZX8KQBJ9GYWN3QFVYRXTX70"),
        case: id("01HZX8KQBJ9GYWN3QFVYRXTX71"),
        statement: "created $10k value".into(),
        proof_level: ProofLevel::Validated,
        evidence_links: vec![id("01HZX8KQBJ9GYWN3QFVYRXTX72")],
        linked_outcome: Some(id("01HZX8KQBJ9GYWN3QFVYRXTX73")),
        status: ValueStatus::Drafted,
    };
    assert!(matches!(can_claim_value(&vc), GateResult::Approved));
}

// helper
fn reasons_include(r: &GateResult, needle: &str) -> bool {
    blocked_reasons(r).iter().any(|s| s.contains(needle))
}
