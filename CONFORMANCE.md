# CONFORMANCE.md — StrategyNotes finish-line

Run date: 2026-06-22. Reference evidence: `.agents/evidence.md` EV-011 (baseline)
through EV-012 (finish).

## Conformance commands (Phase H)
```
cargo test --workspace                          → 107 passed, 0 failed
cargo build --workspace                         → Finished (clean)
cargo clippy --workspace --all-targets -- -D warnings  → Finished (clean)
pnpm -C ui test                                 → 2 test files, 2 passed
pnpm -C ui build                                → 153 kB bundle, clean
```
Tauri build/run: **EV-SKIP** — build env lacks webkit2gtk-4.1-dev (cannot
apt-install; safety rule). Scaffold is correct; see KNOWN_LIMITATIONS.

## Final acceptance checklist (directive)
- [x] Baseline still passes (EV-011 reference, 77 → 107 tests).
- [x] Test count increased appropriately (+30 tests across Phases B-D, G).
- [x] No existing invariant weakened (every INV-* still has its executable proof).
- [x] INV-BODY closed (B1: parse_body + body_refs in index + backlinks union).
- [x] Strategy Capacity gate closed (B2: can_meet_strategy_capacity + SDR override).
- [x] Agent quarantine endpoints exposed (C: accept/reject/request-changes/GET).
- [x] FTS search works (D: derived search_text + LIKE + rebuild-restore test).
- [x] UI organisms exist and are usable (E: 8 required + Agent Draft Inbox).
- [~] Tauri shell launches — scaffold wired (Option A subprocess); build/run
      EV-SKIP (webkit2gtk missing). Not verifiable in this env.
- [x] Calendar adapter contracts exist (G: CalendarProvider + 5 adapters).
- [x] ICS export preserved (IcsCalendarProvider + existing export_timebox_to_ics).
- [x] Provider gaps honest (Google/Outlook/iCloud stubs; real EV-SKIP, no creds).
- [x] Full vertical slice works from API (vertical_slice test + HTTP curl).
- [x] Full vertical slice works from CLI (strategynotes binary, exit 0).
- [x] Markdown rebuild still works (sqlite_index rebuild tests, body_index).
- [x] SQLite deletion still does not lose strategy-critical state
      (index_loss_then_rebuild_yields_equivalent_state; INV-DUR+BODY combined).

## "Do not claim complete if" guard (directive)
- cargo test fails → **passes** (107/0).
- rebuild from markdown fails → **passes** (TST-BODY-005, sqlite_index).
- work can be committed without timebox → **blocked** by INV-WORK+INV-TIME gates.
- timebox can be verified without review → **blocked** by INV-REVIEW gate.
- value claim can validate without proof → **blocked** by INV-VALUE gate.
- agent output can bypass human approval → **blocked** by INV-HUMAN (TST-AGENT-HTTP-004).
- UI shows green while backend gates are blocked → **does not** (organisms render
  GatePill red with failed_gates; backend owns every approval).

## Invariant conformance (all 18, executable)
INV-DUR, INV-PORT, INV-EDGE, INV-ID, INV-CLONE, INV-DAY, INV-BODY (NEW),
INV-EVID, INV-CLAIM, INV-CONTRA, INV-HUMAN, INV-BET, INV-WORK, INV-TIME,
INV-EXEC, INV-REVIEW, INV-VALUE, INV-CAL — each has a direct test (see
`.agents/evidence.md` EV-010 table + B1/G additions).
