use strategynotes_adapters::{
    DaynoteEventSink, MarkdownVault, SQLiteIndex, SystemClock, UlidMinter,
};
use strategynotes_core::node::{Node, NodeType};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::services::App;
use strategynotes_core::trace::reachable_via_spine;
use strategynotes_core::NodeId;

fn app<'a>(vault: &'a MarkdownVault, sink: &'a DaynoteEventSink) -> App<'a> {
    App {
        vault,
        sink,
        minter: &UlidMinter,
        clock: &SystemClock,
    }
}

fn nodes_of_type(index: &SQLiteIndex, vault: &MarkdownVault, ty: NodeType) -> Vec<Node> {
    index
        .nodes_by_type(ty)
        .unwrap()
        .into_iter()
        .map(|id| vault.get(&id).unwrap().unwrap())
        .collect()
}

fn frontmatter_str<'a>(node: &'a Node, key: &str) -> &'a str {
    node.frontmatter
        .get(key)
        .and_then(serde_yaml::Value::as_str)
        .unwrap_or("")
}

fn find_node(
    index: &SQLiteIndex,
    vault: &MarkdownVault,
    ty: NodeType,
    key: &str,
    value: &str,
) -> Node {
    nodes_of_type(index, vault, ty)
        .into_iter()
        .find(|node| frontmatter_str(node, key) == value)
        .unwrap()
}

fn assert_seeded(index: &SQLiteIndex, ty: NodeType, label: &str) {
    let ids = index.nodes_by_type(ty).unwrap();
    assert!(
        !ids.is_empty(),
        "seed should create at least one {label} node"
    );
}

#[test]
fn seed_demo_populates_every_primary_ui_projection() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path().join("vault")).unwrap();
    let index = SQLiteIndex::open_file(tmp.path().join("index.db")).unwrap();
    let sink = DaynoteEventSink::open(tmp.path().join("daynotes")).unwrap();
    let app = app(&vault, &sink);

    let created = app.seed_demo().unwrap();
    assert!(created > 0, "first seed call should add demo content");
    assert_eq!(app.seed_demo().unwrap(), 0, "seed should be idempotent");

    index.rebuild(&vault).unwrap();

    for (ty, label) in [
        (NodeType::Note, "note"),
        (NodeType::Source, "source"),
        (NodeType::SourceChunk, "source_chunk"),
        (NodeType::EvidenceItem, "evidence_item"),
        (NodeType::StrategyCase, "strategy_case"),
        (NodeType::Erd, "erd artifact"),
        (NodeType::Ord, "ord artifact"),
        (NodeType::Sld, "sld artifact"),
        (NodeType::Eds, "eds artifact"),
        (NodeType::Vsd, "vsd artifact"),
        (NodeType::Vrd, "vrd artifact"),
        (NodeType::StrategicClaim, "strategic_claim"),
        (NodeType::Assumption, "assumption"),
        (NodeType::Counterevidence, "counterevidence"),
        (NodeType::ChoiceCascade, "choice_cascade"),
        (NodeType::StrategyBet, "strategy_bet"),
        (NodeType::Experiment, "experiment"),
        (NodeType::Metric, "metric"),
        (NodeType::WorkPackage, "work_package"),
        (NodeType::Timebox, "timebox"),
        (NodeType::TimeboxReview, "timebox_review"),
        (NodeType::ValueClaim, "value_claim"),
        (NodeType::AgentRun, "agent_run"),
    ] {
        assert_seeded(&index, ty, label);
    }

    let accepted = nodes_of_type(&index, &vault, NodeType::EvidenceItem)
        .into_iter()
        .filter(|node| frontmatter_str(node, "status").eq_ignore_ascii_case("accepted"))
        .count();
    assert!(accepted > 0, "ERD needs accepted evidence");

    let approved_bet = find_node(&index, &vault, NodeType::StrategyBet, "status", "approved");
    assert!(
        has_human_title(&approved_bet),
        "approved seed bet should have a readable trace label"
    );
    let trace = reachable_via_spine(&index, approved_bet.id).unwrap();
    for ty in [
        NodeType::WorkPackage,
        NodeType::Timebox,
        NodeType::TimeboxReview,
        NodeType::ValueClaim,
    ] {
        assert!(
            trace_contains_type(&trace, &vault, ty),
            "trace from approved bet should reach {ty:?}"
        );
    }
    for node in trace.iter().filter_map(|id| vault.get(id).ok().flatten()) {
        assert!(
            has_human_title(&node),
            "seeded trace node {:?} should have a readable UI label",
            node.ty
        );
    }
}

fn trace_contains_type(
    trace: &std::collections::HashSet<NodeId>,
    vault: &MarkdownVault,
    ty: NodeType,
) -> bool {
    trace
        .iter()
        .filter_map(|id| vault.get(id).ok().flatten())
        .any(|node| node.ty == ty)
}

fn has_human_title(node: &Node) -> bool {
    !frontmatter_str(node, "title").is_empty() || !node.body.trim().is_empty()
}
