//! Calendar subsystem for StrategyNotes (adapted from the standalone-Tauri
//! calendar spec). Key adaptations to project conventions:
//!
//! - **Timebox (markdown node) is the canonical event.** INV-DUR holds: the
//!   provider subsystem does NOT introduce a parallel CalendarEvent model as
//!   source of truth. Providers mirror timeboxes; they don't own them.
//! - **Sync metadata is non-strategy-critical SQLite.** Losing it triggers a
//!   full re-sync, not data loss - so it may live in SQLite without violating
//!   INV-DUR (which guards strategy-critical state only).
//! - **Secrets behind a port** (`SecretStore`). The Tauri build wires
//!   Stronghold; non-Tauri/testing uses `FileSecretStore` (plaintext, dev only).
//! - **Real HTTP adapters are feature-flagged** (`google`/`microsoft`/`caldav`).
//!   The default build has no reqwest; contract tests use a trait-injected mock
//!   transport. Live-provider smoke is EV-SKIP without credentials.
//! - **calcard/fast-dav-rs were phantom crates** (not on crates.io); ICS parsing
//!   is hand-rolled (like the existing export), CalDAV is reqwest + XML.

pub mod ics_import;
pub mod model;
pub mod providers;
pub mod secrets;
pub mod sync;
pub mod sync_store;

pub use ics_import::{parse_ics, ImportedEvent};
pub use model::{RemoteEventRef, SyncCursor, SyncMetadata, SyncStatus};
pub use providers::{
    http::{HttpRequest, HttpResponse, HttpTransport, MockHttpTransport},
    CalDavAdapter, CalDavConfig, CalendarProviderAdapter, GoogleAdapter, MicrosoftAdapter,
    MockProvider, ProviderError, PullResult, RemoteCalendar,
};
pub use secrets::{FileSecretStore, SecretStore};
pub use sync::{pull, push, PullSummary, PushSummary};
pub use sync_store::SyncMetadataStore;
