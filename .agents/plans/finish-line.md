# Finish-Line Plan — StrategyNotes past MVP

Source directive: the takeover brief. Execution order is fixed (A → H); each
phase has its own evidence requirements. Non-negotiables:
- No core rewrite unless a failing test proves the need.
- No invariant weakened for UI/integration convenience.
- Markdown = source of truth; SQLite = rebuildable derived index.
- External calendar providers never become source of truth.
- Agent output stays quarantined until human approval.
- No work committed without work package + pomo estimate + timebox.
- No timebox verified without post-block review.
- No value claim validated without proof.
- No "done" claim without evidence.

## Phase A — Protect the baseline
Run cargo test / CLI spine / HTTP server / React UI. Record EV-TST + EV-SMOKE
+ EV-UI. Add no features until baseline is known. Output: FINISH_LINE_PLAN.md
audit + updated AGENT_STATE / open_questions.

## Phase B — Close core integrity gaps (highest priority)
- B1 INV-BODY: [[wikilink]] #tag #[[multi word tag]] ((block_ref)). Body parsing
  extracts refs/tags → derived index → backlinks include body refs → rebuild
  restores them → frontmatter/body don't contradict silently. 6 TST-BODY tests.
- B2 Strategy Capacity gate: required pomos vs available capacity; blocks when
  exceeded; override only with an SDR; structured failed_gates. 4 TST-CAP tests.

## Phase C — Agent quarantine HTTP endpoints
GET /api/agent-runs, GET /api/agent-runs/:id, POST .../accept, .../reject,
.../request-changes. No endpoint auto-accepts. 4 TST-AGENT-HTTP tests.

## Phase D — FTS search
Over title/body/tags/type/case title/evidence/claim/bet/work objective. Derived
from index; rebuildable; never source of truth. 5 TST-SEARCH tests.

## Phase E — UI organisms (8)
Case Cockpit, Evidence Inbox, Trace Explorer, Bet Board, Work/Timebox Planner,
Execution Runbook, Daynote Ledger, VRD. Compositions of existing API; no new
backend rules invented in UI. EV-UI per organism.

## Phase F — Tauri desktop shell
Wrap the React UI against the local axum server (Option A — smaller safe path)
or Tauri IPC (Option B). Vault-picker, spine flow runnable from desktop.
EV-BLD + EV-SMOKE + EV-MAN.

## Phase G — Calendar adapter contracts
CalendarProvider trait + Internal + ICS (preserve) + Google/Outlook/iCloud
stubs behind feature flags. create/update/delete/get/status. Provider failure
never corrupts local timebox. 5 TST-CAL tests (mocked; real only if creds).

## Phase H — Final conformance + polish
cargo test/clippy/build + pnpm test/build. Update EVIDENCE/AGENT_STATE/
OPEN_QUESTIONS/CHANGELOG/CONFORMANCE/KNOWN_LIMITATIONS/README. Final
acceptance checklist run.

## Stop conditions (do NOT claim complete if any hold)
- cargo test fails
- rebuild from markdown fails
- work committed without timebox
- timebox verified without review
- value claim validated without proof
- agent output bypasses human approval
- UI shows green while backend gates are blocked
