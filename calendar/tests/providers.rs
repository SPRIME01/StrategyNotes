//! Provider contract tests (CalDAV, Google, Microsoft) via MockHttpTransport.
//! No network, no credentials - the adapter logic (URL building, auth headers,
//! JSON/XML parsing, ETag handling) is exercised against canned responses.
//! INV-CAL: a 5xx response returns ProviderError (the engine then marks the
//! row Error; the local Timebox is never touched).

use strategynotes_calendar::{
    CalDavAdapter, CalDavConfig, CalendarProviderAdapter, GoogleAdapter,
    HttpResponse, MicrosoftAdapter, MockHttpTransport,
};
use strategynotes_core::execution::{PomoEstimate, Timebox, TimeboxStatus};
use strategynotes_core::{AttentionMode, NodeId, PomoPattern};

use chrono::{TimeZone, Utc};

fn timebox() -> Timebox {
    Timebox {
        id: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXMS").unwrap(),
        work_package: NodeId::parse("01HZX8KQBJ9GYWN3QFVYRXTXWP").unwrap(),
        status: TimeboxStatus::Committed,
        estimate: PomoEstimate { pomos: 2, pattern: PomoPattern::P25M5, attention_mode: AttentionMode::ExecutionBuild },
        scheduled_start: Utc.with_ymd_and_hms(2026, 7, 1, 13, 0, 0).unwrap(),
        scheduled_end: Utc.with_ymd_and_hms(2026, 7, 1, 14, 0, 0).unwrap(),
        expected_output: Some("ship draft".into()),
        review_required: true,
    }
}

fn json_resp(status: u16, body: &str, headers: Vec<(&str, &str)>) -> HttpResponse {
    let mut h = vec![("content-type".into(), "application/json".into())];
    for (k, v) in headers {
        h.push((k.into(), v.into()));
    }
    HttpResponse { status, headers: h, body: body.as_bytes().to_vec() }
}

// ---- CalDAV ----

#[tokio::test]
async fn caldav_create_returns_etag_from_response() {
    let mock = MockHttpTransport::new();
    mock.enqueue(json_resp(201, "", vec![("etag", "W/\"abc\"")]));
    let adapter = CalDavAdapter::new(
        CalDavConfig { server_url: "https://dav.example.com".into(), calendar_href: "/work".into(), username: "u".into(), password: "p".into() },
        &mock,
    );
    let remote = adapter.create_event(&timebox()).await.unwrap();
    assert_eq!(remote.etag.as_deref(), Some("W/\"abc\""));
    assert!(remote.uid.is_some());
    // Verify the PUT carried basic auth + If-None-Match.
    let req = mock.last_request().unwrap();
    assert_eq!(req.method, "PUT");
    assert!(req.headers.iter().any(|(k, v)| k == "Authorization" && v.starts_with("Basic ")));
    assert!(req.headers.iter().any(|(k, _)| k == "If-None-Match"));
}

#[tokio::test]
async fn caldav_pull_parses_multistatus() {
    let xml = r#"<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/work/evt-1.ics</d:href>
    <d:propstat><d:prop><d:getetag>"etag-1"</d:getetag></d:prop></d:propstat>
  </d:response>
  <d:response>
    <d:href>/work/evt-2.ics</d:href>
    <d:propstat><d:prop><d:getetag>"etag-2"</d:getetag></d:prop></d:propstat>
  </d:response>
</d:multistatus>"#;
    let mock = MockHttpTransport::new();
    mock.enqueue(HttpResponse { status: 207, headers: vec![], body: xml.as_bytes().to_vec() });
    let adapter = CalDavAdapter::new(
        CalDavConfig { server_url: "https://dav.example.com".into(), calendar_href: "/work".into(), username: "u".into(), password: "p".into() },
        &mock,
    );
    let result = adapter.pull_changes(None).await.unwrap();
    assert_eq!(result.changed.len(), 2);
    assert_eq!(result.changed[0].uid.as_deref(), Some("evt-1"));
    assert_eq!(result.changed[0].etag.as_deref(), Some("\"etag-1\""));
}

