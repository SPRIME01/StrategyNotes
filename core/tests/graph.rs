//! Phase 4 graph logic tests (TST-GRAPH). Guards INV-CLONE: a `Places` edge
//! that would close a cycle is rejected. Uses a fake DerivedIndex (no adapter
//! needed) to keep the test pure-core.

use std::collections::HashMap;

use strategynotes_core::graph::would_create_placement_cycle;
use strategynotes_core::node::{NodeType, TypedEdge};
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
