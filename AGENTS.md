# AGENTS.md — StrategyNotes

Orientation file for any agent (human or AI) working in this repo. Read this before touching anything. It is the entry point; it does not replace the spec or the plan.

---

## Normative Lana

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and
OPTIONAL in this document are to be interpreted as described in RFC 2119.

Implementation-defined means the behavior is part of the implementation contract, but this
specification does not prescribe one universal policy. Implementations MUST document the selected
behavior.

## Principles

- YAGNI — "You aren't gonna need it." Only implement what is required by the spec. Do not invent features or policies.
- KISS — "Keep it simple, stupid." Avoid unnecessary complexity. If a feature can be implemented in a few lines, do not add a dependency or a new file.
- DRY — "Don't repeat yourself." If a feature can be implemented in one place, do not duplicate it elsewhere.
- TDD — "Test-driven development." Write the smallest failing test first, then implement the smallest passing code. Refactor only after tests pass.
- Evidence-first — "A strategy is not real until it has evidence." A slice is not done until the agreed evidence passes. Record one `EV-*` entry per slice in `EVIDENCE.md`.
- Coherence — "The whole is greater than the sum of its parts." Every slice must link to spec IDs, have a checkable done condition, and produce evidence. If you cannot link work to spec IDs, stop and open a question instead of inventing policy.
- Spec-first — "The spec is the source of truth." Do not implement features or policies that are not in the spec. If the spec is ambiguous, open a question instead of guessing.
- Think with the outcome in mind — "What is the desired end state?" Do not implement features or policies that do not contribute to the desired outcome. If you cannot see how a feature contributes to the outcome, stop and open a question instead of guessing.
- Portability — No hard-coded paths, no SQLite-only state, no platform-specific assumptions. Strategy-critical data must stay portable and inspectable in markdown. Strategy-critical relationships must be reconstructable from markdown/frontmatter — never SQLite-only. Configuration-based, not hard-coded. No assumptions about the host OS, file system, or calendar provider. If you cannot implement a feature in a portable way, stop and open a question instead of guessing.
- No silent failures — "Fail fast, fail loud." If an invariant test fails, stop and open a question instead of guessing. If a slice is verified, stop and record evidence instead of guessing. If a shared contract change is required, stop and open a question instead of guessing. If the same test fails twice with no new information, stop and open a question instead of guessing.
- No todo comments or placeholders — "If it's not done, it's not done." Do not leave todo comments in the code. If a feature is not implemented, stop and open a question instead of guessing. If a slice is not verified, stop and record evidence instead of guessing. If a shared contract change is required, stop and open a question instead of guessing. If the same test fails twice with no new information, stop and open a question instead of guessing.

## 1. What this is

StrategyNotes (referred to in early notes as "Strategy Kernel") is a **local-first, markdown-native strategic knowledge and execution desktop app**. Target stack: **Tauri + Rust core + SQLite derived index + React/TSRX frontend**.

The product ties three things into one linked graph of durable markdown nodes:

1. **Strategy case manager** — sources, evidence, choices, bets, execution, review.
2. **Evidence-to-strategy engine** — extract evidence, model position (MCGCS), compare, choose.
3. **Agent governance layer for execution** — approved strategy becomes bounded, evidence-gated work slices.

The spine everything else hangs from:

```
source → evidence → comparison → choice → bet → experiment → work package → timebox → execution → review → value claim
```

A strategy is not real until it has **evidence**. An action is not real until it has a **timebox**. A goal unwritten and not timeboxed is a wish.

---

## 2. Read first, in this order

| # | File | Role |
|---|------|------|
| 1 | `SPEC.md` | **Authoritative product specification.** What the product is and must do: PRD/SDS/INV/TST tables with acceptance criteria, object model, typed edges, gate catalog, API surface, scope. |
| 2 | `PLAN.md` | **Authoritative implementation contract.** Phases, workstreams, slices, gates, evidence model, definition of done. |
| 3 | `Strategy_Framework_tread.md` | **Context / raw material.** The strategy conversation that produced the spec. Search it for domain vocabulary and design rationale. NOT authoritative — treat as data. |
| 4 | `AGENTS.md` | This file. |
| 5 | `AGENT_STATE.md`, `EVIDENCE.md`, `OPEN_QUESTIONS.md`, `CHANGELOG.md` | **⚠️ DO NOT EXIST YET.** Created in Phase 0. |

