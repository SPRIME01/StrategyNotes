//! Phase 2 storage format tests (TST-STORAGE). The first slice (S-STORAGE-001)
//! proves the markdown round-trip: parse -> serialize -> parse yields equivalent
//! domain state, and that the failure modes listed in PLAN sec 6 S-STORAGE-001
//! (missing id, invalid frontmatter, unknown keys) behave correctly.
//!
//! Guards: INV-DUR (markdown is durable), INV-PORT (portable + inspectable),
//! the unknown-key-preservation rule (PLAN sec 2), and deterministic
//! serialization (PLAN sec 2).

use strategynotes_core::format::{edges_of, from_markdown, set_edges, to_markdown};
use strategynotes_core::{EdgeType, Node, NodeId, NodeType, TypedEdge};

const SAMPLE: &str = "---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: strategy_case\nowner: Sam\narena: GodSpeed MVP\n---\n# GodSpeed strategy\n\nBody text here.\n";

#[test]
fn round_trip_preserves_domain_state() {
    let node = from_markdown(SAMPLE).expect("parse");
    assert_eq!(
        node.id,
        NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap()
    );
    assert_eq!(node.ty, NodeType::StrategyCase);
    assert!(node.body.contains("# GodSpeed strategy"));
    // unknown keys preserved:
    assert_eq!(
        node.frontmatter.get("owner").and_then(|v| v.as_str()),
        Some("Sam")
    );
    assert_eq!(
        node.frontmatter.get("arena").and_then(|v| v.as_str()),
        Some("GodSpeed MVP")
    );

    // Serialize -> parse -> equivalent.
    let reserialized = to_markdown(&node).expect("serialize");
    let reparsed: Node = from_markdown(&reserialized).expect("reparse");
    assert_eq!(reparsed.id, node.id);
    assert_eq!(reparsed.ty, node.ty);
    assert_eq!(reparsed.frontmatter, node.frontmatter);
    assert_eq!(reparsed.body, node.body);
}

#[test]
fn determinism_serializing_twice_yields_identical_bytes() {
    let node = from_markdown(SAMPLE).unwrap();
    let a = to_markdown(&node).unwrap();
    let b = to_markdown(&node).unwrap();
    assert_eq!(a, b, "serialization must be deterministic");
}

#[test]
fn unknown_frontmatter_keys_round_trip() {
    let text = "---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: note\nfuture_unknown_key: keep_me\nnested:\n  x: 1\n  y: 2\n---\nbody\n";
    let node = from_markdown(text).unwrap();
    assert_eq!(
        node.frontmatter.get("future_unknown_key").and_then(|v| v.as_str()),
        Some("keep_me")
    );
    let out = to_markdown(&node).unwrap();
    let reparsed = from_markdown(&out).unwrap();
    assert_eq!(reparsed.frontmatter, node.frontmatter);
}

#[test]
fn missing_id_is_rejected() {
    let text = "---\ntype: note\n---\nbody\n";
    let err = from_markdown(text).unwrap_err();
    let msg = format!("{err}");
    assert!(msg.contains("id"), "error should mention id: {msg}");
}

#[test]
fn missing_type_is_rejected() {
    let text = "---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\n---\nbody\n";
    let err = from_markdown(text).unwrap_err();
    let msg = format!("{err}");
    assert!(msg.contains("type"), "error should mention type: {msg}");
}

#[test]
fn missing_leading_delimiter_is_rejected() {
    let text = "id: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: note\n";
    let err = from_markdown(text).unwrap_err();
    let msg = format!("{err}");
    assert!(msg.contains("---"), "error should mention delimiter: {msg}");
}

#[test]
fn missing_closing_delimiter_is_rejected() {
    let text = "---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: note\nbody runs on\n";
    let err = from_markdown(text).unwrap_err();
    let msg = format!("{err}");
    assert!(msg.contains("---"), "error should mention delimiter: {msg}");
}

#[test]
fn typed_edges_round_trip_through_frontmatter() {
    // INV-EDGE: edges reconstructable from frontmatter alone.
    let mut node = from_markdown("---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: strategic_claim\n---\nbody\n").unwrap();
    let target_a = NodeId::parse("01HZX9W3HJ4C2V1DKE8XFNAB63").unwrap();
    let target_b = NodeId::parse("01HZXA8P2KQ5R7M4XHYNGBTEF1").unwrap();
    let edges = vec![
        TypedEdge { from: node.id, to: target_a, edge_type: EdgeType::Supports, status: Default::default() },
        TypedEdge { from: node.id, to: target_b, edge_type: EdgeType::DerivesFrom, status: Default::default() },
    ];
    set_edges(&mut node, &edges).unwrap();

    // Serialize to markdown, reparse, recover edges - reconstructable from text.
    let md = to_markdown(&node).unwrap();
    let reparsed = from_markdown(&md).unwrap();
    let recovered = edges_of(&reparsed).unwrap();
    assert_eq!(recovered.len(), 2);
    assert_eq!(recovered[0].to, target_a);
    assert_eq!(recovered[0].edge_type, EdgeType::Supports);
    assert_eq!(recovered[1].to, target_b);
    assert_eq!(recovered[1].edge_type, EdgeType::DerivesFrom);
    // `from` is filled in as this node's id:
    assert_eq!(recovered[0].from, node.id);
}

#[test]
fn set_edges_with_empty_list_clears_the_key() {
    let mut node = from_markdown("---\nid: 01HZX8KQBJ9GYWN3QFVYRXTXMS\ntype: note\nedges: []\n---\nb\n").unwrap();
    set_edges(&mut node, &[]).unwrap();
    assert!(!node.frontmatter.contains_key("edges"));
}
