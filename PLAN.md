# StrategyNotes Evidence-Based Agent Implementation Plan

Status: Draft v1

Owner: Sam Prime

Spec: `SPEC.md` — StrategyNotes Specification

Date: 2026-06-21

Implementation target: Local-first desktop application; recommended target is Tauri with Rust core, SQLite derived index, markdown vault source of truth, and TSRX-powered frontend components.

Primary outcome:

StrategyNotes is a local-first, markdown-native strategic knowledge and execution application. It merges notes, evidence, strategic reasoning, decision records, work packages, pomodoro-based time commitments, calendar-backed execution, post-timebox review, validation, and value realization into one linked graph of durable markdown nodes. The implementation must preserve markdown as the source of truth, use SQLite only as a rebuildable derived index, and require evidence for claims and timeboxed commitment for execution.

Non-negotiable success condition:

```text
The implementation must remain coherent with the spec.
A slice is not done because an agent says it is done.
A slice is done only when the agreed evidence passes.

No strategy-critical state may live only in SQLite.
No accepted claim may lack provenance.
No committed work may lack a timebox.
No verified execution may lack post-block review or evidence.
```

---

## 0. Planning Contract

Agents must follow this plan in dependency order.

Agents must not optimize for finishing tasks at the expense of spec fidelity.

Required behavior:

* Build the local-first markdown node substrate before strategy-specific workflows.
* Preserve markdown files as the durable source of truth.
* Treat SQLite as a rebuildable derived cache only.
* Build shared contracts before dependent behavior.
* Use TDD for known behavior slices.
* Use evidence gates before marking work complete.
* Keep workstreams MECE.
* Run autonomous loops only against machine-checkable or review-checkable criteria.
* Preserve invariants even when tests are incomplete.
* Do not let optional features block core conformance.
* Do not implement behavior that lacks a linked PRD, SDS, invariant, or test.
* If behavior is ambiguous, record an open question instead of inventing policy.
* If an agent changes shared contracts, dependent agents must be notified before continuing.
* Agent outputs must enter draft/review states, not accepted artifacts.
* All execution objects must move through work package, pomo estimate, calendar commitment, execution review, and evidence verification.

Primary dependency chain:

```text
Spec interpretation
→ shared contracts
→ test and verification harness
→ markdown node substrate
→ graph, refs, branches, daynotes
→ strategy domain objects
→ evidence and traceability
→ gates and state transitions
→ work packages and pomo timeboxes
→ calendar adapters
→ execution/review loop
→ value realization
→ observability
→ conformance and fidelity review
```

Definition of plan success:

```text
Every core PRD is implemented or explicitly deferred.
Every invariant has direct verification.
Every major failure mode has a test or evidence record.
Every workstream has clear ownership.
Every parallel branch has an integration checkpoint.
Every "done" claim is backed by command output, tests, review notes, trace evidence, or smoke-test evidence.
```

---

## 1. Source of Truth and Fidelity Rules

### Source-of-truth order

When documents conflict, use this order:

```text
1. Safety invariants
2. Durable storage rules
3. StrategyNotes PRD outcome requirements
4. StrategyNotes SDS behavior rules
5. Test definitions
6. This implementation plan
7. Agent notes, generated summaries, or UI drafts
```

Agent summaries are never a source of truth.

### Spec ID map

Agents MUST link work to these IDs.

#### Product Requirements

```text
PRD-001  Local-first markdown-native node graph
PRD-002  Every outline item is a first-class node/page
PRD-003  Markdown files are durable source of truth
PRD-004  SQLite index is derived and rebuildable
PRD-005  Bidirectional linking, backlinks, tags, and typed edges
PRD-006  Multi-parent cloning / equal placements
PRD-007  Automated daynote activity capture
PRD-008  Strategy case objects and case cockpit
PRD-009  Evidence Reality Dossier / ERD
PRD-010  Outcome Requirement Document / ORD
PRD-011  Strategic Logic Document / SLD
PRD-012  Execution Design Specification / EDS
PRD-013  Validation Strategy Document / VSD
PRD-014  Value Realization Document / VRD
PRD-015  Strategy Decision Records / SDRs
PRD-016  Actor, ranking, and MCGCS position modeling
PRD-017  Choice cascade and strategy bet builder
PRD-018  Work packages with inputs, outputs, tools, techniques, and exception policy
PRD-019  Pomodoro-based time cost estimation
PRD-020  Calendar-backed timebox commitments
PRD-021  Low-decision execution mode
PRD-022  Post-timebox review and learning capture
PRD-023  Evidence-gated verification of work
PRD-024  Daynote value ledger
PRD-025  Calendar adapter layer: internal, ICS, Google, Outlook, iCloud
PRD-026  Agent draft quarantine and human approval
PRD-027  Atomic/TSRX UI component system
PRD-028  Trace explorer from source to value claim
PRD-029  Import/export of case records and markdown vault
PRD-030  Offline-first operation with optional sync outside the core
```

#### Software Design Specification IDs

```text
SDS-NODE      Node, branch, ref, tag, property, daynote, activity model
SDS-STORAGE   Markdown vault storage and deterministic serialization
SDS-INDEX     SQLite derived index and rebuild process
SDS-GRAPH     Graph service, backlinks, clones, typed edges
SDS-DAY       Daynote and activity ledger service
SDS-STRAT     Strategy domain object model
SDS-EVID      Evidence item, source, provenance, proof level, contradiction
SDS-GATE      Gate engine and state transition validation
SDS-WORK      Work package model
SDS-TIME      Pomo, timebox, calendar commitment, review model
SDS-CAL       Calendar adapters and ICS export/import
SDS-UI        Atomic/TSRX UI component architecture
SDS-EXEC      Execution mode, exception capture, discretionary task handling
SDS-AGENT     Agent run model, draft quarantine, human review
SDS-TRACE     Traceability and provenance traversal
SDS-OBS       Logs, snapshots, audit trail, runtime evidence
SDS-ERR       Error categories and operator-visible failures
```

#### Invariants

