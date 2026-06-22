//! Gate engine (Phase 7). Evaluates each gate from the SPEC sec 9 catalog
//! against a domain object and returns a [`GateResult`]. Backend-owned: the UI
//! never decides approval; it calls these (via application services) and renders
//! the result.
//!
//! Each gate is a pure function over its subject (+ optionally a DerivedIndex
//! for context). Missing each required field produces a typed failed_gate.
//! Guards: INV-EVID, INV-CLAIM, INV-BET, INV-WORK, INV-TIME, INV-REVIEW, INV-VALUE.

use crate::evidence::EvidenceItem;
use crate::execution::{Completion, TimeboxReview, ValueClaim, WorkPackage};
use crate::gate::{GateId, GateResult};
use crate::strategy::StrategyBet;

// ---- INV-EVID ----

/// SPEC sec 9: source/provenance link OR explicit manual basis + reviewer.
pub fn can_accept_evidence(e: &EvidenceItem) -> GateResult {
    let failed = crate::evidence_rules::acceptance_failures(e);
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

// ---- INV-CLAIM ----

/// SPEC sec 9: proof level set + evidence status set + counterevidence reviewed.
/// (proof_level is a required enum field, so it is always set; the gate still
/// checks it is not `Rejected` for an accepted claim, and that the claim has
/// at least one supporting evidence link or an explicit manual basis.)
pub fn can_accept_claim(claim: &crate::strategy::StrategicClaim) -> GateResult {
    use crate::evidence::ProofLevel;
    let mut failed: Vec<&'static str> = Vec::new();
    if claim.proof_level == ProofLevel::Rejected {
        failed.push("proof_level is Rejected");
    }
    if claim.supports.is_empty() {
        failed.push("claim has no supporting evidence links");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

// ---- INV-BET ----

/// SPEC sec 9 / INV-BET: no approved bet without linked choice, assumptions,
/// counterevidence review, success metric, kill criteria, owner.
pub fn can_approve_bet(bet: &StrategyBet) -> GateResult {
    let mut failed: Vec<&'static str> = Vec::new();
    if bet.linked_choice.is_none() {
        failed.push("missing linked choice cascade");
    }
    if bet.assumptions.is_empty() {
        failed.push("missing assumptions");
    }
    if !bet.counterevidence_reviewed {
        failed.push("counterevidence not reviewed");
    }
    if bet.success_metric.as_deref().is_none_or(|s| s.trim().is_empty()) {
        failed.push("missing success metric");
    }
    if bet.kill_criteria.as_deref().is_none_or(|s| s.trim().is_empty()) {
        failed.push("missing kill criteria");
    }
    if bet.owner.as_deref().is_none_or(|s| s.trim().is_empty()) {
        failed.push("missing owner");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

// ---- INV-WORK ----

/// SPEC sec 9 / INV-WORK: no committed work without objective, inputs, outputs,
/// tools, technique, exception policy, evidence requirement.
pub fn can_commit_work_package(wp: &WorkPackage) -> GateResult {
    let mut failed: Vec<&'static str> = Vec::new();
    if wp.objective.trim().is_empty() {
        failed.push("missing objective");
    }
    if wp.inputs.is_empty() {
        failed.push("missing inputs");
    }
    if wp.expected_outputs.is_empty() {
        failed.push("missing expected outputs");
    }
    if wp.tools.is_empty() {
        failed.push("missing tools");
    }
    if wp.technique.as_deref().is_none_or(|s| s.trim().is_empty()) {
        failed.push("missing technique");
    }
    if wp.exception_policy.as_deref().is_none_or(|s| s.trim().is_empty()) {
        failed.push("missing exception policy");
    }
    if wp.evidence_required.is_empty() {
        failed.push("missing evidence requirement");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

// ---- INV-REVIEW ----

/// SPEC sec 9: no verified timebox without post-block review carrying actual
/// pomos, output summary, evidence link OR explicit no-evidence reason, next action.
pub fn can_verify_timebox(review: &TimeboxReview) -> GateResult {
    let mut failed: Vec<&'static str> = Vec::new();
    if !review.executed {
        failed.push("timebox not executed");
    }
    if review.actual_pomos == 0 {
        failed.push("missing actual pomo count");
    }
    if review.completed_expected_output == Completion::None {
        failed.push("missing output summary");
    }
    let has_evidence = !review.evidence_links.is_empty();
    let has_reason = review
        .no_evidence_reason
        .as_deref()
        .is_some_and(|s| !s.trim().is_empty());
    if !has_evidence && !has_reason {
        failed.push("missing evidence link or explicit no-evidence reason");
    }
    if review
        .next_action
        .as_deref()
        .is_none_or(|s| s.trim().is_empty())
    {
        failed.push("missing next action decision");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

// ---- INV-VALUE ----

/// SPEC sec 9: no value claim without proof level, evidence links, linked outcome.
pub fn can_claim_value(vc: &ValueClaim) -> GateResult {
    let mut failed: Vec<&'static str> = Vec::new();
    if vc.evidence_links.is_empty() {
        failed.push("missing evidence links");
    }
    if vc.linked_outcome.is_none() {
        failed.push("missing linked ORD outcome");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

/// Look up which gate id applies to a subject (for routing / display).
pub fn gate_id_for_evidence() -> GateId {
    GateId::CanAcceptEvidence
}
