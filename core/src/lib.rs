//! StrategyNotes pure domain core (the hexagon).
//!
//! See SPEC.md sec 3.4 (Ports & Adapters). This crate contains NO I/O, no
//! framework, no storage, no network. All interaction crosses a port
//! (`ports`). Adapters live outside this crate.
//!
//! Invariants enforced by construction:
//!   INV-DUR   - only an outer NodeVault adapter is durable; this core has no DB
//!   INV-CAL   - CalendarProvider is a port; no provider code reachable here
//!   INV-HUMAN - gates run here; driving adapters cannot bypass them
//!
//! Any import of std::fs, rusqlite, reqwest, tokio, or Tauri types inside this
//! crate is a review-blocker (AGENTS.md sec 10).

pub mod ports;
pub mod time;
