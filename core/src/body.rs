//! Body inline parsing (Phase B1, INV-BODY). The body is authoritative for
//! inline refs/tags (PLAN sec 1 INV-BODY). Pure: takes a body string, returns
//! the extracted refs. The derived index consumes these so backlinks include
//! body-derived references and rebuild restores them.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BodyRefKind {
    WikiLink,
    Tag,
    BlockRef,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct BodyRef {
    pub kind: BodyRefKind,
    pub target: String,
}

/// Extract inline refs/tags from a markdown body. Supports:
/// - `[[wikilink]]`              -> WikiLink(target)
/// - `#tag`                      -> Tag(target)   (single word)
/// - `#[[multi word tag]]`       -> Tag(target)   (multi-word)
/// - `((block_ref))`             -> BlockRef(target)
///
/// Order matters: `#[[` is checked before `[[` and `#`.
pub fn parse_body(body: &str) -> Vec<BodyRef> {
    let bytes = body.as_bytes();
    let mut refs = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        let rest = &body[i..];
        // #[[multi word tag]]
        if let Some(stripped) = rest.strip_prefix("#[[") {
            if let Some(end) = stripped.find("]]") {
                refs.push(BodyRef {
                    kind: BodyRefKind::Tag,
                    target: stripped[..end].to_string(),
                });
                i += 3 + end + 2;
                continue;
            }
        }
        // [[wikilink]]
        if let Some(stripped) = rest.strip_prefix("[[") {
            if let Some(end) = stripped.find("]]") {
                refs.push(BodyRef {
                    kind: BodyRefKind::WikiLink,
                    target: stripped[..end].to_string(),
                });
                i += 2 + end + 2;
                continue;
            }
        }
        // ((block_ref))
        if let Some(stripped) = rest.strip_prefix("((") {
            if let Some(end) = stripped.find("))") {
                refs.push(BodyRef {
                    kind: BodyRefKind::BlockRef,
                    target: stripped[..end].to_string(),
                });
                i += 2 + end + 2;
                continue;
            }
        }
        // #tag (single-word; next char must be a word char)
        if bytes[i] == b'#'
            && i + 1 < bytes.len()
            && is_word_char(bytes[i + 1])
        {
            let start = i + 1;
            let mut end = start;
            while end < bytes.len() && is_word_char(bytes[end]) {
                end += 1;
            }
            refs.push(BodyRef {
                kind: BodyRefKind::Tag,
                target: body[start..end].to_string(),
            });
            i = end;
            continue;
        }
        i += 1;
    }
    refs
}

fn is_word_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'-'
}
