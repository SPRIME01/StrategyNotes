//! Stable node identity. ULID-backed: sortable, path-mappable, 26-char Crockford.
//! Guards: INV-ID.
//!
//! Core parses/validates/comparses NodeIds but never MINTS them — minting needs
//! randomness, which is the [`IdMinter`](crate::ports::IdMinter) adapter's job.

use serde::{Deserialize, Serialize};
use std::fmt;
use ulid::Ulid;

/// Opaque node identity. Stable for the life of the node.
#[derive(
    Debug, Clone, Copy, Default, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize,
)]
#[serde(transparent)]
pub struct NodeId(pub Ulid);

impl NodeId {
    /// Parse a Crockford-Base32 ULID string. Pure.
    pub fn parse(s: &str) -> Result<Self, ulid::DecodeError> {
        Ulid::from_string(s).map(Self)
    }

    /// Lexical (Crockford-Base32) form, used in filenames and markdown refs.
    pub fn to_lexical(&self) -> String {
        self.0.to_string()
    }
}

impl fmt::Display for NodeId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0.to_string())
    }
}
