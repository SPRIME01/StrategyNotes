//! ICS calendar export (Phase 10 minimal). Pure: serializes a [`Timebox`] to an
//! RFC 5545 VEVENT inside a VCALENDAR. Guards INV-CAL by being local-first -
//! the ICS file is the portable commitment; no provider required for core truth.

use chrono::{DateTime, Utc};

use crate::execution::Timebox;
use crate::node::NodeType;
use crate::ports::NodeVault;
use crate::views::TypedView;

/// Serialize a single timebox as an `.ics` document (VCALENDAR + VEVENT).
///
/// Delegates to [`export_timeboxes_to_ics`] — one code path, so a single
/// timebox and the full commitment set can never drift in format.
pub fn export_timebox_to_ics(timebox: &Timebox) -> String {
    export_timeboxes_to_ics(std::slice::from_ref(timebox))
}

/// Serialize a set of timeboxes as ONE `.ics` document.
///
/// One VCALENDAR wrapper around N VEVENTs: an importer must see an update to a
/// calendar, not a separate calendar per timebox (SPEC sec 10.3, OQ-002 Option
/// B). An empty set yields a valid, event-free calendar shell.
///
/// Format: UTC datetimes as `YYYYMMDDTHHMMSSZ`, CRLF line endings per RFC 5545,
/// minimal text escaping for SUMMARY.
pub fn export_timeboxes_to_ics(timeboxes: &[Timebox]) -> String {
    let mut out = String::new();
    out.push_str("BEGIN:VCALENDAR\r\n");
    out.push_str("VERSION:2.0\r\n");
    out.push_str("PRODID:-//StrategyNotes//EN\r\n");
    for t in timeboxes {
        out.push_str("BEGIN:VEVENT\r\n");
        out.push_str(&format!("UID:{}@strategynotes\r\n", t.id));
        out.push_str(&format!("DTSTAMP:{}\r\n", fmt_utc(Utc::now())));
        out.push_str(&format!("DTSTART:{}\r\n", fmt_utc(t.scheduled_start)));
        out.push_str(&format!("DTEND:{}\r\n", fmt_utc(t.scheduled_end)));
        out.push_str(&format!(
            "SUMMARY:{}\r\n",
            escape(t.expected_output.as_deref().unwrap_or("StrategyNotes timebox"))
        ));
        out.push_str("END:VEVENT\r\n");
    }
    out.push_str("END:VCALENDAR\r\n");
    out
}

/// Every timebox in `vault` as one calendar (SPEC sec 10.3).
///
/// Reads markdown only — the export never consults the derived index, so the
/// file is correct even on a fresh clone before the index has been built
/// (INV-DUR). Events are emitted in schedule order so the same vault always
/// yields byte-identical output.
pub fn export_vault_to_ics(vault: &dyn NodeVault) -> Result<String, crate::Error> {
    let mut timeboxes = Vec::new();
    for node in vault.all()? {
        if node.ty != NodeType::Timebox {
            continue;
        }
        timeboxes.push(Timebox::from_node(&node)?);
    }
    timeboxes.sort_by_key(|t| (t.scheduled_start, t.id));
    Ok(export_timeboxes_to_ics(&timeboxes))
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
