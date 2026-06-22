//! Calendar provider port + types (Phase G, INV-CAL). The local Timebox is
//! the source of truth; providers MIRROR events. Provider failure returns Err
//! but cannot corrupt local state - the vault never depends on provider output.
//! Guards INV-CAL by construction (the port is the boundary).

use crate::error::Error;
use crate::execution::Timebox;

/// Provider availability (no credentials, rate-limited, down, etc.).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProviderStatus {
    Available,
    Unavailable(String),
}

/// A mirrored event in an external calendar.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExternalEvent {
    pub external_id: String,
    pub provider: String,
}

/// Driven port: push/pull timeboxes to/from an external calendar. Adapters:
/// Internal (no-op), ICS (file export), Google/Outlook/iCloud (stubs or real
/// behind feature flags). INV-CAL: every method is best-effort; errors never
/// reach the local timebox state.
pub trait CalendarProvider {
    fn provider_name(&self) -> &str;
    fn status(&self) -> ProviderStatus;
    fn create_event(&self, timebox: &Timebox) -> Result<ExternalEvent, Error>;
    fn update_event(&self, timebox: &Timebox, external_id: &str) -> Result<(), Error>;
    fn delete_event(&self, external_id: &str) -> Result<(), Error>;
    fn get_event(&self, external_id: &str) -> Result<Option<ExternalEvent>, Error>;
}
