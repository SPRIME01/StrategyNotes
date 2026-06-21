//! Phase 2 storage format tests (TST-STORAGE). The first slice (S-STORAGE-001)
//! proves the markdown round-trip: parse -> serialize -> parse yields equivalent
//! domain state, and that the failure modes listed in PLAN sec 6 S-STORAGE-001
//! (missing id, invalid frontmatter, unknown keys) behave correctly.
//!
//! Guards: INV-DUR (markdown is durable), INV-PORT (portable + inspectable),
//! the unknown-key-preservation rule (PLAN sec 2), and deterministic
//! serialization (PLAN sec 2).

use strategynotes_core::format::{from_markdown, to_markdown};
use strategynotes_core::{Node, NodeId, NodeType};

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
