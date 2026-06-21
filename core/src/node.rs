//! Core graph primitives: Node, NodeType, Frontmatter, TypedEdge, EdgeType.
//! See SPEC sec 4. Frontmatter is a sorted map that preserves unknown keys
//! (INV-PORT, INV-EDGE, PLAN sec 2 unknown-key-preservation rule).

use crate::identity::NodeId;
use serde::{Deserialize, Serialize};

/// Every strategy object is one of these typed notes (SPEC sec 4.1).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NodeType {
    Note,
    Journal,
    Source,
    SourceChunk,
    EvidenceItem,
    StrategyCase,
    CaseCharter,
    Erd,
    Ord,
    Sld,
    Eds,
    Vsd,
    Vrd,
    DecisionRecord,
    Actor,
    Ranking,
    McgcsPosition,
    StrategicClaim,
    Assumption,
    Counterevidence,
    Option,
    ChoiceCascade,
    StrategyBet,
    Experiment,
    Metric,
    WorkPackage,
    Timebox,
    TimeboxReview,
    ValueClaim,
    OpenQuestion,
    Risk,
    AgentRun,
    View,
    Template,
}

/// Frontmatter = deterministic sorted key/value map preserving unknown keys.
/// BTreeMap gives deterministic (sorted) serialization for free.
pub type Frontmatter = std::collections::BTreeMap<String, serde_yaml::Value>;

/// A typed markdown node - the atom of the whole system.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Node {
    pub id: NodeId,
    #[serde(rename = "type")]
    pub ty: NodeType,
    #[serde(default)]
    pub frontmatter: Frontmatter,
    #[serde(default)]
    pub body: String,
}

/// Typed strategic relationships (SPEC sec 4.2). Stored authoritatively in
/// frontmatter; the derived index only mirrors them (INV-EDGE).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EdgeType {
    Supports,
    Contradicts,
    DerivesFrom,
    Assumes,
    Tests,
    Implements,
    Blocks,
    Resolves,
    Requires,
    Validates,
    Weakens,
    Supersedes,
    ClaimsValueFor,
    ScheduledBy,
    ReviewedBy,
    CreatedFrom,
    ComparesWith,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EdgeStatus {
    #[default]
    Active,
    Superseded,
    Retracted,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TypedEdge {
    pub from: NodeId,
    pub to: NodeId,
    pub edge_type: EdgeType,
    #[serde(default)]
    pub status: EdgeStatus,
}
