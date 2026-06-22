//! Pure graph logic over the [`DerivedIndex`](crate::ports::DerivedIndex) port.
//! No I/O - all traversal goes through the port so the same logic runs against
//! the SQLite index (production) or a fake index (tests).
//!
//! Guards INV-CLONE: adding a `Places` edge that would close a cycle is rejected.

use std::collections::HashSet;

use crate::error::Error;
use crate::identity::NodeId;
use crate::node::EdgeType;
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
