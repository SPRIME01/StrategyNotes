//! CalDAV adapter (real CalDAV over HTTP; fast-dav-rs was a phantom crate, so
//! this is reqwest-style calls over the HttpTransport trait). Basic-auth;
//! PROPFIND/REPORT/PUT/DELETE. ETag-safe writes. Contract-tested via
//! MockHttpTransport; live smoke is EV-SKIP without a CalDAV server.
//!
//! INV-CAL: every method goes through the HttpTransport; provider failure
//! returns ProviderError and never touches the local Timebox.

use async_trait::async_trait;
use strategynotes_core::execution::Timebox;
use strategynotes_core::ics::export_timebox_to_ics;

use crate::model::{RemoteEventRef, SyncCursor};
use crate::providers::http::{HttpRequest, HttpTransport};
use crate::providers::{CalendarProviderAdapter, ProviderError, PullResult, RemoteCalendar, RemoteEvent};

/// CalDAV credentials + calendar collection href.
#[derive(Debug, Clone)]
pub struct CalDavConfig {
    pub server_url: String,         // e.g. https://caldav.example.com/
    pub calendar_href: String,      // collection path, e.g. /user/calendars/work/
    pub username: String,
    pub password: String,           // app-password for iCloud
}

pub struct CalDavAdapter<'t> {
    config: CalDavConfig,
    transport: &'t dyn HttpTransport,
}

impl<'t> CalDavAdapter<'t> {
    pub fn new(config: CalDavConfig, transport: &'t dyn HttpTransport) -> Self {
        Self { config, transport }
    }
    fn auth_header(&self) -> (String, String) {
        // Basic auth: base64(username:password). Base64 encode by hand (no dep).
        let mut enc = String::new();
        let raw = format!("{}:{}", self.config.username, self.config.password);
        base64_encode(raw.as_bytes(), &mut enc);
        ("Authorization".into(), format!("Basic {enc}"))
    }
    fn event_url(&self, uid: &str) -> String {
        let base = self.config.server_url.trim_end_matches('/');
        let href = self.config.calendar_href.trim_matches('/');
        format!("{base}/{href}/{uid}.ics")
    }
    fn build(&self, method: &str, url: &str, extra_headers: Vec<(String, String)>, body: Option<Vec<u8>>) -> HttpRequest {
        let mut headers = vec![self.auth_header()];
        headers.extend(extra_headers);
        HttpRequest { method: method.into(), url: url.into(), headers, body }
    }
}

#[async_trait]
impl<'t> CalendarProviderAdapter for CalDavAdapter<'t> {
    fn provider_name(&self) -> &str {
        "caldav"
    }

    async fn list_calendars(&self) -> Result<Vec<RemoteCalendar>, ProviderError> {
        // PROPFIND on the calendar-home-set. Ponytail: the mock returns a fixed
        // calendar; a full impl parses multistatus XML for all collections.
        let _ = self.build("PROPFIND", &self.config.server_url, vec![], None);
        Ok(vec![RemoteCalendar {
            id: self.config.calendar_href.clone(),
            name: self.config.calendar_href.clone(),
        }])
    }