```text
INV-DUR       Markdown is source of truth; index loss cannot lose user data.
INV-ID        Every node has stable identity and path mapping.
INV-CLONE     Clones are equal placements; no clone-induced cycles.
INV-DAY       Daynotes are activity records, not manually fabricated proof.
INV-BODY      Body parsing is authoritative for inline refs/tags.
INV-EDGE      Strategy-critical relationships must be reconstructable from markdown/frontmatter.
INV-EVID      No accepted evidence without source/provenance or explicit manual basis.
INV-CLAIM     No accepted claim without proof level and evidence status.
INV-CONTRA    Counterevidence and contradiction must not be silently discarded.
INV-HUMAN     Agents may draft, critique, or suggest; humans approve.
INV-BET       No approved strategy bet without assumptions, counterevidence review, success metric, kill criteria, owner.
INV-WORK      No committed work without work package.
INV-TIME      No committed work without estimated pomo cost and calendar timebox.
INV-EXEC      Execution mode must capture exceptions without forcing strategy decisions mid-execution.
INV-REVIEW    No verified timebox without post-block review.
INV-VALUE     No value claim without proof level and evidence links.
INV-CAL       Calendar provider failure must not corrupt local StrategyNotes state.
INV-PORT      Strategy-critical data must remain portable and inspectable in markdown.
```

#### Test Categories

```text
TST-STORAGE   Markdown parse/serialize/rebuild tests
TST-GRAPH     Link/backlink/clone/edge tests
TST-DAY       Daynote capture and scheduling tests
TST-EVID      Evidence acceptance/rejection/provenance tests
TST-GATE      Gate pass/fail tests
TST-STRAT     Strategy artifact and case lifecycle tests
TST-WORK      Work package input/output/tool/method tests
TST-TIME      Pomo/timebox/state transition tests
TST-CAL       Calendar adapter contract tests
TST-EXEC      Execution mode and exception capture tests
TST-REVIEW    Post-block review tests
TST-VALUE     Value claim and VRD tests
TST-AGENT     Agent draft quarantine tests
TST-TRACE     Source-to-value trace tests
TST-OBS       Logs, audit, snapshot tests
```

### Fidelity rule

For every implementation slice, the agent must answer:

```text
Which PRD/SDS/INV/TST IDs does this satisfy?
Which invariants could this violate?
Which tests or checks prove fidelity?
What evidence was produced?
What remains unverified?
```

### Drift rule

If implementation pressure conflicts with the spec:

```text
Do not silently adapt the spec.
Do not silently adapt the implementation.
Create an OPEN_QUESTION with affected IDs.
Continue only on independent work.
```

Pre-seeded open questions:

```text
OQ-001  Exact markdown/frontmatter schema for typed strategy edges.
OQ-002  Whether StrategyNotes uses one file per node or allows grouped child nodes in one file.
OQ-003  Calendar sync level for MVP: internal only, ICS export, or one-way Google/Outlook push.
OQ-004  Default pomo pattern: fixed 25/5 or user-configurable in MVP.
OQ-005  How iCloud Calendar integration is handled: CalDAV, ICS only, or deferred.
OQ-006  Whether strategy artifacts are materialized markdown nodes, generated views, or both.
OQ-007  Exact UX boundary between planning mode and execution mode.
OQ-008  Whether external file edits generate strategy review events automatically.
OQ-009  Conflict resolution policy for simultaneous in-app and external file edits.
OQ-010  Agent autonomy ceiling for MVP.
```

---

## 2. Evidence Model

### Evidence types

Use these evidence types:

```text
EV-TST     Passing test output
EV-TYP     Typecheck output
EV-LINT    Lint/static analysis output
EV-BLD     Build output
EV-CT      Contract test output
EV-SMOKE   External smoke-test output
EV-DIFF    Diff review notes
EV-TRACE   Traceability review
EV-LOG     Runtime log evidence
EV-SKIP    Explicit skipped-test reason
EV-MAN     Manual review note
EV-SRC     Source/provenance evidence
EV-ICS     Calendar/ICS file output evidence
EV-CAL     Calendar provider integration evidence
EV-UI      UI screenshot or component snapshot evidence
EV-AUDIT   Audit trail or activity ledger evidence
```

### Evidence record format

Add one evidence record per completed slice in `EVIDENCE.md`.

````markdown
## EV-{{ID}} — {{TITLE}}

Date:
{{YYYY-MM-DD}}

Agent:
{{AGENT_NAME}}

Slice:
{{SLICE_ID}}

Spec IDs:
- PRD-{{ID}}
- SDS-{{ID}}
- INV-{{ID}}
- TST-{{ID}}

Commands run:
```bash
{{COMMAND_1}}
{{COMMAND_2}}
````

Result:

```text
{{PASTE_RELEVANT_OUTPUT_OR_SUMMARY}}
```

Files changed:

* {{FILE_1}}
* {{FILE_2}}

Fidelity notes:
{{HOW_THIS_MATCHES_THE_SPEC}}

Remaining gaps:
{{WHAT_IS_NOT_YET_VERIFIED}}

Status:
{{Accepted | Needs Review | Rejected | Blocked}}

````

### Minimum evidence by slice type

For pure logic:

```text
Unit tests + typecheck
````

For state transitions:

```text
Unit tests + transition/failure tests + trace review
```

For safety invariants:

```text
Negative tests + positive tests + review of dangerous edge cases
```

For external integrations:

```text
Contract tests with mocks + smoke test or explicit EV-SKIP reason
```

For calendar integrations:

```text
ICS output validation or provider contract test + no-local-data-loss test
```

For UI components:

```text
Component tests + screenshot/snapshot evidence + accessibility check where applicable
```

For strategy gates:

```text
Positive pass test + blocked gate test + trace to affected PRD/SDS/INV
```

For observability:

```text
Log/snapshot assertion tests + sample output
```

---

## 3. Dependency Order

### Phase 0 — Project skeleton and verification harness

Must happen first.

Owns:

* Repository structure
* Tauri/Rust core scaffold or selected implementation shell
* Frontend app scaffold
* Test framework
* Typecheck/lint/build commands
* `SPEC.md`
* `PLAN.md`
* `AGENT_STATE.md`
* `EVIDENCE.md`
* `OPEN_QUESTIONS.md`
* `CHANGELOG.md`
* Shared command list

Outputs:

* Buildable empty app
* One no-op command or service call
* Working test command
* Working typecheck/build command

Evidence required:

* EV-BLD or EV-TST showing harness runs
* EV-TRACE showing initial PRD/SDS/INV/TST map

---

### Phase 1 — Shared contracts and types

Depends on:

* Phase 0

Owns:

