//! ICS import (hand-rolled; calcard was a phantom crate). Parses VEVENT blocks
//! into ImportedEvent structs. Pairs with the existing core::ics export. Pure.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportedEvent {
    pub uid: Option<String>,
    pub summary: Option<String>,
    pub dtstart: Option<String>,
    pub dtend: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
}

/// Parse VEVENT blocks from an iCalendar document. Handles simple property
/// lines (SUMMARY, DTSTART, DTEND, UID, DESCRIPTION, LOCATION). Ponytail: no
/// line-unfolding or recurrence expansion for MVP; the structure round-trips
/// through the existing exporter for non-recurring events.
pub fn parse_ics(text: &str) -> Vec<ImportedEvent> {
    let mut events = Vec::new();
    let mut current: Option<ImportedEvent> = None;
    for raw in text.lines() {
        let line = raw.trim_end_matches('\r');
        if line == "BEGIN:VEVENT" {
            current = Some(ImportedEvent::default());
        } else if line == "END:VEVENT" {
            if let Some(ev) = current.take() {
                events.push(ev);
            }
        } else if let Some(ev) = current.as_mut() {
            if let Some(v) = prop(line, "SUMMARY") {
                ev.summary = Some(v);
            } else if let Some(v) = prop(line, "DTSTART") {
                ev.dtstart = Some(v);
            } else if let Some(v) = prop(line, "DTEND") {
                ev.dtend = Some(v);
            } else if let Some(v) = prop(line, "UID") {
                ev.uid = Some(v);
            } else if let Some(v) = prop(line, "DESCRIPTION") {
                ev.description = Some(v);
            } else if let Some(v) = prop(line, "LOCATION") {
                ev.location = Some(v);
            }
        }
    }
    events
}

/// Extract the value of `NAME:VALUE` or `NAME;PARAMS:VALUE`.
fn prop(line: &str, name: &str) -> Option<String> {
    let colon = line.find(':')?;
    let prop_name = line[..colon].split(';').next()?;
    if prop_name.eq_ignore_ascii_case(name) {
        Some(line[colon + 1..].to_string())
    } else {
        None
    }
}
