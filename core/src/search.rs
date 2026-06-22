//! Search (Phase D). Derived from the index; rebuildable from markdown; never
//! source of truth. Ponytail: LIKE over a denormalized search_text column is
//! the smallest correct solution. FTS5 is a future enhancement, not required
//! for MVP correctness.

use crate::node::{Node, NodeType};

/// One search hit. `excerpt` is a short snippet of the body around the match.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub ty: NodeType,
    pub excerpt: String,
}

/// Build the lowercase searchable text for a node: body + key frontmatter
/// title-ish fields (title/statement/thesis/objective/text/decision/description).
/// Pure. The adapter stores this in a derived column at rebuild time.
pub fn search_text_of(node: &Node) -> String {
    let mut parts: Vec<String> = vec![node.body.clone()];
    for key in [
        "title",
        "statement",
        "thesis",
        "objective",
        "text",
        "decision",
        "description",
    ] {
        if let Some(v) = node.frontmatter.get(key) {
            if let Some(s) = v.as_str() {
                parts.push(s.to_string());
            }
        }
    }
    parts.join(" ").to_lowercase()
}