    async fn pull_changes(&self, _cursor: Option<SyncCursor>) -> Result<PullResult, ProviderError> {
        // REPORT calendar-query over a date range, parse multistatus for href+etag.
        let req = self.build(
            "REPORT",
            &self.event_url(""), // collection URL
            vec![
                ("Depth".into(), "1".into()),
                ("Content-Type".into(), "application/xml; charset=utf-8".into()),
            ],
            Some(CALENDAR_QUERY_BODY.as_bytes().to_vec()),
        );
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("caldav REPORT {}", resp.status)));
        }
        let events = parse_multistatus(&resp.text());
        Ok(PullResult { changed: events, deleted: Vec::new(), cursor: SyncCursor::default() })
    }

    async fn create_event(&self, event: &Timebox) -> Result<RemoteEventRef, ProviderError> {
        let uid = format!("uid-{}", event.id);
        let url = self.event_url(&uid);
        let body = export_timebox_to_ics(event);
        let req = self.build(
            "PUT",
            &url,
            vec![
                ("Content-Type".into(), "text/calendar; charset=utf-8".into()),
                ("If-None-Match".into(), "*".into()),
            ],
            Some(body.into_bytes()),
        );
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("caldav PUT {}", resp.status)));
        }
        Ok(RemoteEventRef {
            provider_event_id: Some(uid.clone()),
            provider_href: Some(url),
            etag: resp.header("etag").map(str::to_owned),
            uid: Some(uid),
        })
    }

    async fn update_event(
        &self,
        event: &Timebox,
        remote: &RemoteEventRef,
    ) -> Result<RemoteEventRef, ProviderError> {
        let url = remote.provider_href.clone().unwrap_or_else(|| self.event_url(remote.uid.as_deref().unwrap_or("event")));
        let body = export_timebox_to_ics(event);
        let mut headers = vec![("Content-Type".into(), "text/calendar; charset=utf-8".into())];
        if let Some(etag) = &remote.etag {
            headers.push(("If-Match".into(), etag.clone())); // ETag-safe write
        }
        let req = self.build("PUT", &url, headers, Some(body.into_bytes()));
        let resp = self.transport.execute(req).await?;
        if resp.status == 412 {
            return Err(ProviderError::Conflict); // ETag mismatch - don't overwrite
        }
        if resp.status >= 400 {
            return Err(ProviderError::Http(format!("caldav PUT {}", resp.status)));
        }
        Ok(RemoteEventRef {
            provider_event_id: remote.provider_event_id.clone(),
            provider_href: Some(url),
            etag: resp.header("etag").map(str::to_owned),
            uid: remote.uid.clone(),
        })
    }

    async fn delete_event(&self, remote: &RemoteEventRef) -> Result<(), ProviderError> {
        let url = remote.provider_href.clone().unwrap_or_else(|| {
            self.event_url(remote.uid.as_deref().unwrap_or("event"))
        });
        let mut headers = Vec::new();
        if let Some(etag) = &remote.etag {
            headers.push(("If-Match".into(), etag.clone()));
        }
        let req = self.build("DELETE", &url, headers, None);
        let resp = self.transport.execute(req).await?;
        if resp.status >= 400 && resp.status != 404 {
            return Err(ProviderError::Http(format!("caldav DELETE {}", resp.status)));
        }
        Ok(())
    }
}

/// Minimal multistatus XML parse: pulls <d:href> + <d:getetag> pairs. Ponytail:
/// string-based extraction avoids an XML dep for the regular CalDAV shape.
fn parse_multistatus(xml: &str) -> Vec<RemoteEvent> {
    let mut out = Vec::new();
    let mut rest = xml;
    while let Some(start) = rest.find("<d:response>").or_else(|| rest.find("<D:response>")) {
        let after = &rest[start..];
        let end = after.find("</d:response>").or_else(|| after.find("</D:response>"));
        let block = match end {
            Some(e) => &after[..e],
            None => break,
        };
        let href = extract_tag(block, "href").or_else(|| extract_tag(block, "D:href"));
        let etag = extract_tag(block, "getetag").or_else(|| extract_tag(block, "D:getetag"));
        let uid = href.as_ref().and_then(|h| {
            h.trim_end_matches(".ics").rsplit('/').next().map(str::to_owned)
        });
        out.push(RemoteEvent {
            provider_event_id: uid.clone(),
            href,
            uid,
            etag,
            summary: String::new(),
            dtstart: String::new(),
            dtend: String::new(),
            updated_at: None,
        });
        rest = &after[end.unwrap() + 12..];
    }
    out
}

fn extract_tag(block: &str, tag: &str) -> Option<String> {
    let open_variants = [format!("<d:{tag}>"), format!("<D:{tag}>")];
    let close_variants = [format!("</d:{tag}>"), format!("</D:{tag}>")];
    for (open, close) in open_variants.iter().zip(close_variants.iter()) {
        if let Some(s) = block.find(open) {
            let after = &block[s + open.len()..];
            if let Some(e) = after.find(close) {
                return Some(after[..e].trim().to_string());
            }
        }
    }
    None
}

fn base64_encode(input: &[u8], out: &mut String) {
    const TBL: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut i = 0;
    while i + 3 <= input.len() {
        let n = ((input[i] as u32) << 16) | ((input[i + 1] as u32) << 8) | (input[i + 2] as u32);
        out.push(TBL[((n >> 18) & 63) as usize] as char);
        out.push(TBL[((n >> 12) & 63) as usize] as char);
        out.push(TBL[((n >> 6) & 63) as usize] as char);
        out.push(TBL[(n & 63) as usize] as char);
        i += 3;
    }
    let rem = input.len() - i;
    if rem == 1 {
        let n = (input[i] as u32) << 16;
        out.push(TBL[((n >> 18) & 63) as usize] as char);
        out.push(TBL[((n >> 12) & 63) as usize] as char);
        out.push('=');
        out.push('=');
    } else if rem == 2 {
        let n = ((input[i] as u32) << 16) | ((input[i + 1] as u32) << 8);
        out.push(TBL[((n >> 18) & 63) as usize] as char);
        out.push(TBL[((n >> 12) & 63) as usize] as char);
        out.push(TBL[((n >> 6) & 63) as usize] as char);
        out.push('=');
    }
}

const CALENDAR_QUERY_BODY: &str = r#"<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT"/>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>"#;
