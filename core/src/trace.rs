//! Trace traversal (Phase 6). Walks the strategy "spine" edges to answer
//! source-to-value questions: "what does this evidence ultimately support?",
//! "trace this value claim back to its sources". Pure: takes &dyn DerivedIndex.
//!
//! Spine edges (SPEC sec 1.4): supports, derives_from, requires, scheduled_by,
//! reviewed_by, validates, claims_value_for, tests, implements.
//! Contradicts/weakens are excluded from the support-trace by design
//! (INV-CONTRA keeps them visible but separate).

use std::collections::HashSet;

use crate::error::Error;
use crate::identity::NodeId;
use crate::node::EdgeType;
use crate::ports::DerivedIndex;

/// Edge types that constitute the support/derivation spine.
pub const SPINE_EDGES: &[EdgeType] = &[
    EdgeType::Supports,
    EdgeType::DerivesFrom,
    EdgeType::Requires,
    EdgeType::ScheduledBy,
    EdgeType::ReviewedBy,
    EdgeType::Validates,
    EdgeType::ClaimsValueFor,
    EdgeType::Tests,
    EdgeType::Implements,
];

/// All nodes reachable from `start` by following spine edges (forward).
/// Includes `start` itself. INV-CONTRA: contradicts/weakens edges are NOT
/// followed - counterevidence stays visible via [`backbone_contradictions`]
/// rather than polluting the support trace.
pub fn reachable_via_spine(
    index: &dyn DerivedIndex,
    start: NodeId,
) -> Result<HashSet<NodeId>, Error> {
    let spine: HashSet<EdgeType> = SPINE_EDGES.iter().copied().collect();
    let mut visited = HashSet::new();
    let mut stack = vec![start];
    while let Some(n) = stack.pop() {
        if !visited.insert(n) {
            continue;
        }
        for edge in index.out_edges(&n)? {
            if spine.contains(&edge.edge_type) {
                stack.push(edge.to);
            }
        }
    }
    Ok(visited)
}

/// Nodes that contradict or weaken anything on the spine starting at `start`.
/// Keeps counterevidence visible alongside the support chain (INV-CONTRA).
pub fn backbone_contradictions(
    index: &dyn DerivedIndex,
    start: NodeId,
) -> Result<HashSet<NodeId>, Error> {
    let backbone = reachable_via_spine(index, start)?;
    let mut contra = HashSet::new();
    for node in &backbone {
        for edge in index.out_edges(node)? {
            if matches!(edge.edge_type, EdgeType::Contradicts | EdgeType::Weakens) {
                contra.insert(edge.to);
            }
        }
    }
    Ok(contra)
}