* Node, Branch, Ref, Tag, Property, Daynote, ActivityEntry
* TypedEdge
* StrategyCase
* StrategyArtifact
* EvidenceItem
* OutcomeRequirement
* StrategicClaim
* StrategyBet
* WorkPackage
* PomoEstimate
* Timebox
* TimeboxReview
* DecisionRecord
* ValueClaim
* OpenQuestion
* Risk
* AgentRun
* GateResult
* Error categories
* Adapter interfaces
* Event shapes

Why this is early:

```text
Parallel agents need stable contracts.
Without this phase, later agents create incompatible local models.
```

Evidence required:

* EV-TYP across shared types
* EV-CT for serialization and adapter interfaces
* EV-TRACE linking contracts to SDS IDs

---

### Phase 2 — Markdown storage and serialization rules

Depends on:

* Phase 1

Owns:

* Markdown file format
* Frontmatter schema
* Deterministic serialization
* Unknown-key preservation
* ULID/path identity
* Inline links and refs
* Tag parsing
* Typed edge encoding in frontmatter or markdown
* Strategy object storage format
* Work package and timebox storage format

Why this is early:

```text
StrategyNotes must remain portable.
If the markdown contract is weak, the rest of the app becomes database-dependent.
```

Evidence required:

* TST-STORAGE parse/serialize tests
* TST-GRAPH inline ref/tag tests
* TST-STORAGE unknown-key preservation tests
* EV-TRACE for INV-DUR, INV-PORT, INV-EDGE

---

### Phase 3 — SQLite index and rebuild contract

Depends on:

* Phase 2

Owns:

* SQLite schema
* Derived tables for nodes, branches, refs, typed_edges, evidence, strategy objects, timeboxes, daynotes
* Rebuild from markdown
* Missing/corrupt index recovery
* Search index if selected
* Index schema versioning

Why this comes before domain workflows:

```text
Strategy workflows require fast queries, but the index must remain disposable.
```

Evidence required:

* Rebuild equivalence tests
* Corrupt index recovery tests
* Index loss no-data-loss test
* EV-TRACE for INV-DUR

---

### Phase 4 — Graph service and activity/daynote service

Depends on:

* Phase 2
* Phase 3

Owns:

* Node create/update/delete
* Branch placement
* Multi-parent clone behavior
* Backlinks
* Typed edge traversal
* Daynote lazy creation
* Activity entries on create/modify
* Scheduled node appearance
* Daynote activity rendering

Evidence required:

* Clone edit/delete tests
* Cycle rejection tests
* Backlink and typed-edge tests
* Daynote creation/activity tests
* Scheduling tests
* EV-TRACE for INV-CLONE, INV-DAY, INV-EDGE

---

### Phase 5 — Strategy domain model and case lifecycle

Depends on:

* Phase 4

Owns:

* Strategy case creation
* Case Charter
* Case phase states
* ERD/ORD/SLD/EDS/VSD/VRD artifact objects
* Artifact generation as views over linked nodes
* Strategy case cockpit data model
* Actor, ranking, and MCGCS models
* Choice cascade model
* Strategy decision records

Evidence required:

* Case lifecycle tests
* Artifact view generation tests
* Actor/ranking/MCGCS tests
* SDR creation tests
* EV-TRACE from PRD-008 through PRD-017

---

### Phase 6 — Evidence, claims, contradiction, and traceability

Depends on:

* Phase 5

Owns:

* Source and source chunk objects
* Evidence extraction drafts
* Evidence acceptance/rejection
* Proof levels
* Claim states
* Contradiction linking
* Source-to-value trace traversal
* Evidence rail data model
* Trace explorer backend

Evidence required:

* Evidence state transition tests
* Claim acceptance gate tests
* Counterevidence visibility tests
* Trace traversal tests
* EV-SRC and EV-TRACE evidence records

---

### Phase 7 — Gate engine

Depends on:

* Phase 5
* Phase 6

Owns:

* Gate definition model
* Gate check engine
* Case phase transition gates
* Evidence acceptance gates
* Strategy bet approval gates
* Work package commitment gates
* Timebox verification gates
* Value claim validation gates
* Backend-owned gate enforcement

Evidence required:

* Gate pass tests
* Gate blocked tests
* API or service contract tests
* EV-TRACE for every INV gate

---

### Phase 8 — Work package planning model

Depends on:

* Phase 7

Owns:

* WorkPackage object
* Inputs/ingredients map
* Expected outputs/artifacts/results map
* Tools required
* Techniques/methods
* Exception policy
* Capture rule
* Review prompt
* Discretionary task model
* CMMN-style sentries/triggers/milestones

Evidence required:

* Work package validation tests
* Missing input/output/tool/method blocked tests
* Discretionary task tests
* Exception capture tests
* EV-TRACE for PRD-018, SDS-WORK, SDS-EXEC

---

### Phase 9 — Pomodoro timebox and capacity model

Depends on:

* Phase 8

Owns:

* PomoEstimate
* Default 25/5 pomo pattern
* Configurable pomo pattern if selected
* Deep Work Packet model: recommended 6 pomos / about 3 hours with breaks
* Timebox states
* Capacity budgets
* Pomo ledger
* Actual vs estimated cost
* Missed/rescheduled/blocked state handling

Evidence required:

* Pomo estimate tests
* Timebox state transition tests
* Capacity infeasibility tests
* Missed/rescheduled review tests
* EV-TRACE for PRD-019 through PRD-024

---

### Phase 10 — Calendar adapters

Depends on:

* Phase 9

Owns:

* Internal StrategyNotes calendar
* ICS export
* ICS import if selected
* Google Calendar adapter
* Outlook/Microsoft 365 Calendar adapter
* iCloud/CalDAV adapter if selected
* Provider error handling
* External event ID mapping
* Calendar sync reconciliation

MVP recommendation:

```text
Build internal timeboxes and ICS export first.
Do not make Google, Outlook, or iCloud required for core correctness.
```

Evidence required:

* ICS file generation test
* Adapter contract tests
* Calendar provider smoke tests or EV-SKIP
* Local state preserved when provider fails
* EV-TRACE for INV-CAL

---

### Phase 11 — Execution mode and review loop

Depends on:

* Phase 8
* Phase 9

Owns:

* Low-decision execution runbook UI/backend
* Active timebox start/end
* Inputs checklist
* Step/method display
* Expected output display
* Exception capture bar
* Idea/blocker/deviation capture
* Evidence attachment
* Post-timebox review
* Hypothesis update
* Next action decision

