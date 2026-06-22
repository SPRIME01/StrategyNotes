//! Driven adapters for the StrategyNotes hexagonal core (SPEC sec 3.4).
//! These crates ARE allowed to use std::fs, external crates, etc. - the
//! hexagonal boundary is at `core/`, not here.

pub mod calendar;
pub mod daynote_sink;
pub mod markdown_vault;
pub mod sqlite_index;
pub mod trivial;

pub use calendar::{
    google_calendar_provider, icloud_calendar_provider, outlook_calendar_provider,
    InternalCalendarProvider, IcsCalendarProvider, StubCalendarProvider,
};
pub use daynote_sink::DaynoteEventSink;
pub use markdown_vault::MarkdownVault;
pub use sqlite_index::SQLiteIndex;
pub use trivial::{SystemClock, UlidMinter};
