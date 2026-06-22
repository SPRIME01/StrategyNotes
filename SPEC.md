# StrategyNotes Specification (SPEC.md)

Status: Draft v1
Owner: Sam Prime
Date: 2026-06-21
Companion docs: `PLAN.md` (implementation contract), `AGENTS.md` (agent orientation), `Strategy_Framework_tread.md` (raw context — not authoritative).

Subtitle: **A local-first, markdown-native strategic knowledge and execution system.**

Problem statement: StrategyNotes stores knowledge, strategy, decisions, work, time commitments, execution reviews, and value claims as a single linked graph of durable markdown nodes. It closes the gap between thinking, planning, acting, and learning by requiring **evidence for claims** and **timeboxed commitments for execution**.

---

## 0. How to read this spec

This document is **authoritative for what the product is and must do**. `PLAN.md` is authoritative for **how it is built** (phases, slices, evidence). When they appear to conflict, precedence (PLAN §1) applies:

```
1. Safety invariants (INV-*)              ← this doc §7
2. Durable storage rules                  ← this doc §3
3. PRD outcome requirements               ← this doc §5
4. SDS behavior rules                     ← this doc §6
5. Test definitions                       ← this doc §8
6. PLAN.md
7. Agent notes, summaries, UI drafts      ← never authoritative
```

Every implementation slice MUST cite the PRD/SDS/INV/TST IDs it satisfies. If behavior is ambiguous, record an `OPEN_QUESTION` naming the affected IDs rather than inventing policy.

---

## 1. Product definition

### 1.1 Thesis

StrategyNotes is a **strategy-native notes app**: every note can become part of a traceable strategy case, every strategic claim can be linked to evidence, and every intended action must be costed, timeboxed, reviewed, and converted into learning.

It is the synthesis of two prior ideas:
- *NexusNotes*: how should knowledge be stored, linked, cloned, rendered, and logged?
- *Strategy Kernel*: how should strategy be evidenced, decided, executed, validated, and claimed?

StrategyNotes answers: **how should a person or team think, decide, schedule, act, and learn from one local-first strategic knowledge graph?**

### 1.2 The two prices (the system's teeth)

```
Epistemic price = evidence.    A claim with no evidence is not accepted.
Execution price = time.        A task with no timebox is not committed.
                               A timebox with no review is not learned from.
                               A value claim with no proof is not validated.
```

A goal unwritten and not timeboxed is a wish.

### 1.3 Layered contribution

| Layer | Contributes |
|---|---|
| Notes | Markdown-native nodes, outlines, bodies, links, backlinks, tags, clones. |
| Evidence | Sources, chunks, evidence items, proof levels, contradictions, provenance. |
| Strategy | Case Charter, ERD, ORD, SLD, EDS, VSD, VRD, choice cascades, bets, decisions. |
| Execution | Work packages, pomos, timeboxes, calendar commitments, execution reviews. |
| Learning | Daynotes, activity logs, post-block reviews, value claims, strategy evolution. |
| Governance | Gates, invariants, audit trail, agent output quarantine, source-of-truth rules. |

The note is the atom. Strategy is the grammar. Time is the cost. Evidence is the proof.

### 1.4 The spine

Every other feature hangs from this chain. Each arrow is a typed edge (§4.2).

```
source → evidence → comparison → choice → bet → experiment
       → work package → timebox → execution → review → value claim
```

---

## 2. Glossary

### 2.1 Strategy document stack

Strategy objects are typed notes (§4.1). The "documents" below are **living views over linked nodes**, not static files. Source of truth stays granular and graph-based; documents are generated readable surfaces.

| Artifact | Full name | Core question | What it is a view over |
|---|---|---|---|
| Case Charter | — | What case are we opening and why? | Case scope, arena, stakeholders, non-goals, initial hypothesis. |
| ERD | Evidence Reality Dossier | What is true, observed, sourced, or uncertain? | Accepted evidence, sources, contradictions, gaps. |
| ORD | Outcome Requirements Document | What must become true in the world for success? | Outcome requirement nodes + acceptance criteria. |
| SLD | Strategic Logic Document | Why does this strategy have this shape? | Strategic claims, logic, assumptions, comparisons, tradeoffs. |
| EDS | Execution Design Specification | How will execution be structured? | Work packages, owners, dependencies, interfaces, capacity. |
| VSD | Validation Strategy Document | How will we know whether it is working? | Experiments, metrics, validation coverage, kill criteria. |
| VRD | Value Realization Document | What value was created, proven, claimed, or learned? | Value claims, evidence, before/after comparisons, lessons. |
| SDR | Strategy Decision Record | What did we decide and why? | Decision-specific records created throughout the case (ADR analog). |

Stack shape: `Case Charter → ERD → ORD → SLD → Choice Cascade + Bets → EDS → VSD → VRD`, with SDRs throughout.

**Why ERD before ORD:** strategy needs a reality base before outcome claims.
**Why VRD after VSD:** strategy needs value claiming and learning capture, not just pass/fail testing.
**Why SLD matters:** it is the bridge between evidence and execution; it carries the strategic thesis, load-bearing bets, constraints, tradeoff rationale, and failure logic.

