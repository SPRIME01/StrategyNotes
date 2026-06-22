//! Phase B1 INV-BODY tests. Body parsing is authoritative for inline refs/tags.

use strategynotes_core::body::{parse_body, BodyRef, BodyRefKind};

fn ref_of(kind: BodyRefKind, target: &str) -> BodyRef {
    BodyRef { kind, target: target.into() }
}

#[test]
fn tst_body_001_parses_wikilinks() {
    let refs = parse_body("see [[GodSpeed MVP]] and [[01HZX8KQBJ9GYWN3QFVYRXTXMS]]");
    assert_eq!(refs.len(), 2);
    assert_eq!(refs[0], ref_of(BodyRefKind::WikiLink, "GodSpeed MVP"));
    assert_eq!(refs[1], ref_of(BodyRefKind::WikiLink, "01HZX8KQBJ9GYWN3QFVYRXTXMS"));
}

#[test]
fn tst_body_002_parses_single_word_tags() {
    let refs = parse_body("this is #urgent and #strategy");
    assert_eq!(refs.len(), 2);
    assert_eq!(refs[0], ref_of(BodyRefKind::Tag, "urgent"));
    assert_eq!(refs[1], ref_of(BodyRefKind::Tag, "strategy"));
}

#[test]
fn tst_body_003_parses_multi_word_tags() {
    let refs = parse_body("tagged #[[competitive moat]] end");
    assert_eq!(refs.len(), 1);
    assert_eq!(refs[0], ref_of(BodyRefKind::Tag, "competitive moat"));
}

#[test]
fn tst_body_004_parses_block_refs() {
    let refs = parse_body("refs ((01HZX8KQBJ9GYWN3QFVYRXTXMS)) and ((01HZX9W3HJ4C2V1DKE8XFNAB63))");
    assert_eq!(refs.len(), 2);
    assert_eq!(refs[0], ref_of(BodyRefKind::BlockRef, "01HZX8KQBJ9GYWN3QFVYRXTXMS"));
    assert_eq!(refs[1], ref_of(BodyRefKind::BlockRef, "01HZX9W3HJ4C2V1DKE8XFNAB63"));
}

#[test]
fn tst_body_mixed_and_order_independent() {
    let refs = parse_body("#a [[b]] #[[c d]] ((e)) #f");
    assert_eq!(
        refs,
        vec![
            ref_of(BodyRefKind::Tag, "a"),
            ref_of(BodyRefKind::WikiLink, "b"),
            ref_of(BodyRefKind::Tag, "c d"),
            ref_of(BodyRefKind::BlockRef, "e"),
            ref_of(BodyRefKind::Tag, "f"),
        ]
    );
}

#[test]
fn tst_body_lone_hash_is_not_a_tag() {
    // "# heading" (markdown heading) must NOT parse as a tag.
    let refs = parse_body("# Heading\n#not_heading");
    assert_eq!(refs.len(), 1);
    assert_eq!(refs[0], ref_of(BodyRefKind::Tag, "not_heading"));
}

#[test]
fn tst_body_empty_body_returns_empty() {
    assert!(parse_body("").is_empty());
    assert!(parse_body("no refs here at all").is_empty());
}
