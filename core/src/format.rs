//! Phase 2 markdown format (pure - no I/O). Serializes a [`Node`] to/from the
//! frontmatter + body markdown form. The file-I/O adapter (later Phase 2 slice)
//! lives in the `adapters/` crate and wraps these functions with atomic writes.
//!
//! Format:
//! ```text
//! ---
//! id: <ULID>
//! type: <snake_case node type>
//! <...other frontmatter keys, sorted, unknown keys preserved...>
//! ---
//! <body markdown>
//! ```
//!
//! Guards: INV-DUR (markdown is the durable form), INV-PORT (portable text),
//! INV-EDGE (frontmatter is authoritative for typed edges), and the PLAN sec 2
//! unknown-key-preservation + deterministic-serialization rules.

use crate::error::Error;
use crate::identity::NodeId;
use crate::node::{EdgeStatus, EdgeType, Node, NodeType, TypedEdge};
use serde::{Deserialize, Serialize};

/// Parse a markdown document into a [`Node`].
///
/// Splits frontmatter (between `---` delimiters) from body, parses frontmatter
/// as a YAML map, extracts the required `id` and `type` keys into typed fields,
/// and preserves all remaining keys (including unknown ones) in `frontmatter`.
pub fn from_markdown(text: &str) -> Result<Node, Error> {
    // Tolerate a leading BOM (some editors write one).
    let text = text.strip_prefix('\u{feff}').unwrap_or(text);

    // First line must be the opening delimiter `---`.
    let mut lines = text.split_inclusive('\n');
    let first = lines
        .next()
        .ok_or_else(|| Error::InvalidFrontmatter("empty input".into()))?;
    if first.trim_end_matches(['\r', '\n']) != "---" {
        return Err(Error::InvalidFrontmatter(format!(
            "expected leading '---' delimiter, got {first:?}"
        )));
    }

    // Collect YAML lines until the closing `---`; everything after is the body.
    let mut yaml_lines: Vec<&str> = Vec::new();
    let mut body_lines: Vec<&str> = Vec::new();
    let mut found_close = false;
    for line in lines {
        if !found_close {
            if line.trim_end_matches(['\r', '\n']) == "---" {
                found_close = true;
            } else {
                yaml_lines.push(line);
            }
        } else {
            body_lines.push(line);
        }
    }
    if !found_close {
        return Err(Error::InvalidFrontmatter(
            "missing closing '---' delimiter".into(),
        ));
    }

    let yaml_str: String = yaml_lines.concat();
    let mut fm: crate::node::Frontmatter = if yaml_str.trim().is_empty() {
        Default::default()
    } else {
        serde_yaml::from_str(&yaml_str)?
    };

    // Required keys: id, type. Extract + remove so they don't duplicate in
    // `frontmatter` (they live in the typed fields).
    let id_val = fm
        .remove("id")
        .ok_or_else(|| Error::InvalidFrontmatter("missing required 'id' key".into()))?;
    let type_val = fm
        .remove("type")
        .ok_or_else(|| Error::InvalidFrontmatter("missing required 'type' key".into()))?;
    let id_str = id_val
        .as_str()
        .ok_or_else(|| Error::InvalidFrontmatter("'id' must be a string".into()))?;
    let id = crate::identity::NodeId::parse(id_str)?;
    let ty: NodeType = serde_yaml::from_value(type_val)
        .map_err(|e| Error::InvalidFrontmatter(format!("'type': {e}")))?;

    Ok(Node {
        id,
        ty,
        frontmatter: fm,
        body: body_lines.concat(),
    })
}

/// Serialize a [`Node`] to deterministic markdown.
///
/// Merges the typed `id`/`type` back into a sorted copy of `frontmatter`,
/// emits it as YAML between `---` delimiters, then appends the body. Because
/// `Frontmatter` is a `BTreeMap`, key order is deterministic.
pub fn to_markdown(node: &Node) -> Result<String, Error> {
    let mut fm = node.frontmatter.clone();
    fm.insert(
        "id".into(),
        serde_yaml::Value::String(node.id.to_lexical()),
    );
    fm.insert(
        "type".into(),
        serde_yaml::to_value(node.ty).map_err(|e| Error::Serialize(e.to_string()))?,
    );

    let mut yaml_str = serde_yaml::to_string(&fm).map_err(|e| Error::Serialize(e.to_string()))?;
    // serde_yaml may emit a leading `---\n` document marker; strip it - we add
    // our own delimiters.
    if let Some(stripped) = yaml_str.strip_prefix("---\n") {
        yaml_str = stripped.to_string();
    }
    // Some emitters add a trailing `...` end marker; strip if present.
    if let Some(stripped) = yaml_str.strip_suffix("\n...") {
        yaml_str = stripped.to_string();
    }

    let mut out = String::with_capacity(yaml_str.len() + node.body.len() + 16);
    out.push_str("---\n");
    out.push_str(&yaml_str);
    out.push_str("---\n");
    out.push_str(&node.body);
    Ok(out)
}

// ---- typed-edge encoding (S-STORAGE-002) ----
//
// A node's outgoing edges live in frontmatter under `edges` as a list of
// {to, type, status?} entries. `from` is implicit (the node itself) so it is
// not stored. INV-EDGE: reconstructable from frontmatter alone.

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EdgeEntry {
    to: String,
    #[serde(rename = "type")]
    edge_type: EdgeType,
    #[serde(default)]
    status: EdgeStatus,
}

/// Outgoing typed edges encoded in this node's frontmatter. Reconstructable
/// from markdown alone (INV-EDGE). `from` is filled in as this node's id.
pub fn edges_of(node: &Node) -> Result<Vec<TypedEdge>, Error> {
    let Some(val) = node.frontmatter.get("edges") else {
        return Ok(Vec::new());
    };
    let entries: Vec<EdgeEntry> = serde_yaml::from_value(val.clone())
        .map_err(|e| Error::Deserialize(format!("'edges': {e}")))?;
    entries
        .into_iter()
        .map(|e| {
            let to = NodeId::parse(&e.to)?;
            Ok(TypedEdge {
                from: node.id,
                to,
                edge_type: e.edge_type,
                status: e.status,
            })
        })
        .collect()
}

/// Attach (replace) this node's outgoing edges in its frontmatter.
pub fn set_edges(node: &mut Node, edges: &[TypedEdge]) -> Result<(), Error> {
    if edges.is_empty() {
        node.frontmatter.remove("edges");
        return Ok(());
    }
    let entries: Vec<EdgeEntry> = edges
        .iter()
        .map(|e| EdgeEntry {
            to: e.to.to_lexical(),
            edge_type: e.edge_type,
            status: e.status,
        })
        .collect();
    let val = serde_yaml::to_value(&entries).map_err(|e| Error::Serialize(e.to_string()))?;
    node.frontmatter.insert("edges".into(), val);
    Ok(())
}
