//! Phase 5 strategy domain tests (TST-STRAT). Proves a StrategyCase round-trips
//! through its storage Node and through the markdown format, and that the
//! typed-view bridge preserves all fields.

use strategynotes_core::format::{from_markdown, to_markdown};
use strategynotes_core::strategy::{CasePhase, StrategyCase};
use strategynotes_core::views::TypedView;
use strategynotes_core::NodeId;

#[test]
fn strategy_case_round_trips_through_node() {
    let id = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap();
    let mut case = StrategyCase::new(id, "GodSpeed AI MVP".into());
    case.owner = Some("Sam".into());
    case.arena = Some("founder/operator AI".into());
    case.phase = CasePhase::DevelopLogic;

    let node = case.to_node().unwrap();
    let back = StrategyCase::from_node(&node).unwrap();
    assert_eq!(back.id, case.id);
    assert_eq!(back.title, case.title);
    assert_eq!(back.phase, case.phase);
    assert_eq!(back.owner, case.owner);
    assert_eq!(back.arena, case.arena);
}

#[test]
fn strategy_case_survives_full_markdown_round_trip() {
    // The typed view must survive: -> Node -> markdown text -> Node -> typed view.
    let id = NodeId::parse("01HZX9W3HJ4C2V1DKE8XFNAB63").unwrap();
    let mut case = StrategyCase::new(id, "Q3 pricing strategy".into());
    case.owner = Some("Sam".into());

    let md = to_markdown(&case.to_node().unwrap()).unwrap();
    let reparsed_node = from_markdown(&md).unwrap();
    let reparsed = StrategyCase::from_node(&reparsed_node).unwrap();

    assert_eq!(reparsed.id, case.id);
    assert_eq!(reparsed.title, case.title);
    assert_eq!(reparsed.phase, CasePhase::EstablishReality); // default for new()
    assert_eq!(reparsed.owner, case.owner);
}

#[test]
fn new_case_starts_in_establish_reality() {
    let id = NodeId::parse("01HZXA8P2KQ5R7M4XHYNGBTEF1").unwrap();
    let case = StrategyCase::new(id, "fresh".into());
    assert_eq!(case.phase, CasePhase::EstablishReality);
}
