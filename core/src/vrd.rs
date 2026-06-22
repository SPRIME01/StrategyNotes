//! Value Realization Document view (Phase 14). Aggregates the value claims,
//! their proof levels, and evidence links for a case into a VRD-shaped view.
//! Guards INV-VALUE: only proven claims count; the view surfaces proof level
//! and any unproven claims as visible debt (not smoothed away).

use crate::error::Error;
use crate::evidence::ProofLevel;
use crate::execution::ValueClaim;
use crate::identity::NodeId;
use crate::ports::NodeVault;
use crate::views::TypedView;
use crate::node::NodeType;

/// A VRD-shaped view over a case's value claims. Unproven claims stay visible
/// as debt - the VRD never claims more value than the evidence supports.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VrdView {
    pub case: NodeId,
    pub claims: Vec<ValueClaim>,
    /// Claims whose proof level is below `Supported` (debt to flag, not hide).
    pub weak_claims: Vec<NodeId>,
    /// Claims with no evidence links (proof debt).
    pub unproven_claims: Vec<NodeId>,
}

impl VrdView {
    /// Build the VRD view by scanning the vault for value_claim nodes linked to
    /// `case`. Pure over the NodeVault port.
    pub fn for_case(vault: &dyn NodeVault, case: NodeId) -> Result<Self, Error> {
        let mut claims = Vec::new();
        for node in vault.all()? {
            if node.ty != NodeType::ValueClaim {
                continue;
            }
            let vc = ValueClaim::from_node(&node)?;
            if vc.case == case {
                claims.push(vc);
            }
        }
        let weak_claims: Vec<NodeId> = claims
            .iter()
            .filter(|c| {
                matches!(
                    c.proof_level,
                    ProofLevel::Speculative | ProofLevel::Hypothesized | ProofLevel::Contested
                )
            })
            .map(|c| c.id)
            .collect();
        let unproven_claims: Vec<NodeId> = claims
            .iter()
            .filter(|c| c.evidence_links.is_empty())
            .map(|c| c.id)
            .collect();
        Ok(Self {
            case,
            claims,
            weak_claims,
            unproven_claims,
        })
    }
}
