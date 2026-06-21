//! Driven ports - traits the pure core depends on. Adapters implement these.
//! See SPEC.md sec 3.4.
//!
//! Phase 0 defines only the port exercised by the smoke test. The full catalog
//! (NodeVault, DerivedIndex, CalendarProvider, EventSink, IdMinter, FileWatcher)
//! lands in Phase 1 (shared contracts) and later phases.

/// Wall-clock time, for daynotes / scheduling / timebox state.
/// Guards: INV-DAY, INV-TIME.
pub trait Clock {
    /// Current time as Unix-epoch seconds (UTC).
    fn now_unix_seconds(&self) -> i64;
}
