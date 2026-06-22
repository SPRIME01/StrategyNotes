//! Driven adapters - trivial ports (Phase 8 prep).
//! SystemClock reads the OS clock; UlidMinter generates real ULIDs. Both are
//! safe to use in production; tests use fakes.

use chrono::Utc;
use strategynotes_core::identity::NodeId;
use strategynotes_core::ports::{Clock, IdMinter};
use ulid::Ulid;

/// Real wall clock. `now_unix_seconds` reads `Utc::now()`.
#[derive(Debug, Clone, Copy, Default)]
pub struct SystemClock;

impl Clock for SystemClock {
    fn now_unix_seconds(&self) -> i64 {
        Utc::now().timestamp()
    }
}

/// Real ULID minter. Generates monotonic-sortable ULIDs using the OS RNG.
/// Guards INV-ID. The core never calls this directly - it goes through the
/// IdMinter port.
#[derive(Debug, Clone, Copy, Default)]
pub struct UlidMinter;

impl IdMinter for UlidMinter {
    fn mint(&self) -> NodeId {
        NodeId(Ulid::new())
    }
}
