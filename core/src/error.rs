//! Core error type. Pure - no I/O error variants here (adapter errors fold in
//! via the From bounds at the adapter layer).

use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum Error {
    #[error("node not found: {0}")]
    NotFound(String),

    #[error("invalid node id: {0}")]
    InvalidId(String),

    #[error("invalid frontmatter: {0}")]
    InvalidFrontmatter(String),

    #[error("serialization failed: {0}")]
    Serialize(String),

    #[error("deserialization failed: {0}")]
    Deserialize(String),

    #[error("cycle detected cloning {0}")]
    Cycle(String),

    #[error("gate blocked: {0}")]
    GateBlocked(String),

    #[error("contract violation: {0}")]
    Contract(String),
}

impl From<ulid::DecodeError> for Error {
    fn from(e: ulid::DecodeError) -> Self {
        Error::InvalidId(e.to_string())
    }
}

impl From<serde_yaml::Error> for Error {
    fn from(e: serde_yaml::Error) -> Self {
        Error::Deserialize(e.to_string())
    }
}