#[tokio::test]
async fn caldav_update_etag_mismatch_returns_conflict() {
    let mock = MockHttpTransport::new();
    mock.enqueue(HttpResponse { status: 412, headers: vec![], body: vec![] });
    let adapter = CalDavAdapter::new(
        CalDavConfig { server_url: "https://dav.example.com".into(), calendar_href: "/work".into(), username: "u".into(), password: "p".into() },
        &mock,
    );
    let remote = strategynotes_calendar::RemoteEventRef {
        provider_event_id: Some("evt-1".into()),
        provider_href: Some("https://dav.example.com/work/evt-1.ics".into()),
        etag: Some("old".into()),
        uid: Some("evt-1".into()),
    };
    let err = adapter.update_event(&timebox(), &remote).await.unwrap_err();
    assert!(matches!(err, strategynotes_calendar::ProviderError::Conflict));
}

// ---- Google ----

#[tokio::test]
async fn google_create_parses_id_and_etag() {
    let mock = MockHttpTransport::new();
    mock.enqueue(json_resp(200, r#"{"id":"evt-xyz","etag":"\"g1\"","iCalUID":"uid-xyz@sn"}"#, vec![]));
    let adapter = GoogleAdapter::new("token".into(), "primary".into(), &mock);
    let remote = adapter.create_event(&timebox()).await.unwrap();
    assert_eq!(remote.provider_event_id.as_deref(), Some("evt-xyz"));
    assert_eq!(remote.etag.as_deref(), Some("\"g1\""));
    assert!(mock.last_request().unwrap().headers.iter().any(|(k, v)| k == "Authorization" && v == "Bearer token"));
}

#[tokio::test]
async fn google_pull_parses_items_and_cancellations() {
    let body = r#"{"items":[
        {"id":"a","etag":"\"ea\"","summary":"A","start":{"dateTime":"2026-07-01T13:00:00Z"},"end":{"dateTime":"2026-07-01T14:00:00Z"}},
        {"id":"b","status":"cancelled"}
    ],"nextSyncToken":"sync-1"}"#;
    let mock = MockHttpTransport::new();
    mock.enqueue(json_resp(200, body, vec![]));
    let adapter = GoogleAdapter::new("token".into(), "primary".into(), &mock);
    let result = adapter.pull_changes(None).await.unwrap();
    assert_eq!(result.changed.len(), 1);
    assert_eq!(result.deleted, vec!["b".to_string()]);
    assert_eq!(result.cursor.value.as_deref(), Some("sync-1"));
}

// ---- Microsoft ----

#[tokio::test]
async fn microsoft_create_parses_id_and_etag() {
    let mock = MockHttpTransport::new();
    mock.enqueue(json_resp(201, r#"{"id":"m-1","@odata.etag":"W/\"m1\"","subject":"ship draft"}"#, vec![]));
    let adapter = MicrosoftAdapter::new("token".into(), "AQMkAGI=".into(), &mock);
    let remote = adapter.create_event(&timebox()).await.unwrap();
    assert_eq!(remote.provider_event_id.as_deref(), Some("m-1"));
    assert_eq!(remote.etag.as_deref(), Some("W/\"m1\""));
}

#[tokio::test]
async fn microsoft_pull_parses_value_and_deltalink() {
    let body = r#"{"value":[{"id":"m-1","@odata.etag":"W/\"1\"","subject":"A","start":{"dateTime":"2026-07-01T13:00:00"},"end":{"dateTime":"2026-07-01T14:00:00"}}],"@odata.deltaLink":"https://graph.microsoft.com/v1.0/me/delta?token=d1"}"#;
    let mock = MockHttpTransport::new();
    mock.enqueue(json_resp(200, body, vec![]));
    let adapter = MicrosoftAdapter::new("token".into(), "AQMkAGI=".into(), &mock);
    let result = adapter.pull_changes(None).await.unwrap();
    assert_eq!(result.changed.len(), 1);
    assert_eq!(result.cursor.value.as_deref(), Some("https://graph.microsoft.com/v1.0/me/delta?token=d1"));
}

// ---- INV-CAL: provider failure ----

#[tokio::test]
async fn provider_5xx_returns_error_not_corrupts_local() {
    // A 503 from any provider returns ProviderError; the sync engine (tested
    // separately) then marks the row Error. The local Timebox passed & is
    // immutable through the adapter.
    let mock = MockHttpTransport::new();
    mock.enqueue(HttpResponse { status: 503, headers: vec![], body: vec![] });
    let adapter = GoogleAdapter::new("token".into(), "primary".into(), &mock);
    let tb = timebox();
    let result = adapter.create_event(&tb).await;
    assert!(result.is_err(), "503 must propagate as ProviderError");
    // INV-CAL: the timebox is unchanged (held by reference throughout).
    assert_eq!(tb.status, TimeboxStatus::Committed);
    assert_eq!(tb.estimate.pomos, 2);
}
