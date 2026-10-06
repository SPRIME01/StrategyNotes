# open_questions.md

Open questions for the StrategyNotes project. Format per PLAN sec 11.
Status legend: Open / Pending decision / Resolved (with date + decision).

Resolve a question by editing its Status line and adding a Resolved subsection.

## Active open questions (from PLAN sec 11)

### OQ-001 — Markdown schema for typed strategy edges
Status: Resolved 2026-06-21 (Option A: frontmatter)
Affected: PRD-005, SDS-GRAPH, INV-EDGE, INV-PORT
Decision: Edges encoded in frontmatter under `edges: [{to, type, status?}]`
  (implemented in `core/src/format.rs` edges_of/set_edges, Phase 2 slice
  S-STORAGE-002). Verified by TST-STORAGE + TST-GRAPH round-trip tests.

### OQ-002 — Calendar integration level for MVP
Status: Pending (recommend Option B: internal timeboxes + ICS export)
Affected: PRD-020, PRD-025, SDS-CAL, INV-CAL
Owner: Sam / Calendar

### OQ-003 — Pomo customization in MVP
Status: Pending (recommend Option C: fixed 25/5 + deep-work preset)
Affected: PRD-019, SDS-TIME, INV-TIME
Owner: Sam / Product

### OQ-004 — Materialized artifacts vs generated views
Status: Pending (recommend Option C: materialized markdown views w/ protected sections)
Affected: PRD-009..014, SDS-STRAT, INV-PORT
Owner: Sam / Architecture

### OQ-005 — External file edit activity
Status: Pending (recommend Option A: count as modifications, event-source metadata)
Affected: PRD-007, SDS-DAY, INV-DAY
Owner: Sam / Storage

### OQ-006..010 (pre-seeded, decide as phase approaches)
- OQ-006: node grouping
- OQ-007: plan/exec UX boundary
- OQ-008: external file edit -> strategy review events
- OQ-009: conflict resolution for simultaneous in-app and external edits
- OQ-010: agent autonomy ceiling for MVP
Owner: Sam (all)

## Resolved

### OQ-006 — Node grouping / clone model
Resolved: 2026-06-21 by Sam. Option A chosen.
Decision: A clone is a typed edge `parent --places--> child` (new `Places` edge
  type added to EdgeType). Multi-parent clones = multiple incoming Places edges.
  Cycle detection traverses the Places subgraph. Implemented in Phase 4 slice
  S-CLONE-001 (`core/src/graph.rs`). SPEC sec 4.3 updated to record the decision.
  Unblocked INV-CLONE.

### OQ-011 — Stale derived index.db crashes server on startup (schema migration)

Status: Open
Affected: SDS-INDEX, INV-DUR, INV-PORT
Surface: graph-unification slice (EV-015)

Description:
`adapters/src/sqlite_index.rs` creates `nodes(... title ...)` and
`CREATE INDEX idx_nodes_title ON nodes(title)` in one batch. If an existing
`index.db` was created by an older schema (no `title` column on `nodes`),
`CREATE TABLE IF NOT EXISTS` is a no-op (table already exists) and the index
creation fails with `no such column: title`, crashing the HTTP server on
startup. Observed 2026-06-23 when running `serve` against a pre-existing
strategynotes-data/index.db.

Why it matters:
The markdown vault is the source of truth and is intact; SQLite is a derived
cache. A stale cache must NEVER block startup — the correct behavior is to
rebuild (INV-DUR: "deleting SQLite must never lose user data"; the rebuild is
the INV-DUR smoke test). Today it blocks instead of rebuilding.

Recommended fix:
Schema-version the derived index (a `schema_version` pragma/key); on open, if
the on-disk version mismatches the expected one, DROP and rebuild from the
vault (which `rebuild(&vault)` already does). This makes "wipe SQLite, rebuild
from markdown" automatic instead of a manual `rm index.db`.

Workaround (current): delete `strategynotes-data/index.db`; it is regenerated
on next server start. Verified safe — vault markdown is untouched.

Owner: Sam / Storage

---

## OQ-WORK-GATE — `can_commit_work_package` does not check the pomo estimate

