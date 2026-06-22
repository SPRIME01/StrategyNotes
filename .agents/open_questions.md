# open_questions.md

Open questions for the StrategyNotes project. Format per PLAN sec 11.
Status legend: Open / Pending decision / Resolved (with date + decision).

Resolve a question by editing its Status line and adding a Resolved subsection.

## Active open questions (from PLAN sec 11)

### OQ-006 — Node grouping / clone model (BLOCKING Phase 4 INV-CLONE)
Status: Escalated (blocking S-CLONE-001)
Affected: PRD-006, SDS-GRAPH, SDS-NODE, INV-CLONE
Owner: Sam / Architecture
Question: SPEC sec 4.3 says clones are "equal placements; clone edits propagate;
  clone-induced cycles rejected" but does not specify HOW a clone is encoded.
Options:
  A. A `placement`/`parent` typed edge (clones are typed edges of a new edge type).
  B. Outline structure in the parent node's body (like Roam/Logseq block refs).
  C. A frontmatter `parents: [id, id]` key on the cloned node.
  D. A separate `placement` node type linking parent -> child.
Why blocking: implementing clone + cycle detection (INV-CLONE) requires picking
one. Inventing a model here would violate PLAN sec 1 drift rule. Need Sam's call.

### OQ-001 — Markdown schema for typed strategy edges
Status: Pending (recommend Option A: frontmatter)
Affected: PRD-005, SDS-GRAPH, INV-EDGE, INV-PORT
Owner: Sam / Architecture
Note: SPEC sec 3.4 and sec 4.2 already assume frontmatter-authoritative edges.
Decision needed: confirm Option A so Phase 2 can implement the serializer.

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
(none yet)
