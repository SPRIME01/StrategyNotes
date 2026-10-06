# StrategyNotes — Product Truth

> Source of truth for **who this is for** and **what it must never become**.
> Visual and interaction system lives in `DESIGN.md`. Spec lives in `.agents/specs/SPEC.md`.
> Nothing in this file is a build-phase status report.

## Register

**Product.** A working instrument, not a marketing surface. Design serves the task.
There is no logo system, no campaign language, no brand work in the repo. Every UI
element exists to expose a fact or block an unjustified action.

## What it is

A local-first, markdown-native desktop app that forces a strategy to earn its way from
evidence to proof. Sources, evidence, claims, bets, work, timeboxes, reviews, and value
claims live as one linked graph of durable markdown nodes. It charges two prices for
everything:

- **a claim costs evidence**
- **an action costs time**

The note is the atom, strategy is the grammar, time is the cost, evidence is the proof.
The result is not a document or a plan. It is a continuous record of how evidence became
a decision, how the decision became scheduled action, and what the action taught.

Runs fully offline. The SQLite index is derived and disposable. **The markdown vault on
disk *is* the strategy.**

## Primary user

A **solo founder, operator, or strategist** who:

- already knows what a strategy bet, a kill criterion, and a pomo are. The app teaches no
  basic PM vocabulary and assumes none.
- works alone, on one machine, offline, with no collaborators and no sync.
- thinks in markdown and wants to `grep` their own strategy.
- is frustrated by PM tools that let everything be "priority 1."

Secondary: an **AI-assisted worker** who wants agents to organize evidence and critique
assumptions, without letting agent output become policy.

**Not** a team tool. **Not** a demo. **Not** an audience of beginners. Domain density is
intentional (proof levels, gates, pomo costs, kill criteria) — but *the jargon must be the
product's, not the spec's*. `INV-BET` is for engineers. "Kill criteria missing" is for the user.

## The spine

```
source → evidence → comparison → choice → bet → experiment → work package
      → timebox → execution → review → value claim
```

Every arrow is a typed edge. Every transition is a backend gate.

1. **Frame the case** — decision, arena, stakeholders, constraints, desired outcome.
2. **Build the reality base** — sources, interviews, observations.
3. **Test the story** — separate evidence from assumption, surface contradictions, name gaps.
4. **Compare choices** — aspiration → where-to-play → how-to-win → capabilities → systems.
5. **Make a bet** — what must be true, how success is measured, when to kill it.
6. **Design the work** — bounded work package.
7. **Commit the time** — estimate in pomos, reserve a calendar timebox.
8. **Execute with focus** — runbook only; capture ideas and exceptions, don't re-plan.
9. **Review the result** — actual vs estimated pomos, output, evidence or explicit no-evidence.
10. **Claim value carefully** — proof level + evidence links back through the whole chain.

## Domain vocabulary

| Term | Definition |
|---|---|
| **Node** | The atom: an addressable markdown object with stable identity, body, refs, tags, properties. Strategy objects are *typed notes*, not separate records. |
| **Source / Source chunk** | Provenance-bearing external material; the chunk is the unit edges attach to. |
| **Evidence item** | An observation promoted from a source chunk. Requires provenance or an explicit manual basis to be accepted. |
| **Proof level** | Claim strength, exactly one of: Observed, Supported, Inferred, Hypothesized, Speculative, Contested, Validated, Rejected. |
| **Counterevidence / contradiction** | Evidence linked *against* a claim. Must stay visible; never silently smoothed away. |
| **Strategy case** | The container: scope, arena, stakeholders, non-goals, phase-gated lifecycle. |
| **ERD / ORD / SLD / EDS / VSD / VRD** | The strategy document stack — *generated views over nodes*, not files. Evidence Reality → Outcome Requirements → Strategic Logic → Execution Design → Validation Strategy → Value Realization. |
| **SDR** | Strategy Decision Record — the ADR-like record created on every bet approval. |
| **MCGCS** | Strategic position model: Mission, Climate, Ground, Command, Systems. |
| **Choice cascade** | aspiration → where-to-play → how-to-win → capabilities → systems. |
| **Strategy bet** | A falsifiable commitment: assumptions, counterevidence review, success metric, kill criteria, owner. |
| **Work package** | Bounded unit of execution: objective, inputs, outputs, tools, technique, exception policy, evidence requirement. |
| **Pomo** | 25 min focus + 5 min break. The **commitment currency** — you cost work in pomos, not minutes. |
| **Deep Work Packet** | 6 pomos ≈ 3 hours; the smallest meaningful project block. |
| **Timebox** | A calendar block that funds a work package. Without one, work is a wish, not a commitment. |
| **Execution runbook** | Low-decision execution surface: runbook, inputs, method, expected output, capture bar, evidence attach. No strategy editing. |
| **Post-block review** | The mandatory close of a timebox: actual pomos, output summary, evidence link *or explicit no-evidence reason*, next action. |
| **Value claim** | A statement of realized value carrying a proof level and evidence links back to source. |
| **Gate** | A backend-owned predicate returning `approved` or `blocked` + `failed_gates[]`. Nine exist: accept evidence, accept claim, approve bet, commit work package, verify timebox, claim value, close case, strategy capacity, value alignment. |
| **Maturity / status** | `Drafted · Reviewed · Accepted · Validated · Claimed · Superseded`. Never Complete/Done/Finished. |
| **Evidence debt** | The visible gap between what a document asserts and what evidence supports it. |
| **Daynote** | An automatically captured activity record. Never manually fabricated proof. |
| **Clone / placement** | One node placed in multiple parents via a `places` edge; clones are equal, edits propagate, cycles are rejected. |
| **Trace explorer** | Typed-edge traversal from any source chunk to any value claim it supports or validates. |
| **Draft quarantine** | Agent output lands in an inbox; nothing reaches an accepted artifact without a human approval event. |
| **Proof burden** | The five questions every artifact must answer: what supports this, what contradicts it, what is assumed, what would change our mind, what remains unverified. |

