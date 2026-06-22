//! Provider adapter trait + shared types (adapted from the calendar spec).
//! The canonical event is the core [`Timebox`] (markdown); adapters mirror it.
//! The sync engine is generic over `A: CalendarProviderAdapter` (no async-trait
//! dep). Real HTTP adapters live behind feature flags (`google`/`microsoft`/
//! `caldav`); tests use `MockProvider`.

use strategynotes_core::execution::Timebox;

use crate::model::{RemoteEventRef, SyncCursor};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteCalendar {
    pub id: String,
    pub name: String,
}

/// A remote event shape (provider-agnostic). Converted to/from Timebox at the
/// adapter boundary; never leaks into the UI.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteEvent {
    pub provider_event_id: Option<String>,
    pub href: Option<String>,
    pub uid: Option<String>,
    pub etag: Option<String>,
    pub summary: String,
    pub dtstart: String,
    pub dtend: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct PullResult {
    pub changed: Vec<RemoteEvent>,
    pub deleted: Vec<String>, // provider event ids / hrefs removed remotely
    pub cursor: SyncCursor,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProviderError {
    Http(String),
    Auth(String),
    NotFound,
    Conflict,
    Other(String),
}

/// Async provider adapter. `async_trait` desugars to Send-safe boxed futures
/// (the canonical solution to the "async fn in public trait" clippy lint and
/// to dyn-compatibility). Real HTTP adapters live behind feature flags.
#[async_trait::async_trait]
pub trait CalendarProviderAdapter: Send + Sync {
    fn provider_name(&self) -> &str;
    async fn list_calendars(&self) -> Result<Vec<RemoteCalendar>, ProviderError>;
    async fn pull_changes(&self, cursor: Option<SyncCursor>) -> Result<PullResult, ProviderError>;
    async fn create_event(&self, event: &Timebox) -> Result<RemoteEventRef, ProviderError>;
    async fn update_event(
        &self,
        event: &Timebox,
        remote: &RemoteEventRef,
    ) -> Result<RemoteEventRef, ProviderError>;
    async fn delete_event(&self, remote: &RemoteEventRef) -> Result<(), ProviderError>;
}

pub mod http;
pub mod mock;
pub mod caldav;
pub mod google;
pub mod microsoft;

pub use mock::MockProvider;
pub use http::{HttpRequest, HttpResponse, HttpTransport, MockHttpTransport};
pub use caldav::{CalDavAdapter, CalDavConfig};
pub use google::GoogleAdapter;
pub use microsoft::MicrosoftAdapter;
