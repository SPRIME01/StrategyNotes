//! Phase 0 harness smoke test. Proves the hexagonal core compiles, has no
//! I/O deps, and is exercised through a port via a fake adapter.
//! See SPEC.md sec 3.4, AGENTS.md sec 10.

use strategynotes_core::{ports::Clock, time::daynote_header};

/// Fake Clock adapter - fixed time, no system call. Proves the core is
/// testable without any real adapter (the hexagonal boundary is real).
struct FakeClock(i64);

impl Clock for FakeClock {
    fn now_unix_seconds(&self) -> i64 {
        self.0
    }
}

#[test]
fn daynote_header_renders_timestamp_from_clock_port() {
    let clock = FakeClock(1_700_000_000);
    assert_eq!(daynote_header(&clock), "# Daynote (epoch=1700000000)");
}
