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
