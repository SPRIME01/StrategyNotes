//! ICS calendar export (Phase 10 minimal). Pure: serializes a [`Timebox`] to an
//! RFC 5545 VEVENT inside a VCALENDAR. Guards INV-CAL by being local-first -
//! the ICS file is the portable commitment; no provider required for core truth.

use chrono::{DateTime, Utc};

use crate::execution::Timebox;

/// Serialize a single timebox as an `.ics` document (VCALENDAR + VEVENT).
///
/// Format: UTC datetimes as `YYYYMMDDTHHMMSSZ`, CRLF line endings per RFC 5545,
/// minimal text escaping for SUMMARY.
pub fn export_timebox_to_ics(timebox: &Timebox) -> String {
    let uid = format!("{}@strategynotes", timebox.id);
    let summary = timebox
        .expected_output
        .as_deref()
        .unwrap_or("StrategyNotes timebox");
    let mut out = String::new();
    out.push_str("BEGIN:VCALENDAR\r\n");
    out.push_str("VERSION:2.0\r\n");
    out.push_str("PRODID:-//StrategyNotes//EN\r\n");
    out.push_str("BEGIN:VEVENT\r\n");
    out.push_str(&format!("UID:{uid}\r\n"));
    out.push_str(&format!("DTSTAMP:{}\r\n", fmt_utc(Utc::now())));
    out.push_str(&format!("DTSTART:{}\r\n", fmt_utc(timebox.scheduled_start)));
    out.push_str(&format!("DTEND:{}\r\n", fmt_utc(timebox.scheduled_end)));
    out.push_str(&format!("SUMMARY:{}\r\n", escape(summary)));
    out.push_str("END:VEVENT\r\n");
    out.push_str("END:VCALENDAR\r\n");
    out
}

fn fmt_utc(dt: DateTime<Utc>) -> String {
    dt.format("%Y%m%dT%H%M%SZ").to_string()
}

fn escape(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace(';', "\\;")
        .replace(',', "\\,")
        .replace('\n', "\\n")
}