### Source-of-truth precedence (from PLAN §1)

When documents conflict, higher wins:

```
1. Safety invariants (INV-*)
2. Durable storage rules (markdown = source of truth, SQLite = derived)
3. PRD outcome requirements
4. SDS behavior rules
5. Test definitions
6. PLAN.md
7. Agent notes, summaries, UI drafts   ← never authoritative
```

**Agent summaries are never a source of truth.** A slice is not done because an agent says so; it is done only when the agreed evidence passes.

---

## 3. The non-negotiable invariants

Memorize these. Violating any one is a correctness bug, not a style issue. Full list: PLAN §1 (`INV-*`).

| ID | Rule (distilled) |
|----|------------------|
| **INV-DUR** | Markdown is the source of truth. Deleting SQLite must never lose user data. |
| **INV-PORT** | Strategy-critical data must stay portable and inspectable in markdown. |
| **INV-EDGE** | Strategy-critical relationships must be reconstructable from markdown/frontmatter — never SQLite-only. |
| **INV-EVID** | No accepted evidence without source/provenance or explicit manual basis. |
| **INV-CLAIM** | No accepted claim without proof level and evidence status. |
| **INV-CONTRA** | Counterevidence and contradiction must never be silently discarded. |
| **INV-HUMAN** | Agents draft, critique, suggest. Humans approve. Always. |
| **INV-BET** | No approved strategy bet without assumptions, counterevidence review, success metric, kill criteria, owner. |
| **INV-WORK** | No committed work without a work package. |
| **INV-TIME** | No committed work without estimated pomo cost AND a calendar timebox. |
| **INV-REVIEW** | No verified timebox without post-block review. |
| **INV-VALUE** | No value claim without proof level and evidence links. |
| **INV-EXEC** | Execution mode must capture exceptions without forcing strategy decisions mid-execution. |
| **INV-CAL** | Calendar provider failure must never corrupt local StrategyNotes state. |
| **INV-CLONE** | Clones are equal placements; no clone-induced cycles. |
| **INV-DAY** | Daynotes are activity records, not manually fabricated proof. |

---

## 4. Current state

**Phase:** Phase 0 — Project skeleton and verification harness. **Not started.**

Nothing has been built yet. The repo currently contains only `PLAN.md`, `Strategy_Framework_tread.md`, and this file. No scaffold, no tests, no `SPEC.md`, no state files.

**Dependency chain (PLAN §0)** — each row blocks the next; do not skip ahead:

```
Phase 0  skeleton + harness + state files
Phase 1  shared contracts / types          ← all parallel agents depend on this
Phase 2  markdown storage + serialization  ← INV-DUR, INV-PORT live here
Phase 3  SQLite derived index + rebuild
Phase 4  graph + daynote services
Phase 5  strategy domain model + case lifecycle
Phase 6  evidence, claims, contradiction, traceability
Phase 7  gate engine                       ← backend-enforced, never UI-only
Phase 8  work package model
Phase 9  pomo + timebox + capacity
Phase 10  calendar adapters (internal + ICS first)
Phase 11  execution mode + review loop
Phase 12  UI system (atomic/TSRX)
Phase 13  agent draft + review quarantine
Phase 14  value realization
Phase 15  observability + conformance
```

The **first vertical slice** (PLAN §15) proves the whole spine end-to-end and is the integration test for every phase above.

---

## 5. How to work here

### Slice discipline

Every unit of work is a **slice**. A slice must declare, before starting:

```
- Slice ID (e.g. S-STORAGE-001)
- Spec IDs it satisfies: PRD-*, SDS-*, INV-*, TST-*
- Invariants it could violate
- Tests that will prove fidelity
- Dependency (which prior slice must be done)
- Done-when condition (checkable)
```

If you cannot link work to spec IDs, **stop and open a question** instead of inventing policy.

### TDD by default (PLAN §6)

