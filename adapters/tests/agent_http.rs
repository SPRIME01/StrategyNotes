//! Phase C agent quarantine service tests (TST-AGENT-HTTP). The HTTP endpoints
//! are thin wrappers over these App methods, so proving the service behavior
//! proves the endpoint behavior. INV-HUMAN: no path auto-accepts.

use strategynotes_adapters::{DaynoteEventSink, MarkdownVault, SQLiteIndex, SystemClock, UlidMinter};
use strategynotes_core::governance::AgentRunStatus;
use strategynotes_core::ports::NodeVault;
use strategynotes_core::services::App;
use strategynotes_core::views::TypedView;
use strategynotes_core::GateResult;

fn app<'a>(vault: &'a MarkdownVault, sink: &'a DaynoteEventSink) -> App<'a> {
    App {
        vault,
        sink,
        minter: &UlidMinter,
        clock: &SystemClock,
    }
}

#[test]
fn tst_agent_http_001_accept_requires_human_reviewer() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("dn")).unwrap();
    let _ = SQLiteIndex::open_in_memory().unwrap();
    let app = app(&vault, &sink);

    let run = app.create_agent_run("critic".into(), "draft bet".into()).unwrap();
    let _ = app.complete_agent_run(run.id).unwrap();

    // No reviewer -> BLOCKED.
    let blocked = app.accept_agent_run(run.id, None).unwrap();
    assert!(matches!(blocked, GateResult::Blocked { .. }));
    // The run must NOT have become Accepted.
    let still = strategynotes_core::governance::AgentRun::from_node(
        &vault.get(&run.id).unwrap().unwrap(),
    )
    .unwrap();
    assert_eq!(still.status, AgentRunStatus::Completed, "no auto-accept without reviewer");

    // With reviewer -> APPROVED, run becomes Accepted.
    let approved = app.accept_agent_run(run.id, Some("Sam")).unwrap();
    assert!(approved.is_approved());
    let after = strategynotes_core::governance::AgentRun::from_node(
        &vault.get(&run.id).unwrap().unwrap(),
    )
    .unwrap();
    assert_eq!(after.status, AgentRunStatus::Accepted);
}

#[test]
fn tst_agent_http_002_reject_preserves_audit() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("dn")).unwrap();
    let app = app(&vault, &sink);

    let run = app.create_agent_run("drafter".into(), "original output preserved".into()).unwrap();
    let _ = app.complete_agent_run(run.id).unwrap();
    let rejected = app.reject_agent_run(run.id).unwrap();
    assert_eq!(rejected.status, AgentRunStatus::Rejected);

    // Audit: the run node survives in the vault with its summary intact.
    let persisted = strategynotes_core::governance::AgentRun::from_node(
        &vault.get(&run.id).unwrap().unwrap(),
    )
    .unwrap();
    assert_eq!(persisted.status, AgentRunStatus::Rejected);
    assert_eq!(persisted.summary.as_deref(), Some("original output preserved"));
}

#[test]
fn tst_agent_http_003_request_changes_preserves_original() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("dn")).unwrap();
    let app = app(&vault, &sink);

    let run = app.create_agent_run("drafter".into(), "v1 output".into()).unwrap();
    let _ = app.complete_agent_run(run.id).unwrap();
    let rc = app.request_changes(run.id).unwrap();
    assert_eq!(rc.status, AgentRunStatus::Quarantined);

    // Original output preserved; status is the new review state.
    let persisted = strategynotes_core::governance::AgentRun::from_node(
        &vault.get(&run.id).unwrap().unwrap(),
    )
    .unwrap();
    assert_eq!(persisted.summary.as_deref(), Some("v1 output"));
    assert_eq!(persisted.status, AgentRunStatus::Quarantined);
}

#[test]
fn tst_agent_http_004_direct_auto_accept_is_impossible() {
    // There is no service method that sets Accepted without a reviewer. The
    // only path to Accepted is accept_agent_run(_, Some(non-empty)), which
    // runs the gate. Confirm a freshly-created run is Running, not Accepted.
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("dn")).unwrap();
    let app = app(&vault, &sink);

    let run = app.create_agent_run("agent".into(), "x".into()).unwrap();
    assert_eq!(run.status, AgentRunStatus::Running);

    // Even completing doesn't accept.
    let completed = app.complete_agent_run(run.id).unwrap();
    assert_eq!(completed.status, AgentRunStatus::Completed);
    assert_ne!(completed.status, AgentRunStatus::Accepted);
}
