# FINISH_LINE_PLAN.md — StrategyNotes takeover audit

Written after running the Phase A baseline. No new features were added before
this audit was recorded. Baseline evidence: `.agents/evidence.md` EV-011.

## Current repo structure
```
strategist/
├── Cargo.toml              workspace: core, adapters, server
├── package.json + pnpm-workspace.yaml + rust-toolchain.toml
├── SPEC.md, PLAN.md, AGENTS.md   authoritative source-of-truth docs
├── AGENT_STATE.md, CHANGELOG.md, FINISH_LINE_PLAN.md (this file)
├── .agents/                tracked agent handoff state
│   ├── evidence.md, open_questions.md, plans/finish-line.md
│   └── (current_status.md, next_steps.md gitignored - OMC stubs)
├── core/                   pure hexagonal domain (NO I/O)
│   └── src/  case_lifecycle, error, evidence(+rules), execution, format, gate(s),
│             governance, graph, ics, identity, naming, node, ports, services,
│             strategy, time, trace, views, vrd, agent_rules
├── adapters/               driven adapters (allowed std::fs / rusqlite / etc.)
│   └── src/  markdown_vault, sqlite_index, daynote_sink, trivial (SystemClock, UlidMinter)
├── server/                 driving layer: CLI + axum HTTP
│   └── src/  main.rs, http.rs
└── ui/                     React 18 + TS + Vite + Vitest (driving adapter)
    └── src/  App.tsx (spine runner), api.ts, vite-env.d.ts
```

## Current command list (AGENTS.md sec 9)
```
build:      cargo build --workspace && pnpm -C ui build
test:       cargo test --workspace && pnpm -C ui test
typecheck:  cargo check --workspace && pnpm -C ui typecheck
lint:       (not configured - cargo clippy / eslint deferred)
rebuild:    (manual: delete SQLite, run spine; covered by sqlite_index test)
```

## Current passing test count
**77 passed, 0 failed** (cargo test --workspace). Breakdown in EV-010/EV-011:
core unit 14 (case_lifecycle 6, evidence_rules 4, agent_rules 4); core
integration 45 (contracts 6, smoke 1, storage 9, gates 16, graph 6, trace 4,
case_domain 3); adapters integration 18 (markdown_vault 7, sqlite_index 4,
daynote_sink 4, vertical_slice 2, vrd 1). UI: 1 vitest.

## Existing API endpoints (16)
```
GET    /api/health
POST   /api/cases                                 GET /api/cases
POST   /api/sources                               POST /api/source-chunks
POST   /api/evidence                              POST /api/evidence/:id/accept
POST   /api/claims
POST   /api/bets                                  POST /api/bets/:id/approve
POST   /api/work-packages                         POST /api/work-packages/:id/commit
POST   /api/timeboxes                             POST /api/timeboxes/:id/review
POST   /api/value-claims                          POST /api/value-claims/:id/validate
GET    /api/trace/:id                             GET /api/daynote/:date
```

## Existing UI routes/components
- Single page: `ui/src/App.tsx` — a 13-step spine runner that calls the API in
  sequence and renders each gate result (green APPROVED / red BLOCKED).
- `ui/src/api.ts` — typed fetch client for all 16 endpoints.
- No router, no case-cockpit/evidence-inbox/bet-board/trace-explorer/runbook/
  daynote-ledger/vrd organisms yet.

## Confirmed gaps (from the directive)
1. INV-BODY inline parsing (`[[wikilink]]`, `#tag`, `#[[multi word tag]]`,
   `((block_ref))`) — NOT implemented. Body refs/tags don't enter the index.
2. Strategy Capacity gate — NOT wired (SPEC sec 9 lists it; not in gates.rs).
3. Agent quarantine HTTP endpoints — NOT exposed (gate + service exist in
   agent_rules.rs, but no `/api/agent-runs*` routes).
4. FTS search — NOT implemented.
5. Tauri desktop shell — NOT wired.
6. Calendar providers (Google/Outlook/iCloud) — NOT implemented (ICS only).
7. UI organisms (8 required) — NOT built (only the spine runner exists).
8. Multi-user/sync — out of scope (PRD-030), correctly deferred.

## Stale or already-closed gaps (verified against the code)
- "Agent quarantine gate missing" — STALE. `agent_rules::can_accept_agent_run`
  exists and is tested (4 tests). Only the HTTP endpoint is missing.
- "VRD debt visibility missing" — STALE. `vrd::VrdView::for_case` exists,
  surfaces weak_claims + unproven_claims, tested.
- "Markdown isn't durable" — STALE. INV-DUR is executable
  (`index_loss_then_rebuild_yields_equivalent_state`).
- "Gates are UI-only" — STALE. All 6 strategy gates are pure functions in
  `core/src/gates.rs`, returning GateResult; backend-owns-gates confirmed over
  HTTP (curl test in EV-009).

## Proposed execution order (matches directive Phases B → H)
B1 → B2 → C → D → E → F → G → H. Within each phase, TDD (test first, RED,
GREEN) and evidence-per-slice. Phase A (this audit) is done. Implementation
begins with B1 (INV-BODY) immediately after this file lands.

## Honest constraints for this build
- No graphical display in the build env: Tauri shell (Phase F) can be wired
  and built but cannot be run/verified here. Will be EV-BLD only; EV-SMOKE
  desktop run recorded as EV-SKIP-with-reason.
- No real calendar credentials: Phase G providers are mock-contract tests
  only; real-provider smoke is EV-SKIP.
- UI organisms (Phase E) cannot be screenshot-verified here; component tests
  + manual EV-UI notes instead.
