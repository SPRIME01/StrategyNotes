//! Microsoft Graph calendar adapter (over HttpTransport). Bearer auth; token
//! refresh is the caller's responsibility. Contract-tested via MockHttpTransport;
//! live smoke = EV-SKIP without credentials.

use async_trait::async_trait;
use strategynotes_core::execution::Timebox;

use crate::model::{RemoteEventRef, SyncCursor};
use crate::providers::http::{HttpRequest, HttpTransport};
use crate::providers::{CalendarProviderAdapter, ProviderError, PullResult, RemoteCalendar, RemoteEvent};

const BASE: &str = "https://graph.microsoft.com/v1.0/me";

pub struct MicrosoftAdapter<'t> {
    access_token: String,
    calendar_id: String,
    transport: &'t dyn HttpTransport,
}

impl<'t> MicrosoftAdapter<'t> {
    pub fn new(access_token: String, calendar_id: String, transport: &'t dyn HttpTransport) -> Self {
        Self { access_token, calendar_id, transport }
    }
    fn auth(&self) -> (String, String) {
        ("Authorization".into(), format!("Bearer {}", self.access_token))
    }
    fn events_url(&self) -> String {
        format!("{BASE}/calendars/{}/events", urlenc(&self.calendar_id))
    }
    fn event_url(&self, id: &str) -> String {
        format!("{BASE}/events/{}", urlenc(id))
    }
    fn event_json(&self, event: &Timebox) -> String {
        serde_json::json!({
            "subject": event.expected_output.as_deref().unwrap_or("StrategyNotes timebox"),
            "start": { "dateTime": event.scheduled_start.to_rfc3339(), "timeZone": "UTC" },
            "end":   { "dateTime": event.scheduled_end.to_rfc3339(), "timeZone": "UTC" },
        })
        .to_string()
    }
}

#[async_trait]
impl<'t> CalendarProviderAdapter for MicrosoftAdapter<'t> {
    fn provider_name(&self) -> &str { "microsoft" }

    async fn list_calendars(&self) -> Result<Vec<RemoteCalendar>, ProviderError> {
        let req = HttpRequest { method: "GET".into(), url: format!("{BASE}/calendars"), headers: vec![self.auth()], body: None };
        let resp = self.transport.execute(req).await?;
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("microsoft parse: {e}")))?;
        let mut out = Vec::new();
        if let Some(items) = json.get("value").and_then(|v| v.as_array()) {
            for item in items {
                out.push(RemoteCalendar {
                    id: item.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    name: item.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                });
            }
        }
        Ok(out)
    }

    async fn pull_changes(&self, cursor: Option<SyncCursor>) -> Result<PullResult, ProviderError> {
        // Graph delta query. Ponytail: calendar-view over a rolling window;
        // deltaLink returned when pagination completes.
        let url = match cursor.and_then(|c| c.value) {
            Some(delta) if delta.starts_with("http") => delta,
            _ => format!("{}?$select=subject,start,end&$top=50", self.events_url()),
        };
        let req = HttpRequest { method: "GET".into(), url, headers: vec![self.auth()], body: None };
        let resp = self.transport.execute(req).await?;
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("microsoft parse: {e}")))?;
        let mut changed = Vec::new();
        if let Some(items) = json.get("value").and_then(|v| v.as_array()) {
            for item in items {
                if item.get("@removed").is_some() {
                    continue;
                }
                changed.push(RemoteEvent {
                    provider_event_id: item.get("id").and_then(|v| v.as_str()).map(str::to_owned),
                    href: None,
                    uid: None,
                    etag: item.get("@odata.etag").and_then(|v| v.as_str()).map(str::to_owned),
                    summary: item.get("subject").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    dtstart: item.pointer("/start/dateTime").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    dtend: item.pointer("/end/dateTime").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    updated_at: item.get("lastModifiedDateTime").and_then(|v| v.as_str()).map(str::to_owned),
                });
            }
        }
        let next = json
            .get("@odata.deltaLink")
            .or_else(|| json.get("@odata.nextLink"))
            .and_then(|v| v.as_str())
            .map(str::to_owned);
        Ok(PullResult { changed, deleted: Vec::new(), cursor: SyncCursor { value: next } })
    }

    async fn create_event(&self, event: &Timebox) -> Result<RemoteEventRef, ProviderError> {
        let req = HttpRequest {
            method: "POST".into(),
            url: self.events_url(),
            headers: vec![self.auth(), ("Content-Type".into(), "application/json".into())],
            body: Some(self.event_json(event).into_bytes()),
        };
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("microsoft POST {}", resp.status)));
        }
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("microsoft parse: {e}")))?;
        Ok(RemoteEventRef {
            provider_event_id: json.get("id").and_then(|v| v.as_str()).map(str::to_owned),
            provider_href: None,
            etag: json.get("@odata.etag").and_then(|v| v.as_str()).map(str::to_owned),
            uid: None,
        })
    }

    async fn update_event(
        &self,
        event: &Timebox,
        remote: &RemoteEventRef,
    ) -> Result<RemoteEventRef, ProviderError> {
        let id = remote.provider_event_id.as_deref().ok_or_else(|| ProviderError::Other("microsoft: missing event id".into()))?;
        let req = HttpRequest {
            method: "PATCH".into(),
            url: self.event_url(id),
            headers: vec![self.auth(), ("Content-Type".into(), "application/json".into())],
            body: Some(self.event_json(event).into_bytes()),
        };
        let resp = self.transport.execute(req).await?;
        if resp.status == 412 {
            return Err(ProviderError::Conflict);
        }
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("microsoft PATCH {}", resp.status)));
        }
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("microsoft parse: {e}")))?;
        Ok(RemoteEventRef {
            provider_event_id: json.get("id").and_then(|v| v.as_str()).map(str::to_owned).or_else(|| Some(id.to_string())),
            provider_href: None,
            etag: json.get("@odata.etag").and_then(|v| v.as_str()).map(str::to_owned),
            uid: None,
        })
    }

    async fn delete_event(&self, remote: &RemoteEventRef) -> Result<(), ProviderError> {
        let id = remote.provider_event_id.as_deref().ok_or_else(|| ProviderError::Other("microsoft: missing event id".into()))?;
        let req = HttpRequest { method: "DELETE".into(), url: self.event_url(id), headers: vec![self.auth()], body: None };
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 && resp.status != 404 {
            return Err(ProviderError::Http(format!("microsoft DELETE {}", resp.status)));
        }
        Ok(())
    }
}

fn urlenc(s: &str) -> String {
    s.chars().map(|c| match c {
        c if c.is_ascii_alphanumeric() || c == '-' || c == '_' => c.to_string(),
        c => format!("%{:02X}", c as u8),
    }).collect()
}
