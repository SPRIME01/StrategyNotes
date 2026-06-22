//! Phase D search tests (TST-SEARCH). Search is derived, rebuildable, never
//! source of truth.

use strategynotes_adapters::{MarkdownVault, SQLiteIndex};
use strategynotes_core::node::{Frontmatter, Node, NodeType};
use strategynotes_core::ports::{DerivedIndex, NodeVault};
use strategynotes_core::NodeId;

use std::collections::BTreeMap;

fn node_with(id_str: &str, ty: NodeType, body: &str, fm: &[(&str, &str)]) -> Node {
    let mut frontmatter: Frontmatter = BTreeMap::new();
    for (k, v) in fm {
        frontmatter.insert((*k).into(), serde_yaml::Value::String((*v).into()));
    }
    Node {
        id: NodeId::parse(id_str).unwrap(),
        ty,
        frontmatter,
        body: body.into(),
    }
}

fn fresh_index(tmp: &std::path::Path, nodes: &[Node]) -> SQLiteIndex {
    let vault = MarkdownVault::open(tmp.join("v")).unwrap();
    for n in nodes {
        vault.put(n).unwrap();
    }
    let idx = SQLiteIndex::open_in_memory().unwrap();
    idx.rebuild(&vault).unwrap();
    idx
}

#[test]
fn tst_search_001_title_search() {
    let tmp = tempfile::tempdir().unwrap();
    let idx = fresh_index(
        tmp.path(),
        &[
            node_with("01HZX8KQBJ9GYWN3QFVYRXTX01", NodeType::StrategyCase, "body a", &[("title", "Founder speed strategy")]),
            node_with("01HZX8KQBJ9GYWN3QFVYRXTX02", NodeType::Note, "unrelated", &[("title", "groceries")]),
        ],
    );
    let hits = idx.search("founder").unwrap();
    assert_eq!(hits.len(), 1);
    assert_eq!(hits[0].id, "01HZX8KQBJ9GYWN3QFVYRXTX01");
}

#[test]
fn tst_search_002_body_search() {
    let tmp = tempfile::tempdir().unwrap();
    let idx = fresh_index(
        tmp.path(),
        &[node_with("01HZX8KQBJ9GYWN3QFVYRXTX03", NodeType::Note, "the key insight is speed", &[])],
    );
    let hits = idx.search("insight").unwrap();
    assert_eq!(hits.len(), 1);
    assert!(hits[0].excerpt.contains("insight"));
}

#[test]
fn tst_search_003_tag_search() {
    // Tags live in body as #tag; search_text includes body, so #urgent is found.
    let tmp = tempfile::tempdir().unwrap();
    let idx = fresh_index(
        tmp.path(),
        &[node_with("01HZX8KQBJ9GYWN3QFVYRXTX04", NodeType::Note, "marked #urgent today", &[])],
    );
    let hits = idx.search("urgent").unwrap();
    assert_eq!(hits.len(), 1);
}

#[test]
fn tst_search_004_strategy_object_search() {
    // thesis (bet), statement (claim), objective (work package) all indexed.
    let tmp = tempfile::tempdir().unwrap();
    let idx = fresh_index(
        tmp.path(),
        &[
            node_with("01HZX8KQBJ9GYWN3QFVYRXTX05", NodeType::StrategyBet, "b", &[("thesis", "win on speed")]),
            node_with("01HZX8KQBJ9GYWN3QFVYRXTX06", NodeType::StrategicClaim, "c", &[("statement", "defensible advantage")]),
            node_with("01HZX8KQBJ9GYWN3QFVYRXTX07", NodeType::WorkPackage, "w", &[("objective", "ship onboarding")]),
        ],
    );
    assert_eq!(idx.search("speed").unwrap().len(), 1);
    assert_eq!(idx.search("advantage").unwrap().len(), 1);
    assert_eq!(idx.search("onboarding").unwrap().len(), 1);
}

#[test]
fn tst_search_005_rebuild_preserves_searchability() {
    // INV-DUR + search: wipe index, rebuild, search still works.
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path().join("v")).unwrap();
    vault
        .put(&node_with(
            "01HZX8KQBJ9GYWN3QFVYRXTX08",
            NodeType::StrategyCase,
            "discusses speed",
            &[("title", "Speed case")],
        ))
        .unwrap();

    let db_path = tmp.path().join("idx.db");
    let idx = SQLiteIndex::open_file(&db_path).unwrap();
    idx.rebuild(&vault).unwrap();
    assert_eq!(idx.search("speed").unwrap().len(), 1);
    drop(idx);
    std::fs::remove_file(&db_path).unwrap();

    let idx2 = SQLiteIndex::open_file(&db_path).unwrap();
    idx2.rebuild(&vault).unwrap();
    assert_eq!(
        idx2.search("speed").unwrap().len(),
        1,
        "search survives index loss + rebuild"
    );
}

#[test]
fn tst_search_case_insensitive_and_no_false_positives() {
    let tmp = tempfile::tempdir().unwrap();
    let idx = fresh_index(
        tmp.path(),
        &[node_with("01HZX8KQBJ9GYWN3QFVYRXTX09", NodeType::Note, "SPEED is the key", &[])],
    );
    assert_eq!(idx.search("speed").unwrap().len(), 1, "case-insensitive");
    assert_eq!(idx.search("slowness").unwrap().len(), 0, "no false positives");
}
