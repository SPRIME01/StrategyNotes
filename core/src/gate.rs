//! Gate result types (SPEC sec 9). The backend owns gates: a transition either
//! returns `Approved` or `Blocked { failed_gates }`. The UI never decides.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GateId {
    CanAcceptEvidence,
    CanAcceptClaim,
    CanApproveBet,
    CanCommitWorkPackage,
    CanVerifyTimebox,
    CanClaimValue,
    CanCloseCase,
    StrategyCapacity,
    ValueAlignment,
}

/// Serializes to `{"status":"approved"}` or
/// `{"status":"blocked","failed_gates":[...]}` per SPEC sec 9.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum GateResult {
    Approved,
    Blocked { failed_gates: Vec<String> },
}

impl GateResult {
    pub fn is_approved(&self) -> bool {
        matches!(self, GateResult::Approved)
    }

    pub fn blocked(gates: impl IntoIterator<Item = impl Into<String>>) -> Self {
        GateResult::Blocked {
            failed_gates: gates.into_iter().map(Into::into).collect(),
        }
    }
}
