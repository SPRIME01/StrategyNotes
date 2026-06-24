# Gap trace map — constraints, dimensions, integrations

For each gap surfaced in EV-014/EV-015: the **constraints** (what locks the fix),
**dimensions** (axes it varies on), **integrations/traces** (files · spec IDs ·
graph edges), and the gate-safe fix approach.

## Gate-safety model (the master constraint)

The gate engine gates **lifecycle transitions**, not field writes
(`core/src/gates.rs`: can_accept_evidence, can_approve_bet, can_commit_work_package,
can_verify_timebox). Setting `kill_criteria` does NOT approve a bet; only
`approve_bet` does. Therefore:
- A PATCH may freely edit concept-doc content (type, body, any descriptive
  frontmatter: title, description, tags, assumptions, kill_criteria, objective…).
- A PATCH must NOT set lifecycle `status` (Accepted/Approved/Committed/Verified/
  Validated) — those go through the gate endpoints. **`status` is the only
  denied key.** This is gate-safe by construction; no gate logic is duplicated.

## Per-gap trace

| Gap | Constraint | Dimensions | Integrations (files · IDs · edges) | Fix |
|-----|-----------|-----------|-------------------------------------|-----|
| **OQ-011 stale index** | SQLite is derived (INV-DUR); must rebuild, never block | correctness·startup-time·data-safety | `adapters/src/sqlite_index.rs` (init); INV-DUR, INV-PORT, SDS-INDEX | schema-version pragma; on mismatch DROP+rebuild from vault |
| **In-place re-type / frontmatter edit** | gate-safe (status denied); preserve unknown keys (INV-PORT) | correctness·UX·gate-integrity | NEW `core/services.rs update_node`; `server/http.rs`; SDS-NODE, INV-HUMAN | PATCH /api/node/:id merges fm+type+body, denies `status` |
| **CodeMirror editor (TASK-N19/N20)** | preserve triggers/autosave; no gate impact; dep add justified by plan | UX·perf·a11y | `ui/.../NoteEditor.tsx` (+`@codemirror/*`); PRD-012 | swap textarea→CM6; adapt detectTrigger to CM state; overlays via coordsAtPos |
| **Block-as-node (PRD-002)** | needs CM decorations + ULID-per-block + ((ref)) | correctness·graph-integrity | `core/node.rs`, `format.rs`, CM ViewPlugin; PRD-002, INV-ID | DEFER to post-CM slice (its own design) |
| **Callout widgets** | needs CM decorations | UX | `CalloutBlock.tsx`→CM widget; — | DEFER (CM decoration follow-on) |
| **ORD/SLD/EDS/VSD generated views** | same pattern as ERD (GU-16) | breadth | `App.tsx` + nav; SDS-STRAT | incremental; cheap once ERD proven |
| **OKF import** | inverse of export; validate type required (OKF §9); id minting | correctness·interop | `ui/lib/okf.ts`, `api.ts`; INV-PORT | parse bundle → POST /api/notes per concept |
| **Clones UX (PRD-006)** | Places edges; cycle check exists (INV-CLONE) | correctness·UX | `core/graph.rs`, editor; INV-CLONE | surface multi-parent in editor (documented OKF extension) |

## Execution order (this turn)

1. OQ-011 — unblocks runtime for all users (isolated, safe).
2. Gate-safe PATCH — clean in-place concept-doc authoring.
3. CodeMirror — the explicit ceiling lift (scoped: surface + triggers; decorations deferred).

Deferred with traces: block-as-node, callout widgets, ORD/SLD, OKF import, clones UX
(each has its own constraint row above; none block the three above).
