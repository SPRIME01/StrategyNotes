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
use crate::node::{EdgeStatus, EdgeType, Frontmatter, Node, NodeType, TypedEdge};
use serde::{de::DeserializeOwned, Deserialize, Serialize};

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

// ---- typed view <-> frontmatter bridge ----
//
// A typed view struct (StrategyCase, EvidenceItem, ...) serializes its fields
// to/from the frontmatter map. The struct's `id` field is `#[serde(skip)]` and
// set explicitly from/to `Node.id` so it isn't duplicated in the map.

/// Serialize a typed view into a frontmatter map (id is handled by the caller).
pub fn frontmatter_from<T: Serialize>(val: &T) -> Result<Frontmatter, Error> {
    let value = serde_yaml::to_value(val).map_err(|e| Error::Serialize(e.to_string()))?;
    Ok(value_to_map(value))
}

/// Parse a YAML frontmatter string into a Frontmatter map. Used by the OKF
/// import path (POST /api/node) so YAML parsing stays in core (serde_yaml is a
/// core dep), not in the driving HTTP layer.
pub fn frontmatter_from_yaml_str(s: &str) -> Result<Frontmatter, Error> {
    serde_yaml::from_str(s).map_err(|e| Error::Deserialize(format!("frontmatter yaml: {e}")))
}

/// Deserialize a typed view from a frontmatter map (id is handled by the caller).
pub fn frontmatter_to<T: DeserializeOwned>(fm: &Frontmatter) -> Result<T, Error> {
    let value = map_to_value(fm);
    serde_yaml::from_value(value).map_err(|e| Error::Deserialize(e.to_string()))
}

fn value_to_map(value: serde_yaml::Value) -> Frontmatter {
    match value {
        serde_yaml::Value::Mapping(m) => m
            .into_iter()
            .filter_map(|(k, v)| Some((k.as_str()?.to_string(), v)))
            .collect(),
        _ => Frontmatter::new(),
    }
}

fn map_to_value(fm: &Frontmatter) -> serde_yaml::Value {
    let mut mapping = serde_yaml::Mapping::new();
    for (k, v) in fm {
        mapping.insert(serde_yaml::Value::String(k.clone()), v.clone());
    }
    serde_yaml::Value::Mapping(mapping)
}

/// Build a storage [`Node`] from a typed view. The view's `id` field must be
/// `#[serde(skip)]` so it isn't duplicated in the frontmatter payload.
pub fn typed_to_node<T: Serialize>(
    val: &T,
    id: NodeId,
    ty: crate::node::NodeType,
) -> Result<crate::node::Node, Error> {
    Ok(crate::node::Node {
        id,
        ty,
        frontmatter: frontmatter_from(val)?,
        body: String::new(),
    })
}

/// Parse the frontmatter payload of a [`Node`] back into a typed view. The
/// caller sets `id` from `node.id` (it is `#[serde(skip)]`).
pub fn typed_from_node<T: serde::de::DeserializeOwned>(
    node: &crate::node::Node,
) -> Result<T, Error> {
    frontmatter_to(&node.frontmatter)
}
