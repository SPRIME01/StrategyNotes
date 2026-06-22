//! Mock provider for testing the sync engine without HTTP. Records every call
//! and returns scripted results. Lives in the default build (no feature flag).

use std::sync::Mutex;

use strategynotes_core::execution::Timebox;

use crate::model::{RemoteEventRef, SyncCursor};
use crate::providers::{CalendarProviderAdapter, ProviderError, PullResult, RemoteCalendar};

#[derive(Debug, Clone, PartialEq, Eq)]
enum RecordedCall {
    ListCalendars,
    Pull(Option<SyncCursor>),
    Create(String),
    Update(String),
    Delete(String),
}

/// A mock adapter that records calls and returns canned results. Tests inspect
/// `calls()` and script `next_result`.
#[derive(Debug, Default)]
pub struct MockProvider {
    name: String,
    calls: Mutex<Vec<RecordedCall>>,
    /// Set to make the next call fail (provider failure / INV-CAL test).
    pub fail_next: Mutex<bool>,
}

impl MockProvider {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            calls: Mutex::new(Vec::new()),
            fail_next: Mutex::new(false),
        }
    }
    pub fn calls(&self) -> Vec<String> {
        self.calls
            .lock()
            .unwrap()
            .iter()
            .map(|c| match c {
                RecordedCall::ListCalendars => "list_calendars".into(),
                RecordedCall::Pull(_) => "pull".into(),
                RecordedCall::Create(t) => format!("create({t})"),
                RecordedCall::Update(t) => format!("update({t})"),
                RecordedCall::Delete(t) => format!("delete({t})"),
            })
            .collect()
    }
    fn check_fail(&self) -> Result<(), ProviderError> {
        let mut f = self.fail_next.lock().unwrap();
        if *f {
            *f = false;
            Err(ProviderError::Http("mock: scripted failure".into()))
        } else {
            Ok(())
        }
    }
}

#[async_trait::async_trait]
impl CalendarProviderAdapter for MockProvider {
    fn provider_name(&self) -> &str {
        &self.name
    }
    async fn list_calendars(&self) -> Result<Vec<RemoteCalendar>, ProviderError> {
        self.calls.lock().unwrap().push(RecordedCall::ListCalendars);
        self.check_fail()?;
        Ok(vec![RemoteCalendar { id: "mock-cal".into(), name: "Mock".into() }])
    }
    async fn pull_changes(&self, cursor: Option<SyncCursor>) -> Result<PullResult, ProviderError> {
        self.calls.lock().unwrap().push(RecordedCall::Pull(cursor.clone()));
        self.check_fail()?;
        Ok(PullResult { changed: Vec::new(), deleted: Vec::new(), cursor: SyncCursor::default() })
    }
    async fn create_event(&self, event: &Timebox) -> Result<RemoteEventRef, ProviderError> {
        self.calls.lock().unwrap().push(RecordedCall::Create(event.id.to_lexical()));
        self.check_fail()?;
        Ok(RemoteEventRef {
            provider_event_id: Some(format!("mock-evt-{}", event.id)),
            provider_href: None,
            etag: Some("mock-etag-1".into()),
            uid: Some(format!("uid-{}", event.id)),
        })
    }
    async fn update_event(
        &self,
        event: &Timebox,
        _remote: &RemoteEventRef,
    ) -> Result<RemoteEventRef, ProviderError> {
        self.calls.lock().unwrap().push(RecordedCall::Update(event.id.to_lexical()));
        self.check_fail()?;
        Ok(RemoteEventRef {
            provider_event_id: Some(format!("mock-evt-{}", event.id)),
            provider_href: None,
            etag: Some("mock-etag-2".into()),
            uid: Some(format!("uid-{}", event.id)),
        })
    }
    async fn delete_event(&self, remote: &RemoteEventRef) -> Result<(), ProviderError> {
        let key = remote.provider_event_id.clone().unwrap_or_default();
        self.calls.lock().unwrap().push(RecordedCall::Delete(key));
        self.check_fail()?;
        Ok(())
    }
}
