//! Driven ports - traits the pure core depends on. Adapters implement these.
//! See SPEC sec 3.4. Driving adapters (UI/Tauri/CLI/tests) call the core via
//! application services built on top of these ports (Phase 5+).
//!
//! Dependency direction: adapters depend on the core; the core never depends
//! on an adapter. Any I/O type (std::fs, rusqlite, reqwest, tokio, tauri)
//! appearing inside this crate is a review-blocker (AGENTS sec 10).

use crate::body::BodyRef;
use crate::error::Error;
use crate::governance::ActivityEvent;
use crate::identity::NodeId;
use crate::node::{Node, TypedEdge};
use chrono::{DateTime, Utc};

// ---- existing (Phase 0) ----

/// Wall-clock time, for daynotes / scheduling / timebox state.
/// Guards: INV-DAY, INV-TIME.
pub trait Clock {
    /// Current time as Unix-epoch seconds (UTC).
    fn now_unix_seconds(&self) -> i64;

    /// Current time as a typed UTC instant (derived from `now_unix_seconds`).
    fn now(&self) -> DateTime<Utc> {
        DateTime::from_timestamp(self.now_unix_seconds(), 0).unwrap_or_default()
    }
}

// ---- Phase 1 additions ----

/// Mints stable, sortable, path-mappable node identities. Guards INV-ID.
/// Implementations call a real RNG; the core never does.
pub trait IdMinter {
    fn mint(&self) -> NodeId;
}

/// Durable source-of-truth for nodes + edges (markdown vault).
/// Guards INV-DUR, INV-PORT, INV-EDGE. Deleting the derived index never
/// reaches this layer; the vault is the only durable store.
pub trait NodeVault {
    fn get(&self, id: &NodeId) -> Result<Option<Node>, Error>;
    fn put(&self, node: &Node) -> Result<(), Error>;
    fn delete(&self, id: &NodeId) -> Result<(), Error>;
    fn all(&self) -> Result<Vec<Node>, Error>;
    /// Typed edges for a node, reconstructed from frontmatter (INV-EDGE).
    fn edges_of(&self, id: &NodeId) -> Result<Vec<TypedEdge>, Error>;
}

/// Fast rebuildable derived index (SQLite adapter in Phase 3).
/// Guards INV-DUR (fully rebuildable from the vault).
pub trait DerivedIndex {
    fn rebuild(&self, vault: &dyn NodeVault) -> Result<(), Error>;
    fn backlinks(&self, id: &NodeId) -> Result<Vec<NodeId>, Error>;
    fn out_edges(&self, id: &NodeId) -> Result<Vec<TypedEdge>, Error>;
    fn nodes_by_type(&self, ty: crate::node::NodeType) -> Result<Vec<NodeId>, Error>;

    /// Body-derived inline refs/tags for a node (INV-BODY). Default: empty
    /// (adapters that don't parse bodies return nothing; the markdown index
    /// adapter overrides this).
    fn body_refs_of(&self, _id: &NodeId) -> Result<Vec<BodyRef>, Error> {
        Ok(Vec::new())
    }

    /// Full-text-ish search (Phase D). Derived; rebuildable; never source of
    /// truth. Default: empty.
    fn search(&self, _query: &str) -> Result<Vec<crate::search::SearchResult>, Error> {
        Ok(Vec::new())
    }
}

/// Audit / activity sink (daynote ledger). Guards INV-DAY.
/// Implementations: DaynoteEventSink (writes activity records), RecordingSink (tests).
pub trait EventSink {
    fn record(&self, event: ActivityEvent);
}
