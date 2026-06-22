//! Reqwest-backed HttpTransport - the real network impl, feature-gated. Enable
//! `google` / `microsoft` / `caldav` to compile this. Without features, the
//! adapters still compile + contract-test against MockHttpTransport; live
//! provider calls require this + credentials (EV-SKIP without creds).

#![cfg(any(feature = "google", feature = "microsoft", feature = "caldav"))]

use async_trait::async_trait;

use crate::providers::http::{HttpRequest, HttpResponse, HttpTransport};
use crate::providers::ProviderError;

pub struct ReqwestTransport {
    client: reqwest::Client,
}

impl Default for ReqwestTransport {
    fn default() -> Self {
        Self::new()
    }
}

impl ReqwestTransport {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::builder()
                .build()
                .expect("reqwest client"),
        }
    }
}

#[async_trait]
impl HttpTransport for ReqwestTransport {
    async fn execute(&self, req: HttpRequest) -> Result<HttpResponse, ProviderError> {
        let method = reqwest::Method::from_bytes(req.method.as_bytes())
            .map_err(|e| ProviderError::Other(format!("bad method: {e}")))?;
        let mut builder = self.client.request(method, &req.url);
        for (k, v) in &req.headers {
            builder = builder.header(k, v);
        }
        if let Some(body) = req.body {
            builder = builder.body(body);
        }
        let resp = builder
            .send()
            .await
            .map_err(|e| ProviderError::Http(format!("reqwest: {e}")))?;
        let status = resp.status().as_u16();
        let headers: Vec<(String, String)> = resp
            .headers()
            .iter()
            .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();
        let body = resp
            .bytes()
            .await
            .map_err(|e| ProviderError::Http(format!("reqwest body: {e}")))?
            .to_vec();
        Ok(HttpResponse { status, headers, body })
    }
}
