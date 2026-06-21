//! Governance objects: open questions, risks, agent runs, activity events.
//! Guards INV-HUMAN (agent draft quarantine), INV-DAY (activity capture).

use crate::identity::NodeId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// An open question raised when spec/implementation is ambiguous (PLAN sec 1
/// drift rule). Halting signal for autonomous agents.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OpenQuestion {
    pub id: NodeId,
    pub title: String,
    pub statement: String,
    #[serde(default)]
    pub affected_ids: Vec<String>, // PRD/SDS/INV/TST ids
    #[serde(default)]
    pub status: QuestionStatus,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum QuestionStatus {
    #[default]
    Open,
    Pending,
    Resolved,
    WontFix,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Risk {
    pub id: NodeId,
    pub description: String,
    #[serde(default)]
    pub mitigation: Option<String>,
}

/// Agent run state. INV-HUMAN: agent output enters Draft; never auto-accepted.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgentRunStatus {
    #[default]
    Running,
    Completed,
    Quarantined,
    Accepted,
    Rejected,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AgentRun {
    pub id: NodeId,
    pub agent: String,
    pub status: AgentRunStatus,
    #[serde(default)]
    pub started_at: Option<DateTime<Utc>>,
    #[serde(default)]
    pub summary: Option<String>,
}

/// An activity event captured by an EventSink (daynote ledger). INV-DAY:
/// events are recorded, not manually fabricated.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActivityEvent {
    pub at: DateTime<Utc>,
    pub node: NodeId,
    pub kind: ActivityKind,
    #[serde(default)]
    pub source: Option<EventSource>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActivityKind {
    Created,
    Modified,
    Scheduled,
    Accepted, // evidence/claim/bet acceptance - gate-driven
    Verified, // timebox verification
}

/// What produced the event - distinguishes user vs agent vs external edits
/// (OQ-005: external file edits count as modifications with source metadata).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventSource {
    User,
    Agent,
    ExternalFile,
    System,
}
