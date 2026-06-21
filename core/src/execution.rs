//! Execution layer: work packages, pomo estimates, timeboxes, reviews, value
//! claims, decision records. Guards INV-WORK, INV-TIME, INV-REVIEW, INV-VALUE.
//! See SPEC sec 9 (gate catalog), sec 2.4 (pomo model).

use crate::identity::NodeId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Work package lifecycle. Cannot reach `Ready` without objective/inputs/
/// outputs/tools/technique/exception-policy/evidence-requirement (INV-WORK).
/// Cannot reach `Committed` without pomo estimate + scheduled timebox (INV-TIME).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkStatus {
    #[default]
    Intent,
    Ready,
    Committed,
    InProgress,
    Done,
    Blocked,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkPackage {
    pub id: NodeId,
    pub case: NodeId,
    pub objective: String,
    #[serde(default)]
    pub linked_bet: Option<NodeId>,
    #[serde(default)]
    pub inputs: Vec<NodeId>,
    #[serde(default)]
    pub expected_outputs: Vec<String>,
    #[serde(default)]
    pub tools: Vec<String>,
    #[serde(default)]
    pub technique: Option<String>,
    #[serde(default)]
    pub exception_policy: Option<String>,
    #[serde(default)]
    pub evidence_required: Vec<String>,
    #[serde(default)]
    pub status: WorkStatus,
}

/// Budgeted attention quality, not just clock time (SPEC sec 2.4).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AttentionMode {
    Capture,
    EvidenceReview,
    Synthesis,
    DeepCreation,
    DecisionReview,
    ExecutionBuild,
    AdminSetup,
    RecoveryReflection,
}

/// Estimated pomo cost. INV-TIME: no commitment without this.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct PomoEstimate {
    pub pomos: u32,
    #[serde(default = "default_pattern")]
    pub pattern: PomoPattern,
    pub attention_mode: AttentionMode,
}

fn default_pattern() -> PomoPattern {
    PomoPattern::P25M5
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PomoPattern {
    P25M5,   // 25 min focus + 5 min break (default; SPEC sec 2.4)
    DeepPacket, // 6 pomos ~= 3 hours incl breaks
}

/// Timebox lifecycle. INV-REVIEW: cannot reach `Verified` without a review.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimeboxStatus {
    Scheduled,
    Committed,
    InProgress,
    Executed,
    Missed,
    Rescheduled,
    Verified,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Timebox {
    pub id: NodeId,
    pub work_package: NodeId,
    pub status: TimeboxStatus,
    pub estimate: PomoEstimate,
    pub scheduled_start: DateTime<Utc>,
    pub scheduled_end: DateTime<Utc>,
    #[serde(default)]
    pub expected_output: Option<String>,
    #[serde(default)]
    pub review_required: bool,
}

/// Post-block review. INV-REVIEW: required before Timebox -> Verified.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimeboxReview {
    pub id: NodeId,
    pub timebox: NodeId,
    pub executed: bool,
    #[serde(default)]
    pub actual_pomos: u32,
    #[serde(default)]
    pub completed_expected_output: Completion,
    #[serde(default)]
    pub evidence_links: Vec<NodeId>,
    #[serde(default)]
    pub friction_notes: Option<String>,
    #[serde(default)]
    pub hypothesis_update: Option<String>,
    #[serde(default)]
    pub next_action: Option<String>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Completion {
    #[default]
    None,
    Partial,
    Full,
}

/// Value claim. INV-VALUE: no acceptance without proof level + evidence links.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ValueClaim {
    pub id: NodeId,
    pub case: NodeId,
    pub statement: String,
    pub proof_level: crate::evidence::ProofLevel,
    #[serde(default)]
    pub evidence_links: Vec<NodeId>,
    #[serde(default)]
    pub linked_outcome: Option<NodeId>,
    #[serde(default)]
    pub status: ValueStatus,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ValueStatus {
    #[default]
    Drafted,
    Claimed,
    Validated,
    Rejected,
}

/// Strategy Decision Record (SDR) - the strategy analog of an ADR.
/// Created when a bet is approved or a major decision is made.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DecisionRecord {
    pub id: NodeId,
    pub case: NodeId,
    pub decision: String,
    pub rationale: String,
    #[serde(default)]
    pub decided_at: Option<DateTime<Utc>>,
}