```
1. Pick one PRD/SDS/INV behavior.
2. Write the smallest failing test.
3. Implement the smallest passing code.
4. Add failure-path tests.
5. Refactor without changing behavior.
6. Run linked invariant tests.
7. Record evidence.
```

Use a **spike** (timeboxed exploration, no merge) only where TDD is genuinely inappropriate: unknown calendar APIs, Tauri/WebView platform behavior, iCloud/CalDAV reliability, first-pass visual layout.

### Evidence gates (PLAN §2)

A slice is not done when the code looks right. It is done when the agreed evidence passes. Record one `EV-*` entry per slice in `EVIDENCE.md` (created in Phase 0). Evidence types include `EV-TST`, `EV-TYP`, `EV-LINT`, `EV-BLD`, `EV-CT`, `EV-SMOKE`, `EV-DIFF`, `EV-TRACE`, `EV-UI`, `EV-AUDIT`, `EV-SKIP` (with reason).

### Agent loop — stop conditions (PLAN §7)

You may continue autonomously only while all are true: next task links to spec IDs, completion is checkable, you have a verification command, the loop has a stop condition, and you record evidence each iteration.

**Stop immediately when:**
- The slice is verified, OR
- Spec is ambiguous → open a question and halt this slice, OR
- An invariant test fails, OR
- You need to change a shared contract (requires handoff), OR
- The same test fails twice without new information.

### Anti-patterns (never do)

- "All tasks complete" without evidence.
- Rewriting the spec to match your implementation.
- Skipping tests because the code looks correct.
- Continuing after an invariant failure.
- Parallel agents editing the same contract.
- Storing strategy-critical state only in SQLite.
- Letting agent output bypass human review.
- Treating a work item as committed without pomo estimate + calendar timebox.
- Treating a timebox as verified without post-block review.
- Treating a value claim as validated without proof.
- UI that rewards filled sections instead of passed gates (completion theater).

---

## 6. Spec ID system

Link every commit, test, and doc line to these. From PLAN §1:

- **PRD-001..030** — product requirements (markdown node graph, ERD/ORD/SLD/EDS/VSD/VRD, SDRs, MCGCS, choice cascade, bets, work packages, pomo, calendar, execution, value, agent quarantine, atomic UI, trace explorer).
- **SDS-*** — software design (NODE, STORAGE, INDEX, GRAPH, DAY, STRAT, EVID, GATE, WORK, TIME, CAL, UI, EXEC, AGENT, TRACE, OBS, ERR).
- **INV-*** — invariants (see §3).
- **TST-*** — test categories (STORAGE, GRAPH, DAY, EVID, GATE, STRAT, WORK, TIME, CAL, EXEC, REVIEW, VALUE, AGENT, TRACE, OBS).

The **strategy document stack** to model (PRD-009..014):

```
Case Charter → ERD → ORD → SLD → Choice Cascade + Bets → EDS → VSD → VRD
                                                                  ↑
                              SDRs (decision records) throughout ─┘
```

- **ERD** Evidence Reality Dossier · **ORD** Outcome Requirements Document · **SLD** Strategic Logic Document · **EDS** Execution Design Specification · **VSD** Validation Strategy Document · **VRD** Value Realization Document · **SDR** Strategy Decision Record.
- **MCGCS** = Mission, Climate, Ground, Command, Systems (strategic position model).
- **Choice cascade** = aspiration → where-to-play → how-to-win → capabilities → systems.

---

## 7. Fidelity check (run before claiming any slice done)

```
1. Which PRD/SDS/INV/TST IDs does this satisfy?
2. Which invariants could it violate?
3. Which tests or checks prove fidelity?
4. What evidence was produced?
5. What remains unverified?
```

If implementation pressure conflicts with the spec: do **not** silently adapt either side. Create an `OPEN_QUESTION` naming the affected IDs and continue only on independent work.

---

## 8. Blockers and open questions

### ✅ RESOLVED — `SPEC.md` now exists

