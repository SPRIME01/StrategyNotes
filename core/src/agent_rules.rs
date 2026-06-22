//! Agent draft quarantine rules (Phase 13). INV-HUMAN: agents may draft,
//! critique, or suggest; humans approve. An agent run cannot move to Accepted
//! without a non-empty human approver. Guards the last un-enforced invariant.

use crate::governance::{AgentRun, AgentRunStatus};
use crate::gate::GateResult;

/// SPEC sec 7 (CTRL-05 / INV-HUMAN): no agent output becomes Accepted without
/// a named human approver. Returns Blocked if the run is not in a quarantined/
/// completed state or no approver is named.
pub fn can_accept_agent_run(run: &AgentRun, human_approver: Option<&str>) -> GateResult {
    let mut failed: Vec<&'static str> = Vec::new();
    let approver_present = human_approver.map_or(false, |s| !s.trim().is_empty());
    if !approver_present {
        failed.push("missing human approver (agents cannot self-accept)");
    }
    if !matches!(
        run.status,
        AgentRunStatus::Completed | AgentRunStatus::Quarantined
    ) {
        failed.push("agent run is not in a Completed/Quarantined state");
    }
    if failed.is_empty() {
        GateResult::Approved
    } else {
        GateResult::blocked(failed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::governance::{AgentRun, AgentRunStatus};
    use crate::NodeId;

    fn run(status: AgentRunStatus) -> AgentRun {
        AgentRun {
            id: NodeId::default(),
            agent: "critic".into(),
            status,
            started_at: None,
            summary: None,
        }
    }

    #[test]
    fn agent_cannot_self_accept() {
        let r = run(AgentRunStatus::Completed);
        assert!(matches!(
            can_accept_agent_run(&r, None),
            GateResult::Blocked { .. }
        ));
    }

    #[test]
    fn human_can_accept_completed_run() {
        let r = run(AgentRunStatus::Completed);
        assert!(matches!(
            can_accept_agent_run(&r, Some("Sam")),
            GateResult::Approved
        ));
    }

    #[test]
    fn empty_approver_string_is_rejected() {
        let r = run(AgentRunStatus::Quarantined);
        assert!(matches!(
            can_accept_agent_run(&r, Some("   ")),
            GateResult::Blocked { .. }
        ));
    }

    #[test]
    fn running_run_cannot_be_accepted_even_with_approver() {
        let r = run(AgentRunStatus::Running);
        assert!(matches!(
            can_accept_agent_run(&r, Some("Sam")),
            GateResult::Blocked { .. }
        ));
    }
}
