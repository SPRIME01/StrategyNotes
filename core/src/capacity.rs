//! Strategy Capacity gate (Phase B2, SPEC sec 9). Forces strategy to confront
//! available time: blocks when required pomos exceed available capacity, with
//! override only via an SDR that records the tradeoff.

use crate::gate::GateResult;
use crate::identity::NodeId;

/// Inputs to the capacity gate.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CapacityCheck {
    /// Sum of pomo estimates across the work package set / EDS.
    pub required_pomos: u32,
    /// Strategic capacity available in the planning window.
    pub available_pomos: u32,
    /// If set, an SDR records the decision to accept the capacity risk
    /// (reduce scope / extend timeline / add owner / defer / accept risk).
    pub override_sdr: Option<NodeId>,
}

/// SPEC sec 9 Strategy Capacity gate. Returns Blocked with structured
/// failed_gates when required > available and no override SDR exists.
pub fn can_meet_strategy_capacity(c: &CapacityCheck) -> GateResult {
    if c.required_pomos <= c.available_pomos {
        GateResult::Approved
    } else if c.override_sdr.is_some() {
        // Explicit override: an SDR records the tradeoff. Approved, but the
        // decision is auditable (the SDR is a real node, traceable).
        GateResult::Approved
    } else {
        GateResult::blocked(["capacity_exceeded", "missing_capacity_decision"])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn id(s: &str) -> NodeId {
        NodeId::parse(s).unwrap()
    }

    #[test]
    fn tst_cap_001_passes_when_required_le_available() {
        let c = CapacityCheck { required_pomos: 8, available_pomos: 12, override_sdr: None };
        assert!(can_meet_strategy_capacity(&c).is_approved());
    }

    #[test]
    fn tst_cap_002_blocks_when_required_exceeds_available() {
        let c = CapacityCheck { required_pomos: 14, available_pomos: 8, override_sdr: None };
        let r = can_meet_strategy_capacity(&c);
        match r {
            GateResult::Blocked { failed_gates } => {
                assert!(failed_gates.contains(&"capacity_exceeded".to_string()));
                assert!(failed_gates.contains(&"missing_capacity_decision".to_string()));
            }
            GateResult::Approved => panic!("over-capacity without SDR must block"),
        }
    }

    #[test]
    fn tst_cap_003_override_requires_sdr() {
        // Over capacity WITH an SDR is approved (the tradeoff is recorded).
        let with_sdr = CapacityCheck {
            required_pomos: 14,
            available_pomos: 8,
            override_sdr: Some(id("01HZX8KQBJ9GYWN3QFVYRXTXMS")),
        };
        assert!(can_meet_strategy_capacity(&with_sdr).is_approved());
        // Over capacity WITHOUT an SDR is blocked.
        let without_sdr = CapacityCheck { required_pomos: 14, available_pomos: 8, override_sdr: None };
        assert!(!can_meet_strategy_capacity(&without_sdr).is_approved());
    }

    #[test]
    fn tst_cap_004_blocked_response_shape_matches_directive() {
        // The directive's example blocked response.
        let c = CapacityCheck { required_pomos: 100, available_pomos: 1, override_sdr: None };
        let json = serde_json::to_string(&can_meet_strategy_capacity(&c)).unwrap();
        assert!(json.contains(r#""status":"blocked""#));
        assert!(json.contains(r#""capacity_exceeded""#));
        assert!(json.contains(r#""missing_capacity_decision""#));
    }
}
