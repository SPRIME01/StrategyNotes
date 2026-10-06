//! Deletion safety (INV-DUR). `delete_note` used to remove whatever id it was
//! handed, so `DELETE /api/notes/:id` happily destroyed a strategy bet that four
//! other nodes still pointed at — orphaning them with no way back (the vault is
//! not in git; the index is disposable by design). A reference is data; leaving
//! one dangling is unrecoverable corruption.

use strategynotes_adapters::{DaynoteEventSink, MarkdownVault, SystemClock, UlidMinter};
use strategynotes_core::services::App;
use strategynotes_core::NodeVault;

/// Tempdir held for the life of the test so the vault outlives its own setup.
struct Harness {
    _dir: tempfile::TempDir,
    vault: MarkdownVault,
    sink: DaynoteEventSink,
}

impl Harness {
    fn new() -> Self {
        let dir = tempfile::tempdir().unwrap();
        let vault = MarkdownVault::open(dir.path().join("vault")).unwrap();
        let sink = DaynoteEventSink::open(dir.path().join("daynotes")).unwrap();
        Self { _dir: dir, vault, sink }
    }

    fn app(&self) -> App<'_> {
        App {
            vault: &self.vault,
            sink: &self.sink,
            minter: &UlidMinter,
            clock: &SystemClock,
        }
    }
}

#[test]
fn a_referenced_node_cannot_be_deleted() {
    let h = Harness::new();
    let app = h.app();

    let case = app.create_case("GodSpeed strategy".into()).unwrap();
    // The bet's frontmatter carries `case: <case id>`, so the case is referenced.
    let bet = app.draft_bet(case.id, "One-day onboarding as wedge".into()).unwrap();
    assert_eq!(bet.case, case.id);

    let err = app.delete_note(case.id).expect_err("a referenced node must be refused");
    let msg = err.to_string();
    // The refusal is read by a person in a toast: it must say where the link is,
    // not print a ULID.
    assert!(
        msg.contains("still linked from") && msg.contains("remove those links first"),
        "the refusal must say why and what to do: {msg}"
    );
    assert!(
        msg.contains("GodSpeed strategy"),
        "the refusal must name the thing being deleted: {msg}"
    );

    // Nothing was destroyed.
    assert!(
        h.vault.get(&case.id).unwrap().is_some(),
        "the case must survive a refused delete"
    );
}

#[test]
fn an_unreferenced_node_can_be_deleted() {
    let h = Harness::new();
    let app = h.app();

    let note = app.create_note("Scratch".into(), "nothing points here".into()).unwrap();
    app.delete_note(note.id).expect("an unreferenced note must delete");
    assert!(h.vault.get(&note.id).unwrap().is_none(), "it must actually be gone");
}