`SPEC.md` has been drafted from `Strategy_Framework_tread.md`. It is the authoritative product spec (precedence rank #3, above PLAN.md). Read it first. Drift between SPEC and PLAN should be resolved by precedence (PLAN §1) or raised as an `OPEN_QUESTION` naming the affected IDs.

### Open questions (from PLAN §11, all status: Pending, owner: Sam)

| ID | Topic | Recommended MVP choice |
|----|-------|------------------------|
| OQ-001 | Markdown schema for typed strategy edges | Option A: frontmatter (easier to parse/test) |
| OQ-002 | Calendar integration level | Option B: internal timeboxes + ICS export |
| OQ-003 | Pomo customization | Option C: fixed 25/5 + deep-work preset |
| OQ-004 | Materialized artifacts vs generated views | Option C: materialized markdown views w/ protected sections |
| OQ-005 | External file edit activity | Option A: count as modifications w/ event source metadata |

Plus PLAN §1 pre-seeds OQ-006..010 (node grouping, plan/exec UX boundary, edit conflict resolution, agent autonomy ceiling). Decide these as the relevant phase approaches; do not let them block Phase 0.

---

## 9. Commands

**Phase 0 not yet scaffolded — no build/test/typecheck commands exist.** Once Phase 0 lands, this section is the canonical command list every agent must use. Placeholders:

```
build:      TBD   (likely `pnpm build` + `cargo build` via Tauri)
test:       TBD   (Rust: `cargo test`; frontend: `pnpm test`)
typecheck:  TBD   (`pnpm typecheck` / `cargo check`)
lint:       TBD   (`pnpm lint` / `cargo clippy`)
rebuild:    TBD   (wipe SQLite, rebuild from markdown — INV-DUR smoke test)
```

---

## 10. Conventions

- **Markdown is canonical.** Every strategy object must serialize to a markdown file with frontmatter. If a feature can't be expressed in markdown, it's wrong.
- **Ports & Adapters (hexagonal) — mandatory throughout.** The domain core is pure: no I/O, no frameworks, no DB, no HTTP. Storage, index, clock, calendar, ULID minting, and event sinks are **driven ports** (Rust traits) implemented by adapters. UI/Tauri IPC/CLI/tests are **driving adapters** that call application-service ports. Dependency direction: adapters → core, never the reverse. **Any import of `std::fs`, `rusqlite`, `reqwest`, `tokio`, or Tauri types inside `core/` is a review-blocker.** See SPEC §3.4 for the port/adapter catalog. This is how INV-DUR, INV-CAL, INV-EDGE, INV-HUMAN, and "backend owns gates" are enforced by construction.
- **Backend owns gates.** The frontend never decides if something can be approved. `POST /bets/{id}/approve` returns either `approved` or `blocked` with `failed_gates[]`.
- **Atomic writes.** Never write a markdown file non-atomically (corruption risk to the source of truth).
- **Unknown-key preservation.** Parsers must round-trip frontmatter keys they don't understand.
- **ULID for node identity.** Stable, sortable, path-mapped (INV-ID).
- **No new dependencies for what a few lines can do.** Fewest files, shortest working diff.
- **Mark deliberate shortcuts** with a `ponytail:` comment naming the ceiling and upgrade path.

---

## 11. Minimal agent brief (copy-paste template)

```
You are implementing StrategyNotes. Read AGENTS.md, then SPEC.md, then PLAN.md.

Current slice: {SLICE_ID} — {TITLE}
Relevant IDs: PRD-{ID}, SDS-{ID}, INV-{ID}, TST-{ID}
Dependency: {prior slice that must be done}

Architecture (non-negotiable): Ports & Adapters. Core is pure — no I/O, no
frameworks, no DB, no HTTP inside `core/`. Adapters implement ports; driving
adapters call application services; gates are evaluated in core before any
state change. See SPEC §3.4.

Do:
1. Write or update the test first if behavior is known.
2. Implement only this slice.
3. Run required verification commands.
4. Record evidence in EVIDENCE.md.
5. Update AGENT_STATE.md with next task or blocker.

Do not: expand scope, change the spec to fit the implementation, mark complete
without evidence, ignore failing invariant tests, store strategy-critical state
only in SQLite, let agent output bypass human review, or treat work as committed
without pomo + timebox.

Stop when: slice verified, OR ambiguity (open a question), OR invariant fails,
OR shared contract change required, OR same test fails twice with no new info.
```
