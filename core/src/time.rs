//! Pure time-derived domain logic. Depends only on the [`Clock`](crate::ports::Clock) port.

use crate::ports::Clock;

/// Render a daynote header string from the current instant, obtained via the
/// Clock port. The core never reads the system clock directly; the adapter
/// decides what "now" means (real clock in production, fixed value in tests).
// ponytail: real date formatting (RFC 3339 / daynote date) deferred to Phase 2
// when serde + a date crate land. Phase 0 only proves the port wiring.
pub fn daynote_header(clock: &dyn Clock) -> String {
    format!("# Daynote (epoch={})", clock.now_unix_seconds())
}
