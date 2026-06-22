# StrategyNotes

**A local-first, markdown-native strategic knowledge and execution system.**

StrategyNotes connects research, decisions, execution, and learning in one durable graph. It helps individuals and teams build strategies from evidence, turn approved choices into timeboxed work, review what happened, and trace value claims back to their proof.

> A strategy is not real until it has evidence. An action is not real until it has a timebox.

<!-- Placeholder: product screenshot or short demo. -->

## Why StrategyNotes

Most tools separate notes, strategy documents, task lists, calendars, and review records. That separation breaks the chain between what you learned, what you chose, what you committed to, and what created value.

StrategyNotes keeps that chain intact:

```text
source -> evidence -> comparison -> choice -> bet -> experiment
       -> work package -> timebox -> execution -> review -> value claim
```

Every item in the chain is a linked, addressable markdown node. Typed relationships make the reasoning traceable in both directions.

StrategyNotes imposes two prices:

| Price | Rule |
|---|---|
| Epistemic | A claim without evidence cannot be accepted. |
| Execution | Work without an estimated cost and calendar timebox cannot be committed. |

An executed timebox also requires a review, and a value claim requires proof. This prevents activity, confidence, or filled-in templates from masquerading as progress.

## What You Can Do

### Build a strategy case

Open a case, define its arena and outcomes, collect sources, extract evidence, map actors, and model the strategic position through Mission, Climate, Ground, Command, and Systems (MCGCS).

### Turn evidence into choices

Compare options, expose assumptions and counterevidence, create a choice cascade, and frame strategy bets with success metrics and kill criteria. Backend-owned gates block approval when required evidence or decisions are missing.

### Convert choices into executable work

Define work packages with objectives, inputs, outputs, tools, techniques, exception policies, and required evidence. Estimate the cost in pomodoros, then commit the work by reserving time on a calendar.

### Execute with fewer decisions

Execution mode presents only the active runbook, inputs, method, expected output, capture controls, and evidence attachments. New strategic questions are captured for later review instead of disrupting the work block.

### Review, learn, and prove value

After each timebox, record actual effort, outcomes, evidence, friction, and the next action. Daynotes provide an activity ledger, while trace views connect sources and decisions to experiments, reviews, and value claims.

## The Strategy Stack

Strategy artifacts are living views over linked nodes rather than isolated documents.

```text
Case Charter -> ERD -> ORD -> SLD -> Choice Cascade + Bets -> EDS -> VSD -> VRD
                               Strategy Decision Records throughout
```

| Artifact | Purpose |
|---|---|
| Case Charter | Defines the case, arena, stakeholders, boundaries, and initial hypothesis. |
| ERD | Evidence Reality Dossier: what is observed, sourced, contradicted, or uncertain. |
| ORD | Outcome Requirements Document: what must become true and how it will be judged. |
| SLD | Strategic Logic Document: thesis, assumptions, alternatives, tradeoffs, and failure logic. |
| EDS | Execution Design Specification: work packages, dependencies, ownership, interfaces, and capacity. |
| VSD | Validation Strategy Document: experiments, metrics, signals, and kill criteria. |
| VRD | Value Realization Document: proven value, before-and-after evidence, claims, and lessons. |
| SDR | Strategy Decision Record: what was decided, why, and on what evidence. |

## One Graph, Multiple Modes

StrategyNotes uses the same underlying graph across focused working modes:

| Mode | Focus |
|---|---|
| Notes | Capture, outline, link, clone, tag, and search. |
| Evidence | Review sources, extract evidence, assess proof, and preserve contradictions. |
| Strategy | Build cases, requirements, logic, choices, bets, and validation plans. |
| Planning | Package work, estimate attention cost, and reserve calendar capacity. |
| Execution | Follow a low-decision runbook and capture exceptions and evidence. |
| Review | Compare intent with results and update hypotheses and next actions. |
| Value | Validate claims and trace realized value back to evidence. |

## Core Principles

- **Markdown is the source of truth.** Strategy-critical data remains readable and portable outside the application.
- **SQLite is derived.** The index can be deleted and rebuilt from markdown without data loss.
- **Relationships are durable.** Typed edges live in markdown frontmatter and can be reconstructed without the database.
- **Evidence precedes acceptance.** Claims and evidence carry provenance, status, and proof levels.
- **Contradictions remain visible.** Counterevidence cannot be silently discarded.
- **Time expresses commitment.** Work requires both a pomodoro estimate and a calendar timebox.
- **Review closes the loop.** Executed work cannot be verified without a post-block review.
- **Humans approve.** Agents may draft, critique, and suggest; they cannot approve strategy or bypass gates.
- **Offline comes first.** Core workflows do not require a network connection.

## Architecture