Raised: 2026-10-06 · Slice: S-WORK-001 · Owner: Sam · Status: Open
Affected IDs: PRD-019, PRD-020, SDS-WORK, SDS-TIME, INV-TIME, INV-WORK, TST-WORK

SPEC (`.agents/specs/SPEC.md` §515) states the work commitment gate requires a
**"estimated pomos"** — i.e. PRD-019's "every work package carries a pomo estimate" is
supposed to be gate-enforced. `core/src/gates.rs` (`can_commit_work_package`) does not read
`WorkPackage.pomos` at all. INV-TIME ("no committed work without estimated pomo cost AND a
calendar timebox") is therefore **not enforced on the estimate half**.

Decided for now (operator, 2026-10-06): **leave the gate as-is.** `WorkPackage.pomos` was
added (`#[serde(default)]`, PRD-019) so the field exists and round-trips
(`core/tests/execution.rs`, 5 tests), and the UI can set it — but flipping the gate would
block every legacy work package that has no estimate yet (all three seeded ones), turning a
working view into a wall of refusals with no migration path.

Open question: when the gate starts checking `pomos > 0`, what happens to
pre-existing estimate-less work packages?
  (a) block them until an estimate is supplied (spec-literal, breaks the seed),
  (b) grandfather nodes written before the rule existed (needs a recorded-at marker), or
  (c) treat a linked timebox's `estimate.pomos` as satisfying the gate (the estimate is
      already stored, just on the timebox rather than the WP).

Recommendation: **(c)** — it reads the estimate from markdown rather than inventing state,
and it makes the four existing timeboxes meaningful. Decide before any slice claims
INV-TIME is enforced.


---

## OQ-BET-KILL — no spec'd way to kill a bet; the UI button lies

Raised: 2026-10-06 · Slice: S-BET-KILL · Owner: Sam · **Status: RESOLVED (operator, 2026-10-06 — option (a))**
Affected IDs: SDS-STRAT, SDS-GATE, INV-BET, INV-HUMAN, TST-STRAT

`BetBoard`'s **Kill** button (`views/BetBoard.tsx:95`) does
`api.patchNode(b.id, { frontmatter: { ...b.frontmatter, status: "killed" } })`.
`services::update_node` strips `status` before merging (gate-owned), so the call
succeeds, the toast says *"Killed "<title>". The record stays; its status does
not."*, and **the bet is unchanged**. Same defect class as evidence rejection,
fixed in EV-027 for evidence — but the bet case has no spec to implement against:

- SPEC §10.2 lists `POST /bets/{id}/approve` and **no** `/bets/{id}/kill`.
- The gate catalog (§9.1) has no kill gate.
- `BetStatus::Killed` **does** exist (`core/src/strategy.rs:148`), and INV-BET's
  failure mode reads *"strategy theater; bets that cannot fail or be killed."*
- `can_approve_bet` requires `kill_criteria` to exist — the spec tells you *when*
  to kill, not *how*.

So: the model says a bet can be killed, the UI offers to kill it, the invariant
says it must be killable, and the API surface has no endpoint for it.

Options:
  (a) add `POST /bets/{id}/kill` as a **non-gated** transition, symmetric to
      `reject_evidence` — declining needs no proof (INV-HUMAN), the ledger entry
      is the record. Smallest change that makes the button true.
  (b) add it **behind a gate** (`can_kill_bet`) — but no such gate is specified,
      so this invents one and forces decisions the spec does not ask for
      (does killing an approved bet need a reason? does it need `kill_criteria`?).
  (c) remove/disable the Kill button until the spec defines the transition —
      honest, but leaves `BetStatus::Killed` unreachable and INV-BET's stated
      purpose unimplementable.

Recommendation: **(a)**, with the caveat that it extends the API surface beyond
§10.2 and therefore needs operator ratification. Do not ship it as if the spec
already said so.

Pending until then: `BetBoard.kill` still silently no-ops. `EvidenceInbox` no
longer does (EV-027).

**Resolution (operator, 2026-10-06):** option **(a)** — `POST /api/bets/{id}/kill`
added as a non-gated transition, symmetric to `reject_evidence`. Shipped and verified
in `.agents/evidence.md` → **EV-028**. It remains an extension of the API surface
beyond SPEC §10.2, recorded here rather than folded into the spec: if the spec is
later updated, §10.2 should list this route.