Evidence required:

* Execution mode state tests
* Exception capture tests
* Post-block review required tests
* Verification blocked without review tests
* EV-TRACE for INV-EXEC and INV-REVIEW

---

### Phase 12 — StrategyNotes UI system

Depends on:

* Phase 5 through Phase 11 contracts

Owns:

* Atomic UI component library
* Strategy case cockpit
* Evidence inbox
* Artifact view builder
* MCGCS map
* Choice cascade canvas
* Bet board
* Planning board
* Execution runbook
* Pomo ledger
* Daynote ledger
* Trace explorer
* Value realization panel
* Agent draft inbox
* TSRX rendering integration

Evidence required:

* Component tests
* UI snapshot evidence
* Manual review or screenshot evidence
* Accessibility checks for critical flows
* EV-TRACE for SDS-UI

---

### Phase 13 — Agent draft and review system

Depends on:

* Phase 6
* Phase 7
* Phase 12

Owns:

* AgentRun object
* Agent input/output capture
* Draft quarantine
* Human accept/reject/split/merge controls
* Agent prompt templates
* Agent trace links
* Agent failure/error categories
* Agent authority limits

Evidence required:

* Agent draft never auto-accepted test
* Human approval transition test
* Agent output trace test
* EV-TRACE for PRD-026, SDS-AGENT, INV-HUMAN

---

### Phase 14 — Value realization and review

Depends on:

* Phase 7
* Phase 9
* Phase 11

Owns:

* ValueClaim object
* VRD view
* Before/after comparison
* Proof level
* Stakeholder value map
* Lessons learned
* Strategy review record
* Framework evolution note
* Case close gate

Evidence required:

* Value claim blocked without proof test
* VRD generation test
* Case close blocked without review test
* Lessons learned capture test
* EV-TRACE for PRD-014, PRD-024, INV-VALUE

---

### Phase 15 — Observability and conformance

Depends on:

* Phases 0 through 14

Owns:

* Structured logs
* Audit trail
* Runtime snapshot
* Evidence dashboard
* Full regression suite
* Traceability review
* Orphan code check
* Known limitations
* Final fidelity review

Evidence required:

* Full test suite
* Typecheck/lint/build
* Log/snapshot tests
* Fidelity review records
* EV-SMOKE for full vertical slice

---

## 4. MECE Workstreams

### Workstream A — Foundation and contracts

Mission:

Create the shared app substrate every other agent depends on.

Owns:

* Project skeleton
* Test harness
* Typecheck/build/lint commands
* Shared domain types
* Error categories
* Adapter interfaces
* Event shapes
* Agent state/evidence files

Does not own:

* Strategy behavior
* Calendar provider behavior
* UI implementation

Blocks:

* All downstream implementation

Evidence required:

* Empty test harness passes
* Shared contracts compile
* Contract tests exist for important interfaces

---

### Workstream B — Markdown vault and serialization

Mission:

Make markdown the durable source of truth.

Owns:

* Markdown frontmatter schema
* Deterministic serialization
* Node identity
* Inline refs/tags
* Typed edge persistence
* Unknown-key preservation
* Atomic file writes

Does not own:

* SQLite query behavior
* Strategy gate policy
* UI rendering

Blocks:

* Index
* Graph
* Strategy domain objects

Evidence required:

* Parse/serialize tests
* Round-trip tests
* Rebuild compatibility tests

---

### Workstream C — Index and graph services

Mission:

Provide fast derived graph queries without becoming the source of truth.

Owns:

* SQLite schema
* Rebuild process
* Ref/backlink resolution
* Typed edge traversal
* Branch/clone behavior
* Daynote indexing

Does not own:

* Markdown schema decisions
* Strategy semantics

Blocks:

* Evidence trace
* Case cockpit
* Daynote ledger

Evidence required:

* Rebuild tests
* Clone tests
* Backlink/edge tests

---

### Workstream D — Strategy domain model

Mission:

Define strategy-native objects as typed notes.

Owns:

* StrategyCase
* ERD/ORD/SLD/EDS/VSD/VRD
* SDR
* Actor/ranking/MCGCS
* Choice cascade
* Strategy bet
* Experiment/metric/value claim

Does not own:

* Work package/timebox execution
* Calendar adapters

Blocks:

* Gate engine
* Case cockpit
* Value realization

Evidence required:

* Domain object tests
* Artifact view tests
* Strategy lifecycle tests

---

### Workstream E — Evidence and traceability

Mission:

Make claims accountable to source reality.

Owns:

* Source/source chunk
* Evidence item
* Evidence status
* Proof levels
* Contradiction linking
* Trace traversal
* Evidence rail

Does not own:

* Strategy document rendering
* Calendar state

Blocks:

* Claim gates
* Bet approval
* Value realization

Evidence required:

* Evidence state tests
* Trace tests
* Counterevidence tests

---

### Workstream F — Gate engine

Mission:

Make progress claims backend-enforced.

Owns:

* Gate definitions
* Gate engine
* Approval state transitions
* Blocked gate reporting
* Gate API/service

Does not own:

* UI display only
* Domain object storage

Blocks:

* Bet approval
* Work commitment
* Timebox verification
* Value claims

Evidence required:

* Gate pass/fail tests
* Contract tests
* Invariant trace review

---

### Workstream G — Work package and CMMN execution planning

Mission:

Separate planning from execution.

Owns:

* Work packages
* Inputs/ingredients
* Outputs/artifacts/results
* Tools/techniques
* Exception policies
* Discretionary tasks
* Sentries/triggers/milestones
* Capture rules

Does not own:

* Calendar provider integration
* Strategy artifact schema

Blocks:

* Timeboxing
* Execution mode

Evidence required:

* Work package validation tests
* Exception policy tests
* Discretionary task tests

---

### Workstream H — Pomo, timebox, and capacity ledger

Mission:

Make time cost explicit.

Owns:

* Pomo estimate
* Timebox states
* Capacity budget
* Value/time ledger
* Actual vs estimate
* Missed/rescheduled/blocker states
* Review-required state

Does not own:

* External calendar providers
* Strategy claim logic

Blocks:

* Calendar integration
* Execution mode

Evidence required:

* Timebox state tests
* Capacity tests
* Review required tests

---

### Workstream I — Calendar adapters

Mission:

