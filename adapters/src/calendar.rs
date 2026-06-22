//! Calendar provider adapters (Phase G). INV-CAL: the local Timebox is the
//! source of truth; providers mirror. Real Google/Outlook/iCloud impls are
//! stubs that report Unavailable without credentials - a feature flag
//! (`google`/`outlook`/`icloud`) would enable the real HTTP adapters later.
//! The ICS adapter is the only real external-format provider (local-first).

use strategynotes_core::calendar::{CalendarProvider, ExternalEvent, ProviderStatus};
use strategynotes_core::execution::Timebox;
use strategynotes_core::ics::export_timebox_to_ics;
use strategynotes_core::Error;

/// Internal calendar: no external provider. Mirrors are no-ops; always available.
#[derive(Debug, Clone, Default)]
pub struct InternalCalendarProvider;

impl CalendarProvider for InternalCalendarProvider {
    fn provider_name(&self) -> &str { "internal" }
    fn status(&self) -> ProviderStatus { ProviderStatus::Available }
    fn create_event(&self, t: &Timebox) -> Result<ExternalEvent, Error> {
        Ok(ExternalEvent { external_id: format!("internal:{}", t.id), provider: "internal".into() })
    }
    fn update_event(&self, t: &Timebox, _external_id: &str) -> Result<(), Error> {
        let _ = t; Ok(())
    }
    fn delete_event(&self, _external_id: &str) -> Result<(), Error> { Ok(()) }
    fn get_event(&self, external_id: &str) -> Result<Option<ExternalEvent>, Error> {
        if external_id.starts_with("internal:") {
            Ok(Some(ExternalEvent { external_id: external_id.into(), provider: "internal".into() }))
        } else {
            Ok(None)
        }
    }
}

/// ICS calendar: emits RFC 5545 text (local-first; no provider round-trip).
/// Guards INV-CAL by being entirely local - there is no external state to corrupt.
#[derive(Debug, Clone, Default)]
pub struct IcsCalendarProvider;

impl CalendarProvider for IcsCalendarProvider {
    fn provider_name(&self) -> &str { "ics" }
    fn status(&self) -> ProviderStatus { ProviderStatus::Available }
    fn create_event(&self, t: &Timebox) -> Result<ExternalEvent, Error> {
        // The external_id is the ICS document itself (self-contained, portable).
        let ics = export_timebox_to_ics(t);
        Ok(ExternalEvent { external_id: ics, provider: "ics".into() })
    }
    fn update_event(&self, t: &Timebox, _external_id: &str) -> Result<(), Error> {
        let _ = export_timebox_to_ics(t); Ok(())
    }
    fn delete_event(&self, _external_id: &str) -> Result<(), Error> { Ok(()) }
    fn get_event(&self, external_id: &str) -> Result<Option<ExternalEvent>, Error> {
        if external_id.starts_with("BEGIN:VCALENDAR") {
            Ok(Some(ExternalEvent { external_id: external_id.into(), provider: "ics".into() }))
        } else {
            Ok(None)
        }
    }
}

/// Stub for a real provider that is unavailable without credentials. The real
/// adapter lives behind a feature flag (e.g. `google`); without it, the stub
/// correctly reports Unavailable and errors on use - never silently fakes success.
#[derive(Debug, Clone)]
pub struct StubCalendarProvider {
    name: &'static str,
    credential_env: &'static str,
}

impl StubCalendarProvider {
    pub const fn google() -> Self { Self { name: "google", credential_env: "GOOGLE_CALENDAR_CREDENTIALS" } }
    pub const fn outlook() -> Self { Self { name: "outlook", credential_env: "OUTLOOK_CREDENTIALS" } }
    pub const fn icloud() -> Self { Self { name: "icloud-caldav", credential_env: "ICLOUD_CALDAV_CREDENTIALS" } }
}

impl CalendarProvider for StubCalendarProvider {
    fn provider_name(&self) -> &str { self.name }
    fn status(&self) -> ProviderStatus {
        ProviderStatus::Unavailable(format!(
            "no credentials; set {} to enable the real {} adapter (feature-flagged)",
            self.credential_env, self.name
        ))
    }
    fn create_event(&self, _t: &Timebox) -> Result<ExternalEvent, Error> {
        Err(Error::Contract(format!("{} provider unavailable without credentials", self.name)))
    }
    fn update_event(&self, _t: &Timebox, _external_id: &str) -> Result<(), Error> {
        Err(Error::Contract(format!("{} provider unavailable", self.name)))
    }
    fn delete_event(&self, _external_id: &str) -> Result<(), Error> {
        Err(Error::Contract(format!("{} provider unavailable", self.name)))
    }
    fn get_event(&self, _external_id: &str) -> Result<Option<ExternalEvent>, Error> {
        Err(Error::Contract(format!("{} provider unavailable", self.name)))
    }
}

/// Convenience constructors for the named stubs.
pub fn google_calendar_provider() -> StubCalendarProvider { StubCalendarProvider::google() }
pub fn outlook_calendar_provider() -> StubCalendarProvider { StubCalendarProvider::outlook() }
pub fn icloud_calendar_provider() -> StubCalendarProvider { StubCalendarProvider::icloud() }
