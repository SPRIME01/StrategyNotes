use chrono::{Datelike, NaiveDate};

use crate::identity::NodeId;
use crate::node::{Frontmatter, Node, NodeType};
use crate::services::App;
use crate::Error;

use super::DEMO_TITLE;

pub(super) fn demo_case(app: &App<'_>) -> Result<Option<Node>, Error> {
    Ok(app
        .vault
        .all()?
        .into_iter()
        .find(|node| node.ty == NodeType::StrategyCase && fm_str(node, "title") == DEMO_TITLE))
}

pub(super) fn fm(pairs: &[(&str, serde_yaml::Value)]) -> Frontmatter {
    let mut out = Frontmatter::new();
    for (key, value) in pairs {
        out.insert((*key).to_string(), value.clone());
    }
    out
}

pub(super) fn doc_fm(case_id: NodeId, title: &str) -> Frontmatter {
    fm(&[("title", s(title)), ("case", id(case_id))])
}

pub(super) fn s(value: &str) -> serde_yaml::Value {
    serde_yaml::Value::String(value.to_string())
}

pub(super) fn id(value: NodeId) -> serde_yaml::Value {
    s(&value.to_lexical())
}

pub(super) fn list(values: &[&str]) -> serde_yaml::Value {
    serde_yaml::Value::Sequence(values.iter().map(|value| s(value)).collect())
}

pub(super) fn fm_str<'a>(node: &'a Node, key: &str) -> &'a str {
    node.frontmatter
        .get(key)
        .and_then(serde_yaml::Value::as_str)
        .unwrap_or("")
}

pub(super) fn journal_title(date: NaiveDate) -> String {
    let day = date.day();
    let suffix = match day {
        11..=13 => "th",
        _ => match day % 10 {
            1 => "st",
            2 => "nd",
            3 => "rd",
            _ => "th",
        },
    };
    format!("{} {}{}, {}", date.format("%b"), day, suffix, date.year())
}
