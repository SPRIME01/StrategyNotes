//! Daynote event sink (Phase 4). Implements [`EventSink`] by appending each
//! activity event as a line in a per-day markdown file under `<root>/<YYYY-MM-DD>.md`.
//!
//! Guards INV-DAY: activity is captured from core-emitted events, not manually
//! fabricated by the UI. The daynote is a derived activity record, NOT a node
//! (it is not source-of-truth for any strategy state).
//!
//! Ponytail: global append lock. Per-date locks if throughput matters later.

use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use chrono::{Datelike, NaiveDate};

use strategynotes_core::governance::{ActivityEvent, ActivityKind, EventSource};
use strategynotes_core::ports::EventSink;

#[derive(Debug)]
pub struct DaynoteEventSink {
    root: PathBuf,
    _lock: Mutex<()>,
}

impl DaynoteEventSink {
    pub fn open(root: impl AsRef<Path>) -> std::io::Result<Self> {
        let root = root.as_ref().to_path_buf();
        std::fs::create_dir_all(&root)?;
        Ok(Self { root, _lock: Mutex::new(()) })
    }

    fn path_for(&self, date: NaiveDate) -> PathBuf {
        self.root
            .join(format!("{:04}-{:02}-{:02}.md", date.year(), date.month(), date.day()))
    }

    /// Read a day's captured activity (empty string if no daynote exists).
    pub fn read(&self, date: NaiveDate) -> std::io::Result<String> {
        match std::fs::read_to_string(self.path_for(date)) {
            Ok(s) => Ok(s),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
            Err(e) => Err(e),
        }
    }
}

impl EventSink for DaynoteEventSink {
    fn record(&self, event: ActivityEvent) {
        let _g = self._lock.lock().unwrap();
        let date = event.at.date_naive();
        let path = self.path_for(date);
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let line = format_event_line(&event);
        if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&path) {
            // Best-effort: INV-DAY capture must not fail the calling operation.
            let _ = f.write_all(line.as_bytes());
        }
    }
}

fn format_event_line(e: &ActivityEvent) -> String {
    let kind = match e.kind {
        ActivityKind::Created => "created",
        ActivityKind::Modified => "modified",
        ActivityKind::Scheduled => "scheduled",
        ActivityKind::Accepted => "accepted",
        ActivityKind::Verified => "verified",
    };
    let source = match e.source {
        Some(EventSource::User) => "user",
        Some(EventSource::Agent) => "agent",
        Some(EventSource::ExternalFile) => "external-file",
        Some(EventSource::System) => "system",
        None => "unknown",
    };
    format!("- {} {} {} ({})\n", e.at.format("%H:%M:%S"), kind, e.node, source)
}