Connect commitments to real calendars without corrupting local state.

Owns:

* Internal calendar
* ICS export
* ICS import if selected
* Google Calendar adapter
* Outlook adapter
* iCloud/CalDAV adapter if selected
* Provider error mapping

Does not own:

* Local timebox source of truth
* Work package planning

Blocks:

* External calendar sync

Evidence required:

* ICS tests
* Adapter contract tests
* Smoke tests or EV-SKIP

---

### Workstream J — Execution and review UX

Mission:

Support low-decision execution and disciplined learning.

Owns:

* Execution runbook
* Active timebox view
* Exception capture
* Evidence attachment
* Post-block review
* Hypothesis update
* Next action decision

Does not own:

* Strategy planning logic
* Calendar provider sync

Blocks:

* Verified execution
* Learning loop

Evidence required:

* Execution flow tests
* Review tests
* UI evidence

---

### Workstream K — UI component system

Mission:

Build reusable StrategyNotes UI from atomic components.

Owns:

* Atoms
* Molecules
* Organisms
* Templates
* TSRX renderers
* Case cockpit
* Evidence inbox
* Bet board
* Planning board
* Daynote ledger
* Trace explorer

Does not own:

* Backend gate authority
* Storage persistence rules

Blocks:

* User-facing workflows

Evidence required:

* Component tests
* Snapshot/UI evidence
* Manual review notes

---

### Workstream L — Agent draft and governance

Mission:

Keep agent outputs useful but bounded.

Owns:

* AgentRun
* Draft quarantine
* Human review controls
* Prompt generation
* Agent trace links
* Agent failure handling

Does not own:

* Human approval policy itself
* Core storage rules

Blocks:

* Safe AI-assisted workflows

Evidence required:

* Draft quarantine tests
* Human approval tests
* Agent trace tests

---

### Workstream M — Observability and conformance

Mission:

Prove the implementation matches the spec.

Owns:

* Logs
* Runtime snapshots
* Audit trail
* Evidence dashboard
* Full test suite
* Traceability review
* Fidelity review
* Known limitations

Does not own:

* New feature implementation unless explicitly assigned

Blocks:

* Release

Evidence required:

* Full evidence bundle
* Remaining gaps list
* Final acceptance decision

---

## 5. Parallelization Rules

### Safe to parallelize early

These can run once skeleton and shared contracts exist:

* Markdown parse/serialize
* ULID/path identity
* Typed edge schema design
* Pure validation rules
* Error categories
* Logging format
* Component stubs

Why:

```text
They are mostly pure or interface-bound.
They do not mutate shared runtime state.
```

### Safe to parallelize later

These can run once core interfaces are stable:

* UI components behind stable domain contracts
* Calendar adapters behind timebox contract
* Agent draft workflow behind review contract
* Observability snapshot
* ICS export
* Import/export

Why:

```text
They depend on contracts but do not own central state transitions.
```

### Do not aggressively parallelize

Keep these tightly coordinated:

* Markdown/frontmatter schema
* SQLite schema
* Node identity model
* Gate engine
* Timebox state machine
* Strategy bet approval logic
* Daynote/activity logging
* Calendar sync reconciliation
* Shared type/interface changes

Why:

```text
These areas create correctness bugs when multiple agents make local assumptions.
```

### Parallel agent handoff rule

Before one agent depends on another agent’s work, require:

```text
- Interface name and location
- Example input/output
- Failure behavior
- Test command
- Evidence record
- Known limitations
```

---

## 6. TDD Strategy

### Red-Green-Refactor Loop

For each slice:

```text
1. Pick one PRD/SDS/INV behavior.
2. Write the smallest failing test.
3. Implement the smallest passing code.
4. Add failure-path tests.
5. Refactor without changing behavior.
6. Run related invariant tests.
7. Record evidence.
```

### Example TDD slices

#### Slice S-STORAGE-001 — Markdown node round-trip

Spec links:

* PRD-001
* PRD-003
* SDS-STORAGE
* INV-DUR
* INV-PORT

Dependency:

* Phase 1 shared types

Test first:

* TST-STORAGE-001 — parse node markdown with frontmatter and body, serialize it, parse again, and prove equivalent domain state.

Failure cases:

* Missing required ID
* Invalid frontmatter
* Unknown frontmatter keys
* Malformed typed edge list

Evidence:

* EV-TST
* EV-TYP
* EV-TRACE

Done when:

* Round-trip test passes.
* Invalid input tests pass.
* Evidence is recorded.

---

#### Slice S-EVID-001 — Evidence cannot be accepted without provenance

Spec links:

* PRD-009
* SDS-EVID
* INV-EVID
* TST-EVID

Dependency:

* Source and EvidenceItem contracts

Test first:

* TST-EVID-001 — evidence item with no source link and no manual basis cannot move to Accepted.

Failure cases:

* Missing source
* Source exists but unresolved
* Manual basis missing reviewer

Evidence:

* EV-TST
* EV-TRACE

Done when:

* Acceptance gate blocks invalid evidence.
* Valid evidence can be accepted.
* Evidence record exists.

---

#### Slice S-BET-001 — Strategy bet approval gate

Spec links:

* PRD-017
* SDS-GATE
* INV-BET
* TST-GATE

Dependency:

* Evidence, Claim, StrategyBet, GateResult contracts

Test first:

* TST-GATE-001 — bet cannot be approved without linked choice, evidence basis, assumptions, counterevidence review, success metric, kill criteria, and owner.

Evidence:

* EV-TST
* EV-TRACE

Done when:

* Missing each required field produces a typed failed gate.
* Valid bet produces accepted gate result and SDR.

---

#### Slice S-WORK-001 — Work package must define action ingredients

Spec links:

* PRD-018
* SDS-WORK
* INV-WORK
* TST-WORK

Dependency:

* WorkPackage contract

Test first:

* TST-WORK-001 — work package cannot move to Ready unless objective, inputs, outputs, tools, technique, exception policy, and evidence requirement exist.

Evidence:

* EV-TST
* EV-TRACE

---

#### Slice S-TIME-001 — No commitment without pomo estimate and timebox

Spec links:

* PRD-019
* PRD-020
* SDS-TIME
* INV-TIME
* TST-TIME

Dependency:

* WorkPackage Ready state

Test first:

* TST-TIME-001 — work package cannot move to Committed unless it has estimated pomos, scheduled start/end, owner, expected output, and evidence requirement.

