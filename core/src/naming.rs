//! Generic enum <-> snake_case-string helpers. Used by adapters (e.g. the
//! SQLite index, which stores enum values as TEXT) without forcing those crates
//! to depend on serde directly.

use serde::{de::DeserializeOwned, Serialize};

use crate::Error;

/// Serialize an enum value to its snake_case name (e.g. `NodeType::StrategyCase`
/// -> `"strategy_case"`). Driven by `#[serde(rename_all = "snake_case")]`.
pub fn snake_case_name<T: Serialize>(val: T) -> String {
    serde_yaml::to_value(val)
        .ok()
        .and_then(|v| v.as_str().map(str::to_string))
        .unwrap_or_default()
}

/// Parse a snake_case name back into an enum value.
pub fn from_snake_case<T: DeserializeOwned>(s: &str) -> Result<T, Error> {
    let val = serde_yaml::Value::String(s.to_string());
    serde_yaml::from_value::<T>(val)
        .map_err(|e| Error::Deserialize(format!("enum from '{s}': {e}")))
}
