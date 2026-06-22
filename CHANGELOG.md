# CHANGELOG.md

All notable changes to StrategyNotes. Format: Keep a Changelog. SemVer versioning
starts at first user-facing release; until then, changes accumulate under [Unreleased].

## [Unreleased]

### Added
- Source-of-truth docs: SPEC.md, PLAN.md, AGENTS.md (commit 6f440fa).
- Ports & Adapters mandated as architecture throughout (SPEC sec 3.4,
  AGENTS sec 10): pure core, driven/driving ports, review-blocker rule for
  I/O imports inside `core/`.
- Cargo workspace with `core/` crate: pure hexagonal domain, `Clock` driven
  port, `time::daynote_header` domain fn, fake-adapter smoke test green.
- pnpm workspace with `ui/` app: React 18 + TS + Vite + Vitest, smoke test green.
- State files: AGENT_STATE.md, `.agents/evidence.md`, `.agents/open_questions.md`, CHANGELOG.md.
- Shared command list documented in AGENTS.md sec 9.
- Phase 1: all domain types (34 NodeTypes, 17 EdgeTypes, all strategy/execution/
  governance structs, 9 GateIds, GateResult). Driven ports: Clock, IdMinter,
  NodeVault, DerivedIndex, EventSink.
- Phase 2: markdown format (frontmatter + body, unknown-key preservation,
  deterministic serialization) + MarkdownVault adapter (atomic writes).
- Phase 3: SQLiteIndex adapter + the INV-DUR rebuild proof (delete index,
  rebuild, queries match).
- Phase 4: DaynoteEventSink (INV-DAY capture with source metadata) +
  would_create_placement_cycle (INV-CLONE, Places edge type, OQ-006 Option A).
- Phase 5: case lifecycle state machine + TypedView bridge (StrategyCase
  round-trips through the full storage stack).
- Phase 6: evidence acceptance rule (INV-EVID) + spine trace (INV-CONTRA).
- Phase 7: gate engine - 6 gates returning Approved/Blocked{failed_gates}.
- Phase 8-11: App services wiring gates to state changes; PLAN sec 15 vertical
  slice proven end-to-end.
- S-PHASE0-002 (CLI): `strategynotes` binary runs the spine.
- HTTP driving adapter (axum, 16 REST endpoints) + React UI spine runner.
- Phase 13: agent draft quarantine (INV-HUMAN gate).
- Phase 14: VRD view (aggregates value claims, surfaces proof debt).

### Changed
- Moved `EVIDENCE.md` -> `.agents/evidence.md` and `OPEN_QUESTIONS.md` ->
  `.agents/open_questions.md` (agent handoff state belongs in `.agents/`).

### Deferred
- S-PHASE0-002 (Tauri shell): HTTP+UI works headless; Tauri wraps the same UI.
- Full atomic UI component library (Phase 12 organisms).
- Calendar providers (Google/Outlook/iCloud) - ICS export only.
- Lint config (cargo clippy / eslint).
- Real date formatting in core (chrono/time crate).

### Conformance
- `cargo test --workspace` ... 77 passed, 0 failed (the conformance gate).
- Every INV-* has a direct executable test (see .agents/evidence.md EV-010).
