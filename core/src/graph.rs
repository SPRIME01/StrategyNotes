//! Pure graph logic over the [`DerivedIndex`](crate::ports::DerivedIndex) port.
//! No I/O - all traversal goes through the port so the same logic runs against
//! the SQLite index (production) or a fake index (tests).
//!
//! Guards INV-CLONE: adding a `Places` edge that would close a cycle is rejected.

use std::collections::HashSet;

use crate::error::Error;
use crate::identity::NodeId;
use crate::node::{EdgeType, Node};
use crate::ports::DerivedIndex;

/// Would adding the placement edge `parent --places--> child` create a cycle in
/// the `Places` subgraph?
///
/// A cycle arises iff `child` can already (transitively) place `parent` - i.e.
/// `parent` is reachable from `child` by following `Places` out-edges. Self-loops
/// (`parent == child`) are cycles by definition.
///
/// Pure: takes the index as a trait. INV-CLONE check.
pub fn would_create_placement_cycle(
    index: &dyn DerivedIndex,
    parent: NodeId,
    child: NodeId,
) -> Result<bool, Error> {
    // Self-loop is a cycle by definition.
    if parent == child {
        return Ok(true);
    }
    // A cycle arises iff `parent` is reachable from `child` by following Places
    // out-edges (i.e. `child` transitively places `parent`). DFS from `child`.
    let mut stack = vec![child];
    let mut visited = HashSet::new();
    while let Some(n) = stack.pop() {
        if !visited.insert(n) {
            continue;
        }
        for edge in index.out_edges(&n)? {
            if edge.edge_type == EdgeType::Places {
                if edge.to == parent {
                    return Ok(true);
                }
                stack.push(edge.to);
            }
        }
    }
    Ok(false)
}

/// Every node whose frontmatter still names `target`, excluding `target` itself.
///
/// Guards deletion (INV-DUR): removing a node that other nodes point at orphans
/// those pointers, and a dangling ULID in markdown is unrecoverable state — the
/// vault is not in git, and the SQLite index is disposable by design, so nothing
/// downstream can repair it.
///
/// Match is exact on the lexical ULID, so a longer token that merely *starts*
/// with the target does not count. Self-references are ignored, otherwise any
/// node that mentions its own id could never be deleted.
///
/// Pure over `&[Node]` so it runs with no I/O and no index.
pub fn referencing_nodes(nodes: &[Node], target: NodeId) -> Vec<NodeId> {
    let want = target.to_lexical();
    nodes
        .iter()
        .filter(|n| n.id != target)
        .filter(|n| {
            let mut hit = false;
            for v in n.frontmatter.values() {
                names(v, &want, &mut hit);
                if hit {
                    break;
                }
            }
            hit
        })
        .map(|n| n.id)
        .collect()
}

/// Depth-first over a YAML value, flagging an exact string match. Recurses
/// through sequences and mappings so `linked_bet:`, `assumptions: [...]` and
/// `edges: [{to: ...}]` are all covered (INV-EDGE: edges live in frontmatter).
fn names(v: &serde_yaml::Value, want: &str, hit: &mut bool) {
    if *hit {
        return;
    }
    match v {
        serde_yaml::Value::String(s) => *hit = s == want,
        serde_yaml::Value::Sequence(items) => items.iter().for_each(|i| names(i, want, hit)),
        serde_yaml::Value::Mapping(map) => map.values().for_each(|i| names(i, want, hit)),
        _ => {}
    }
}
