# Graph Unification Plan — "everything is generated from markdown"

**Status:** Active
**Created:** 2026-06-23
**Principle:** StrategyNotes is a projection engine over an OKF-style markdown vault (the
Logseq/Obsidian model, strategy-native). Markdown files are the only truth; every screen,
document, and daynote is *derived*. One graph, many lenses. Node `type` drives screen
membership.

**Related:** `editor-screen.md`, `notes-feature.md`, `Strategy_Framework_tread.md`,
`SPEC.md` (PRD-003, §4, §11), OKF v0.1.

---

## 1. Why

The backend is already markdown-first: `MarkdownVault` writes one `.md` per node (atomic,
INV-DUR/PORT/EDGE); `sqlite_index` is a rebuildable derived cache; `Node` + `TypedEdge` are
modeled; the API exposes `nodesByType`, `getNode`, `trace`, `search`, + CRUD/gates.

The **entire gap is the frontend**: the strategy screens render hardcoded `MOCK_*` constants
instead of reading the vault. The editor already writes to the vault; the screens ignore it.
Two graphs. This plan unifies them so the app is what its name claims — a strategy-native
view engine over notes.

## 2. Data contract (the linchpin — verified against backend)

- `getNode(id)` → `{ id, type, frontmatter: {…all typed fields…}, body }`.
  - Typed nodes (evidence/bet/work/…): fields in `frontmatter`, `body` empty.
  - Plain notes: `title` in frontmatter, content in `body`.
- `nodesByType(ty)` → `string[]` (IDs). `ty` is snake_case (`evidence_item`, `strategy_bet`…).
- `trace(id)` → `{ reachable: string[] }`.
- `getBacklinks(id)` → `string[]`. `search(q)` → `[{id,ty,excerpt}]`.
- Typed edges live in frontmatter (OQ-001 Option A); `getNode` round-trips them.

**Field map (frontmatter keys, read defensively — snake_case):**

| Type | Keys (frontmatter) |
|------|--------------------|
| strategy_case | title, phase, owner, arena |
| evidence_item | text, proof_level, status, source_chunk, kind, supports[], contradicts[] |
| strategic_claim | statement, proof_level, supports[], contradicts[] |
| strategy_bet | thesis, status, case, linked_choice, assumptions[], counterevidence_reviewed, success_metric, kill_criteria, owner |
| work_package | objective, status, case, linked_bet |
| timebox | status, work_package, start, end, pomos, expected_output |
| value_claim | statement, proof_level, status, evidence_links[], linked_outcome |
| agent_run | agent, status, summary, reviewer |

## 3. Shared infrastructure (built first, reused by all screens)

- `ui/src/lib/node.ts` — typed field accessors: `fm(node, key)`, `fmList`, `nodeTitle`, `fmString`.
  Reads from `node.frontmatter` with safe fallbacks. Single source of truth for "how to read
  a node."
- `ui/src/hooks/useTypedNodes.ts` — `useTypedNodes(ty)`: fetches IDs via `nodesByType`, resolves
  each via `getNode`, caches, exposes `{nodes, loading, reload}`. The one hook every screen uses.
- `ui/src/hooks/useNode.ts` — `useNode(id)` for single-node screens (trace, detail).
- Reuse existing `atoms.tsx` (NodeTypeBadge, ProofLevelBadge, EvidenceStateBadge, GateStatusBadge…).

## 4. Part 1 — Unify the graph (kill all MOCK_* data)

Each strategy screen becomes a generated view over typed nodes. No backend change.

| Screen | Node type(s) | Source |
|--------|--------------|--------|
| CaseCockpit | strategy_case + linked evidence/bet/work | `nodesByType("strategy_case")` + per-case links; compute phase, evidence-debt, capacity |
| EvidenceInbox | evidence_item | `nodesByType("evidence_item")`; accept gate unchanged |
| BetBoard | strategy_bet | `nodesByType("strategy_bet")` grouped by `status`; INV-BET req checklist from frontmatter |
| TraceExplorer | (trace) | `api.trace(id)` walking typed edges |
| WorkPlanner | work_package | `nodesByType("work_package")` |
| ExecutionRunbook | timebox (Committed) | `nodesByType("timebox")` |
| DaynoteLedger | (daynote log) | `api.daynote(date)` (already vault-backed) |
| VrdView | value_claim | `nodesByType("value_claim")` |
| AgentDraftInbox | agent_run | `nodesByType("agent_run")` |

