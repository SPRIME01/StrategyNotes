# AGENT_STATE.md

Living state for agents working in this repo. NOT a source of truth (precedence
#7 per PLAN sec 1). Update every slice.

Last updated: 2026-06-22

## Current phase
Finish-line build (past MVP). Phase A (baseline) complete; Phase B (core
integrity gaps) in progress.

## Current slice
S-BODY-001 — INV-BODY inline parsing ([[wikilink]], #tag, #[[multi word tag]],
((block_ref))). Next: TDD the parser, wire body refs into the derived index +
backlinks, prove rebuild restores them.

## What works (baseline, EV-011)
- 77 cargo tests green; cargo build + pnpm build clean.
- CLI spine runs end-to-end (all 6 gates fire).
- HTTP API (16 endpoints) on axum; create-case + list-cases smoke-verified.
- React UI spine runner builds.
- All 18 INV-* have executable proofs (EV-010 table).

## Next action
Phase B1 INV-BODY → B2 Strategy Capacity gate → C agent endpoints → D FTS →
E UI organisms → F Tauri → G calendar contracts → H conformance.

## Blockers
None.

## Non-negotiables locked
No core rewrite without failing test; no invariant weakening; markdown = truth;
SQLite = derived; providers never source of truth; agent output quarantined;
work needs package+pomo+timebox; timebox needs review; value needs proof;
no done-without-evidence.

## Deferred (honest)
- Tauri desktop RUN (no display in env; build-only verification).
- Real calendar provider smoke (no credentials; mock contracts only).
- UI screenshot verification (component tests + manual notes).
