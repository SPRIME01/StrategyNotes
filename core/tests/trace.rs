//! Phase 6 trace traversal tests (TST-TRACE). Proves the source->value spine
//! walks forward through support/derivation edges, and that contradiction
//! edges stay visible but separate (INV-CONTRA).

use std::collections::HashMap;

use strategynotes_core::node::{NodeType, TypedEdge};
use strategynotes_core::ports::DerivedIndex;
use strategynotes_core::trace::{backbone_contradictions, reachable_via_spine};
use strategynotes_core::{EdgeType, NodeId, Error};

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

const SOURCE: &str = "01HZX8KQBJ9GYWN3QFVYRXTX01";
const EVIDENCE: &str = "01HZX8KQBJ9GYWN3QFVYRXTX02";
const CLAIM: &str = "01HZX8KQBJ9GYWN3QFVYRXTX03";
const BET: &str = "01HZX8KQBJ9GYWN3QFVYRXTX04";
const VALUE: &str = "01HZX8KQBJ9GYWN3QFVYRXTX05";
const UNRELATED: &str = "01HZX8KQBJ9GYWN3QFVYRXTX99";
const COUNTER: &str = "01HZX8KQBJ9GYWN3QFVYRXTX07";

fn id(s: &str) -> NodeId {
    NodeId::parse(s).unwrap()
}

#[test]
fn spine_trace_walks_source_to_value() {
    // source ->supports-> evidence ->supports-> claim ->derives_from-> bet
    // ->requires-> value
    let idx = FakeIndex::from_edges(&[
        (SOURCE, EVIDENCE, EdgeType::Supports),
        (EVIDENCE, CLAIM, EdgeType::Supports),
        (CLAIM, BET, EdgeType::DerivesFrom),
        (BET, VALUE, EdgeType::Requires),
    ]);
    let reach = reachable_via_spine(&idx, id(SOURCE)).unwrap();
    for node in [SOURCE, EVIDENCE, CLAIM, BET, VALUE] {
        assert!(reach.contains(&id(node)), "spine should reach {node}");
    }
}

#[test]
fn unrelated_subgraph_is_not_reached() {
    let idx = FakeIndex::from_edges(&[
        (SOURCE, EVIDENCE, EdgeType::Supports),
        (UNRELATED, BET, EdgeType::Supports), // disconnected
    ]);
    let reach = reachable_via_spine(&idx, id(SOURCE)).unwrap();
    assert!(reach.contains(&id(EVIDENCE)));
    assert!(!reach.contains(&id(UNRELATED)));
    assert!(!reach.contains(&id(BET)));
}

#[test]
fn contradicts_edges_are_not_followed_in_spine_trace() {
    // INV-CONTRA: contradiction does not become "support" by being walked.
    // source ->contradicts-> claim must NOT put claim on source's spine.
    let idx = FakeIndex::from_edges(&[(SOURCE, CLAIM, EdgeType::Contradicts)]);
    let reach = reachable_via_spine(&idx, id(SOURCE)).unwrap();
    assert_eq!(reach.len(), 1, "only the start node; contradicts not followed");
    assert!(reach.contains(&id(SOURCE)));
}

#[test]
fn counterevidence_stays_visible_along_the_spine() {
    // claim is on the spine (source->supports->claim); claim->contradicts->counter.
    // backbone_contradictions must surface `counter` so INV-CONTRA holds: the
    // user sees both the support chain AND the counterevidence, never smoothed.
    let idx = FakeIndex::from_edges(&[
        (SOURCE, CLAIM, EdgeType::Supports),
        (CLAIM, COUNTER, EdgeType::Contradicts),
    ]);
    let contra = backbone_contradictions(&idx, id(SOURCE)).unwrap();
    assert!(contra.contains(&id(COUNTER)), "counterevidence must stay visible");
}