**Empty states matter:** with no backend / empty vault, screens show honest "no X yet — create
one" prompts, not fake data. This is the anti-RISK-001 guardrail (no completion theater).

**Done when:** every screen reads from the graph; zero `MOCK_*` references remain; the editor's
notes and the strategy screens are one graph (promote a note → it appears in the right screen).

## 5. Part 2 — Editor as OKF concept-doc author (strategy-native teeth)

The editor gains a **frontmatter surface** so authoring a note = authoring an OKF concept doc.

- **Type selector** in the editor header: change `type` (note → evidence_item → strategy_bet…).
  Persisted to frontmatter. Drives which screen the node appears in.
- **Proof Burden panel** replaces "Core Concepts" in the ContextPanel (SPEC §11.4):
  *What supports this? What contradicts? What is assumed? What would change our mind? What's
  unverified?* — derived from typed edges + frontmatter.
- **Typed edges on link:** mention/link creation lets the user pick an edge type
  (`supports`/`contradicts`/`requires`…) stored as a frontmatter edge array. Base `[[wikilink]]`
  stays an untyped OKF link.
- **Citations** section (OKF §8): link a node to a source as provenance (INV-EVID).

**Done when:** a user can, in the editor, type a note, set type=evidence_item, link it
`supports` a claim, and see it flow into EvidenceInbox + the claim's Proof Burden panel.

## 6. Part 3 — Generated documents (index views)

ERD/ORD/SLD as synthesized listings over typed nodes (OKF `index.md` model — Obsidian Dataview
style). Start with **ERD** = index over a case's accepted `evidence_item` nodes (title + proof
level + source + contradictions). Proves the pattern; ORD/SLD/EDS/VSD/VRD follow the same shape.

**Done when:** ERD view regenerates entirely from the graph; no static content.

## 7. Part 4 — Export as OKF bundle

`Share` → export a case's nodes as an OKF-conformant bundle: one `.md` per concept (frontmatter
`type` + body), `log.md` from daynotes, `index.md` as the ERD. `okf_version: "0.1"` at root.
Clones documented as the documented SN extension (`places` edges).

**Done when:** exported bundle is cat-able/git-clone-able and re-readable.

## 8. Task list (slice IDs, ordered)

### Part 1 — unify
- [x] **GU-01** `lib/node.ts` field accessors + tests
- [x] **GU-02** `useTypedNodes` + `useNode` hooks + tests
- [x] **GU-03** EvidenceInbox → API-driven
- [x] **GU-04** BetBoard → API-driven
- [x] **GU-05** VrdView → API-driven
- [x] **GU-06** WorkPlanner → API-driven
- [x] **GU-07** ExecutionRunbook → API-driven (timeboxes)
- [x] **GU-08** AgentDraftInbox → API-driven
- [x] **GU-09** CaseCockpit → API-driven (projection over case + links)
- [x] **GU-10** TraceExplorer → API-driven (`trace`)
- [x] **GU-11** Remove all MOCK_* + dead types; App.tsx clean

### Part 2 — editor teeth
- [x] **GU-12** Type selector in editor (frontmatter `type`)
- [x] **GU-13** Typed-edge creation on link (frontmatter edge arrays)
- [x] **GU-14** Proof Burden panel (replaces Core Concepts)
- [x] **GU-15** Citations / provenance link

### Part 3 — generated docs
- [x] **GU-16** ERD index view (generated from evidence nodes)

### Part 4 — export
- [x] **GU-17** OKF bundle export (Share)

## 9. Spec IDs

PRD-003 (markdown source of truth), PRD-002 (every node first-class), PRD-012 (atomic UI),
SDS-NODE, SDS-GRAPH (typed edges bidirectional, frontmatter-stored), INV-DUR, INV-PORT,
INV-EDGE, INV-EVID, INV-CLAIM, INV-CONTRA, INV-HUMAN. RISK-001 mitigation (no generic-PKM
drift; no UI-only progress).

## 10. Verification

```
pnpm -C ui typecheck
pnpm -C ui test
pnpm -C ui build
```
Each slice: typecheck + focused test + (for screens) a render test against a mocked api.
Evidence recorded per slice in `.agents/evidence.md` (EV-015+).

## 11. Sequencing

GU-01/02 (infra) → GU-03..10 (screens, parallelizable) → GU-11 (cleanup) → GU-12..15 (editor)
→ GU-16 (docs) → GU-17 (export). Part 1 is the coherence spine and ships first.
