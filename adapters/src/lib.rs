//! Driven adapters for the StrategyNotes hexagonal core (SPEC sec 3.4).
//! These crates ARE allowed to use std::fs, external crates, etc. - the
//! hexagonal boundary is at `core/`, not here.

pub mod daynote_sink;
pub mod markdown_vault;
pub mod sqlite_index;

pub use daynote_sink::DaynoteEventSink;
pub use markdown_vault::MarkdownVault;
pub use sqlite_index::SQLiteIndex;
