//! Phase 14 VRD view tests. INV-VALUE: the view surfaces proof level and
//! flags weak/unproven claims as debt rather than smoothing them away.

use strategynotes_adapters::MarkdownVault;
use strategynotes_core::evidence::ProofLevel;
use strategynotes_core::execution::{ValueClaim, ValueStatus};
use strategynotes_core::ports::NodeVault;
use strategynotes_core::views::TypedView;
use strategynotes_core::vrd::VrdView;
use strategynotes_core::NodeId;

fn vc(case: NodeId, id_str: &str, proof: ProofLevel, evidence: Vec<&str>) -> ValueClaim {
    ValueClaim {
        id: NodeId::parse(id_str).unwrap(),
        case,
        statement: format!("claim {id_str}"),
        proof_level: proof,
        evidence_links: evidence.into_iter().map(NodeId::parse).map(Result::unwrap).collect(),
        linked_outcome: None,
        status: ValueStatus::Drafted,
    }
}

#[test]
fn vrd_aggregates_claims_for_a_case() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let case = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX01").unwrap();
    let other = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTX02").unwrap();
    // Two claims for our case, one for a different case (must be excluded).
    let c1 = vc(case, "01HZX8KQBJ9GYWN3QFVYRXTX11", ProofLevel::Validated, vec!["01HZX8KQBJ9GYWN3QFVYRXTX20"]);
    let c2 = vc(case, "01HZX8KQBJ9GYWN3QFVYRXTX12", ProofLevel::Hypothesized, vec![]); // weak + unproven
    let c3 = vc(other, "01HZX8KQBJ9GYWN3QFVYRXTX13", ProofLevel::Validated, vec!["01HZX8KQBJ9GYWN3QFVYRXTX20"]);
    vault.put(&c1.to_node().unwrap()).unwrap();
    vault.put(&c2.to_node().unwrap()).unwrap();
    vault.put(&c3.to_node().unwrap()).unwrap();

    let view = VrdView::for_case(&vault, case).unwrap();
    assert_eq!(view.claims.len(), 2, "only this case's claims");
    assert!(view.weak_claims.contains(&c2.id), "hypothesized claim flagged weak");
    assert!(view.unproven_claims.contains(&c2.id), "evidence-less claim flagged unproven");
    assert!(!view.claims.iter().any(|c| c.id == c3.id), "other case excluded");
}
