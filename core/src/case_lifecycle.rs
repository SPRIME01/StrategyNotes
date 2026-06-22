//! Case lifecycle state machine (Phase 5). Defines which phase transitions are
//! structurally allowed. Gate enforcement (does the case have enough evidence
//! / outcomes / bets to actually advance?) is the Phase 7 gate engine's job;
//! this module is purely the transition *graph*.
//!
//! Flow (SPEC sec 1.4 spine + sec 2.1 document stack):
//!   EstablishReality -> DefineOutcomes -> DevelopLogic -> ChooseAndBet
//!   -> DesignExecution -> Validate -> RealizeValue -> Review -> Closed
//!
//! With feedback loops (strategy evolves) and Review reachable from any phase.

use crate::strategy::CasePhase;

/// Phases this case may legally move to from `from`. Forward path + feedback
/// loops + Review-from-anywhere + Close-from-Review.
pub fn allowed_next(from: CasePhase) -> Vec<CasePhase> {
    use CasePhase::*;
    match from {
        EstablishReality => vec![DefineOutcomes, Review],
        DefineOutcomes => vec![DevelopLogic, EstablishReality, Review],
        DevelopLogic => vec![ChooseAndBet, DefineOutcomes, Review],
        ChooseAndBet => vec![DesignExecution, DevelopLogic, Review],
        DesignExecution => vec![Validate, ChooseAndBet, Review],
        Validate => vec![RealizeValue, DesignExecution, Review],
        RealizeValue => vec![Review],
        // Review is the hub: close, or loop back to any earlier phase to evolve.
        Review => vec![
            Closed,
            EstablishReality,
            DefineOutcomes,
            DevelopLogic,
            ChooseAndBet,
            DesignExecution,
            Validate,
            RealizeValue,
        ],
        Closed => vec![],
    }
}

/// Is the transition `from -> to` permitted by the lifecycle?
pub fn can_transition(from: CasePhase, to: CasePhase) -> bool {
    allowed_next(from).contains(&to)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn closed_is_terminal() {
        assert!(allowed_next(CasePhase::Closed).is_empty());
    }

    #[test]
    fn forward_path_is_allowed() {
        assert!(can_transition(CasePhase::EstablishReality, CasePhase::DefineOutcomes));
        assert!(can_transition(CasePhase::DefineOutcomes, CasePhase::DevelopLogic));
        assert!(can_transition(CasePhase::RealizeValue, CasePhase::Review));
    }

    #[test]
    fn skipping_ahead_is_rejected() {
        // Cannot jump from EstablishReality straight to Validate.
        assert!(!can_transition(CasePhase::EstablishReality, CasePhase::Validate));
    }

    #[test]
    fn review_is_reachable_from_any_active_phase() {
        for phase in [
            CasePhase::EstablishReality,
            CasePhase::DefineOutcomes,
            CasePhase::DevelopLogic,
            CasePhase::ChooseAndBet,
            CasePhase::DesignExecution,
            CasePhase::Validate,
            CasePhase::RealizeValue,
        ] {
            assert!(can_transition(phase, CasePhase::Review), "Review reachable from {phase:?}");
        }
    }

    #[test]
    fn feedback_loops_allow_going_back() {
        // A falsified bet sends the case back from ChooseAndBet to DevelopLogic.
        assert!(can_transition(CasePhase::ChooseAndBet, CasePhase::DevelopLogic));
    }

    #[test]
    fn close_only_from_review() {
        assert!(can_transition(CasePhase::Review, CasePhase::Closed));
        assert!(!can_transition(CasePhase::Validate, CasePhase::Closed));
    }
}
