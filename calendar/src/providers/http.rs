//! HttpTransport abstraction. Adapters build requests against this trait;
//! tests inject MockHttpTransport (canned responses, no network). The real
//! reqwest-backed transport is feature-gated (live-provider smoke = EV-SKIP
//! without credentials).

use std::sync::Mutex;

use async_trait::async_trait;

use crate::providers::ProviderError;

#[derive(Debug, Clone)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub body: Option<Vec<u8>>,
}

#[derive(Debug, Clone)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
}

impl HttpResponse {
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(name))
            .map(|(_, v)| v.as_str())
    }
    pub fn text(&self) -> String {
        String::from_utf8_lossy(&self.body).into_owned()
    }
}

#[async_trait]
pub trait HttpTransport: Send + Sync {
    async fn execute(&self, req: HttpRequest) -> Result<HttpResponse, ProviderError>;
}

/// Mock transport for contract tests. Returns the next canned response for each
/// call, in insertion order. Records every request for assertions.
#[derive(Default)]
pub struct MockHttpTransport {
    pub responses: Mutex<Vec<HttpResponse>>,
    pub requests: Mutex<Vec<HttpRequest>>,
}

impl MockHttpTransport {
    pub fn new() -> Self {
        Self::default()
    }
    /// Queue a canned response (returned in FIFO order).
    pub fn enqueue(&self, resp: HttpResponse) {
        self.responses.lock().unwrap().push(resp);
    }
    pub fn last_request(&self) -> Option<HttpRequest> {
        self.requests.lock().unwrap().last().cloned()
    }
}

#[async_trait]
impl HttpTransport for MockHttpTransport {
    async fn execute(&self, req: HttpRequest) -> Result<HttpResponse, ProviderError> {
        self.requests.lock().unwrap().push(req);
        match self.responses.lock().unwrap().first().cloned() {
            Some(r) => {
                self.responses.lock().unwrap().remove(0);
                Ok(r)
            }
            None => Err(ProviderError::Other("mock: no canned response queued".into())),
        }
    }
}

pub fn resp(status: u16, body: &str) -> HttpResponse {
    HttpResponse {
        status,
        headers: vec![("content-type".into(), "application/json".into())],
        body: body.as_bytes().to_vec(),
    }
}