Evidence:

* EV-TST
* EV-TRACE

---

#### Slice S-REVIEW-001 — No verified timebox without post-block review

Spec links:

* PRD-022
* PRD-023
* SDS-TIME
* INV-REVIEW
* TST-REVIEW

Dependency:

* Timebox state machine

Test first:

* TST-REVIEW-001 — executed timebox cannot move to Verified unless a review exists with actual pomos, output summary, evidence link or explicit no-evidence reason, and next action decision.

Evidence:

* EV-TST
* EV-TRACE

---

### When not to use strict TDD

Strict TDD may be inappropriate when:

* Exploring unknown calendar provider API behavior.
* Investigating Tauri/WebView platform behavior.
* Testing iCloud/CalDAV reliability.
* Designing first-pass visual layout.

Use a spike:

```markdown
### SPIKE-{{ID}} — {{TITLE}}

Question:
{{WHAT_NEEDS_TO_BE_LEARNED}}

Time/iteration budget:
{{LIMIT}}

Evidence required:
- Notes
- Minimal reproduction
- Recommendation
- Affected spec IDs

Exit:
- Convert findings into tests and implementation tasks.
- Do not merge spike code unless cleaned and tested.
```

---

## 7. Ralph-Style Agent Loop With Evidence Gates

### Loop contract

The agent may continue autonomously only while all are true:

* The next task is linked to specific spec IDs.
* The completion condition is checkable.
* The agent has a command or review criterion for verification.
* The loop has a stop condition.
* The loop records evidence after each iteration.
* The loop does not modify shared contracts without explicit handoff.

### Loop state files

Use these files:

```text
AGENT_STATE.md
EVIDENCE.md
OPEN_QUESTIONS.md
CHANGELOG.md
```

### Agent loop prompt pattern

```text
You are implementing StrategyNotes according to SPEC.md and PLAN.md.

Your current task is:
{{TASK}}

Relevant IDs:
- PRD-{{ID}}
- SDS-{{ID}}
- INV-{{ID}}
- TST-{{ID}}

Rules:
- Do not implement behavior outside these IDs.
- Write or update the test first when behavior is known.
- Run the verification commands.
- Record evidence in EVIDENCE.md.
- Update AGENT_STATE.md with next task or blocker.
- If the spec is ambiguous, add an OPEN_QUESTION and stop this slice.
- Do not mark the task complete without evidence.
- Do not store strategy-critical data only in SQLite.
- Do not allow agent output to bypass human review.
- Do not mark work committed without a pomo estimate and calendar timebox.
- Do not mark execution verified without post-block review.

Stop when:
- The slice is verified, or
- You are blocked by ambiguity, or
- An invariant test fails, or
- You need to change a shared contract, or
- The same test fails twice without new information.
```

### Loop iteration checklist

Each iteration must produce:

* A diff
* A test or verification update
* Command output
* Evidence record
* Updated agent state
* Clear next action or blocker

### Loop anti-patterns

Do not allow:

* “All tasks complete” without evidence.
* Rewriting the spec to match implementation.
* Skipping tests because the code looks correct.
* Continuing after invariant failure.
* Parallel agents editing the same contract.
* Ambiguous work inside an autonomous loop.
* Massive refactors without slice-level verification.
* Accepting agent-generated strategy claims without human review.
* Treating calendar sync as the source of truth.

---

## 8. Auto-Research and Spike Loops

### When auto-research is allowed

Use auto-research for:

* Current Tauri behavior
* Current SQLite/FTS behavior
* Current Google Calendar API behavior
* Current Microsoft Graph Calendar API behavior
* iCloud/CalDAV feasibility
* ICS file format edge cases
* TSRX runtime behavior
* Local filesystem watcher behavior
* Markdown parsing libraries
* ULID library monotonicity

Do not use auto-research for:

* Inventing product intent
* Overriding explicit spec decisions
* Replacing tests
* Expanding scope

### Auto-research loop

```text
1. State the research question.
2. Link affected spec IDs.
3. Identify authoritative sources.
4. Extract only implementation-relevant facts.
5. Convert facts into a decision, test, or open question.
6. Record evidence.
```

### Research record format

```markdown
## RESEARCH-{{ID}} — {{TITLE}}

Question:
{{QUESTION}}

Affected IDs:
- PRD-{{ID}}
- SDS-{{ID}}
- TST-{{ID}}

Sources checked:
- {{SOURCE_1}}
- {{SOURCE_2}}

Findings:
- {{FACT_1}}
- {{FACT_2}}

Decision impact:
{{WHAT_THIS_CHANGES_OR_CONFIRMS}}

Tests to add/update:
- TST-{{ID}}

Remaining uncertainty:
{{UNCERTAINTY}}

Status:
{{Accepted | Needs Review | Superseded}}
```

Pre-seeded research targets:

```text
RESEARCH-001  ICS export requirements for calendar compatibility.
RESEARCH-002  Google Calendar API event creation and OAuth scope.
RESEARCH-003  Microsoft Graph calendar event creation and OAuth scope.
RESEARCH-004  iCloud/CalDAV feasibility for MVP.
RESEARCH-005  Tauri filesystem watcher reliability.
RESEARCH-006  TSRX component embedding.
RESEARCH-007  Local-first conflict handling patterns.
```

---

## 9. Coherence and Fidelity Review

### Coherence review questions

Ask these after every major phase:

```text
Is markdown still the durable source of truth?
Is SQLite still fully rebuildable?
Did any strategy-critical state become index-only?
Are node identities stable and traceable?
Are typed edges reconstructable from markdown/frontmatter?
Are evidence claims linked to provenance?
Is contradiction preserved?
Are agents still draft-only unless humans approve?
Are work packages separated from timeboxes?
Are timeboxes separated from reviews?
Can a task become committed without a timebox? It must not.
Can a timebox become verified without review? It must not.
Can a value claim become validated without evidence? It must not.
Did any optional calendar provider become required for core correctness?
Are failures operator-visible?
Can a future agent understand why each behavior exists?
```

### Fidelity review procedure

For each implemented slice:

```text
1. Read the linked PRD/SDS/INV.
2. Inspect the diff.
3. Run the linked tests.
4. Check whether behavior matches the spec wording.
5. Check failure behavior.
6. Check observability.
7. Record Accepted, Needs Review, or Rejected.
```

### Fidelity review record