## Non-negotiable rules the UI must never violate

The UI is downstream of these. Violating any is a correctness bug, not a style issue.

- **Gates are backend-owned.** The UI *displays* gate state; it never decides approval. Every
  transition returns `approved` or `blocked` with `failed_gates[]`.
- **Maturity is shown via gates and evidence debt, never percent-complete.**
- **Never use the status words** Complete · Done · Finished. Use
  Drafted/Reviewed/Accepted/Validated/Claimed/Superseded.
- **Never shame the user.** Honest, non-punitive language. "This timebox was missed. This
  may indicate hidden friction. What should change?" — not a red flag with no way to clear it.
- **A red flag is only legitimate when paired with a one-click path to satisfy it.**
- **Execution mode is low-decision.** Runbook, inputs, method, expected output, capture bar,
  evidence attach — and *no* strategy editing. New ideas are captured, never applied as
  strategy mutations.
- **Never silently swallow an error.** Operator-visible, categorized failures.
- **Capture must be frictionless.** Taxonomy must never evict a note from the workspace.
- **The same node renders differently by context.** A `strategy_bet` appears as a Bet Board
  card, an SLD section, an EDS dependency, a VSD validation target, and a trace node.

Invariants the UI surfaces rather than implements: `INV-DUR` `INV-ID` `INV-CLONE` `INV-DAY`
`INV-BODY` `INV-EDGE` `INV-EVID` `INV-CLAIM` `INV-CONTRA` `INV-HUMAN` `INV-BET` `INV-WORK`
`INV-TIME` `INV-EXEC` `INV-REVIEW` `INV-VALUE` `INV-CAL` `INV-PORT`.

## Tone

A **precision instrument, not a coach.** It does not advise, encourage, gamify, celebrate,
or explain its reasoning. It states what is true, what is unsupported, what is unverified,
and what will be refused, then lets the human decide. Austere, verifiable, slightly skeptical
of the user's optimism, utterly unsentimental.

**Trust is earned by showing the receipts.**

Words the spec uses: *local-first, markdown-native, evidence-first, durable, defensible,
honest, living case, the system's teeth.* A goal unwritten and not timeboxed is a wish. A
strategy is not real until it has evidence.

## Anti-references

What this must never look or behave like:

- **Not a generic PKM/notes app** with strategy templates bolted on.
- **Not a chatbot.**
- **Not a mechanical project manager.**
- **Not a compliance auditor.** The named failure: treating the user as a clerk failing an
  audit — red ✕ marks and `PROOF DEBT` warnings brandished with no mechanism to fulfill them.
  Red flags are only legitimate when paired with a one-click path to satisfy them.
- **Not a read-only dashboard suite.** A screen you can look at but not act on is a
  screenshot, not a tool.
- **Not full of dead controls.** Buttons with no handler, mock elements, permanently
  disabled actions. Worse than absent.
- **Not developer-facing.** No `INV-BET` plastered on primary buttons. No ULIDs where a human
  title belongs. No raw gate error codes (`missing_linked_choice_cascade`) as user copy.
  No empty states that read `schedule one (POST /api/timeboxes)`.
- **Not fragmented.** Tracking one bet across six unlinked sidebar views with no deep links
  forces the user to hold the graph in their head.
- **Not lossy with capture.** The "disappearing thought" failure: classify a note and it
  vanishes.
- **Not uncertain about its own state.** A capacity meter that always reads zero is a lie.
- **Not silent.** No `catch { /* backend not running */ }`.
- **Not rewarding filled sections instead of passed gates.** Completion theater.

## Design-law reminders

- **A red flag is only legitimate when paired with a one-click path to satisfy it.**
  Every blocked state must expose the action that clears it.
- **Gate vocabulary is the product's, not the spec's.** Say "kill criteria missing", not
  `INV-BET`. Reserve invariant IDs for a tooltip or an audit trail, never for a CTA label.
- **Empty is a real state.** Say what will appear here and how to make the first one. Never
  render a blank panel.
- **Honest uncertainty over fake precision.** A missing value renders as an em dash with a
  label, never as `0`.
