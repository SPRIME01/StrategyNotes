//! Strategy domain view structs (SPEC sec 4.4, sec 2.1-2.3). These are typed
//! views over the underlying Node frontmatter - they describe the fields a
//! node of each type carries. The storage adapter (Phase 2) maps to/from the
//! raw frontmatter map.

use crate::evidence::ProofLevel;
use crate::identity::NodeId;
use serde::{Deserialize, Serialize};

/// Case lifecycle phase. Transitions are gate-guarded (Phase 5/7).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CasePhase {
    EstablishReality,
    DefineOutcomes,
    DevelopLogic,
    ChooseAndBet,
    DesignExecution,
    Validate,
    RealizeValue,
    Review,
    Closed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StrategyCase {
    pub id: NodeId,
    pub title: String,
    pub phase: CasePhase,
    #[serde(default)]
    pub owner: Option<String>,
    #[serde(default)]
    pub arena: Option<String>,
}

/// An outcome requirement (ORD). Acceptance criteria required for success.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OutcomeRequirement {
    pub id: NodeId,
    pub case: NodeId,
    pub statement: String,
    #[serde(default)]
    pub acceptance_criteria: Vec<String>,
}

/// A strategic claim (SLD thesis, sub-thesis, or load-bearing assertion).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StrategicClaim {
    pub id: NodeId,
    pub statement: String,
    pub proof_level: ProofLevel,
    #[serde(default)]
    pub supports: Vec<NodeId>,
    #[serde(default)]
    pub contradicts: Vec<NodeId>,
}

/// An assumption that, if false, breaks the strategy (load-bearing).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Assumption {
    pub id: NodeId,
    pub statement: String,
    #[serde(default)]
    pub status: AssumptionStatus,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssumptionStatus {
    #[default]
    Untested,
    Testing,
    Confirmed,
    Weakened,
    Falsified,
}

/// Choice cascade level (SPEC sec 2.3).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChoiceLevel {
    Aspiration,
    WhereToPlay,
    HowToWin,
    Capabilities,
    Systems,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ChoiceCascade {
    pub id: NodeId,
    pub case: NodeId,
    pub level: ChoiceLevel,
    pub statement: String,
}

/// A strategy bet. INV-BET: cannot be approved without assumptions,
/// counterevidence review, success metric, kill criteria, owner.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StrategyBet {
    pub id: NodeId,
    pub case: NodeId,
    pub thesis: String,
    #[serde(default)]
    pub linked_choice: Option<NodeId>,
    #[serde(default)]
    pub assumptions: Vec<NodeId>,
    #[serde(default)]
    pub counterevidence_reviewed: bool,
    #[serde(default)]
    pub success_metric: Option<String>,
    #[serde(default)]
    pub kill_criteria: Option<String>,
    #[serde(default)]
    pub owner: Option<String>,
    #[serde(default)]
    pub status: BetStatus,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BetStatus {
    #[default]
    Draft,
    UnderReview,
    Approved,
    Killed,
    Superseded,
}