```markdown
## FID-{{ID}} — {{SLICE_TITLE}}

Slice:
{{SLICE_ID}}

Spec IDs:
- PRD-{{ID}}
- SDS-{{ID}}
- INV-{{ID}}

Evidence reviewed:
- EV-{{ID}}
- EV-{{ID}}

Decision:
{{Accepted | Needs Review | Rejected}}

Reason:
{{WHY}}

Required changes:
- {{CHANGE_1}}
- {{CHANGE_2}}
```

---

## 10. Integration Gates

### Gate 1 — Contracts stable

Pass criteria:

* Shared types compile.
* Interface contracts are documented.
* Serialization contracts exist.
* Mocks match real adapter shapes.
* No workstream owns the same behavior as another.

Evidence:

* EV-TYP
* EV-CT
* EV-TRACE

---

### Gate 2 — Local-first substrate works

Pass criteria:

* Node markdown is created.
* Node markdown is parsed and serialized.
* SQLite index is built from markdown.
* Index can be deleted and rebuilt.
* Daynote activity captures creation/modification.
* Backlinks and typed edges resolve.

Evidence:

* EV-TST
* EV-BLD
* EV-TRACE

---

### Gate 3 — Strategy case spine works

Pass criteria:

* Strategy case can be created.
* Evidence item can be linked to source.
* ORD outcome can be created.
* SLD claim can be created.
* Strategy bet can be drafted.
* Trace view shows source → evidence → claim → bet.

Evidence:

* EV-TST
* EV-SMOKE
* EV-TRACE

---

### Gate 4 — Evidence and bet gates work

Pass criteria:

* Evidence cannot be accepted without provenance.
* Claims carry proof level.
* Contradictions remain visible.
* Bet cannot be approved without required fields.
* Approved bet creates or links to SDR.

Evidence:

* EV-TST
* EV-TRACE
* EV-AUDIT

---

### Gate 5 — Work package and timebox loop works

Pass criteria:

* Work package requires inputs, outputs, tools, technique, evidence requirement, exception policy.
* Work package cannot be committed without pomo estimate.
* Work package cannot be committed without timebox.
* Timebox can be scheduled internally.
* ICS export works or is explicitly skipped.
* Executed timebox requires post-block review.
* Verified timebox requires evidence or explicit no-evidence reason.

Evidence:

* EV-TST
* EV-ICS
* EV-SMOKE
* EV-TRACE

---

### Gate 6 — Execution/review loop works

Pass criteria:

* Execution mode shows runbook, inputs, expected output, method, capture bar.
* New ideas are captured, not forced into immediate strategy changes.
* Blockers and exceptions are classified.
* Review creates evidence, open question, decision, or next work package.
* Daynote ledger shows execution activity.

Evidence:

* EV-TST
* EV-UI
* EV-AUDIT
* EV-TRACE

---

### Gate 7 — Value realization works

Pass criteria:

* Value claim links to ORD outcome and evidence.
* Proof level is required.
* VRD view generates from value claims and evidence.
* Case cannot close without value finding or explicit no-value finding.
* Lessons learned are captured.

Evidence:

* EV-TST
* EV-TRACE
* EV-MAN

---

### Gate 8 — Release conformance

Pass criteria:

* Full tests pass.
* Typecheck/lint/build pass.
* Invariant tests pass.
* Traceability review passes.
* Fidelity review passes.
* Known gaps are documented.
* No unresolved blocking questions remain.

Evidence:

* EV-TST
* EV-TYP
* EV-LINT
* EV-BLD
* EV-TRACE
* FID records

---

## 11. Open Questions

### OQ-001 — Exact markdown schema for typed strategy edges

Why it matters:

Typed edges must be durable and reconstructable from markdown, not SQLite-only.

Affected IDs:

* PRD-005
* SDS-GRAPH
* INV-EDGE
* INV-PORT

Options:

* Option A: Store typed edges in frontmatter.
* Option B: Store typed edges as inline markdown syntax.
* Option C: Store typed edges in both, with frontmatter authoritative.

Recommended choice:

Option A for MVP. It is easier to parse and test. Inline rendering can come later.

Decision:

Pending.

Owner:

Sam / Architecture Agent

Status:

Open

---

### OQ-002 — MVP calendar integration level

Why it matters:

Full Google/Outlook/iCloud sync can slow the MVP.

Affected IDs:

* PRD-020
* PRD-025
* SDS-CAL
* INV-CAL

Options:

* Option A: Internal timeboxes only.
* Option B: Internal timeboxes + ICS export.
* Option C: One-way Google/Outlook sync.
* Option D: Full two-way sync.

Recommended choice:

Option B for MVP.

Decision:

Pending.

Owner:

Sam / Calendar Agent

Status:

Open

---

### OQ-003 — Pomo customization in MVP

Why it matters:

Default 25/5 keeps the product opinionated, but users may need different cycles.

Affected IDs:

* PRD-019
* SDS-TIME
* INV-TIME

Options:

* Option A: Fixed 25/5 in MVP.
* Option B: User-configurable from day one.
* Option C: Fixed 25/5 plus deep-work preset.

Recommended choice:

Option C.

Decision:

Pending.

Owner:

Sam / Product Agent

Status:

Open

---

### OQ-004 — Materialized artifacts vs generated views

Why it matters:

ERD/ORD/SLD/EDS/VSD/VRD must be readable, but the source of truth should remain graph-based.

Affected IDs:

* PRD-009 through PRD-014
* SDS-STRAT
* INV-PORT

Options:

* Option A: Artifacts are generated views only.
* Option B: Artifacts are markdown nodes manually edited.
* Option C: Artifacts are materialized markdown views generated from graph nodes, with protected generated sections.

Recommended choice:

Option C.

Decision:

Pending.

Owner:

Sam / Architecture Agent

Status:

Open

---

### OQ-005 — External file edit activity

Why it matters:

The app must decide whether external edits appear in daynotes and strategy ledgers.

Affected IDs:

* PRD-007
* SDS-DAY
* INV-DAY

Options:

* Option A: External edits count as modifications.
* Option B: External edits update index but do not create activity.
* Option C: User-configurable.

Recommended choice:

Option A, with explicit event source metadata.

Decision:

Pending.

Owner:

Sam / Storage Agent

Status:

Open

---

## 12. Risk Register

### RISK-001 — Generic notes app drift

Description:

The app becomes a PKM app with light strategy templates instead of a strategy-native system.

Likely failure mode:

Agents build notes/outliner features but skip evidence gates, timeboxes, and validation.

Affected workstreams:

* D
* E
* F
* G
* H

Mitigation:

* Build strategy vertical slice early.
* Do not accept UI-only progress.
* Require source → evidence → bet → work package → timebox → review trace.

Detection:

* Gate 3 and Gate 5 fail.

Owner:

Product/Architecture Agent

Status:

Open

---

### RISK-002 — Database becomes hidden source of truth

Description:

Strategy-critical state ends up only in SQLite.

Likely failure mode:

Rebuild loses gates, typed edges, timeboxes, or reviews.

Affected workstreams:

* B
* C
* D
* H

Mitigation:

* Every strategy object must serialize to markdown.
* Rebuild equivalence tests required.
* Index deletion smoke test required.

Detection:

* INV-DUR test fails.

Owner:

Storage Agent

Status:

Open

---

### RISK-003 — Calendar integration delays core product

Description:

External provider work blocks local timebox behavior.

Likely failure mode:

MVP stalls on OAuth, iCloud, or sync edge cases.

Affected workstreams:

* H
* I

Mitigation:

* Build internal timeboxes and ICS export first.
* Treat provider sync as optional adapter.

Detection:

* Calendar smoke tests blocked by credentials.

Owner:

Calendar Agent

Status:

Open

---

### RISK-004 — Completion theater through UI percentages

Description:

The UI rewards filled sections instead of verified progress.

Likely failure mode:

Users feel progress because documents look complete.

Affected workstreams:

* F
* K
* M

Mitigation:

* Use maturity states, not percent complete.
* Display evidence debt, gate failures, and proof levels.

Detection:

* UI allows artifact to show complete without passed gates.

Owner:

UI Agent

Status:

Open

---

### RISK-005 — Planning and execution collapse into each other

Description:

Users re-plan mid-execution and lose flow.

Likely failure mode:

Execution mode becomes another strategy-editing workspace.

Affected workstreams:

* G
* J
* K

Mitigation:

* Execution mode only shows runbook, inputs, method, expected output, capture bar, and evidence attach.
* New ideas go to capture, not immediate plan mutation.

Detection:

* Execution mode allows unrestricted strategy object editing.

Owner:

Execution UX Agent

Status:

Open

---

### RISK-006 — Agent authority creep

Description:

AI-generated content becomes accepted strategy without human review.

Likely failure mode:

Agent drafts directly update ERD, SLD, bets, or value claims.

Affected workstreams:

* E
* F
* L

Mitigation:

* Draft quarantine.
* Human approval gate.
* AgentRun trace required.

Detection:

* Agent output appears in accepted artifact without human approval event.

Owner:

Agent Governance Agent

Status:

Open

---

## 13. Definition of Done

The project is done only when:

* [ ] All in-scope PRDs have implementation or explicit deferral.
* [ ] All in-scope SDS items have tests or documented verification.
* [ ] All invariants have direct tests.
* [ ] Core failure behaviors are tested.
* [ ] Markdown remains the durable source of truth.
* [ ] SQLite can be deleted and rebuilt without losing strategy-critical state.
* [ ] Strategy cases, evidence, claims, bets, work packages, timeboxes, reviews, and value claims serialize to markdown.
* [ ] Evidence acceptance gates work.
* [ ] Strategy bet approval gates work.
* [ ] Work package commitment gates work.
* [ ] Timebox verification gates work.
* [ ] Value claim validation gates work.
* [ ] Calendar integration smoke tests pass or are clearly skipped with reason.
* [ ] UI shows maturity/gate states instead of fake completion percentages.
* [ ] Daynote ledger captures activity, scheduled work, timeboxes, reviews, decisions, and evidence.
* [ ] External integrations are behind contracts.
* [ ] Operator-visible errors exist for startup, storage, gates, calendar, execution, and sync failures.
* [ ] Evidence records exist for completed slices.
* [ ] Fidelity review is accepted.
* [ ] Documentation matches actual behavior.
* [ ] No unresolved blocking questions remain.
* [ ] Known limitations are documented.

---

## 14. Minimal Agent Brief

Use this when assigning a single coding agent.

```text
You are implementing StrategyNotes.

Read:
- SPEC.md
- PLAN.md
- AGENT_STATE.md
- OPEN_QUESTIONS.md

Current slice:
{{SLICE_ID}} — {{TITLE}}

Relevant IDs:
- PRD-{{ID}}
- SDS-{{ID}}
- INV-{{ID}}
- TST-{{ID}}

Your task:
{{TASK}}

Dependency:
{{DEPENDENCY}}

Do:
1. Write or update the test first if behavior is known.
2. Implement only this slice.
3. Run required verification commands.
4. Record evidence in EVIDENCE.md.
5. Update AGENT_STATE.md.
6. Stop if ambiguity, invariant failure, or shared contract change is required.

Do not:
- Expand scope.
- Change the spec to fit your implementation.
- Mark complete without evidence.
- Ignore failing invariant tests.
- Store strategy-critical state only in SQLite.
- Let agent output bypass human review.
- Treat a work item as committed without pomo estimate and calendar timebox.
- Treat a timebox as verified without post-block review.
- Treat a value claim as validated without proof.
```

---

## 15. First Vertical Slice

Build this before expanding screens or integrations:

```text
Create strategy_case node
→ create source node
→ create evidence_item node linked to source
→ accept evidence through gate
→ create strategic_claim linked to evidence
→ create strategy_bet linked to claim
→ fail approval gate due to missing assumptions/metrics/kill criteria
→ add required bet fields
→ approve bet and create SDR
→ create work_package linked to bet
→ define inputs, outputs, tools, technique, exception policy
→ estimate pomo cost
→ create internal timebox
→ export ICS file
→ execute timebox
→ capture exception/review
→ attach evidence
→ verify timebox
→ create value_claim
→ show trace from source to value claim
→ show daynote ledger for the day
```

Pass condition:

```text
The vertical slice proves the full StrategyNotes spine:
notes → evidence → strategy → decision → work package → timebox → execution review → value claim → daynote ledger.
```

Evidence required:

* EV-TST for each state transition
* EV-ICS for calendar export
* EV-TRACE for source-to-value chain
* EV-UI for cockpit/daynote/trace display
* EV-MAN review of the full flow
