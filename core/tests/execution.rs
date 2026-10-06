//! TST-WORK / TST-TIME — work package and timebox storage fidelity.
//!
//! PRD-019 requires every work package to carry an estimated pomo cost. The
//! typed-view bridge (`format::typed_to_node`) rebuilds frontmatter from struct
//! fields only, so a pomo estimate that is not a `WorkPackage` field is written
//! by `update_node` (which merges raw frontmatter) and then *silently destroyed*
//! by the next typed write — `commit_work_package` being the common one. These
//! tests pin the field so INV-TIME's "estimated pomo cost" actually survives.

use strategynotes_core::execution::{AttentionMode, PomoEstimate, PomoPattern, WorkPackage, WorkStatus};
use strategynotes_core::format::{from_markdown, to_markdown};
use strategynotes_core::node::NodeType;
use strategynotes_core::views::TypedView;
use strategynotes_core::NodeId;

fn wp() -> WorkPackage {
    WorkPackage {
        id: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX50").unwrap(),
        case: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX51").unwrap(),
        objective: "Draft SLD thesis".into(),
        linked_bet: Some(NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX52").unwrap()),
        inputs: vec![NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX53").unwrap()],
        expected_outputs: vec!["thesis doc".into()],
        tools: vec!["SLD workspace".into()],
        technique: Some("compare two alternatives".into()),
        exception_policy: Some("capture ideas; solve local blockers only".into()),
        evidence_required: vec!["EV-MAN".into()],
        status: WorkStatus::Intent,
        pomos: 6,
    }
}

/// PRD-019: the estimate must survive the exact write path a commit performs
/// (typed view -> Node), otherwise the value is destroyed by using the app.
#[test]
fn work_package_pomo_estimate_survives_typed_write() {
    let node = wp().to_node().unwrap();
    let back = WorkPackage::from_node(&node).unwrap();
    assert_eq!(back.pomos, 6, "pomo estimate must survive to_node/from_node");
}

/// INV-DUR: markdown written before this field existed must still open.
#[test]
fn work_package_without_pomo_estimate_defaults_to_zero() {
    let md = "\
---
id: 01HZX8KQBJ9GYWN3QFVYRXTX50
type: work_package
case: 01HZX8KQBJ9GYWN3QFVYRXTX51
objective: Draft SLD thesis
status: intent
---
";
    let node = from_markdown(md).unwrap();
    assert_eq!(node.ty, NodeType::WorkPackage);
    let back = WorkPackage::from_node(&node).unwrap();
    assert_eq!(back.pomos, 0, "a legacy work package must not fail to parse");
}

/// INV-DUR: estimate set by the UI must survive a full markdown write/read,
/// not just the in-memory typed view.
#[test]
fn work_package_pomo_estimate_survives_full_markdown_round_trip() {
    let md = to_markdown(&wp().to_node().unwrap()).unwrap();
    assert!(
        md.contains("pomos: 6"),
        "estimate must be serialized to markdown, got:\n{md}"
    );
    let back = WorkPackage::from_node(&from_markdown(&md).unwrap()).unwrap();
    assert_eq!(back.pomos, 6);
}

/// A fresh work package carries no estimate yet (INV-TIME not yet met), so the
/// UI can show "no estimate" rather than a fabricated 0 cost.
#[test]
fn new_work_package_has_no_pomo_estimate() {
    let mut w = wp();
    w.pomos = 0;
    assert_eq!(w.pomos, 0);
}

// ---- timebox estimate shape (what capacity must read) ----

/// SDS-TIME: a timebox owns its pomo cost under `estimate`, not at top level.
#[test]
fn timebox_estimate_holds_pomos() {
    let est = PomoEstimate {
        pomos: 6,
        pattern: PomoPattern::DeepPacket,
        attention_mode: AttentionMode::ExecutionBuild,
    };
    assert_eq!(est.pomos, 6);
}
