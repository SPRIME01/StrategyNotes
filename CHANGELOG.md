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
- State files: AGENT_STATE.md, .agents/evidence.md, .agents/open_questions.md, CHANGELOG.md.
- Shared command list documented in AGENTS.md sec 9.

### Changed
- Moved `EVIDENCE.md` → `.agents/evidence.md` and `OPEN_QUESTIONS.md` →
  `.agents/open_questions.md` (lowercase to match `.agents/` convention).
  These are agent working/handoff state, not authoritative source-of-truth —
  the right home per the OMC `.agents/` convention. SPEC.md and PLAN.md stay
  at root. `.gitignore` updated: `.agents/` is now tracked except the two OMC
  per-session stubs (`current_status.md`, `next_steps.md`). Cross-references
  updated across SPEC/PLAN/AGENTS/AGENT_STATE/CHANGELOG; EV-000's point-in-time
  file list and `Strategy_Framework_tread.md` left as historical record.

### Deferred
- S-PHASE0-002: Tauri v2 shell wiring (core <-> ui IPC).
- Lint config (cargo clippy + eslint): Phase 1 or 15.
- Real date formatting in core (chrono/time crate): Phase 2.
