//! Google Calendar adapter (REST v3 over HttpTransport). Bearer auth; token
//! refresh is the caller's responsibility (the real OAuth flow lives behind the
//! `google` feature with reqwest; here the adapter takes a pre-obtained token).
//! Contract-tested via MockHttpTransport; live smoke = EV-SKIP without creds.

use async_trait::async_trait;
use strategynotes_core::execution::Timebox;

use crate::model::{RemoteEventRef, SyncCursor};
use crate::providers::http::{HttpRequest, HttpTransport};
use crate::providers::{CalendarProviderAdapter, ProviderError, PullResult, RemoteCalendar, RemoteEvent};

const BASE: &str = "https://www.googleapis.com/calendar/v3";

pub struct GoogleAdapter<'t> {
    access_token: String,
    calendar_id: String,
    transport: &'t dyn HttpTransport,
}

impl<'t> GoogleAdapter<'t> {
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
        format!("{BASE}/calendars/{}/events/{}", urlenc(&self.calendar_id), urlenc(id))
    }
    fn event_json(&self, event: &Timebox) -> String {
        serde_json::json!({
            "summary": event.expected_output.as_deref().unwrap_or("StrategyNotes timebox"),
            "start": { "dateTime": event.scheduled_start.to_rfc3339() },
            "end":   { "dateTime": event.scheduled_end.to_rfc3339() },
        })
        .to_string()
    }
}

#[async_trait]
impl<'t> CalendarProviderAdapter for GoogleAdapter<'t> {
    fn provider_name(&self) -> &str { "google" }

    async fn list_calendars(&self) -> Result<Vec<RemoteCalendar>, ProviderError> {
        let req = HttpRequest {
            method: "GET".into(),
            url: format!("{BASE}/users/me/calendarList"),
            headers: vec![self.auth()],
            body: None,
        };
        let resp = self.transport.execute(req).await?;
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("google parse: {e}")))?;
        let mut out = Vec::new();
        if let Some(items) = json.get("items").and_then(|v| v.as_array()) {
            for item in items {
                out.push(RemoteCalendar {
                    id: item.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    name: item.get("summary").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                });
            }
        }
        Ok(out)
    }

    async fn pull_changes(&self, cursor: Option<SyncCursor>) -> Result<PullResult, ProviderError> {
        let mut url = format!("{}&singleEvents=true&maxResults=250", self.events_url());
        if let Some(c) = cursor.and_then(|c| c.value) {
            url.push_str(&format!("&syncToken={}", urlenc(&c)));
        } else {
            url.push_str("&showDeleted=true");
        }
        let req = HttpRequest { method: "GET".into(), url, headers: vec![self.auth()], body: None };
        let resp = self.transport.execute(req).await?;
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("google parse: {e}")))?;
        let mut changed = Vec::new();
        let mut deleted = Vec::new();
        if let Some(items) = json.get("items").and_then(|v| v.as_array()) {
            for item in items {
                let status = item.get("status").and_then(|v| v.as_str()).unwrap_or("");
                let id = item.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                if status == "cancelled" {
                    deleted.push(id);
                } else {
                    changed.push(RemoteEvent {
                        provider_event_id: Some(id),
                        href: None,
                        uid: item.get("iCalUID").and_then(|v| v.as_str()).map(str::to_owned),
                        etag: item.get("etag").and_then(|v| v.as_str()).map(str::to_owned),
                        summary: item.get("summary").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        dtstart: item.pointer("/start/dateTime").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        dtend: item.pointer("/end/dateTime").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        updated_at: item.get("updated").and_then(|v| v.as_str()).map(str::to_owned),
                    });
                }
            }
        }
        let next_token = json.get("nextSyncToken").and_then(|v| v.as_str()).map(str::to_owned);
        Ok(PullResult {
            changed,
            deleted,
            cursor: SyncCursor { value: next_token },
        })
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
            return Err(ProviderError::Http(format!("google POST {}", resp.status)));
        }
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("google parse: {e}")))?;
        Ok(RemoteEventRef {
            provider_event_id: json.get("id").and_then(|v| v.as_str()).map(str::to_owned),
            provider_href: None,
            etag: json.get("etag").and_then(|v| v.as_str()).map(str::to_owned),
            uid: json.get("iCalUID").and_then(|v| v.as_str()).map(str::to_owned),
        })
    }

    async fn update_event(
        &self,
        event: &Timebox,
        remote: &RemoteEventRef,
    ) -> Result<RemoteEventRef, ProviderError> {
        let id = remote.provider_event_id.as_deref().ok_or_else(|| ProviderError::Other("google: missing event id".into()))?;
        let url = self.event_url(id);
        let headers = vec![
            ("Content-Type".into(), "application/json".into()),
            self.auth(),
            ("If-Match".into(), remote.etag.clone().unwrap_or_else(|| "*".into())),
        ];
        let req = HttpRequest { method: "PUT".into(), url, headers, body: Some(self.event_json(event).into_bytes()) };
        let resp = self.transport.execute(req).await?;
        if resp.status == 412 {
            return Err(ProviderError::Conflict);
        }
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("google PUT {}", resp.status)));
        }
        let json: serde_json::Value = serde_json::from_slice(&resp.body)
            .map_err(|e| ProviderError::Other(format!("google parse: {e}")))?;
        Ok(RemoteEventRef {
            provider_event_id: json.get("id").and_then(|v| v.as_str()).map(str::to_owned).or_else(|| Some(id.to_string())),
            provider_href: None,
            etag: json.get("etag").and_then(|v| v.as_str()).map(str::to_owned),
            uid: remote.uid.clone(),
        })
    }

    async fn delete_event(&self, remote: &RemoteEventRef) -> Result<(), ProviderError> {
        let id = remote.provider_event_id.as_deref().ok_or_else(|| ProviderError::Other("google: missing event id".into()))?;
        let req = HttpRequest { method: "DELETE".into(), url: self.event_url(id), headers: vec![self.auth()], body: None };
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 && resp.status != 404 {
            return Err(ProviderError::Http(format!("google DELETE {}", resp.status)));
        }
        Ok(())
    }
}

fn urlenc(s: &str) -> String {
    s.chars().map(|c| match c {
        ' ' => "+".into(),
        c if c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.' || c == '~' => c.to_string(),
        c => format!("%{:02X}", c as u8),
    }).collect()
}
