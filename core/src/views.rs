//! Typed-view <-> Node bridge impls (Phase 8 prep). Each domain struct that
//! is stored as a node implements [`TypedView`] here. Co-located for review;
//! the structs themselves are defined in their domain modules.
//!
//! Pattern: `id` is `#[serde(skip)]` on every struct (it lives in `Node.id`),
//! set explicitly by `from_node`. Every other field round-trips through the
//! frontmatter map via [`format::typed_to_node`] / [`format::typed_from_node`].

use crate::evidence::{EvidenceItem, Source, SourceChunk};
use crate::execution::{DecisionRecord, Timebox, TimeboxReview, ValueClaim, WorkPackage};
use crate::format;
use crate::node::{Node, NodeType};
use crate::strategy::{ChoiceCascade, OutcomeRequirement, StrategicClaim, StrategyBet, StrategyCase};

/// A typed domain view that serializes to / from a storage [`Node`].
pub trait TypedView: Sized {
    fn to_node(&self) -> Result<Node, crate::Error>;
    fn from_node(node: &Node) -> Result<Self, crate::Error>;
}

macro_rules! impl_view {
    ($t:ty, $variant:expr) => {
        impl TypedView for $t {
            fn to_node(&self) -> Result<Node, crate::Error> {
                format::typed_to_node(self, self.id, $variant)
            }
            fn from_node(node: &Node) -> Result<Self, crate::Error> {
                let mut v: Self = format::typed_from_node(node)?;
                v.id = node.id;
                Ok(v)
            }
        }
    };
}

impl_view!(StrategyCase, NodeType::StrategyCase);
impl_view!(Source, NodeType::Source);
impl_view!(SourceChunk, NodeType::SourceChunk);
impl_view!(EvidenceItem, NodeType::EvidenceItem);
impl_view!(OutcomeRequirement, NodeType::Ord);
impl_view!(StrategicClaim, NodeType::StrategicClaim);
impl_view!(ChoiceCascade, NodeType::ChoiceCascade);
impl_view!(StrategyBet, NodeType::StrategyBet);
impl_view!(WorkPackage, NodeType::WorkPackage);
impl_view!(Timebox, NodeType::Timebox);
impl_view!(TimeboxReview, NodeType::TimeboxReview);
impl_view!(ValueClaim, NodeType::ValueClaim);
impl_view!(DecisionRecord, NodeType::DecisionRecord);
