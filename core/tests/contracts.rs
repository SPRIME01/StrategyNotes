//! Phase 1 contract tests (EV-CT). Proves the shared types serialize/deserialize
//! to the shapes SPEC sec 4.4 and sec 9 require, and that identity round-trips.

use strategynotes_core::{
    EdgeType, GateResult, Node, NodeId, NodeType, TypedEdge,
};

#[test]
fn node_id_roundtrips_lexically() {
    let s = "01HZX8KQBJ9GYWN3QFVYRXTXMS";
    let id = NodeId::parse(s).expect("parse");
    assert_eq!(id.to_lexical(), s);
    assert_eq!(format!("{id}"), s);
}

#[test]
fn node_id_sorts_lexically() {
    // ULIDs are sortable; lexical order == creation order.
    let a = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap();
    let b = NodeId::parse("01HZX9W3HJ4C2V1DKE8XFNAB63").unwrap();
    assert!(a < b, "earlier ULID sorts first");
}

#[test]
fn node_serde_roundtrip_preserves_typed_fields() {
    let id = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap();
    let node = Node {
        id,
        ty: NodeType::StrategyCase,
        frontmatter: Default::default(),
        body: "case body".into(),
    };
    let yaml = serde_yaml::to_string(&node).unwrap();
    let back: Node = serde_yaml::from_str(&yaml).unwrap();
    assert_eq!(back.id, id);
    assert_eq!(back.ty, NodeType::StrategyCase);
    assert_eq!(back.body, "case body");
}

#[test]
fn typed_edge_uses_snake_case_edge_type() {
    let edge = TypedEdge {
        from: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap(),
        to: NodeId::parse("01HZX9W3HJ4C2V1DKE8XFNAB63").unwrap(),
        edge_type: EdgeType::DerivesFrom,
        status: Default::default(),
    };
    let yaml = serde_yaml::to_string(&edge).unwrap();
    assert!(
        yaml.contains("edge_type: derives_from"),
        "expected snake_case edge_type, got:\n{yaml}"
    );
}

#[test]
fn gate_result_blocked_shape_matches_spec() {
    // SPEC sec 9: {"status":"blocked","failed_gates":[...]}
    let result = GateResult::blocked(["missing_kill_criteria", "missing_owner"]);
    let json = serde_json::to_string(&result).unwrap();
    assert_eq!(
        json,
        r#"{"status":"blocked","failed_gates":["missing_kill_criteria","missing_owner"]}"#
    );
}

#[test]
fn gate_result_approved_shape_matches_spec() {
    let json = serde_json::to_string(&GateResult::Approved).unwrap();
    assert_eq!(json, r#"{"status":"approved"}"#);
}