StrategyNotes is a desktop application built around a pure domain core and explicit ports and adapters.

```text
React / TSRX UI + Tauri desktop shell
                 |
         Driving application ports
                 |
     Rust graph, strategy, gate, and commitment core
                 |
          Driven service ports
                 |
Markdown vault | SQLite index | Calendar adapters | Event sinks
```

The main layers are:

1. Markdown storage and deterministic serialization
2. Rebuildable SQLite indexing and search
3. Nodes, backlinks, clones, tags, and typed edges
4. Strategy cases, evidence, claims, choices, bets, and validation
5. Work packages, pomodoros, timeboxes, calendars, and reviews
6. Backend-enforced gates, audit trails, and agent governance
7. Atomic React/TSRX components composed into focused workspaces

The domain core contains no filesystem, database, HTTP, async runtime, or UI dependencies. Adapters implement those concerns behind ports, so external failures cannot corrupt local strategy state.

## Data Model

The node is the atom. Each node has a stable ULID, markdown body, frontmatter, references, tags, and typed relationships. Evidence items, strategy bets, work packages, timeboxes, reviews, and value claims all use this same model.

Nodes can appear in multiple contexts through equal placements. All placements point to the same node, so edits propagate everywhere, and cycle checks keep the placement graph valid.

## Calendars and Capacity

StrategyNotes treats the calendar as a commitment ledger rather than a passive due-date display.

- One pomo is 25 minutes of focused work plus a 5-minute break.
- A Deep Work Packet is six pomos, or about three hours including breaks.
- Work packages record both estimated and actual pomos.
- Internal timeboxes and ICS export work without a cloud account.
- Google Calendar, Outlook, and iCloud connect through provider adapters.
- Provider failures remain visible and never invalidate or corrupt local commitments.

## Agent Governance

Agent output enters a review quarantine. Agents can assemble evidence, draft artifacts, identify contradictions, critique assumptions, and propose work packages, but every accepted artifact and approval event requires a human decision.

The same evidence rules apply to agent work as to human work: an agent run must expose its inputs, outputs, status, and review history.

## Getting Started

<!-- Placeholder: replace release links and platform details before publication. -->

### Install the desktop app

Download the appropriate StrategyNotes release for your platform:

- macOS: `[release link]`
- Windows: `[release link]`
- Linux: `[release link]`

### Create or open a vault

1. Launch StrategyNotes.
2. Create a new vault or select an existing folder of StrategyNotes markdown files.
3. Open a strategy case or begin in Notes mode.
4. Configure calendar export or a calendar provider under Settings.

### Build from source

Prerequisites:

- Rust stable
- Node.js `[supported version]`
- pnpm 10.26.2 or newer compatible release
- Tauri system dependencies for your operating system

```bash
pnpm install
cargo build --workspace
pnpm -C ui build
```

<!-- Placeholder: add the final Tauri development and production build commands. -->

## Development

Run the available verification commands:

```bash
cargo check --workspace
cargo test --workspace
pnpm -C ui typecheck
pnpm -C ui test
pnpm -C ui build
```

Run the web UI during frontend development:

```bash
pnpm -C ui dev
```

All changes follow test-driven, evidence-gated slices. Each slice links to product requirements, design rules, invariants, and test categories, then records its verification evidence in `.agents/evidence.md`.

## Repository Guide

| Path | Purpose |
|---|---|
| `core/` | Pure Rust domain types, graph behavior, gates, and application contracts. |
| `adapters/` | Markdown, SQLite, calendar, and event-sink implementations. |
| `ui/` | React/TypeScript interface and atomic component system. |
| `SPEC.md` | Authoritative product and software specification. |
| `PLAN.md` | Implementation phases, slices, evidence gates, and definition of done. |
| `AGENTS.md` | Required working rules for human and AI contributors. |
| `Strategy_Framework_tread.md` | Original strategy discussion and design rationale; context, not specification. |

Read `AGENTS.md`, `SPEC.md`, and `PLAN.md` before changing the system. When documents conflict, invariants and durable-storage rules take precedence.

## Documentation

- [Product and software specification](SPEC.md)
- [Implementation plan](PLAN.md)
- [Contributor and agent instructions](AGENTS.md)
- [Changelog](CHANGELOG.md)

<!-- Placeholder: user guide, architecture decisions, contribution guide, security policy, and support links. -->

## Release and Support

<!-- Placeholder: release channel, version, platform matrix, stability guarantees, and support contact. -->

StrategyNotes follows evidence-based release gates. A release is accepted only when storage portability, index rebuild, graph integrity, approval gates, timebox review, agent quarantine, traceability, and offline operation pass their conformance checks.

## License

<!-- Placeholder: selected license and link to LICENSE. -->
