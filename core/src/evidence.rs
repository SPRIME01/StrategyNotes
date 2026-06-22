//! Evidence + claim-strength vocabulary (SPEC sec 2.5, 4.4). Guards INV-EVID,
//! INV-CLAIM, INV-CONTRA.

use crate::identity::NodeId;
use serde::{Deserialize, Serialize};

/// Proof level every accepted claim carries (SPEC sec 2.5).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProofLevel {
    Observed,
    Supported,
    Inferred,
    Hypothesized,
    Speculative,
    Contested,
    Validated,
    Rejected,
}

/// Evidence lifecycle. Only `Accepted` counts toward strategy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceStatus {
    Drafted,
    Reviewed,
    Accepted,
    Rejected,
    Superseded,
}

/// What kind of evidence this is (shapes how it is rendered and cited).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceKind {
    DirectQuote,
    Paraphrase,
    Summary,
    Observation,
    DataPoint,
    Manual,
}

/// A source document imported into the vault (article, transcript, note, etc.).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Source {
    #[serde(skip)]
    pub id: NodeId,
    pub title: String,
    #[serde(default)]
    pub provenance: Option<String>,
}

/// A located chunk within a source - the unit evidence is extracted from.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SourceChunk {
    #[serde(skip)]
    pub id: NodeId,
    pub source: NodeId,
    pub locator: String, // page, timestamp, offset - source-format specific
    pub text: String,
}

/// A reviewable evidence item extracted from a chunk. INV-EVID: cannot be
/// `Accepted` without a source link or explicit manual basis + reviewer.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvidenceItem {
    #[serde(skip)]
    pub id: NodeId,
    pub kind: EvidenceKind,
    pub status: EvidenceStatus,
    pub proof_level: ProofLevel,
    pub source_chunk: Option<NodeId>,
    pub manual_basis_reviewer: Option<String>,
    pub text: String,
    #[serde(default)]
    pub supports: Vec<NodeId>,
    #[serde(default)]
    pub contradicts: Vec<NodeId>,
}
