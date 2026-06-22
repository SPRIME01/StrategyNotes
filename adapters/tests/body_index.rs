//! Phase B1 INV-BODY index integration tests. Body-derived refs must survive
//! rebuild and must show up in backlinks.

use strategynotes_adapters::{MarkdownVault, SQLiteIndex};
use strategynotes_core::body::{BodyRef, BodyRefKind};
use strategynotes_core::node::{Node, NodeType};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::NodeId;

use std::collections::BTreeMap;

fn note(id_str: &str, body: &str) -> Node {
    Node {
        id: NodeId::parse(id_str).unwrap(),
        ty: NodeType::Note,
        frontmatter: BTreeMap::new(),
        body: body.into(),
    }
}

const A: &str = "01HZX8KQBJ9GYWN3QFVYRXTX01";
const B: &str = "01HZX8KQBJ9GYWN3QFVYRXTX02";

#[test]
fn tst_body_005_rebuild_restores_body_refs() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    vault
        .put(&note(
            A,
            "mentions [[target note]] #tag #[[multi word]] ((01HZX8KQBJ9GYWN3QFVYRXTX02))",
        ))
        .unwrap();

    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    let refs = idx.body_refs_of(&NodeId::parse(A).unwrap()).unwrap();
    assert_eq!(refs.len(), 4, "all four body ref kinds survive rebuild");
    assert!(refs.contains(&BodyRef { kind: BodyRefKind::WikiLink, target: "target note".into() }));
    assert!(refs.contains(&BodyRef { kind: BodyRefKind::Tag, target: "tag".into() }));
    assert!(refs.contains(&BodyRef { kind: BodyRefKind::Tag, target: "multi word".into() }));
    assert!(refs.contains(&BodyRef { kind: BodyRefKind::BlockRef, target: B.into() }));
}

#[test]
fn tst_body_006_backlinks_include_body_derived_refs() {
    // A's body references B via both ((B-id)) and [[B-id]]. B's backlinks must
    // include A - proving body-derived refs participate in the graph.
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let body = format!("see (({B})) and [[{B}]]");
    vault.put(&note(A, &body)).unwrap();
    vault.put(&note(B, "target body")).unwrap();

    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    let back = idx.backlinks(&NodeId::parse(B).unwrap()).unwrap();
    assert!(
        back.contains(&NodeId::parse(A).unwrap()),
        "A must appear in B's backlinks via body refs: {back:?}"
    );
}

#[test]
fn tst_body_rebuild_after_wipe_restores_refs() {
    // INV-DUR + INV-BODY together: wipe the index, rebuild, body refs return.
    let tmp = tempfile::tempdir().unwrap();
    let db_path = tmp.path().join("idx.db");
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    vault.put(&note(A, "ref [[X]] #y")).unwrap();

    let idx = SQLiteIndex::open_file(&db_path).unwrap();
    idx.rebuild(&vault).unwrap();
    let before = idx.body_refs_of(&NodeId::parse(A).unwrap()).unwrap().len();
    drop(idx);
    std::fs::remove_file(&db_path).unwrap();

    let idx2 = SQLiteIndex::open_file(&db_path).unwrap();
    idx2.rebuild(&vault).unwrap();
    let after = idx2.body_refs_of(&NodeId::parse(A).unwrap()).unwrap().len();
    assert_eq!(before, after, "body refs survive index loss + rebuild");
}

#[test]
fn tst_body_007_wikilink_by_title_resolves_to_node() {
    // [[Title]] in A's body must surface as a backlink on the node whose
    // frontmatter title is "Title" - closing the title->id resolution gap.
    use strategynotes_core::node::NodeType;
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    // A: a note whose body wikilinks by title.
    vault.put(&note(A, "see [[GodSpeed MVP]] for context")).unwrap();
    // B: a strategy_case whose frontmatter title is "GodSpeed MVP".
    let mut b_node = note(B, "case body");
    b_node.ty = NodeType::StrategyCase;
    b_node.frontmatter.insert(
        "title".into(),
        serde_yaml::Value::String("GodSpeed MVP".into()),
    );
    vault.put(&b_node).unwrap();

    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    let back = idx.backlinks(&NodeId::parse(B).unwrap()).unwrap();
    assert!(
        back.contains(&NodeId::parse(A).unwrap()),
        "A's [[GodSpeed MVP]] wikilink must resolve to B via title: {back:?}"
    );
}
