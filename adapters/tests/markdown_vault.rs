//! MarkdownVault adapter tests (TST-STORAGE). Proves INV-DUR end-to-end:
//! nodes survive as plain markdown on disk, can be re-read, and wiping the
//! derived index never reaches this layer.

use strategynotes_adapters::MarkdownVault;
use strategynotes_core::node::{Frontmatter, Node, NodeType};
use strategynotes_core::ports::NodeVault;
use strategynotes_core::NodeId;

fn sample_node(id_str: &str, body: &str) -> Node {
    Node {
        id: NodeId::parse(id_str).unwrap(),
        ty: NodeType::StrategyCase,
        frontmatter: Frontmatter::from([
            (
                "owner".to_string(),
                serde_yaml::Value::String("Sam".into()),
            ),
            (
                "arena".to_string(),
                serde_yaml::Value::String("GodSpeed MVP".into()),
            ),
        ]),
        body: body.into(),
    }
}

#[test]
fn put_then_get_round_trips_through_disk() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let node = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "# Case\n\nbody");
    vault.put(&node).unwrap();

    let got = vault.get(&node.id).unwrap().expect("node should exist");
    assert_eq!(got.id, node.id);
    assert_eq!(got.ty, node.ty);
    assert_eq!(got.frontmatter, node.frontmatter);
    assert_eq!(got.body, node.body);
}

#[test]
fn get_missing_returns_none_not_error() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let id = NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap();
    assert!(vault.get(&id).unwrap().is_none());
}

#[test]
fn delete_removes_node_and_is_idempotent() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let node = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "x");
    vault.put(&node).unwrap();
    vault.delete(&node.id).unwrap();
    assert!(vault.get(&node.id).unwrap().is_none());
    // deleting again must not error
    vault.delete(&node.id).unwrap();
}

#[test]
fn all_lists_every_node_in_the_vault() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let a = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "a");
    let b = sample_node("01HZX9W3HJ4C2V1DKE8XFNAB63", "b");
    vault.put(&a).unwrap();
    vault.put(&b).unwrap();
    let mut all = vault
        .all()
        .unwrap()
        .into_iter()
        .map(|n| n.id)
        .collect::<Vec<_>>();
    all.sort();
    assert_eq!(all, vec![a.id, b.id]);
}

#[test]
fn files_on_disk_are_plain_markdown_inv_dur() {
    // INV-DUR / INV-PORT: a user can open the vault and read it without the app.
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let node = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "# readable");
    vault.put(&node).unwrap();
    let path = tmp.path().join("01HZX8KQBJ9GYWN3QFVYRXTXMS.md");
    let contents = std::fs::read_to_string(&path).unwrap();
    assert!(contents.starts_with("---\n"), "must start with frontmatter");
    assert!(contents.contains("id: 01HZX8KQBJ9GYWN3QFVYRXTXMS"));
    assert!(contents.contains("type: strategy_case"));
    assert!(contents.contains("# readable"));
}

#[test]
fn atomic_write_leaves_no_tmp_file_behind() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let node = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "v1");
    vault.put(&node).unwrap();
    let mut updated = node.clone();
    updated.body = "v2".into();
    vault.put(&updated).unwrap();

    let entries = std::fs::read_dir(tmp.path()).unwrap().count();
    assert_eq!(entries, 1, "no .tmp leftovers after atomic rename");
}

#[test]
fn unknown_frontmatter_keys_survive_disk_round_trip() {
    let tmp = tempfile::tempdir().unwrap();
    let vault = MarkdownVault::open(tmp.path()).unwrap();
    let mut node = sample_node("01HZX8KQBJ9GYWN3QFVYRXTXMS", "b");
    node.frontmatter.insert(
        "future_plugin_key".into(),
        serde_yaml::Value::Sequence(vec![serde_yaml::Value::from(1), serde_yaml::Value::from(2)]),
    );
    vault.put(&node).unwrap();
    let got = vault.get(&node.id).unwrap().unwrap();
    assert_eq!(got.frontmatter.get("future_plugin_key"), node.frontmatter.get("future_plugin_key"));
}