### 2.2 MCGCS

Strategic position model (Sun Tzu-derived): **Mission, Climate, Ground, Command, Systems**. The MCGCS map separates these so the user can see what is missing or misread, instead of treating "the situation" as one muddy blob.

### 2.3 Choice cascade

`aspiration → where-to-play → how-to-win → capabilities → systems`. A strategy is a coherent set of reinforcing choices, not a list of moves.

### 2.4 Pomodoro model

```
1 pomo            = 25 minutes focused work + 5 minute break   (default; user-configurable later)
Deep Work Packet  = 6 pomos ≈ 3 hours including breaks         (smallest meaningful project block)
```

Attention modes (budget attention quality, not just clock time): `Capture, Evidence review, Synthesis, Deep creation, Decision review, Execution/build, Admin/setup, Recovery/reflection`.

Pomos are the **commitment currency**. "How many pomos will this cost?" is the default time question, not "how many minutes?".

### 2.5 Proof levels / claim strength

Every claim carries exactly one of:

```
Observed   Supported   Inferred   Hypothesized   Speculative   Contested   Validated   Rejected
```

### 2.6 Status labels (anti-completion-theater)

Use: `Drafted · Reviewed · Accepted · Validated · Claimed · Superseded`.
Never use: `Complete · Done · Finished`. Maturity is shown via gates and evidence debt, not filled sections.

---

## 3. Architecture

### 3.1 Layered stack

```
1. Storage Layer        OKF-style markdown vault (durable source of truth)
2. Serialization Layer  Frontmatter + markdown body + inline refs + typed-edge metadata
3. Index Layer          SQLite derived, rebuildable cache (nodes, branches, refs, edges, gates, timeboxes, search)
4. Graph Layer          Nodes, branches, backlinks, clones, tags, typed strategy edges
5. Strategy Domain      Cases, artifacts, evidence, claims, choices, bets, work packages, validation, value
6. Commitment Layer     Pomos, timeboxes, calendar adapters, capacity ledger, post-block reviews
7. Gate Layer           Approval checks: evidence requirements, timebox requirements, validation requirements
8. Presentation Layer   TSRX strategy components, outliner, cockpit, runbook, dashboards
```

This is a single domain stack, not a plugin layer. The core knows typed nodes/edges/renderers/commands/derived indexes; strategy supplies the domain pack.

**Layers 4–7 form the hexagonal core (§3.4).** Layers 1–3 (storage/serialization/index) and layer 8 (presentation) are adapters around that core.

### 3.2 Source-of-truth rules (durable storage)

```
Markdown files are the durable source of truth.
SQLite is a derived, rebuildable index.
Strategy-critical state must NEVER live only in SQLite.
Deleting the index must NEVER lose user data.
```

Every strategy object MUST serialize to a markdown file with frontmatter. If a feature cannot be expressed in markdown, it is wrong.

### 3.3 Modes over one graph

Same nodes, different affordances. The vault supports both normal notes and strategy work.

| Mode | Purpose |
|---|---|
| Notes | Capture, write, outline, link, clone, search. |
| Evidence | Source review, evidence extraction, acceptance, contradiction mapping. |
| Strategy | ERD/ORD/SLD/choice cascade/bet design. |
| Planning | Work packages: inputs, outputs, tools, methods, evidence requirements. |
| Execution | Low-decision runbook view for active timeboxes. |
| Review | Post-timebox reflection, learning, decisions, next actions. |
| Value | VRD, proof, before/after, stakeholder claims. |

### 3.4 Ports & Adapters (hexagonal core)

The domain core (Graph + Strategy Domain + Gate + Commitment layers) is **pure**: it knows nothing about I/O, frameworks, storage engines, or external services. All interaction crosses a port. This is **mandatory throughout** the codebase — not a suggestion.

