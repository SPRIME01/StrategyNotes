//! Phase 4 graph logic tests (TST-GRAPH). Guards INV-CLONE: a `Places` edge
//! that would close a cycle is rejected. Uses a fake DerivedIndex (no adapter
//! needed) to keep the test pure-core.

use std::collections::HashMap;

use strategynotes_core::format::frontmatter_from_yaml_str;
use strategynotes_core::graph::{referencing_nodes, would_create_placement_cycle};
use strategynotes_core::node::{Node, NodeType, TypedEdge};
use strategynotes_core::ports::DerivedIndex;
use strategynotes_core::{EdgeType, NodeId, Error};

/// In-memory index for unit testing pure graph logic.
struct FakeIndex {
    by_from: HashMap<NodeId, Vec<TypedEdge>>,
}

impl FakeIndex {
    fn from_edges(edges: &[(&str, &str, EdgeType)]) -> Self {
        let mut by_from: HashMap<NodeId, Vec<TypedEdge>> = HashMap::new();
        for (f, t, et) in edges {
            let from = NodeId::parse(f).unwrap();
            let to = NodeId::parse(t).unwrap();
            by_from.entry(from).or_default().push(TypedEdge {
                from,
                to,
                edge_type: *et,
                status: Default::default(),
            });
        }
        Self { by_from }
    }
}

impl DerivedIndex for FakeIndex {
    fn rebuild(&self, _vault: &dyn strategynotes_core::ports::NodeVault) -> Result<(), Error> {
        Ok(())
    }
    fn backlinks(&self, id: &NodeId) -> Result<Vec<NodeId>, Error> {
        Ok(self
            .by_from
            .values()
            .flatten()
            .filter(|e| e.to == *id)
            .map(|e| e.from)
            .collect())
    }
    fn out_edges(&self, id: &NodeId) -> Result<Vec<TypedEdge>, Error> {
        Ok(self.by_from.get(id).cloned().unwrap_or_default())
    }
    fn nodes_by_type(&self, _ty: NodeType) -> Result<Vec<NodeId>, Error> {
        Ok(Vec::new())
    }
}

const A: &str = "01HZX8KQBJ9GYWN3QFVYRXTX01";
const B: &str = "01HZX8KQBJ9GYWN3QFVYRXTX02";
const C: &str = "01HZX8KQBJ9GYWN3QFVYRXTX03";
const D: &str = "01HZX8KQBJ9GYWN3QFVYRXTX04";

fn id(s: &str) -> NodeId {
    NodeId::parse(s).unwrap()
}

#[test]
fn adding_a_new_placement_with_no_path_is_safe() {
    // existing: A->places->B. Adding A->places->C (C new) is safe.
    let idx = FakeIndex::from_edges(&[(A, B, EdgeType::Places)]);
    assert!(!would_create_placement_cycle(&idx, id(A), id(C)).unwrap());
}

#[test]
fn closing_a_direct_cycle_is_rejected() {
    // existing: A->places->B. Adding B->places->A would close a 2-cycle.
    let idx = FakeIndex::from_edges(&[(A, B, EdgeType::Places)]);
    assert!(would_create_placement_cycle(&idx, id(B), id(A)).unwrap());
}

#[test]
fn closing_a_transitive_cycle_is_rejected() {
    // existing chain: A->places->B->places->C. Adding C->places->A closes the loop.
    let idx =
        FakeIndex::from_edges(&[(A, B, EdgeType::Places), (B, C, EdgeType::Places)]);
    assert!(would_create_placement_cycle(&idx, id(C), id(A)).unwrap());
}

#[test]
fn self_loop_is_rejected() {
    let idx = FakeIndex::from_edges(&[]);
    assert!(would_create_placement_cycle(&idx, id(A), id(A)).unwrap());
}

#[test]
fn non_places_edges_do_not_participate_in_cycle_check() {
    // A->supports->B->requires->A exists, but those are not Places edges;
    // adding A->places->B must still be safe.
    let idx = FakeIndex::from_edges(&[
        (A, B, EdgeType::Supports),
        (B, A, EdgeType::Requires),
    ]);
    assert!(!would_create_placement_cycle(&idx, id(A), id(B)).unwrap());
}

#[test]
fn independent_branch_does_not_trigger_false_positive() {
    // A->places->B and C->places->D are independent subtrees.
    // Adding D->places->B is safe (D's descendants don't include B's... wait,
    // we add parent=D, child=B; check: does B reach D via Places? No. Safe.)
    let idx = FakeIndex::from_edges(&[
        (A, B, EdgeType::Places),
        (C, D, EdgeType::Places),
    ]);
    assert!(!would_create_placement_cycle(&idx, id(D), id(B)).unwrap());
}

// ---------- deletion safety (INV-DUR: never orphan a reference) ----------
//
// DELETE /api/notes/:id had no type guard and no reachability check, so one
// click could remove a strategy object that four other nodes still pointed at.
// `referencing_nodes` is the pure check behind the refusal.

const T: &str = "01HZX8KQBJ9GYWN3QFVYRXTX05"; // the node we want to delete
const X: &str = "01HZX8KQBJ9GYWN3QFVYRXTX06"; // a node that points at it

fn node_with(id: &str, fm_yaml: &str) -> Node {
    Node {
        id: NodeId::parse(id).unwrap(),
        ty: NodeType::Note,
        frontmatter: frontmatter_from_yaml_str(fm_yaml).unwrap(),
        body: String::new(),
    }
}

#[test]
fn referencing_nodes_finds_a_scalar_reference() {
    let referrer = node_with(X, &format!("linked_bet: {T}\nobjective: ship\n"));
    let target = node_with(T, "status: approved\n");
    let hits = referencing_nodes(&[referrer, target], id(T));
    assert_eq!(hits, vec![id(X)], "the node naming T must be reported");
}

#[test]
fn referencing_nodes_finds_a_reference_inside_a_list() {
    let referrer = node_with(X, &format!("assumptions:\n  - {T}\n"));
    let hits = referencing_nodes(&[referrer], id(T));
    assert_eq!(hits, vec![id(X)]);
}

#[test]
fn referencing_nodes_finds_an_edge_target() {
    let referrer = node_with(
        X,
        &format!("edges:\n  - to: {T}\n    type: derives_from\n    status: active\n"),
    );
    let hits = referencing_nodes(&[referrer], id(T));
    assert_eq!(hits, vec![id(X)], "typed edges are frontmatter too (INV-EDGE)");
}

#[test]
fn referencing_nodes_returns_nothing_when_unreferenced() {
    let other = node_with(X, "linked_bet: 01HZX8KQBJ9GYWN3QFVYRXTX09\n");
    let target = node_with(T, "status: draft\n");
    assert!(referencing_nodes(&[other, target], id(T)).is_empty());
}

#[test]
fn referencing_nodes_ignores_the_node_pointing_at_itself() {
    // Otherwise nothing that mentions its own id could ever be deleted.
    let self_ref = node_with(T, &format!("case: {T}\n"));
    assert!(referencing_nodes(&[self_ref], id(T)).is_empty());
}

#[test]
fn referencing_nodes_ignores_partial_ulid_matches() {
    // "01HZX...X05" must not match a longer token that merely starts with it.
    let referrer = node_with(X, "note: 01HZX8KQBJ9GYWN3QFVYRXTX05EXTRA\n");
    assert!(referencing_nodes(&[referrer], id(T)).is_empty());
}
