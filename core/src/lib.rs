//! StrategyNotes pure domain core (the hexagon).
//!
//! See SPEC.md sec 3.4 (Ports & Adapters). This crate contains NO I/O, no
//! framework, no storage, no network. All interaction crosses a port
//! (`ports`). Adapters live outside this crate.
//!
//! Invariants enforced by construction:
//!   INV-DUR   - only an outer NodeVault adapter is durable; this core has no DB
//!   INV-CAL   - CalendarProvider is a port; no provider code reachable here
//!   INV-HUMAN - gates run here; driving adapters cannot bypass them
//!
//! Any import of std::fs, rusqlite, reqwest, tokio, or Tauri types inside this
//! crate is a review-blocker (AGENTS.md sec 10).

pub mod agent_rules;
pub mod body;
pub mod capacity;
pub mod case_lifecycle;
pub mod error;
pub mod evidence;
pub mod evidence_rules;
pub mod execution;
pub mod format;
pub mod gate;
pub mod gates;
pub mod governance;
pub mod graph;
pub mod ics;
pub mod identity;
pub mod naming;
pub mod node;
pub mod ports;
pub mod search;
pub mod services;
pub mod strategy;
pub mod time;
pub mod trace;
pub mod views;
pub mod vrd;

pub use error::Error;
pub use evidence::{
    EvidenceItem, EvidenceKind, EvidenceStatus, ProofLevel, Source, SourceChunk,
};
pub use execution::{
    AttentionMode, Completion, DecisionRecord, PomoEstimate, PomoPattern, Timebox,
    TimeboxReview, TimeboxStatus, ValueClaim, ValueStatus, WorkPackage, WorkStatus,
};
pub use gate::{GateId, GateResult};
pub use governance::{
    ActivityEvent, ActivityKind, AgentRun, AgentRunStatus, EventSource, OpenQuestion,
    QuestionStatus, Risk,
};
pub use identity::NodeId;
pub use node::{EdgeStatus, EdgeType, Frontmatter, Node, NodeType, TypedEdge};
pub use ports::{Clock, DerivedIndex, EventSink, IdMinter, NodeVault};
pub use strategy::{
    Assumption, AssumptionStatus, BetStatus, CasePhase, ChoiceCascade, ChoiceLevel,
    OutcomeRequirement, StrategicClaim, StrategyBet, StrategyCase,
};