- **Driven ports** (SPI interfaces, the core's needs): repository/provider/capability traits the core depends on. Adapters implement them.
- **Driving ports** (application services, the core's API): the only entry points the outside world can call. Each state-changing service runs the relevant gate through the core's `GateEvaluator` before mutating (§9). The UI, Tauri IPC, CLI, and tests are all driving adapters.

**Dependency direction is one-way:** adapters depend on the core; the core never depends on an adapter. Substituting an adapter (SQLite ↔ in-memory, Markdown ↔ mock, Google Calendar ↔ fake, real clock ↔ fake clock) MUST NOT require a change to the core. This is what makes invariants enforceable by construction rather than by discipline.

#### Driven ports (SPI)

| Port | Purpose | Primary adapter | Test adapter | Guards |
|---|---|---|---|---|
| `NodeVault` | Durable source-of-truth for nodes + typed edges (markdown). | `MarkdownVaultAdapter` | `InMemoryVault` | INV-DUR, INV-PORT, INV-EDGE |
| `DerivedIndex` | Fast derived queries (rebuildable). | `SQLiteIndexAdapter` | `InMemoryIndex` | INV-DUR |
| `Clock` | `now()` / `today()` for daynotes, scheduling, timebox state. | `SystemClock` | `FakeClock` | INV-DAY, INV-TIME |
| `CalendarProvider` | External calendar push/pull + ICS export. | `InternalCalendarAdapter`, `IcsAdapter`, `GoogleCalendarAdapter`, `OutlookAdapter`, `ICloudCalDavAdapter` | `FakeCalendarProvider` | INV-CAL |
| `EventSink` | Audit + activity emission (daynotes, agent runs, decisions). | `DaynoteEventSink` | `RecordingSink` | INV-DAY |
| `IdMinter` | ULID minting (monotonic, sortable). | `UlidMinter` | `FakeMinter` | INV-ID |
| `FileWatcher` *(future, OQ-005)* | External file-edit detection. | `FsWatcherAdapter` | — | INV-DAY |

#### Driving ports (application services)

Each is the sole entry point for its concern; each state-changing call evaluates its gate (§9) in the core before any mutation reaches a driven port.

| Service | State-changing ops | Gate owned |
|---|---|---|
| `NodeService` | create / update / clone | (cycle check INV-CLONE, identity INV-ID) |
| `EvidenceService` | accept / reject evidence | `can_accept_evidence` |
| `ClaimService` | accept claim | `can_accept_claim` |
| `BetService` | approve bet → SDR | `can_approve_bet` |
| `WorkService` | commit work package | `can_commit_work_package` |
| `TimeboxService` | start / review / verify | `can_verify_timebox` |
| `ValueService` | validate value claim | `can_claim_value` |
| `CaseService` | close case | `can_close_case` |
| `CalendarService` | ICS export / provider push | (delegates to `CalendarProvider`) |
| `TraceService` *(read-only)* | source→value traversal | — |
| `DaynoteService` *(read + capture)* | daynote activity ledger | — |
| `AgentRunService` | quarantine + human-approval handoff | INV-HUMAN |

#### Why this is not optional

| Invariant | How the architecture enforces it |
|---|---|
| INV-DUR / INV-PORT | Only `NodeVault` (markdown) is durable; `DerivedIndex` is a port with a rebuildable adapter. The core physically cannot read "truth" from SQLite. |
| INV-CAL | `CalendarProvider` is a port; any adapter failure is contained and surfaces as an operator-visible error, never local-state corruption. |
| INV-HUMAN / gate ownership | State-changing driving services call `GateEvaluator` in the core before mutating; the UI/Tauri/CLI are driving adapters with no path around it. |
| INV-EDGE | Typed edges live in markdown (via `NodeVault`); `DerivedIndex` only mirrors them — they survive index deletion. |
| INV-DAY | `EventSink` is a port; activity is captured by the core, not fabricated by the UI. |

#### Build rule

Every PR in the core: no `std::fs`, no `rusqlite`, no `reqwest`, no `tokio`, no Tauri types. Core crates depend only on domain types + port traits. Any import of an I/O or framework crate inside `core/` is a review-blocker.

---

## 4. Object model

### 4.1 Node = atom

The **Node** is the atomic unit: an addressable markdown object with a stable ULID identity, body, refs, tags, properties, and schedule metadata. Every outline item is a first-class node.

**Schema shift:** strategy objects are not rows in a strategy module — they are **typed notes**. An evidence item is a note. A strategy bet is a note. A timebox is a note. A decision record is a note. A value claim is a note. One system of truth.

#### Node types

```
note, journal, source, source_chunk, evidence_item,
strategy_case, case_charter, erd, ord, sld, eds, vsd, vrd, decision_record,
actor, ranking, mcgcs_position, strategic_claim, assumption, counterevidence,
option, choice_cascade, strategy_bet, experiment, metric,
work_package, timebox, timebox_review, value_claim,
open_question, risk, agent_run, view, template
```

### 4.2 Typed edges

Base refs/backlinks are not enough for strategy. Typed edges carry the spine's semantics. **Edge data lives in frontmatter (authoritative); SQLite indexes it (derived).**

```
supports        contradicts     derives_from    assumes         tests
implements      blocks          resolves        requires        validates
weakens         supersedes      claims_value_for scheduled_by   reviewed_by
created_from    compares_with
```

**Example trace (the product's core promise):**

```
Source Chunk
 → supports    Evidence Item
 → supports    Strategic Claim
 → derives_from SLD
 → supports    Strategy Bet
 → requires    Work Package
 → scheduled_by Timebox
 → reviewed_by  Timebox Review
 → validates    Value Claim
```

### 4.3 Identity, branches, clones

- **ULID** for node identity (stable, sortable, path-mapped).
- **Branch** placement lets one node appear in multiple contexts without duplication.
- **Clone / multi-parent placement** — e.g. one evidence item belongs to ERD, SLD, VSD, and VRD simultaneously. Clones are **equal placements**; clone edits propagate; clone-induced cycles are rejected. **Encoding (OQ-006 resolved 2026-06-21, Option A):** a clone is a typed edge `parent --places--> child` (the `Places` edge type, §4.2). Multi-parent = a child with multiple incoming `Places` edges. Cycle detection: before adding `P --places--> C`, traverse `C`'s `Places` descendants; reject if `P` is reachable (would close a loop). See `core::graph::would_create_placement_cycle`.
- **Unknown-key preservation:** parsers MUST round-trip frontmatter keys they do not understand.
- **Atomic writes:** markdown files are never written non-atomically (corruption risk to the source of truth).

### 4.4 Frontmatter examples (illustrative, not normative)

```yaml
# strategy_case
type: strategy_case
status: Listening
phase: EstablishReality
owner: Sam
arena: GodSpeed AI MVP
current_artifacts:
  erd: [[ERD - GodSpeed MVP]]
  ord: [[ORD - GodSpeed MVP]]
  sld: [[SLD - GodSpeed MVP]]
  eds: [[EDS - GodSpeed MVP]]
  vsd: [[VSD - GodSpeed MVP]]
  vrd: [[VRD - GodSpeed MVP]]
open_questions: [((01HX...))]
active_bets:     [((01HY...))]
```

```yaml
# evidence_item
type: evidence_item
evidence_type: DirectQuote
status: Accepted
proof_level: Observed
source_chunk: ((01SRC...))
supports:   [((01CLAIM...))]
contradicts: []
confidence: high
```

```yaml
# strategy_bet
type: strategy_bet
status: Draft
linked_choice_cascade: ((01CHOICE...))
target_actor: ((01ACTOR...))
assumptions: [((01ASSUMP...))]
counterevidence_reviewed: false
success_metric: null
kill_criteria: null
owner: null
```

```yaml
# work_package
type: work_package
status: Intent
linked_case: ((01CASE...))
linked_bet:  ((01BET...))
objective: Draft SLD thesis
inputs:          [((01ERD...)), ((01ORD...))]
expected_outputs: [Draft strategic thesis, 3 load-bearing assumptions, 2 counterarguments]
tools:           [SLD workspace, Evidence rail, Critic agent]
technique: Compare current path against two alternatives
evidence_required: [EV-MAN, linked_claims]
exception_policy: Capture new ideas; only solve local blockers
```

```yaml
# timebox
type: timebox
status: Committed
linked_work_package: ((01WP...))
estimated_pomos: 2
pomo_pattern: 25/5
attention_mode: Synthesis
scheduled_start: 2026-06-23T13:30:00-04:00
scheduled_end:   2026-06-23T14:30:00-04:00
calendar_provider: Internal
external_calendar_event_id: null
expected_output: Draft SLD thesis
review_required: true
```

```yaml
# timebox_review
type: timebox_review
linked_timebox: ((01TBX...))
executed: true
actual_pomos: 3
completed_expected_output: partial
evidence_links: [((01EV...))]
friction_notes: Source evidence was weaker than expected.
hypothesis_update: Need stronger ICP evidence before finalizing SLD.
next_action: Schedule second SLD block.
```

---

## 5. Product Requirements (PRD)

Each PRD has a one-line acceptance criterion a test can hit.

| ID | Requirement | Acceptance criterion |
|----|---|---|
| **PRD-001** | Local-first markdown-native node graph | A vault on disk is a complete, readable strategy graph with no DB required to read it. |
| **PRD-002** | Every outline item is a first-class node/page | Any outline item has its own ULID, address, body, and backlinks. |
| **PRD-003** | Markdown files are durable source of truth | Wiping SQLite and rebuilding yields identical domain state. |
| **PRD-004** | SQLite index is derived and rebuildable | Index deletion never loses user data; rebuild is deterministic. |
| **PRD-005** | Bidirectional linking, backlinks, tags, typed edges | Links produce backlinks; typed edges resolve in both directions. |
| **PRD-006** | Multi-parent cloning / equal placements | A cloned node appears in N parents; an edit propagates; cycles are rejected. |
| **PRD-007** | Automated daynote activity capture | Create/modify events appear on the correct daynote automatically; scheduling does not pollute activity. |
| **PRD-008** | Strategy case objects and case cockpit | A strategy_case node exists and renders a cockpit aggregating its artifacts, gates, evidence, decisions, and timeboxes. |
| **PRD-009** | ERD — Evidence Reality Dossier | ERD view generates from accepted evidence + sources + contradictions + gaps; updates as evidence changes. |
| **PRD-010** | ORD — Outcome Requirements Document | ORD view lists outcome requirements with acceptance criteria; outcome without criteria shows as evidence debt. |
| **PRD-011** | SLD — Strategic Logic Document | SLD view shows thesis, load-bearing assumptions, counterarguments, tradeoffs; each links to evidence. |
| **PRD-012** | EDS — Execution Design Specification | EDS view shows work packages, owners, dependencies, interfaces, capacity; infeasible capacity is flagged. |
| **PRD-013** | VSD — Validation Strategy Document | VSD view shows experiments, metrics, leading/lagging signals, kill criteria; metrics link to outcomes. |
| **PRD-014** | VRD — Value Realization Document | VRD view shows value claims with proof levels + before/after; unproven claims are visible as debt. |
| **PRD-015** | SDRs — Strategy Decision Records | SDRs are first-class nodes referenced throughout the case; approved bets create/link an SDR. |
| **PRD-016** | Actor, ranking, and MCGCS position modeling | MCGCS map renders Mission/Climate/Ground/Command/Systems with evidence links and gap markers. |
| **PRD-017** | Choice cascade and strategy bet builder | Choice cascade composes aspiration→where-to-play→how-to-win→capabilities→systems; bets link to a choice. |
| **PRD-018** | Work packages with inputs, outputs, tools, techniques, exception policy | A work package cannot reach Ready without objective, inputs, outputs, tools, technique, exception policy, evidence requirement. |
| **PRD-019** | Pomodoro-based time cost estimation | Every work package carries an estimated pomo cost; deep-work packet preset = 6 pomos. |
| **PRD-020** | Calendar-backed timebox commitments | A work package cannot be Committed without estimated pomos + scheduled start/end + owner + expected output + evidence requirement. |
| **PRD-021** | Low-decision execution mode | Execution mode shows only runbook, inputs, method, expected output, capture bar, evidence attach — not strategy editing. |
| **PRD-022** | Post-timebox review and learning capture | An executed timebox cannot be Verified without a review carrying actual pomos, output summary, evidence/explicit-no-evidence, and next action. |
| **PRD-023** | Evidence-gated verification of work | Timebox verification requires evidence link or explicit no-evidence reason; nothing is "done" by assertion. |
| **PRD-024** | Daynote value ledger | Daynote shows created/modified/scheduled + committed/executed/missed timeboxes + evidence produced + decisions made. |
| **PRD-025** | Calendar adapter layer: internal, ICS, Google, Outlook, iCloud | Internal timeboxes + ICS export are core; Google/Outlook/iCloud are adapters behind a contract. |
| **PRD-026** | Agent draft quarantine and human approval | Agent output enters a draft inbox; nothing an agent produces reaches an accepted artifact without a human approval event. |
| **PRD-027** | Atomic/TSRX UI component system | UI is composed from atoms→molecules→organisms; "screens" are compositions, not bespoke builds. |
| **PRD-028** | Trace explorer from source to value claim | Trace view traverses typed edges from any source chunk to any value claim it supports/validates. |
| **PRD-029** | Import/export of case records and markdown vault | A case (or whole vault) can be exported as markdown and re-imported without loss. |
| **PRD-030** | Offline-first operation with optional sync outside the core | All core flows work with no network; sync (if any) is outside the core and never blocks local correctness. |

---

## 6. Software Design Specification (SDS)

Behavior rules per subsystem. Each subsystem exposes its port(s) per §3.4; behavior rules below describe the port contract, not the adapter.

| ID | Subsystem | Behavior rules |
|----|---|---|
| **SDS-NODE** | Node, branch, ref, tag, property, daynote, activity | ULID identity; body is authoritative for inline refs/tags; branch placements are editable; clone edits propagate; cycles rejected. |
| **SDS-STORAGE** | Markdown vault + deterministic serialization | Atomic writes; deterministic key ordering; unknown-key round-trip; UTF-8; LF newlines; trailing newline; path = function of ULID. |
| **SDS-INDEX** | SQLite derived index + rebuild | Rebuild is deterministic from markdown; corrupt/missing index is auto-recoverable; index schema is versioned; index holds no truth the markdown lacks. |
| **SDS-GRAPH** | Graph service, backlinks, clones, typed edges | Backlinks computed from refs; typed edges stored in frontmatter; edge traversal is bidirectional; clone graph is acyclic. |
| **SDS-DAY** | Daynote + activity ledger | Daynotes lazily created; create/modify events captured automatically; scheduling does not alter activity; daynote is an activity record, not manually fabricated proof. |
| **SDS-STRAT** | Strategy domain model | Strategy objects are typed nodes; artifacts are views over nodes; case lifecycle is phase-gated; SDRs are created on approval events. |
| **SDS-EVID** | Evidence item, source, provenance, proof level, contradiction | Evidence has status (Drafted/Reviewed/Acquired) + proof level; sources carry provenance; contradictions remain visible (never silently discarded); manual-basis evidence requires a reviewer. |
| **SDS-GATE** | Gate engine + state-transition validation | Gates are backend-owned; a transition either returns `approved` or `blocked` with `failed_gates[]`; the UI never decides approval. |
| **SDS-WORK** | Work package model | Inputs/outputs/tools/technique/exception-policy/evidence-requirement are required to reach Ready; discretionary tasks and CMMN-style sentries/triggers/milestones supported. |
| **SDS-TIME** | Pomo, timebox, calendar commitment, review | Pomo = 25/5 default; deep-work packet = 6 pomos; timebox states enforced; actual vs estimated tracked; missed/rescheduled/blocked states handled; review required before Verified. |
| **SDS-CAL** | Calendar adapters + ICS export/import | Internal calendar + ICS export are core; providers behind a contract; provider failure maps to an operator-visible error and never corrupts local state. |
| **SDS-UI** | Atomic/TSRX UI | Atoms→molecules→organisms→templates; components render from node type + context; maturity shown via gates/evidence-debt, not percent-complete. |
| **SDS-EXEC** | Execution mode, exception capture, discretionary tasks | Execution mode is low-decision: runbook, inputs, method, expected output, capture bar, evidence attach; new ideas are captured, not applied as strategy mutations. |
| **SDS-AGENT** | Agent run model, draft quarantine, human review | AgentRun captures inputs/outputs; drafts are quarantined; human accept/reject/split/merge controls; agent authority limits enforced. |
| **SDS-TRACE** | Traceability + provenance traversal | Any node can be traced to its supporting sources and its supported claims/bets/value; traversal uses typed edges only. |
| **SDS-OBS** | Logs, snapshots, audit trail, runtime evidence | Status changes, evidence approvals, decisions, and agent runs leave an audit trail; runtime snapshots are reproducible. |
| **SDS-ERR** | Error categories + operator-visible failures | Startup, storage, gate, calendar, execution, and sync failures produce operator-visible errors with categories. |

---

## 7. Invariants (INV)

Invariants are safety invariants. Violating any one is a correctness bug. Each lists **trigger** (when it applies) and **prevents** (what goes wrong if missing).

| ID | Rule | Trigger | Prevents |
|----|---|---|---|
| **INV-DUR** | Markdown is source of truth; index loss cannot lose user data. | Any write, any rebuild. | Silent data loss; database becoming hidden truth. |
| **INV-ID** | Every node has stable identity and path mapping. | Node creation, move, rename. | Broken links; identity drift. |
| **INV-CLONE** | Clones are equal placements; no clone-induced cycles. | Clone create/move. | Infinite loops in traversal; contradictory edit semantics. |
| **INV-DAY** | Daynotes are activity records, not manually fabricated proof. | Activity capture, review claims. | Fabricated evidence; rewriting history. |
| **INV-BODY** | Body parsing is authoritative for inline refs/tags. | Parse, serialize, round-trip. | Index/frontmatter drift from what the user sees. |
| **INV-EDGE** | Strategy-critical relationships are reconstructable from markdown/frontmatter. | Any typed edge; any rebuild. | Edges that exist only in SQLite and vanish on rebuild. |
| **INV-EVID** | No accepted evidence without source/provenance or explicit manual basis. | Evidence acceptance gate. | Hallucinated or untraceable evidence entering the strategy. |
| **INV-CLAIM** | No accepted claim without proof level and evidence status. | Claim acceptance. | Claims of unknown strength masquerading as fact. |
| **INV-CONTRA** | Counterevidence and contradiction must not be silently discarded. | Contradiction linking, synthesis. | Smoothing away inconvenient evidence; false confidence. |
| **INV-HUMAN** | Agents may draft, critique, or suggest; humans approve. | Any agent output, any approval. | AI-generated strategy becoming accepted without review. |
| **INV-BET** | No approved strategy bet without assumptions, counterevidence review, success metric, kill criteria, owner. | Bet approval gate. | Strategy theater; bets that cannot fail or be killed. |
| **INV-WORK** | No committed work without a work package. | Work commitment. | Unstructured to-dos bypassing the strategy spine. |
| **INV-TIME** | No committed work without estimated pomo cost and calendar timebox. | Work commitment. | "Wishes" treated as committed execution capacity. |
| **INV-EXEC** | Execution mode captures exceptions without forcing strategy decisions mid-execution. | Execution mode. | Re-planning mid-flow; lost execution focus. |
| **INV-REVIEW** | No verified timebox without post-block review. | Timebox verification. | Unlearned execution; fake "done". |
| **INV-VALUE** | No value claim without proof level and evidence links. | Value validation gate. | Unproven value claims presented as realized value. |
| **INV-CAL** | Calendar provider failure must not corrupt local StrategyNotes state. | Any calendar adapter call. | External provider outages corrupting the vault. |
| **INV-PORT** | Strategy-critical data stays portable and inspectable in markdown. | Export, import, manual inspection. | Lock-in; unreadable strategy state. |

---

## 8. Test categories (TST)

What each category proves. Tests are the evidence type `EV-TST` (PLAN §2).

| ID | Category | What is proven |
|----|---|---|
| **TST-STORAGE** | Markdown parse/serialize/rebuild | Round-trip equivalence; unknown-key preservation; deterministic serialization. |
| **TST-GRAPH** | Link/backlink/clone/edge | Backlinks resolve; typed edges are bidirectional; clone edits propagate; cycles rejected. |
| **TST-DAY** | Daynote capture and scheduling | Activity appears on correct day; scheduling does not pollute activity; lazy creation. |
| **TST-EVID** | Evidence acceptance/rejection/provenance | Acceptance gate blocks invalid evidence; contradictions preserved; proof levels assigned. |
| **TST-GATE** | Gate pass/fail | Each gate returns approved/blocked correctly; UI cannot bypass. |
| **TST-STRAT** | Strategy artifact + case lifecycle | Artifacts generate from nodes; case phases transition only via gates. |
| **TST-WORK** | Work package input/output/tool/method | Missing fields block Ready; exception policy honored; discretionary tasks behave. |
| **TST-TIME** | Pomo/timebox/state transitions | Estimates required; capacity infeasibility detected; missed/rescheduled handled. |
| **TST-CAL** | Calendar adapter contract | ICS output valid; provider failure leaves local state intact; adapter contract upheld. |
| **TST-EXEC** | Execution mode + exception capture | Runbook-only affordances; ideas captured not applied; exceptions classified. |
| **TST-REVIEW** | Post-block review | Verification blocked without review; review carries required fields. |
| **TST-VALUE** | Value claim + VRD | Value claims blocked without proof; VRD generates from claims + evidence. |
| **TST-AGENT** | Agent draft quarantine | Drafts never auto-accepted; human approval transition works; agent run traced. |
| **TST-TRACE** | Source-to-value trace | Trace traversal returns complete provenance chain via typed edges. |
| **TST-OBS** | Logs, audit, snapshot | Audit trail captures required events; snapshots reproducible. |

---

## 9. Gate catalog

Gates are **backend-owned** (SDS-GATE). The UI displays gate state; it never decides approval. Every gate returns either:

```json
{ "status": "approved" }
```

or:

```json
{ "status": "blocked", "failed_gates": ["…", "…"] }
```

| Gate | Guards invariant | Required to pass |
|---|---|---|
| **can_accept_evidence** | INV-EVID, INV-CONTRA | source/provenance link OR explicit manual basis + reviewer; contradictions remain linked. |
| **can_accept_claim** | INV-CLAIM, INV-CONTRA | proof level set; evidence status set; counterevidence reviewed. |
| **can_approve_bet** | INV-BET | linked choice cascade; evidence basis; assumptions; counterevidence review; success metric; kill criteria; owner. On approve → create/link an SDR. |
| **can_commit_work_package** | INV-WORK, INV-TIME | objective; inputs; outputs; tools; technique; exception policy; evidence requirement; estimated pomos; scheduled start/end; owner; expected output. |
| **can_verify_timebox** | INV-REVIEW, INV-VALUE (seed) | post-block review with: actual pomos; output summary; evidence link OR explicit no-evidence reason; next action decision. |
| **can_claim_value** | INV-VALUE | proof level; evidence links; linked ORD outcome. |
| **can_close_case** | INV-VALUE | value finding OR explicit no-value finding; lessons learned captured; strategy review record exists. |
| **Strategy Capacity** | (planning gate, SDS-TIME) | EDS workstreams' estimated pomo cost ≤ available capacity; otherwise scope/timeline/owner/deferral must change. |
| **Value Alignment** | (advisory gate, SDS-TIME) | Reveals divergence between stated priority and committed time (e.g. "Priority 1 strategy but 3% of committed time"). Non-blocking but always visible. |

---

## 10. API surface

Organized around **nodes + domain transitions + gates**, not documents.

### 10.1 Node API

```
POST   /nodes
GET    /nodes/{id}
PATCH  /nodes/{id}
POST   /nodes/{id}/clone
GET    /nodes/{id}/backlinks
GET    /nodes/{id}/trace
GET    /daynotes/{date}
```

### 10.2 Strategy API

```
POST   /strategy-cases
POST   /evidence/{id}/accept
POST   /evidence/{id}/reject
POST   /claims
POST   /outcomes
POST   /choice-cascades
POST   /bets/{id}/approve
POST   /experiments/{id}/record-result
POST   /value-claims/{id}/validate
POST   /decisions
GET    /trace/{object_type}/{object_id}
```

### 10.3 Commitment API

```
POST   /work-packages
POST   /work-packages/{id}/estimate
POST   /work-packages/{id}/commit
POST   /timeboxes
POST   /timeboxes/{id}/start
POST   /timeboxes/{id}/review
POST   /timeboxes/{id}/verify
POST   /calendar/ics/export
```

### 10.4 Gate API

```
GET    /gates/{object_type}/{object_id}
POST   /gates/{object_type}/{object_id}/check
GET    /cases/{id}/gates
```

---

## 11. UI system

The UI is composed from atomic TSRX components; "screens" are compositions of organisms, not bespoke builds. Maturity is shown via gates and evidence debt, **never percent-complete**.

### 11.1 Atoms

```
NodeTypeBadge · ProofLevelBadge · EvidenceStatePill · GateStatusIcon · PomoCostChip
CalendarCommitmentChip · TraceLink · DecisionMarker · ContradictionBadge · SourceBadge
```

### 11.2 Molecules

```
StrategyNodeCard · EvidenceCard · ClaimCard · BetCard · WorkPackageCard · TimeboxCard
PostBlockReviewForm · GateChecklist · TraceMiniMap · PomoEstimator · CalendarCommitter
ExceptionCaptureBar
```

### 11.3 Organisms

```
StrategyCaseCockpit · EvidenceInbox · ArtifactViewBuilder · MCGCSMap · ChoiceCascadeCanvas
BetBoard · PlanningBoard · ExecutionRunbook · PomoLedger · DaynoteLedger
ValueRealizationPanel · TraceExplorer · AgentDraftInbox
```

The same node renders differently depending on context (e.g. a `strategy_bet` node appears as a card on the Bet Board, a section in the SLD, a dependency in the EDS, a validation target in the VSD, a node in the trace graph, a calendar-linked commitment source).

### 11.4 Core UX patterns

- **Commitment Card** — title, linked strategy object, why it matters, estimated cost, scheduled slot, expected output, evidence required, status, post-block review status, actual vs estimated, next action.
- **Value Ledger** — time committed/spent/missed by case, artifact, bet, outcome; evidence produced per hour; validated learning per hour; value claims supported.
- **Proof Burden panel** (every artifact answers): *What supports this? What contradicts this? What is assumed? What would change our mind? What remains unverified?*
- **Honest, non-punitive language** ("This timebox was missed. This may indicate hidden friction. What should change?"). Never shame UX.

---

## 12. Scope

### 12.1 MVP in (core spine, must work end-to-end)

```
Notes substrate (markdown nodes, refs, backlinks, tags, clones, daynotes)
→ evidence (source, chunk, item, accept gate, contradiction)
→ strategy case + ERD/ORD/SLD/Choice/Bet/EDS/VSD/VRD as generated views
→ bet approval gate (INV-BET)
→ work package (INV-WORK)
→ pomo estimate + internal timebox + ICS export (INV-TIME)
→ execution mode + post-block review (INV-REVIEW)
→ value claim (INV-VALUE)
→ trace explorer source→value
→ daynote ledger
→ agent draft quarantine (INV-HUMAN)
```

### 12.2 MVP out (deferred, behind contracts or post-MVP)

- Live two-way Google/Outlook/iCloud sync (internal + ICS first).
- CalDAV/iCloud reliability work (spike first).
- Multi-user collaboration.
- Fully autonomous agent runs (agents draft; humans approve — always).
- Strategy library / reusable patterns.
- Multi-agent dialectic (a later "Critique and Dialectic" capability).
- Live NotebookLM connector (import/export first).

### 12.3 Non-goals (explicit)

- A generic PKM app with strategy templates bolted on.
- A chatbot.
- A mechanical project manager.
- Anything that rewards filled sections instead of passed gates.

---

## 13. First vertical slice (integration proof)

This slice proves the whole spine end-to-end and is the integration test for every layer. (Operational definition lives in PLAN §15.)

```
Create strategy_case node
 → create source node
 → create evidence_item node linked to source
 → accept evidence through gate                          [INV-EVID]
 → create strategic_claim linked to evidence             [INV-CLAIM]
 → create strategy_bet linked to claim
 → FAIL approval gate (missing assumptions/metrics/kill) [INV-BET]
 → add required bet fields
 → approve bet and create SDR
 → create work_package linked to bet                     [INV-WORK]
 → define inputs, outputs, tools, technique, exception policy
 → estimate pomo cost
 → create internal timebox                               [INV-TIME]
 → export ICS file
 → execute timebox
 → capture exception / review                            [INV-EXEC]
 → attach evidence
 → verify timebox                                        [INV-REVIEW]
 → create value_claim                                    [INV-VALUE]
 → show trace from source to value claim
 → show daynote ledger for the day
```

Pass condition: notes → evidence → strategy → decision → work package → timebox → execution review → value claim → daynote ledger, all backend-gated, all reconstructable from markdown alone.

---

## 14. Open questions

Tracked in full in `PLAN.md` §11 and `.agents/open_questions.md` (created Phase 0). Summary with recommended MVP choices:

| ID | Topic | Recommended MVP choice |
|----|---|---|
| OQ-001 | Markdown schema for typed strategy edges | **A:** frontmatter (easier to parse/test). |
| OQ-002 | Calendar integration level | **B:** internal timeboxes + ICS export. |
| OQ-003 | Pomo customization | **C:** fixed 25/5 + deep-work preset. |
| OQ-004 | Materialized artifacts vs generated views | **C:** materialized markdown views with protected generated sections. |
| OQ-005 | External file edit activity | **A:** count as modifications with event-source metadata. |
| OQ-006..010 | node grouping, plan/exec UX boundary, edit conflicts, agent autonomy ceiling | decide as the relevant phase approaches. |

---

## 15. Fidelity checklist (run before claiming any slice done)

```
1. Which PRD/SDS/INV/TST IDs does this satisfy?
2. Which invariants could it violate?
3. Which tests or checks prove fidelity?
4. What evidence was produced?
5. What remains unverified?
```

If implementation pressure conflicts with this spec: do **not** silently adapt either side. Create an `OPEN_QUESTION` naming the affected IDs and continue only on independent work.
