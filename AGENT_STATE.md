# AGENT_STATE.md

Living state for agents working in this repo. NOT a source of truth (precedence
#7 per PLAN sec 1). Update every slice; the authoritative docs are SPEC.md,
PLAN.md, AGENTS.md.

Last updated: 2026-06-21

## Current phase
Phase 0 — Project skeleton and verification harness. **In progress.**

## Current slice
S-PHASE0-001 — Workspace scaffold + harness (core + ui + state files)

## What works
- Cargo workspace (root) with `core/` member compiling clean.
- `strategynotes-core`: pure hexagonal crate, zero I/O deps, one driven port
  (`Clock`), one pure domain fn (`time::daynote_header`), exercised via a fake
  adapter in `core/tests/smoke.rs`. `cargo test` green.
- pnpm workspace with `ui/` (React 18 + TS + Vite + Vitest). `pnpm test` green.
- State files present: this file + `CHANGELOG.md` at root; `evidence.md` + `open_questions.md` in `.agents/`.
- AGENTS.md sec 9 commands filled in with real values.

## Next action
S-PHASE0-002 (Tauri v2 shell) vs Phase 1 (shared contracts). Recommendation:
Phase 1 next — all parallel agents depend on shared contract types, while the
Tauri shell can land in parallel once those types exist (the shell just exposes
them via IPC). Confirm direction with Sam.

## Blockers
None.

## Deferred
- S-PHASE0-002: Tauri v2 shell (app crate + tauri.conf.json + IPC bridge).
- Lint config (cargo clippy + eslint): Phase 1 or 15.
- Real date formatting in core (chrono/time crate): Phase 2 (serialization).
