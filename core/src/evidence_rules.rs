//! Evidence acceptance rules (Phase 6). Pure domain logic implementing
//! INV-EVID: no accepted evidence without source/provenance OR explicit manual
//! basis + reviewer. The Phase 7 gate engine wraps these into a GateResult.

use crate::evidence::EvidenceItem;

/// List the reasons (if any) this evidence item would fail acceptance.
/// Empty = acceptable per INV-EVID.
pub fn acceptance_failures(e: &EvidenceItem) -> Vec<String> {
    let mut failed = Vec::new();

    let has_source = e.source_chunk.is_some();
    let has_manual = e
        .manual_basis_reviewer
        .as_ref()
        .is_some_and(|r| !r.trim().is_empty());

    if !has_source && !has_manual {
        failed.push(
            "missing source_chunk link or explicit manual basis + reviewer".into(),
        );
    }
    // A manual basis with an empty/whitespace reviewer string is not a basis.
    if e.manual_basis_reviewer.is_some() && !has_manual {
        failed.push("manual_basis_reviewer is present but empty".into());
    }

    failed
}

/// Convenience: is this evidence item acceptable per INV-EVID?
pub fn can_accept(e: &EvidenceItem) -> bool {
    acceptance_failures(e).is_empty()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::evidence::{EvidenceItem, EvidenceKind, EvidenceStatus, ProofLevel};
    use crate::NodeId;

    fn item(source: Option<&str>, reviewer: Option<&str>) -> EvidenceItem {
        EvidenceItem {
            id: NodeId::default(),
            kind: EvidenceKind::DirectQuote,
            status: EvidenceStatus::Drafted,
            proof_level: ProofLevel::Observed,
            source_chunk: source.map(|s| NodeId::parse(s).unwrap()),
            manual_basis_reviewer: reviewer.map(str::to_string),
            text: "x".into(),
            supports: vec![],
            contradicts: vec![],
        }
    }

    #[test]
    fn evidence_with_source_is_acceptable() {
        assert!(can_accept(&item(Some("01HZX8KQBJ9GYWN3QFVYRXTXMS"), None)));
    }

    #[test]
    fn evidence_with_manual_basis_and_reviewer_is_acceptable() {
        assert!(can_accept(&item(None, Some("Sam"))));
    }

    #[test]
    fn evidence_with_neither_source_nor_manual_is_rejected() {
        let failures = acceptance_failures(&item(None, None));
        assert!(!failures.is_empty());
        assert!(failures[0].contains("source_chunk") || failures[0].contains("manual"));
    }

    #[test]
    fn empty_reviewer_string_does_not_count_as_manual_basis() {
        let failures = acceptance_failures(&item(None, Some("   ")));
        assert!(!failures.is_empty(), "whitespace-only reviewer must not satisfy INV-EVID");
    }
}
