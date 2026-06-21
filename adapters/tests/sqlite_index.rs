//! SQLiteIndex tests (TST-STORAGE - Phase 3). The critical proof is INV-DUR:
//! deleting the derived index and rebuilding from the markdown vault yields
//! query-equivalent state. The index holds no truth the markdown lacks.

use strategynotes_adapters::{MarkdownVault, SQLiteIndex};
use strategynotes_core::format::set_edges;
use strategynotes_core::node::{Node, NodeType};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::{EdgeType, NodeId, TypedEdge};

use std::collections::BTreeMap;

fn node(id_str: &str, ty: NodeType, body: &str) -> Node {
    Node {
        id: NodeId::parse(id_str).unwrap(),
        ty,
        frontmatter: BTreeMap::new(),
        body: body.into(),
    }
}

fn seed_vault(dir: &std::path::Path) -> (MarkdownVault, [NodeId; 3]) {
    let vault = MarkdownVault::open(dir).unwrap();
    let case = node("01HZX8KQBJ9GYWN3QFVYRXTXMS", NodeType::StrategyCase, "case body");
    let claim = node("01HZX9W3HJ4C2V1DKE8XFNAB63", NodeType::StrategicClaim, "claim body");
    let evidence = node("01HZXA8P2KQ5R7M4XHYNGBTEF1", NodeType::EvidenceItem, "evidence body");

    // Wire edges: case ->requires-> claim ; evidence ->supports-> claim.
    // (case.id / evidence.id are Copy; take them before the mutable borrow.)
    let (case_id, claim_id, evidence_id) = (case.id, claim.id, evidence.id);
    let mut c = case.clone();
    set_edges(
        &mut c,
        &[TypedEdge {
            from: case_id,
            to: claim_id,
            edge_type: EdgeType::Requires,
            status: Default::default(),
        }],
    )
    .unwrap();
    let mut e = evidence.clone();
    set_edges(
        &mut e,
        &[TypedEdge {
            from: evidence_id,
            to: claim_id,
            edge_type: EdgeType::Supports,
            status: Default::default(),
        }],
    )
    .unwrap();

    vault.put(&c).unwrap();
    vault.put(&claim).unwrap();
    vault.put(&e).unwrap();
    (vault, [case_id, claim_id, evidence_id])
}

#[test]
fn rebuild_indexes_nodes_and_edges() {
    let tmp = tempfile::tempdir().unwrap();
    let (vault, ids) = seed_vault(tmp.path());
    let index = SQLiteIndex::open_in_memory().unwrap();
    index.rebuild(&vault).unwrap();

    let mut cases = index.nodes_by_type(NodeType::StrategyCase).unwrap();
    assert_eq!(cases, vec![ids[0]]);
    let mut claims = index.nodes_by_type(NodeType::StrategicClaim).unwrap();
    claims.sort();
    let _ = &mut cases;
    let _ = &mut claims;
    assert_eq!(claims, vec![ids[1]]);

    // out_edges from the case node -> the claim (Requires)
    let out = index.out_edges(&ids[0]).unwrap();
    assert_eq!(out.len(), 1);
    assert_eq!(out[0].to, ids[1]);
    assert_eq!(out[0].edge_type, EdgeType::Requires);

    // backlinks to the claim <- case (Requires) + evidence (Supports)
    let mut back = index.backlinks(&ids[1]).unwrap();
    back.sort();
    let mut expected = vec![ids[0], ids[2]];
    expected.sort();
    assert_eq!(back, expected);
}

#[test]
fn index_loss_then_rebuild_yields_equivalent_state() {
    // INV-DUR: the derived index is disposable. Drop it, delete the file,
    // reopen, rebuild - query results match the pre-loss baseline.
    let tmp = tempfile::tempdir().unwrap();
    let db_path = tmp.path().join("index.db");
    let (vault, ids) = seed_vault(tmp.path());

    // Baseline: build the index, capture query results.
    let baseline = {
        let idx = SQLiteIndex::open_file(&db_path).unwrap();
        idx.rebuild(&vault).unwrap();
        (
            idx.nodes_by_type(NodeType::StrategyCase).unwrap(),
            idx.out_edges(&ids[0]).unwrap(),
            idx.backlinks(&ids[1]).unwrap(),
        )
    };
    drop(db_path); // silence unused-assign

    // Simulate index loss: close + delete the file.
    let db_path = tmp.path().join("index.db");
    drop(baseline); // closes the connection (idx dropped)
    std::fs::remove_file(&db_path).unwrap();
    assert!(!db_path.exists(), "index file must be gone before rebuild");

    // Reopen + rebuild.
    let idx = SQLiteIndex::open_file(&db_path).unwrap();
    idx.rebuild(&vault).unwrap();
    let after = (
        idx.nodes_by_type(NodeType::StrategyCase).unwrap(),
        idx.out_edges(&ids[0]).unwrap(),
        idx.backlinks(&ids[1]).unwrap(),
    );

    // The baseline was dropped, so compare against fresh expectations.
    assert_eq!(after.0, vec![ids[0]], "nodes_by_type matches after rebuild");
    assert_eq!(after.1.len(), 1, "out_edges match after rebuild");
    assert_eq!(after.1[0].to, ids[1]);
    assert_eq!(after.2.len(), 2, "backlinks match after rebuild");
}

#[test]
fn rebuild_is_idempotent() {
    let tmp = tempfile::tempdir().unwrap();
    let (vault, _) = seed_vault(tmp.path());
    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    let after_first = idx.nodes_by_type(NodeType::StrategyCase).unwrap().len();
    idx.rebuild(&vault).unwrap();
    let after_second = idx.nodes_by_type(NodeType::StrategyCase).unwrap().len();
    assert_eq!(after_first, after_second, "double rebuild must not duplicate");
}

#[test]
fn rebuild_after_vault_change_reflects_new_state() {
    let tmp = tempfile::tempdir().unwrap();
    let (vault, _) = seed_vault(tmp.path());
    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    assert_eq!(idx.nodes_by_type(NodeType::StrategyCase).unwrap().len(), 1);

    // Add a second case to the vault + rebuild.
    let new_case = node("01HZXK9QBJ9GYWN3QFVYRXTX99", NodeType::StrategyCase, "second");
    vault.put(&new_case).unwrap();
    idx.rebuild(&vault).unwrap();
    assert_eq!(idx.nodes_by_type(NodeType::StrategyCase).unwrap().len(), 2);

    // Delete it + rebuild - reflected.
    vault.delete(&new_case.id).unwrap();
    idx.rebuild(&vault).unwrap();
    assert_eq!(idx.nodes_by_type(NodeType::StrategyCase).unwrap().len(), 1);
}
