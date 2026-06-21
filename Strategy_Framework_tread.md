# Strategy Framework

**User:** Anonymous  
**Created:** 6/21/2026 12:21:38  
**Updated:** 6/21/2026 14:55:07  
**Exported:** 6/21/2026 14:56:47  
**Link:** [https://chatgpt.com/g/g-p-688f7bb4c380819198facb26496c9bb8-sam/c/6a380ec1-3adc-83ea-a3d1-430ddc9d90a4](https://chatgpt.com/g/g-p-688f7bb4c380819198facb26496c9bb8-sam/c/6a380ec1-3adc-83ea-a3d1-430ddc9d90a4)  

## Prompt:
6/21/2026, 12:21:39 PM

use bifrost to view my notebooklm notebooks, and view the Strategy notebook. based on the synergized strategy framework im working on complete this specification so i can create and application for it

[Attachment: Evidence_Based_Agent_Implementation_Plan_Template(1).md]

## Response:
6/21/2026, 12:21:38 PM

I’ll try to access the Strategy material through Bifrost first, then use the uploaded implementation-plan template as the structure. If NotebookLM is not exposed through the available connector, I’ll say that plainly and complete a grounded draft from the evidence I can access.

Bifrost is not reachable right now: its MCP endpoint returned a connection failure. I’m still going to complete a usable spec from the uploaded evidence-plan template and the strategy context already available here, then flag where the actual NotebookLM Strategy notebook should refine it.

## Prompt:
6/21/2026, 12:23:00 PM

bifrost is up, i'm looking at it's  dashboard

## Response:
6/21/2026, 12:22:59 PM

Got it. The first call hit the endpoint before it responded cleanly, so I’ll retry with a lighter check and then avoid the path that triggered safety filtering.

The available Bifrost tools I can see are Desktop Commander-style filesystem/process tools, not a NotebookLM-specific connector. I’ll try a minimal process call next; if that also fails, the issue is the MCP connection from this chat session rather than whether your dashboard is up locally.

The connection still fails from here even for `echo bifrost-ok`, so I can’t inspect NotebookLM directly in this run. I’m going to produce the app spec anyway using the Strategy context we’ve already developed: Navigatum/rankings, evidence-first strategy, DomainForge/SEA envelopes, capability compounding, and agent-gated implementation.

## Prompt:
6/21/2026, 12:24:48 PM

![ad4eebf8-280f-4b20-baaf-841fe0f2aed8.png](https://chatgpt.com/backend-api/estuary/content?id=file_00000000d46c720ca2dfa4069870910f&fn=ad4eebf8-280f-4b20-baaf-841fe0f2aed8.png&cd=attachment&ts=495018&p=fs&cid=1&sig=9345237bd068d2fbd04643f37309903d5cd645598053691ba6f10db1df6e560b&v=0)

it's up see

## Response:
6/21/2026, 12:24:51 PM

You’re right that the dashboard shows **notebooklm connected**. The issue is narrower: the tool surface exposed to me in this chat does **not currently include the NotebookLM actions**, and the Desktop Commander route I tested is the disconnected one shown in your screenshot.

I’m going to re-query the Bifrost tool registry directly for NotebookLM now.

The dashboard confirms **NotebookLM is connected inside Bifrost**, but the tool registry exposed to me in this chat still does **not** include any NotebookLM callable tools. I re-listed all 67 Bifrost tools exposed here; they are Desktop Commander, Logseq, and Microsoft Docs tools only. So the failure mode is not “Bifrost is down”; it is **NotebookLM is connected locally but not exposed into this ChatGPT tool surface**.

I’m going to complete the spec from the strategy framework context already in this project and the uploaded evidence-based implementation plan template.

## Prompt:
6/21/2026, 12:40:37 PM

ok , instead i've attached the sources, notes, and reports from the notebook via the two attached zip files

[Attachment: notebooklm-export-2026-06-21.zip]

[Attachment: notebooklm-sources-2026-06-21.zip]

## Response:
6/21/2026, 12:40:41 PM

> **Processing uploaded zip and template for specification**
>
> The user uploaded zip files, likely containing a template named "Evidence_Based_Agent_Implementation_Plan_Template." I'll inspect the contents, complete the specification, and possibly generate markdown files. Since the task is in markdown, I'll create it without the need for docx/pdf unless further specified. I should include the citation if I reference the uploaded template.
>
> **Inspecting zip files and creating implementation plan**
>
>
> **Inspecting and summarizing files**
>
> I need to inspect the files first, so I'll extract them to a temporary folder and read through them. I'll likely need to look at the notes and list the main headings in the documents. I’ll also search for key terms to get a better summary of the content.
>
> **Extracting and scanning document files**
>
>
> **Inspecting documents and generating specification**
>
> I need to review relevant documents like "All_notes" and "The Integrated Strategy" to extract key concepts. Since I'm using sandbox files, formal citations aren't possible, but I can mention the zip filenames. I'll generate downloadable Markdown files for the specification and implementation plan without full content, creating user-facing files.
>
> **Extracting key concepts from strategy documents**
>
>
> **Inspecting "Golden Key" in source**
>
> I need to check if "Golden Key" appears in the source documents. It's likely an important term or concept, so I'll carefully review it to see if it's relevant for the task at hand. I'll evaluate its significance before moving forward with the next steps.
>
> **Inspecting key term occurrences in documents**
>
>
> **Creating specification document**
>
> I need to create a formal specification for app creation, including a PRD (Product Requirements Document), SDS (System Design Specification), data models, invariants, test plan, and an implementation plan. This should all be formatted in a SPEC.md document, per the uploaded plan template. I'll also inspect source documents for details on "case management" and its connection to CMMN (Case Management Model and Notation).
>
> **Inspecting case management documentation**
>
>
> **Creating a comprehensive file**
>
> I don't want the final file to be too long, but it needs to be comprehensive. I should probably reference the template through file searches for citation. I can either use a file search to find the specific lines or click to cite lines from the current upload, to ensure accuracy.
>
> **Finalizing and generating spec files**
>
> I need to include citations in the final output. The spec will be based on the sources, and I'll generate a comprehensive plan with a source digest. I'll parse the documents and possibly provide a source map, but no direct citation line for zips. I’ll create the spec files: strategy-kernel-spec.md, strategy-kernel-implementation-plan.md, and strategy-kernel-build-brief.md, with a possible .zip. I'll generate concise summaries and appendices, then use appropriate tools to write files.
>
> **Building out spec and ensuring invariants for MVP**
>
> I'm defining the MVP scope and key invariants, like requiring provenance (INV-001) and ensuring direct quotes are exact (INV-002). I’m also outlining tests for creation, extraction, and ranking, acknowledging the need for human approval and no autonomous agent action. I'll include detailed workflows for source imports, evidence extraction, and strategy mapping.
>
> **Defining MVP scope and UI elements**
>
> For the MVP, I’m excluding features like a live NotebookLM connector, multi-user collaboration, and full autonomous agent running. I’ll include a detailed UI with screens for the dashboard, evidence inbox, and various strategy tools. The implementation plan will follow predefined phases, using structured schemas where applicable. I'll stay concise with my files.
>
> **Generating files with sandbox citations**
>
> I'm preparing the content you need in the analysis phase and will transfer it to the user-visible section in Python for file creation. The final files will include required citations grounded by the template. For zip files, I can mention inspection, but no formal citation is necessary.
>
> **Planning spec content and organization**
>
> I need to craft code that generates specs and includes a source manifest. The files extracted can be used to create this, and I can store them in a dedicated folder for zipping. The content will start with the "SOURCE_NOTES_SUMMARY.md" and include
>
> **Finalizing workstream processes and file checks**
>
> I need to prepare workstreams for A-L, focusing on the evidence model and key slices, maybe the first 20. Parallelization and TDD are also on the list. I'll need to check if the script from earlier was interrupted; no output yet, so examining the file should help. I'll finalize the agent kickoff prompt too.
>
> **Identifying available strategy files in directory**
>
>
> **Preparing file contents and handling sources**
>
> I want to create the file contents by synthesizing the information. I'll generate a manifest from the uploaded zip files, summarize their contents, and include enough grounding, like noting the 57 markdown files extracted. Since the user mentioned Bifrost, I'll clarify that I used the zips instead. Then, I'll prepare the code and write the file with content from my analysis, keeping the string manageable for the tool. I'll handle the citation and timestamp properly. I’ll call the tool with the file.
>
> Thought for 1m 27s

Done - I processed the two NotebookLM zip exports and created a complete app-spec package.

Main design call: **Strategy Kernel should treat each strategic effort as a “Strategy Case”** that preserves the chain:

```text
source → evidence → comparison → choice → bet → experiment → implementation → claim
```

I also aligned the build plan to your evidence-gated implementation template: spec IDs, invariants, tests, evidence records, agent stop conditions, and “done only with evidence,” not agent summaries. `Evidence_Based_Agent_Implementation_Plan_Template.md`

Files:

- [Download full package ZIP](sandbox:/mnt/data/strategy-kernel-app-spec-package.zip)
- [SPEC.md - Strategy Kernel Application Specification](sandbox:/mnt/data/strategy_kernel_app_spec_package/strategy-kernel-spec.md)
- [PLAN.md - Evidence-Based Implementation Plan](sandbox:/mnt/data/strategy_kernel_app_spec_package/strategy-kernel-implementation-plan.md)
- [Coding Agent Build Brief](sandbox:/mnt/data/strategy_kernel_app_spec_package/strategy-kernel-coding-agent-brief.md)
- [Source Processing Summary](sandbox:/mnt/data/strategy_kernel_app_spec_package/strategy-kernel-source-summary.md)

The strongest MVP path is **not** live NotebookLM integration first. It should be: import NotebookLM markdown/export files → chunk sources → review evidence → build MCGCS/choice cascade → approve strategy bets → generate implementation slices with evidence gates. That gives you the product’s real spine before adding connectors.

## Prompt:
6/21/2026, 1:02:23 PM

that is absolutely excellent. lets tweak it some, first by extrapolating some details, so don't generate new artifacts just yet while we explore these. first , let take a look at all the MECE set of  jobs to be done (JTBD) by the app so we can ensure all outcomes are covered and map them to the MECE set of user stories/value mappings/job stories so we see it all end to  end

## Response:
6/21/2026, 1:02:23 PM

> **Considering citation requirements for file usage**
>
> The user is asking about a spec we created, and there may be an attached file, but they didn't directly reference it. I need to explore if it's relevant for the answer. The user's focus is on exploration, not necessarily the file, so we might not need to use it—but if I mention it, I should include a citation.
>
> **Considering file usage for JTBD context**
>
> I’m wondering if I need to cite the file, especially for evidence-gated implementation. The file already has a citation for the template, but now I’m thinking about inspecting the zip files to ensure accuracy. I should check their contents, but I'll avoid generating new artifacts since the user mentioned not wanting that.
>
> **Listing zip file contents for analysis**
>
>
> **Clarifying grounded details and citation requirements**
>
> I’m thinking about how to approach extracting grounded details without using citations. Since the user didn’t ask for citations and I won’t be using file_search, I might not need to worry about citations. Instead, I’ll focus on structuring a MECE set of JTBD and mapping them to user stories, avoiding artifact generation.
>
> **Framing JTBD and agency layer considerations**
>
> I'm focusing on mapping the JTBD to job stories and outcomes, covering things like Listening, Aiming, Moving, and Claiming, as well as other frameworks. I wonder if I should mention and cite the uploaded Epistemic Navigator file, which adds user agency and control? It could strengthen the JTBD by emphasizing user empowerment.
>
> **Considering citations for user agency and template reference**
>
> The user didn’t specifically ask for citations, but if I mention a "user agency meta-layer," I might need to cite the EmpoweredUser file. I'll also consider citing the template, especially if I need to reference specific lines from it. I'll check for relevant lines if needed.
>
> **Searching for specific template file**
>
> The search didn’t return the template, possibly due to the source_filter being active or the template not being included in the search. It looks like file_search only found the EmpoweredUser file, maybe due to overload. I’ll check for the template by searching with the exact filename.
>
> **Defining job-to-be-done (JTBD) and user stories**
>
> I don’t need to cite the template since it didn’t show up, but I might cite EmpoweredUser when needed. The user wants detailed exploration, so let's focus on providing main insights along with tables to map the MECE set of JTBD by the app. I'll create levels and split into outcome domains with ID, adding a coverage check for the sources and frameworks.
>
> **Crafting a MECE map for JTBD**
>
> I’m defining the jobs that the app does or what it’s hired to do, like preserving strategic material, organizing evidence, helping the user understand and compare options, and more. I’ll break down the lifecycle into steps, ensuring each job neatly fits into a MECE framework. 
> 
> I'll start with jobs like governing user agency and framing cases but may need to adjust when testing it.
>
> Thought for 52s

Yes - this is the right next layer. The key move is to separate **the app’s end-to-end strategy value chain** from the **control-plane jobs** that make the system trustworthy. If we mix them, the JTBD map gets muddy.

The clean model is:

```text
Value Chain JTBD = the strategy work the app helps complete
Control Plane JTBD = the trust, agency, evidence, and governance layer that keeps the work valid
```

That gives us a true MECE structure instead of a bloated feature list.

## A. MECE value-chain JTBD

| ID | App JTBD | Plain-English outcome |
|---|---|---|
| JTBD-01 | Frame the strategy case | Turn a vague strategic concern into a named case with scope, aim, arena, owner, and current phase. |
| JTBD-02 | Ingest strategic reality | Pull scattered source material into the case without losing origin, context, or source identity. |
| JTBD-03 | Convert sources into evidence | Transform raw notes, docs, transcripts, reports, and observations into reviewable evidence items. |
| JTBD-04 | Qualify and accept evidence | Separate draft evidence from accepted evidence, weak evidence from strong evidence, and quotes from paraphrases. |
| JTBD-05 | Model the strategic situation | Describe the situation through actors, rankings, MCGCS position, constraints, systems, and gaps. |
| JTBD-06 | Compare strategic positions | Compare self, rivals, customers, current state, possible futures, and alternative interpretations. |
| JTBD-07 | Generate strategic questions | Surface questions the current frame cannot generate on its own. |
| JTBD-08 | Create strategic options | Use destruction/creation to break stale assumptions and recombine new possible moves. |
| JTBD-09 | Form coherent strategic choices | Build a choice cascade: aspiration, where-to-play, how-to-win, capabilities, systems. |
| JTBD-10 | Convert choices into falsifiable bets | Turn strategic choices into bets with assumptions, counterevidence, success metrics, and kill criteria. |
| JTBD-11 | Design learning experiments | Convert uncertainty into experiments that can update the evidence base. |
| JTBD-12 | Execute adaptively | Manage strategy execution as a living case with tasks, sentries, milestones, discretionary moves, and evidence gates. |
| JTBD-13 | Generate implementation plans | Convert approved bets into PRD/SDS/INV/TST-linked work slices for agents or humans. |
| JTBD-14 | Claim and communicate value | Prove what changed, what value was created, what evidence supports the claim, and what remains uncertain. |
| JTBD-15 | Review and evolve strategy | Feed outcomes back into the case so the strategy improves over time. |

That is the core loop. It starts with **orientation** and ends with **learning**, not with “a strategy document.”

## B. Control-plane JTBD

These are not steps in the strategy workflow. They govern the whole system.

| ID | Control-plane JTBD | Why it matters |
|---|---|---|
| CTRL-01 | Preserve provenance | Every claim must trace back to source, evidence, experiment, or human judgment. |
| CTRL-02 | Preserve human agency | The user must be able to pause, redirect, challenge, override, or reframe the system. This matches the empowerment/control-panel logic in your Navigator materials: user agency, customization, contestability, and co-design are explicit system behaviors. `EmpoweredUser_EpistemicNavigator.md` |
| CTRL-03 | Separate fact, inference, hypothesis, and speculation | The app must not let polished synthesis disguise weak evidence. |
| CTRL-04 | Preserve contradiction | Counterevidence should remain visible instead of being smoothed away. |
| CTRL-05 | Govern agent authority | Agents draft, critique, and suggest. Humans approve. |
| CTRL-06 | Maintain evidence-gated completion | No implementation slice should be marked complete without agreed evidence. |
| CTRL-07 | Support framework evolution | The user should be able to modify the framework, not just use a frozen model. Your Navigator material explicitly includes framework modification and user co-creation rights. `EmpoweredUser_EpistemicNavigator.md` |
| CTRL-08 | Export/import the strategic record | The strategy case must be portable, inspectable, and agent-followable. |
| CTRL-09 | Provide auditability | Status changes, evidence approvals, decisions, and agent runs must leave a trail. |
| CTRL-10 | Protect against manipulative strategy outputs | The system should preserve authentic choice, avoid false dichotomies, and expose persuasive framing when relevant. `EmpoweredUser_EpistemicNavigator.md` |

This control plane is what makes Strategy Kernel different from NotebookLM plus a dashboard. It is not just helping the user think. It is protecting the integrity of thinking.

## C. End-to-end user story / value / job story map

| JTBD | User story | Job story | Value created |
|---|---|---|---|
| JTBD-01 Frame the strategy case | As a strategist, I want to create a bounded strategy case so I can stop mixing unrelated decisions. | When I have a messy strategic concern, I want to define the case, scope, phase, and aim, so I know what kind of work I am actually doing. | Reduces ambiguity; creates a container for strategy work. |
| JTBD-02 Ingest strategic reality | As a user, I want to import sources from NotebookLM, docs, notes, reports, and transcripts so the case starts from real material. | When my evidence is scattered, I want to pull it into one case without losing source context, so I can reason from reality instead of memory. | Creates source completeness and lowers friction. |
| JTBD-03 Convert sources into evidence | As a strategist, I want the app to extract candidate evidence so I can review signals faster. | When I have too much source material, I want the app to propose evidence items, so I can focus on judgment rather than manual extraction. | Saves time while preserving review. |
| JTBD-04 Qualify and accept evidence | As a strategist, I want to approve, reject, split, merge, and score evidence so accepted claims are trustworthy. | When the app extracts evidence, I want to decide what counts, so the strategy does not rest on unreviewed AI output. | Builds trust and prevents hallucinated strategy. |
| JTBD-05 Model the strategic situation | As a strategist, I want to map actors, rankings, MCGCS elements, constraints, and gaps so I can see the battlefield. | When I need to understand a strategic situation, I want the app to separate mission, climate, ground, command, and systems, so I can see what is missing or misread. | Turns raw evidence into strategic diagnosis. |
| JTBD-06 Compare strategic positions | As a strategist, I want to compare alternatives and actors so I can see advantage relationally. | When I am choosing a direction, I want to compare self, rivals, customers, and possible futures, so I can see where advantage could emerge. | Reveals differentiation and relative position. |
| JTBD-07 Generate strategic questions | As a strategist, I want the app to generate deeper questions from gaps and contradictions so I do not get trapped in the obvious frame. | When the current frame feels incomplete, I want better questions, so I can discover the move that the old model could not produce. | Expands strategic imagination. |
| JTBD-08 Create strategic options | As a strategist, I want to break assumptions apart and recombine possibilities so I can create non-obvious options. | When existing options feel stale, I want to deconstruct assumptions and recombine parts, so I can generate new strategic possibilities. | Produces creative strategic options without losing discipline. |
| JTBD-09 Form coherent strategic choices | As a strategist, I want to build a choice cascade so my strategy is a coherent set of reinforcing choices. | When I have many possible moves, I want to define aspiration, where-to-play, how-to-win, capabilities, and systems, so the strategy becomes integrated. | Converts insight into strategic architecture. |
| JTBD-10 Convert choices into falsifiable bets | As a strategist, I want to turn strategy into bets so I know what must be true. | When I believe a strategic move might work, I want to state assumptions, counterevidence, metrics, and kill criteria, so I can test instead of just believe. | Prevents strategy theater. |
| JTBD-11 Design learning experiments | As a strategist, I want to design experiments so uncertainty becomes learnable. | When a bet depends on unknowns, I want to create an experiment, so I can update the case with evidence. | Turns uncertainty into learning loops. |
| JTBD-12 Execute adaptively | As an operator, I want execution to behave like a living case rather than a rigid plan. | When strategy execution changes as evidence arrives, I want tasks, sentries, milestones, and discretionary moves, so the plan adapts without losing control. | Connects strategy to real-world motion. |
| JTBD-13 Generate implementation plans | As a builder, I want approved strategy to become evidence-gated work slices so humans or agents can execute safely. | When a strategic bet is approved, I want PRD/SDS/INV/TST-linked slices, so implementation stays aligned to intent. | Converts strategy into agent-followable work. |
| JTBD-14 Claim and communicate value | As a strategist, I want to prove and communicate value created so stakeholders can trust the outcome. | When work produces results, I want to compare before/after and show evidence, so claims are credible. | Creates defensible value realization. |
| JTBD-15 Review and evolve strategy | As a strategist, I want outcomes to update the case so the framework gets sharper over time. | When experiments and execution produce evidence, I want the app to update claims, choices, and bets, so the strategy learns. | Creates compounding strategic intelligence. |

## D. What this reveals about the app

The app has **three nested products** inside it.

First, it is a **strategy case manager**. That is the outer container: sources, evidence, choices, bets, execution, review.

Second, it is an **evidence-to-strategy engine**. That is the thinking core: extract evidence, model position, compare, question, create, choose.

Third, it is an **agent governance layer for strategy execution**. That is the action core: convert approved strategy into bounded implementation slices with evidence gates.

The mistake would be building only one of those. A notes app covers the first weakly. A chatbot covers the second loosely. A project manager covers the third mechanically. Strategy Kernel becomes valuable because it ties all three together.

## E. Possible missing JTBD we should decide on

I see four candidates that may need to be explicit in the spec.

| Candidate | Should it be included? | Why |
|---|---:|---|
| Personal strategy coaching | Maybe | The framework could help an individual reason about career, business, or life strategy, but this may dilute the business/product positioning. |
| Multi-agent debate / dialectic | Yes, likely | Your Navigator materials already include opposing worldviews and contestability. This should probably become a “Critique and Dialectic” capability. `EmpoweredUser_EpistemicNavigator.md` |
| Strategy library / reusable patterns | Yes, later | Once cases accumulate, the app should let the user reuse patterns, questions, and bet templates. |
| Stakeholder communication package | Yes | Claiming value should produce investor updates, leadership memos, decision briefs, or customer-facing proof narratives. |

My recommendation: add **Critique/Dialectic** explicitly, but treat personal coaching and pattern libraries as later-stage extensions. The core MVP should stay focused on the strategic case loop.

## Prompt:
6/21/2026, 1:21:16 PM

i asked two other agents the following:
lets translate the ideas of and ARD, PRD, SDS (Software Design Specification), and TSD (testing strategy document) for real world strategy not necessserily connected to software (can use ARD, PRD, SDS, and TSD). for example the PRD would be an ORD (outcome requirement document) if that makes sense

thier responces:

# agent 1
This is a really fun framing exercise! You're essentially taking the **documentation pipeline** of software engineering — where each artifact answers a progressively more concrete question — and porting that logic to any real-world endeavor. Let me build out a clean translation layer.

#### The Underlying Logic

In software, these documents form a **chain of increasing specificity**: each one inherits the *why* from above and adds the *how* below. The SDS, for example, "translates business requirements into architecture decisions" and choices that can actually be executed , while the testing layer verifies "the system against the PRD and TRD to ensure that it actually fulfills the specified requirements" . That cascade — **purpose → desired result → designed approach → verification** — is the part that's universal. It works for losing weight, launching a campaign, relocating a city, or running a nonprofit just as well as it works for code.

#### The Translation Map

| Software Artifact | Answers... | Real-World Strategy Analog | Answers... |
|---|---|---|---|
| **ARD** (Architecture/Analysis Requirements) | "What's the foundation & constraints?" | **ARD** — *Aims & Rationale Document* | "Why are we doing this, and what's fixed?" |
| **PRD** (Product Requirements) | "What must the product do?" | **ORD** — *Outcome Requirement Document* | "What results must be true when we succeed?" |
| **SDS** (Software Design Specification) | "How is it architected?" | **ADS** — *Approach Design Specification* | "How will we actually structure the plan?" |
| **TSD** (Testing Strategy Document) | "How do we verify it works?" | **VSD** — *Validation Strategy Document* | "How will we know it's working?" |

Notice I kept **ARD** intact (the acronym survives, the words shift) and adopted your **ORD** idea — it slots in beautifully.

#### 1. ARD → Aims & Rationale Document

This is your **bedrock layer** — the equivalent of the software ARD where architects establish the foundational constraints before any building begins.

- **Mission / Aim:** The fundamental reason this effort exists.
- **Stakeholders:** Who is affected, who decides, who pays.
- **Fixed constraints:** Budget, time, regulations, non-negotiables.
- **Success definition (high-level):** What "winning" even means in principle.

> *Real-world example (opening a café):* "We aim to create a profitable neighborhood gathering space within 18 months. Constraints: \$120k budget, must comply with local health codes, founder works full-time elsewhere for first 6 months."

#### 2. PRD → ORD (Outcome Requirement Document)

Your coinage — and it's spot-on. Where a PRD specifies what the product must *do*, the **ORD specifies the concrete outcomes** that must be true. It deliberately stays **solution-agnostic**, just like a good PRD avoids prescribing the tech stack.

- **Required outcomes:** Measurable end-states (e.g., "Break even by month 14").
- **Acceptance criteria:** How you'll judge each outcome as met — borrowing directly from the software practice of defining "acceptance criteria for each requirement" .
- **Priorities:** Must-haves vs. nice-to-haves.

> *Café ORD:* "Serve 80 customers/day by month 6; achieve 25% repeat-customer rate; maintain a 4.5★ average review."

#### 3. SDS → Approach Design Specification

This is the **blueprint stage**. In software, the SDS describes "the system architecture, its components, the interactions among the components" and gives the team "a detailed roadmap" to act on . Your ADS does the same for a strategy — it's the first document that commits to *how*.

- **Components / workstreams:** The moving parts (location, supply chain, staffing, marketing).
- **Interactions & dependencies:** What relies on what, and sequencing.
- **Chosen approach + tradeoffs:** Just as an SDS justifies "Postgres vs. Mongo" against requirements , your ADS justifies, say, "lease vs. buy" against your ARD constraints.

> *Café ADS:* "Lease corner unit (lower capital, faster start); source beans from two suppliers for redundancy; hire 2 baristas + 1 manager; soft-launch marketing 4 weeks pre-open."

#### 4. TSD → Validation Strategy Document

The final layer: **how you prove it's working** rather than assuming it is. The software TSD covers "testing strategies" and verification methods ; your VSD defines the **real-world equivalent of test cases** — the metrics, checkpoints, and review cadences.

- **Validation metrics:** KPIs tied directly back to the ORD outcomes.
- **Test cadence:** Weekly/monthly review rhythm.
- **Failure thresholds & contingencies:** What triggers a pivot.

> *Café VSD:* "Track daily covers and review velocity weekly; if month-3 repeat rate < 15%, run a loyalty-program experiment; if cash runway drops below 3 months, trigger contingency funding."

#### Why This Mapping Holds Together

The elegance is that **each document constrains the next**:

```
ARD (why + limits)
  └─> ORD (what outcomes prove success)
        └─> ADS (how we'll structure the approach)
              └─> VSD (how we verify the ADS achieves the ORD)
```

The **VSD always validates back against the ORD** — exactly mirroring how software testing checks the build against the PRD . If a metric in your VSD doesn't trace to an outcome in your ORD, it's noise. If an outcome in your ORD violates a constraint in your ARD, you've got a contradiction to resolve before spending a dime.

Want me to draft a **fill-in-the-blank template** for any one of these four (ARD/ORD/ADS/VSD), or apply the full chain to a specific real-world goal you have in mind?

# agent 2 
This is a good translation problem. The goal is a document stack that has the same epistemic rigor as the software stack — same coverage, same handoffs between layers — but speaks the language of strategy rather than engineering.

Here is how I'd map them:

---

## The Strategy Document Stack

### PRD → ORD (Outcome Requirements Document)

You already named this one correctly. The PRD answers "what does the product need to do." The ORD answers "what must be true in the world when this is done." The shift is from output-think to outcome-think.

What goes in it: stakeholder outcomes (not deliverables), acceptance criteria for success, boundary conditions, explicit anti-goals. The ORD should be falsifiable. If you can't tell from the document whether you succeeded, it is not finished.

---

### ARD → SLD (Strategic Logic Document)

The ARD in software captures the structural decisions that shape how the system holds together — constraints, coupling choices, load-bearing components, trade-off rationale. The strategy analog is the document that answers: why does this strategy have the shape it has?

The SLD is not a plan. It is the reasoning behind the architecture of the plan. What are the constraints that govern design choices? What bets are load-bearing versus modular? What would have to be true for a different structure to make more sense? Where are the dependencies that, if they break, break everything?

In strategy work, this document is almost always missing. Teams go from "here are our outcomes" straight to "here is what we are doing." The SLD is the layer that justifies the structure in between.

---

### SDS → EDS (Execution Design Specification)

The SDS specifies how the design is implemented — interfaces, component behavior, sequencing. The EDS does the same for strategy execution.

What goes in it: initiative-level blueprints, sequencing logic (what unlocks what), interfaces between workstreams (where ownership transfers, where input is required, where there is legitimate coupling), resource and capacity allocation, named owners. The EDS is where the strategy becomes a build spec. If the ORD says what must be true and the SLD says why this structure, the EDS says how each piece actually gets done.

---

### TSD → VSD (Validation Strategy Document)

The TSD defines how you verify the software does what it is supposed to do. The VSD defines the epistemics of how you learn whether the strategy is working.

This is more than a metrics dashboard. What goes in it: leading indicators (what signals that you are on track before outcomes are visible), lagging confirmation criteria, experiment design for anything uncertain, kill criteria (at what point does evidence require you to change course), and the instrumentation plan (how you will actually collect the signal you need). The VSD answers the question most strategy docs ignore: how will you know?

---

## The Stack as a Whole

```
ORD   → what must be true in the world
SLD   → why this structure of strategy (constraints, architecture, load-bearing bets)
EDS   → how each initiative is designed and executed
VSD   → how you know it is working
```

The handoffs between layers mirror software: ORD acceptance criteria become SLD design constraints. SLD structural decisions become EDS sequencing logic. EDS initiative specs generate the observability points that VSD instruments.

You can still embed ARD, PRD, SDS, and TSD inside any strategy that involves software. They nest cleanly into the EDS layer as initiative-level specs.

---

A few naming notes worth flagging:

The SLD is the most novel departure. Every other document has a surface analog (outcomes doc, execution plan, metrics framework). The SLD names something that exists informally in most strategy work but almost never gets written down — the structural reasoning. That is also where most strategy failures live. Worth making it explicit.

The VSD also has a different character than TSD. Software testing can be exhaustive. Strategy validation cannot. The VSD needs to be explicit about what it is not covering and why — which is actually the more honest document.

Want to draft templates for any of these, or work out how they connect for a specific GodSpeed initiative?

# prompt

Considering thier responces what changes do you recommend

## Response:
6/21/2026, 1:21:16 PM

> **Clarifying agent responses and strategy changes**
>
> The answer should focus on the agents' responses, but I might need to mention the uploaded file depending on whether it's relevant. The user didn’t request a citation, but if I refer to the document, it may require one. I’ll suggest tweaks to the Strategy Kernel, especially around terms like ARD and CAS.
>
> **Clarifying strategy and document naming**
>
> I’m considering whether to keep "ARD" as Arena & Rationale or Aim & Rationale, especially since Agent 2’s SLD seems more fitting for structure. Maybe combining SRD/SLD could work. For the user’s application, I’ll propose final names for documents: ARD as Architecture & Rationale, PRD as Outcome Requirements, etc.
>
> Thought for 30s

Yes - I would take **Agent 2’s structure as the backbone**, borrow **Agent 1’s clarity**, and add **two missing pieces** that matter for Strategy Kernel: a **reality/evidence layer before outcomes** and a **claiming/value-realization layer after validation**.

The clean change is this:

```text id="m95w77"
Reality → Outcomes → Strategic Logic → Execution Design → Validation → Claiming
```

That maps much better to your app than a direct software-document clone.

## My recommended strategy document stack

| Layer | Recommended artifact | Software analog | Core question | Why this belongs |
|---|---|---|---|---|
| 1 | **ERD - Evidence Reality Dossier** | Discovery / requirements evidence | What is true, observed, sourced, or uncertain? | This prevents the stack from starting with opinions. Strategy needs a reality base before outcomes. |
| 2 | **ORD - Outcome Requirements Document** | PRD | What must be true in the world for this to count as success? | Your ORD idea is exactly right. It forces outcome-thinking instead of deliverable-thinking. |
| 3 | **SLD - Strategic Logic Document** | ARD / architecture rationale | Why does this strategy have this shape? | Agent 2’s best contribution. This is the missing layer in most strategy work. |
| 4 | **EDS - Execution Design Specification** | SDS | How will the strategy be structured and executed? | Better than ADS because it is not just an “approach”; it specifies workstreams, interfaces, owners, sequencing, and dependencies. |
| 5 | **VSD - Validation Strategy Document** | TSD | How will we know whether it is working? | Keep this. But in strategy, validation is not pass/fail only; it updates confidence. |
| 6 | **VRD - Value Realization Document** | Release notes / acceptance report / post-implementation review | What value was actually created, proven, claimed, or learned? | This maps to your “Claiming” phase and prevents the process from ending at execution metrics. |

The two changes I would make to the agents’ responses are: **add ERD before ORD** and **add VRD after VSD**. Otherwise the stack starts too late and ends too early.

## Why I would not use Agent 1’s ARD as-is

Agent 1’s **ARD = Aims & Rationale Document** is useful, but it overlaps too much with the ORD and SLD. “Why are we doing this?” belongs partly in the case charter and partly in strategic logic. “What’s fixed?” belongs in constraints. “What does winning mean?” belongs in the ORD.

So I would not make ARD a main strategy artifact unless you want a lightweight front-door document. For Strategy Kernel, I’d treat it as a **Case Charter**, not as the core architecture layer.

Better split:

```text id="8a8te3"
Case Charter = what case are we opening and why?
ERD = what evidence/reality are we starting from?
ORD = what outcomes must become true?
SLD = why this strategy structure?
EDS = how execution is designed?
VSD = how we validate?
VRD = what value was realized?
```

## Why Agent 2’s SLD is the key upgrade

The **SLD - Strategic Logic Document** should absolutely be added to the spec.

That document answers the question strategy teams usually skip:

```text id="9cty6u"
Why this structure instead of another structure?
```

It should contain:

| SLD section | What it captures |
|---|---|
| Strategic thesis | The central logic of how advantage will be created. |
| Load-bearing bets | The assumptions that, if false, break the strategy. |
| Strategic constraints | Boundaries that shape what moves are viable. |
| Tradeoff rationale | What we are choosing not to do and why. |
| Comparison logic | Why this path is better than alternatives. |
| Capability logic | Why these capabilities are required. |
| System logic | What management systems must sustain the strategy. |
| Failure logic | Where the strategy is most likely to break. |

This is where your app becomes much more than an evidence board. The SLD is the bridge between **evidence** and **execution**.

## The updated end-to-end mapping

| Strategy Kernel phase | Artifact | JTBD covered |
|---|---|---|
| Open case | **Case Charter** | Frame the strategy case |
| Listen | **ERD - Evidence Reality Dossier** | Ingest reality, convert sources into evidence, qualify evidence |
| Aim | **ORD - Outcome Requirements Document** | Define success, acceptance criteria, non-goals |
| Aim / Compare | **SLD - Strategic Logic Document** | Model situation, compare positions, form strategic logic |
| Create / Choose | **Choice Cascade + Strategy Bet Record** | Generate options, form choices, create falsifiable bets |
| Move | **EDS - Execution Design Specification** | Design execution, owners, workstreams, dependencies |
| Move / Learn | **VSD - Validation Strategy Document** | Design experiments, metrics, leading/lagging signals, kill criteria |
| Claim | **VRD - Value Realization Document** | Prove value, communicate outcomes, update strategy |
| Review | **Strategy Review Record** | Feed learning back into the case |

This gives you full coverage from **source reality** to **claimed value**.

## Naming recommendation

Use these names in the app:

```text id="2wouv0"
Case Charter
ERD - Evidence Reality Dossier
ORD - Outcome Requirements Document
SLD - Strategic Logic Document
EDS - Execution Design Specification
VSD - Validation Strategy Document
VRD - Value Realization Document
SDR - Strategy Decision Record
```

The **SDR - Strategy Decision Record** is important too. It should work like ADRs in software: small, decision-specific records created throughout the case.

Example SDRs:

```text id="7fvtvl"
SDR-001 - Choose founder/operator market before enterprise governance market
SDR-002 - Treat NotebookLM as import/export, not live connector, for MVP
SDR-003 - Use evidence graph before visual graph UI
```

So the main docs describe the case. The SDRs capture the important decisions along the way.

## How this should change Strategy Kernel

I’d update the spec so each Strategy Case has a **Document Stack** section:

```text id="rq1spq"
Strategy Case
├── Case Charter
├── ERD - Evidence Reality Dossier
├── ORD - Outcome Requirements Document
├── SLD - Strategic Logic Document
├── Choice Cascade
├── Strategy Bet Records
├── EDS - Execution Design Specification
├── VSD - Validation Strategy Document
├── VRD - Value Realization Document
├── SDRs - Strategy Decision Records
├── Evidence Log
└── Open Questions Register
```

The app should not force the user to fill every document manually. It should generate and update these documents from the case graph.

That means the underlying object model stays graph-based, but the user gets coherent artifacts.

```text id="yflske"
Evidence graph = source of truth
Documents = readable views of the graph
```

That is the right architecture.

## The critical design principle

Do **not** make these static templates.

Make them **living strategy artifacts**.

For example:

- The ERD updates when new evidence is accepted.
- The ORD updates when outcomes are revised.
- The SLD updates when strategic logic changes.
- The EDS updates when execution structure changes.
- The VSD updates when new uncertainty appears.
- The VRD updates when outcomes are proven or disproven.
- SDRs preserve decision history.

This matches your broader “user agency / contestability / co-design” direction: the user should be able to challenge, revise, and reshape the framework instead of being trapped inside a rigid template. `EmpoweredUser_EpistemicNavigator.md`

## Bottom line

I’d make these changes:

1. **Keep ORD.** That name is strong.
2. **Adopt SLD from Agent 2.** It is the most important missing concept.
3. **Use EDS instead of ADS.** Execution is more precise than approach.
4. **Keep VSD, but define it as learning/validation, not just testing.**
5. **Add ERD before ORD.** Strategy needs evidence reality before outcome claims.
6. **Add VRD after VSD.** Strategy needs value claiming and learning capture.
7. **Add SDRs as decision records.** They are the strategy analog of ADRs.

So the revised stack should be:

```text id="haax7o"
ERD → ORD → SLD → EDS → VSD → VRD
        ↘ SDRs throughout ↙
```

That gives Strategy Kernel a better spine than the original software analogy while still preserving the rigor you wanted from PRD/SDS/TSD discipline.

## Prompt:
6/21/2026, 1:30:06 PM

excellent i agree. now before we rewrite the spec lets consider the UI/UX, data structure and API. for the UI what screens (and elements needed for each screen) will be needed, what goals are achieved through each screen/element, how do the screens maps to the journey, what does each step of the journey afford, which inputs and outputs map to each step, how are they transformed, how does to all gauranteed progress/outcomes instead of completion theater, etc

## Response:
6/21/2026, 1:30:07 PM

The UI should be designed around **earned progress**, not page completion. A user should never feel “done” because a document has text in it. They should feel progress only when the app has moved something through a gate:

```text
raw input → sourced evidence → accepted evidence → claim → decision → bet → experiment → execution → verified value
```

That means the UI is not just screens. It is a **strategy production line with proof gates**.

## 1. The core UX model

I would structure the app around three layers:

```text
Case Cockpit
↓
Journey Workspaces
↓
Evidence / Decision / Validation Rails
```

The **Case Cockpit** tells the user where the strategy case stands.

The **Journey Workspaces** are where the work happens: ERD, ORD, SLD, EDS, VSD, VRD, etc.

The **Rails** are always available: evidence, decisions, open questions, risks, agent runs, audit trail, source trace.

This matters because the app should not hide the evidence layer inside each screen. The evidence rail should be visible everywhere, because provenance is the app’s discipline.

---

# 2. Recommended journey stages

I would use this end-to-end journey:

```text
0. Open Case
1. Establish Reality
2. Define Outcomes
3. Build Strategic Logic
4. Create Options
5. Choose and Bet
6. Design Execution
7. Validate and Learn
8. Claim Value
9. Review and Evolve
```

Mapped to documents:

| Journey stage | Primary artifact | Purpose |
|---|---|---|
| 0. Open Case | Case Charter | Define what strategic case exists and why. |
| 1. Establish Reality | ERD — Evidence Reality Dossier | Build the sourced reality base. |
| 2. Define Outcomes | ORD — Outcome Requirements Document | Define what must become true. |
| 3. Build Strategic Logic | SLD — Strategic Logic Document | Explain why this strategy has its shape. |
| 4. Create Options | Destruction/Creation Board | Break assumptions and recombine options. |
| 5. Choose and Bet | Choice Cascade + Strategy Bet Records | Commit to a coherent strategic direction. |
| 6. Design Execution | EDS — Execution Design Specification | Design workstreams, owners, dependencies, interfaces. |
| 7. Validate and Learn | VSD — Validation Strategy Document | Define how the strategy will be tested and updated. |
| 8. Claim Value | VRD — Value Realization Document | Prove what changed and what value was created. |
| 9. Review and Evolve | Strategy Review Record | Feed learning back into the system. |

The app should let users move nonlinearly, but it should **not let them claim mature progress out of order**.

For example, they can draft a strategy bet early, but the app should label it:

```text
Draft Bet — blocked by weak ERD and missing VSD.
```

That is how we prevent completion theater.

---

# 3. Screen architecture

## Screen 1 — Workspace Dashboard

**Goal:** Help the user choose where to work and see which cases are real, blocked, stale, or progressing.

### Elements

| Element | Goal |
|---|---|
| Active case cards | Show each strategy case and its current phase. |
| Evidence health indicator | Show whether the case has accepted evidence or just drafts. |
| Blocking questions count | Show unresolved ambiguity that prevents progress. |
| Validation status | Show whether bets have experiments and evidence gates. |
| Recent decisions | Keep strategic commitments visible. |
| Agent activity feed | Show what agents drafted, failed, or need review. |
| “Start new strategy case” button | Open a new case with a charter, not a blank doc. |

### Inputs

- Workspace metadata
- Case statuses
- Evidence counts
- Open question counts
- Decision log
- Agent run records

### Outputs

- Selected strategy case
- New case shell
- Prioritized work queue

### Progress guard

A case card should not show “progress” based on filled sections. It should show progress based on gates:

```text
Reality base established?
Outcomes accepted?
Strategic logic approved?
Bet approved?
Validation running?
Value claimed?
```

---

## Screen 2 — Case Cockpit

**Goal:** Give one truthful view of the case.

This is the most important screen.

### Elements

| Element | Goal |
|---|---|
| Case title, objective, arena | Keep scope visible. |
| Journey stage tracker | Show where the case is in the strategic journey. |
| Current “next best work” panel | Tell the user what action creates real progress next. |
| Evidence strength panel | Show accepted, draft, contradicted, weak, and missing evidence. |
| Document stack status | Show Case Charter, ERD, ORD, SLD, EDS, VSD, VRD status. |
| Open questions rail | Surface blockers. |
| Strategic risk rail | Surface load-bearing risks. |
| Decision rail | Surface accepted SDRs. |
| Agent draft inbox | Show what needs human review. |
| Value/progress ledger | Show what has been verified, not just written. |

### Inputs

- Case metadata
- Evidence graph
- Open questions
- Document statuses
- Bet statuses
- Experiment statuses
- Implementation slice statuses

### Outputs

- Next action
- Navigation to the correct workspace
- Case status updates
- Review queue

### Progress guard

The Case Cockpit should separate:

```text
Drafted
Reviewed
Accepted
Validated
Claimed
```

A document with text is **drafted**.  
A document with human-approved content is **accepted**.  
A bet tested by evidence is **validated**.  
A proven result is **claimed**.

That language matters.

---

# 4. Journey workspace screens

## Screen 3 — Case Charter

**Goal:** Define the strategic container.

### Elements

| Element | Goal |
|---|---|
| Case purpose | Why this case exists. |
| Strategic concern | What triggered the case. |
| Arena / boundary | What is inside and outside scope. |
| Stakeholders | Who is affected, who decides, who pays, who blocks. |
| Initial hypothesis | What the user currently believes. |
| Non-goals | What this case is not trying to solve. |
| Decision authority | Who can approve changes. |
| Case phase | Draft, Listening, Aiming, Moving, Claiming, Review. |

### Inputs

- User description
- Imported notes
- Stakeholders
- Initial assumptions

### Transformation

```text
messy concern → bounded strategy case
```

### Outputs

- Case ID
- Case scope
- Stakeholder map
- Initial open questions
- Source intake plan

### Progress guard

The app should not allow “Established Reality” to be marked ready until the case has a bounded arena and at least one source or manual evidence record.

---

## Screen 4 — Source Library

**Goal:** Bring reality into the case.

### Elements

| Element | Goal |
|---|---|
| Source upload/import area | Add markdown, text, PDFs, NotebookLM exports, reports, transcripts. |
| Source manifest table | Show all sources and provenance metadata. |
| Source type labels | Separate interview, report, note, agent output, customer quote, etc. |
| Chunking status | Show whether source text is addressable. |
| Extraction status | Show whether evidence has been extracted. |
| Source health warnings | Flag duplicate, missing metadata, unreadable, weak, stale, or unsourced material. |
| Source preview | Let user inspect original source. |

### Inputs

- Files
- Pasted notes
- NotebookLM exports
- Manual source records
- Agent reports

### Transformation

```text
raw source → source record → chunked source → extraction-ready material
```

### Outputs

- Source records
- Source chunks
- Source manifest
- Extraction jobs

### Progress guard

The app should distinguish:

```text
Imported source
Chunked source
Evidence extracted
Evidence reviewed
Evidence accepted
```

Imported sources alone do not equal evidence.

---

## Screen 5 — Evidence Inbox / ERD Builder

**Goal:** Convert sources into reviewed evidence.

This screen powers the **ERD — Evidence Reality Dossier**.

### Elements

| Element | Goal |
|---|---|
| Draft evidence queue | Review AI-extracted evidence. |
| Evidence type selector | Classify quote, observation, pain, constraint, risk, gap, assumption, counterevidence. |
| Source context viewer | Show the exact source chunk behind each evidence item. |
| Accept / reject / split / merge controls | Human judgment gate. |
| Confidence and evidence strength fields | Prevent weak signals from looking strong. |
| Contradiction linker | Link evidence that conflicts with other evidence. |
| Actor/ranking linker | Attach evidence to actors and priorities. |
| ERD generated view | Show the living evidence dossier. |

### Inputs

- Source chunks
- Agent extraction drafts
- Manual evidence entries
- User review actions

### Transformation

```text
source chunks → draft evidence → reviewed evidence → accepted evidence base
```

### Outputs

- Accepted evidence
- Rejected evidence
- Contradictions
- Evidence quality scores
- ERD sections
- Open questions

### Progress guard

The app should not count evidence as “usable” until it is accepted or explicitly marked as provisional.

A good status model:

```text
Draft Evidence
Needs Review
Accepted
Rejected
Contradicted
Superseded
```

---

## Screen 6 — Actor and Ranking Map

**Goal:** Identify who matters and what they rank.

### Elements

| Element | Goal |
|---|---|
| Actor list | Buyer, user, competitor, sponsor, regulator, founder, operator, agent/system. |
| Actor profile panel | Role, incentives, constraints, power, pain, current workaround. |
| Stated priorities | What the actor says they value. |
| Revealed priorities | What behavior suggests they value. |
| Ranking statements | “Actor ranks X over Y.” |
| Evidence links | Show what supports each ranking. |
| Confidence indicator | Mark weak vs strong ranking claims. |
| Contradiction area | Show conflicting evidence. |

### Inputs

- Accepted evidence
- User-created actors
- Agent-suggested actors
- Ranking hypotheses

### Transformation

```text
accepted evidence → actor model → ranking model
```

### Outputs

- Actor records
- Ranking records
- Missing evidence questions
- Comparison inputs for SLD

### Progress guard

A ranking should not be accepted unless it has:

```text
actor + preferred value + deprioritized value + scope + basis + confidence
```

Example:

```text
Founder ranks architecture over market signal in early product design.
Basis: human judgment + prior case evidence.
Confidence: medium.
```

---

## Screen 7 — MCGCS Position Map

**Goal:** Model strategic position through Mission, Climate, Ground, Command, and Systems.

### Elements

| Element | Goal |
|---|---|
| Actor selector | Choose self, competitor, customer, stakeholder, team. |
| Mission column | Goals, purpose, values, aspiration. |
| Climate column | Shifting conditions, mood, trend, timing. |
| Ground column | Constraints, terrain, assets, rules, resources. |
| Command column | Authority, judgment, decision style, leadership pattern. |
| Systems column | Routines, processes, tools, feedback loops, operating mechanisms. |
| Evidence drawer | Attach evidence to each cell. |
| Gap detector | Show empty or weak dimensions. |
| Compare mode | Compare two actors or time periods. |

### Inputs

- Actors
- Rankings
- Accepted evidence
- User judgment
- Agent synthesis

### Transformation

```text
evidence + actors + rankings → strategic position model
```

### Outputs

- MCGCS position map
- Position gaps
- Strategic questions
- SLD inputs

### Progress guard

The app should not mark MCGCS “complete” just because each field has text. It should show:

```text
Mission: supported / weak / assumed / missing
Climate: supported / weak / assumed / missing
Ground: supported / weak / assumed / missing
Command: supported / weak / assumed / missing
Systems: supported / weak / assumed / missing
```

---

## Screen 8 — ORD Workspace

**Goal:** Define what must become true.

### Elements

| Element | Goal |
|---|---|
| Outcome list | Define required end-states. |
| Acceptance criteria | Define how each outcome will be judged. |
| Anti-goals | Prevent scope creep. |
| Stakeholder outcome map | Show who benefits and how. |
| Outcome priority | Must-have, should-have, could-have. |
| Evidence support | Link outcomes to reality signals. |
| Outcome conflict detector | Show outcomes that may fight each other. |

### Inputs

- Case Charter
- ERD
- Stakeholder map
- User-defined goals
- Accepted evidence

### Transformation

```text
strategic concern + evidence → falsifiable outcomes
```

### Outputs

- ORD
- Outcome requirements
- Acceptance criteria
- Anti-goals
- Outcome risks
- VSD input metrics

### Progress guard

An outcome should not be accepted unless it has:

```text
measurable or observable success condition
stakeholder relevance
time boundary or review point
acceptance criteria
known uncertainty
```

---

## Screen 9 — SLD Workspace

**Goal:** Explain why the strategy has this shape.

This is the bridge between evidence and execution.

### Elements

| Element | Goal |
|---|---|
| Strategic thesis | The core theory of advantage. |
| Comparison logic | Why this path beats alternatives. |
| Load-bearing bets | Assumptions that can break the strategy. |
| Constraints | Hard and soft limits. |
| Tradeoff rationale | What we are choosing not to do. |
| Capability logic | Why specific capabilities are needed. |
| System logic | What systems must sustain the strategy. |
| Failure logic | Where the strategy is likely to break. |
| Counterargument panel | Red-team critique. |
| Evidence trace panel | Show support for every claim. |

### Inputs

- ERD
- ORD
- MCGCS map
- Rankings
- Comparisons
- User judgment
- Critic agent output

### Transformation

```text
evidence + outcomes + position + comparison → strategic logic
```

### Outputs

- SLD
- Strategic thesis
- Load-bearing assumptions
- Required capabilities
- Required systems
- Failure hypotheses
- Open questions
- Strategy bet candidates

### Progress guard

The SLD should have a **Logic Integrity Score**, not a “completion percentage.”

Integrity checks:

```text
Does the thesis link to evidence?
Are load-bearing bets named?
Are alternatives compared?
Are tradeoffs explicit?
Are capability claims justified?
Are failure points named?
Is counterevidence visible?
```

---

## Screen 10 — Destruction / Creation Board

**Goal:** Break stale assumptions and generate new strategic options.

### Elements

| Element | Goal |
|---|---|
| Current model / assumption list | Capture what is being challenged. |
| Particulars board | Break the model into parts. |
| Obsolete assumption marker | Identify what may no longer be true. |
| Recombination canvas | Combine parts into new options. |
| Option cards | Draft possible strategic moves. |
| Hypothesis marker | Prevent creative ideas from being treated as truth. |
| Validation prompt | Ask what evidence would support or kill each option. |

### Inputs

- SLD assumptions
- MCGCS gaps
- Evidence contradictions
- User-created ideas
- Agent-suggested recombinations

### Transformation

```text
stale model → broken parts → recombined options → hypothesis options
```

### Outputs

- Strategic option cards
- Hypotheses
- Research questions
- Strategy bet candidates

### Progress guard

Creative options must remain marked as:

```text
Hypothesis
```

until linked to evidence, decision, or experiment.

---

## Screen 11 — Choice Cascade Workspace

**Goal:** Convert strategic logic into coherent choices.

### Elements

| Element | Goal |
|---|---|
| Winning aspiration | What winning means. |
| Where-to-play | Arena, customer, segment, geography, channel, problem space. |
| How-to-win | Advantage mechanism. |
| Required capabilities | What must be true internally. |
| Required management systems | What routines, tools, governance, metrics, or loops must sustain it. |
| Coherence checker | Detect contradictions between choices. |
| Evidence links | Tie each choice back to ERD/SLD. |
| Alternative cascades | Compare multiple strategy options. |

### Inputs

- ORD outcomes
- SLD logic
- Option cards
- MCGCS map
- Evidence base

### Transformation

```text
strategic logic + options → integrated choice cascade
```

### Outputs

- Choice cascade
- Capability requirements
- Management system requirements
- Strategy bet candidates
- EDS inputs

### Progress guard

The app should flag:

```text
Winning aspiration without where-to-play
Where-to-play without how-to-win
How-to-win without required capabilities
Capabilities without management systems
Choices without evidence
Choices that conflict with ORD outcomes
```

---

## Screen 12 — Strategy Bet Builder

**Goal:** Turn choices into falsifiable commitments.

### Elements

| Element | Goal |
|---|---|
| Bet thesis | What we believe will work. |
| Linked choice cascade | Tie bet to strategy. |
| Target actor/customer | Who the bet concerns. |
| Assumption list | What must be true. |
| Counterevidence panel | What might disprove or weaken the bet. |
| Success metric | What proves progress. |
| Kill criteria | What tells us to stop or pivot. |
| Experiment links | How the bet will be tested. |
| Approval gate | Human decision to move forward. |

### Inputs

- Choice cascade
- SLD load-bearing bets
- Evidence
- Counterevidence
- User judgment

### Transformation

```text
strategic choice → falsifiable strategy bet
```

### Outputs

- Strategy Bet Record
- Experiment requirements
- EDS requirements
- SDR if approved
- Open questions if not ready

### Progress guard

A bet cannot be approved without:

```text
thesis
target actor
linked choice
evidence basis
assumptions
counterevidence review
success metric
kill criteria
owner
```

This is one of the strongest anti-completion-theater gates.

---

## Screen 13 — EDS Workspace

**Goal:** Design execution.

### Elements

| Element | Goal |
|---|---|
| Workstream map | Break strategy into execution streams. |
| Owner map | Assign accountability. |
| Dependency graph | Show what unlocks what. |
| Interface contracts | Define handoffs between teams/agents/workstreams. |
| Resource plan | Identify capacity and constraints. |
| Milestones | Define progress points. |
| Evidence gates | Define proof required for each milestone. |
| Risk and contingency panel | Show execution failure modes. |

### Inputs

- Approved strategy bets
- Choice cascade
- Required capabilities
- Required systems
- Constraints
- Owners/resources

### Transformation

```text
approved strategy bet → executable design
```

### Outputs

- EDS
- Workstreams
- Tasks
- Owners
- Dependencies
- Milestones
- Evidence gates
- Implementation slices

### Progress guard

No workstream should be marked ready unless it has:

```text
owner
dependency clarity
input/output contract
success evidence
failure signal
```

---

## Screen 14 — VSD Workspace

**Goal:** Define how the strategy will be validated.

### Elements

| Element | Goal |
|---|---|
| Validation question list | What needs to be learned. |
| Leading indicators | Early signals. |
| Lagging indicators | Final confirmation. |
| Experiment design | How uncertainty will be tested. |
| Instrumentation plan | How signals will be collected. |
| Review cadence | When evidence will be reviewed. |
| Kill/pivot criteria | What evidence forces a change. |
| Coverage map | Show which assumptions are untested. |

### Inputs

- Strategy bets
- SLD assumptions
- ORD outcomes
- EDS milestones
- Evidence gaps
- Risk register

### Transformation

```text
uncertainty + outcomes + execution plan → validation strategy
```

### Outputs

- VSD
- Experiments
- Metrics
- Instrumentation plan
- Review cadence
- Kill criteria
- Evidence collection tasks

### Progress guard

The VSD should show **validation coverage**:

```text
Outcome coverage
Assumption coverage
Bet coverage
Milestone coverage
Risk coverage
```

A dashboard metric without a linked outcome or assumption is noise.

---

## Screen 15 — Adaptive Case Board

**Goal:** Execute strategy as a living case, not a rigid checklist.

### Elements

| Element | Goal |
|---|---|
| Active tasks | Show current execution work. |
| Discretionary tasks | Show optional next moves. |
| Sentries / triggers | Show conditions that open or block work. |
| Milestones | Show evidence-gated progress points. |
| Blockers | Surface unresolved dependencies. |
| Evidence required | Show what proof is needed before moving forward. |
| Case events | Show what changed. |
| Agent/human task ownership | Separate who does what. |

### Inputs

- EDS workstreams
- VSD validation tasks
- Strategy bets
- Human decisions
- New evidence
- Agent updates

### Transformation

```text
execution design + live evidence → adaptive case movement
```

### Outputs

- Completed tasks
- Blocked tasks
- New evidence
- Triggered milestones
- New open questions
- Updated case state

### Progress guard

Milestones cannot be marked complete without evidence records.

Task states should be:

```text
Planned
Ready
Blocked
In Progress
Needs Evidence
Verified
Rejected
Superseded
```

Avoid “Done” as a final state. Use **Verified**.

---

## Screen 16 — Implementation Slice Builder

**Goal:** Convert execution into agent-followable or human-followable slices.

### Elements

| Element | Goal |
|---|---|
| Slice list | Show implementation units. |
| Linked IDs | Connect to ORD/SLD/EDS/VSD/INV/TST-style records. |
| Evidence requirement | Define what proves completion. |
| Test/check definition | Make verification concrete. |
| Agent brief generator | Generate bounded prompts. |
| Stop condition editor | Prevent runaway agent loops. |
| Dependency map | Show sequencing. |
| Evidence record attach area | Attach test output, review note, trace, or external proof. |

### Inputs

- EDS tasks
- VSD validation rules
- Approved bets
- Requirements
- Invariants
- Agent role templates

### Transformation

```text
execution task → bounded implementation slice → evidence-gated work unit
```

### Outputs

- Implementation slices
- Agent prompts
- Required evidence records
- Dependencies
- OPEN_QUESTIONS if ambiguous

### Progress guard

A slice cannot be verified unless:

```text
linked requirement exists
verification method exists
evidence record exists
related invariants pass
open blockers are resolved or deferred
```

This directly inherits the evidence-based implementation discipline we already defined.

---

## Screen 17 — SDR / Decision Log

**Goal:** Preserve strategic decisions as inspectable records.

### Elements

| Element | Goal |
|---|---|
| Decision list | Show all strategic decisions. |
| Decision detail | Question, context, options, decision, rationale. |
| Evidence links | Show why decision was made. |
| Tradeoffs | Show what was rejected. |
| Reversal criteria | Show what would change the decision. |
| Decision status | Proposed, Accepted, Superseded, Reopened. |

### Inputs

- User decisions
- Approved bets
- SLD tradeoffs
- Choice cascade approvals
- Case phase transitions

### Transformation

```text
choice point → strategy decision record
```

### Outputs

- SDRs
- Decision history
- Updated case state
- Constraints for future agent work

### Progress guard

Any major strategy transition should require an SDR:

```text
Approve ORD
Accept SLD
Approve Choice Cascade
Approve Bet
Approve EDS
Approve VSD
Claim Value
Close Case
```

---

## Screen 18 — Open Questions and Risk Register

**Goal:** Prevent ambiguity from being buried.

### Elements

| Element | Goal |
|---|---|
| Open question list | Show unresolved ambiguity. |
| Blocking flag | Identify questions that stop progress. |
| Affected artifacts | Show which ORD/SLD/EDS/VSD items are affected. |
| Options | Capture possible answers. |
| Recommended choice | Allow agents/users to suggest a direction. |
| Owner and due date | Make questions actionable. |
| Resolution link | Tie answer to SDR or evidence. |
| Risk register | Track likely failure modes. |

### Inputs

- User questions
- Agent blockers
- Failed validation
- Contradictory evidence
- Missing requirements

### Transformation

```text
ambiguity/risk → visible object → resolution path
```

### Outputs

- Open questions
- Risk records
- SDRs when resolved
- Blocked progress gates

### Progress guard

The app should block stage advancement when a blocking open question affects that stage.

Example:

```text
Cannot approve EDS while OQ-004 “Who owns customer discovery?” is blocking execution ownership.
```

---

## Screen 19 — VRD / Value Realization Workspace

**Goal:** Prove what changed.

### Elements

| Element | Goal |
|---|---|
| Original outcome list | Pull from ORD. |
| Before/after comparison | Show change over time. |
| Evidence of value | Attach metrics, quotes, artifacts, outputs, tests. |
| Claim strength | Proven, likely, weak, unproven. |
| Stakeholder value map | Show value by stakeholder. |
| Narrative builder | Generate leadership memo, investor update, case study, internal report. |
| Remaining uncertainty | Show what cannot be claimed. |

### Inputs

- ORD outcomes
- VSD results
- Experiment outcomes
- Execution evidence
- Stakeholder feedback
- Metrics

### Transformation

```text
validated outcomes → value claim → communication artifact
```

### Outputs

- VRD
- Value claims
- Proof narrative
- Lessons learned
- Updated evidence graph

### Progress guard

The app should prevent overclaiming.

Value claim states:

```text
Unproven
Weakly Supported
Supported
Validated
Contested
Superseded
```

---

## Screen 20 — Review and Evolution

**Goal:** Turn outcomes into compounding strategy intelligence.

### Elements

| Element | Goal |
|---|---|
| What changed | Summarize case evolution. |
| What was learned | Extract reusable lessons. |
| Which assumptions held/failed | Update future strategy logic. |
| Pattern library candidates | Save reusable patterns. |
| Framework adjustment notes | Let user evolve the framework. |
| Next case suggestions | Generate follow-on work. |

### Inputs

- VRD
- Experiment outcomes
- Failed bets
- SDRs
- Evidence graph
- User reflection

### Transformation

```text
case outcome → reusable strategic learning
```

### Outputs

- Review record
- Updated framework patterns
- New case candidates
- Reusable questions/templates
- Superseded decisions

### Progress guard

A case should not close without:

```text
value claim or explicit no-value finding
lessons learned
open questions disposition
decision review
evidence export
```

---

# 5. Cross-cutting UI rails

These should be available from almost every screen.

## Evidence Rail

Shows:

```text
Accepted evidence
Draft evidence
Contradictions
Source context
Evidence strength
Evidence gaps
```

Goal: Keep reality visible.

## Decision Rail

Shows:

```text
Accepted SDRs
Pending decisions
Superseded decisions
Decision rationale
```

Goal: Keep commitments visible.

## Open Question Rail

Shows:

```text
Blocking questions
Non-blocking questions
Owner
Affected artifact
Resolution path
```

Goal: Keep ambiguity visible.

## Agent Rail

Shows:

```text
Agent drafts
Agent critiques
Failed agent runs
Prompt used
Input IDs
Output status
Human review status
```

Goal: Keep agent authority bounded.

## Trace Rail

Shows:

```text
This claim came from these sources.
This decision came from these claims.
This bet came from this decision.
This task came from this bet.
This value claim came from this evidence.
```

Goal: Make the chain inspectable.

---

# 6. Inputs, transformations, outputs by journey step

| Stage | Inputs | Transformation | Outputs |
|---|---|---|---|
| Case Charter | User concern, context, stakeholders | Mess → bounded case | Case ID, scope, phase, stakeholders |
| ERD | Sources, notes, transcripts, reports | Raw material → reviewed evidence | Accepted evidence, contradictions, gaps |
| Actor/Ranking | Evidence, user judgment | Signals → actor priorities | Actor map, ranking map |
| MCGCS | Evidence, actors, rankings | Evidence → strategic position | Position map, gaps |
| ORD | Case aim, evidence, stakeholders | Aim → falsifiable outcomes | Outcome requirements, acceptance criteria |
| SLD | ERD, ORD, MCGCS, comparisons | Evidence → strategic logic | Thesis, tradeoffs, load-bearing bets |
| Creation Board | Assumptions, contradictions, options | Old frame → new options | Hypotheses, option cards |
| Choice Cascade | SLD, options, outcomes | Options → coherent choices | Strategic choice architecture |
| Bet Builder | Choice cascade, evidence, assumptions | Choice → falsifiable bet | Strategy Bet Record |
| EDS | Approved bets, capabilities, systems | Bet → execution design | Workstreams, owners, dependencies |
| VSD | Outcomes, assumptions, risks | Unknowns → validation plan | Metrics, experiments, kill criteria |
| Adaptive Board | EDS, VSD, live evidence | Plan → adaptive movement | Verified tasks, blockers, new evidence |
| VRD | Outcomes, validation, execution proof | Results → value claims | Value realization, proof narrative |
| Review | Case history, outcomes, lessons | Case → reusable learning | Patterns, next cases, framework updates |

---

# 7. How the UI guarantees real progress

“Guarantee” is strong, so I’d phrase it carefully: the app cannot guarantee the external world will produce the outcome. It **can guarantee that internal progress claims are evidence-backed**.

That is the key distinction.

## The app can guarantee

```text
No accepted evidence without provenance.
No approved bet without assumptions and kill criteria.
No verified task without evidence.
No value claim without proof level.
No agent output accepted without human review.
No strategy transition without decision record.
No metric without linked outcome or assumption.
No execution workstream without owner and dependency clarity.
```

## The app cannot guarantee

```text
The market responds.
Customers buy.
The strategy works.
The evidence is complete.
The user makes the right call.
```

But it can make failure visible earlier.

That is the real product promise.

---

# 8. Anti-completion-theater mechanisms

These should be built into the UI from day one.

## 1. Maturity states, not percent complete

Bad:

```text
SLD: 80% complete
```

Good:

```text
SLD: Drafted, weak evidence, missing counterarguments, 2 load-bearing assumptions untested
```

## 2. Gate labels

Use gates like:

```text
Drafted
Reviewed
Accepted
Validated
Claimed
Superseded
```

Avoid:

```text
Complete
Done
Finished
```

## 3. Evidence debt

Show evidence debt like technical debt.

Examples:

```text
4 claims lack accepted evidence.
2 outcomes lack acceptance criteria.
3 bets lack kill criteria.
5 tasks lack evidence gates.
1 value claim is overextended.
```

## 4. Traceability score

Not a vanity score. A diagnostic score.

Inputs:

```text
source coverage
accepted evidence coverage
decision linkage
bet linkage
validation linkage
implementation evidence
contradiction visibility
```

## 5. Blocked progress gates

The app should explicitly block transitions.

Example:

```text
Cannot approve Strategy Bet:
- Missing counterevidence review
- Missing kill criteria
- No linked VSD validation method
```

## 6. Proof burden panel

Every artifact should answer:

```text
What supports this?
What contradicts this?
What is assumed?
What would change our mind?
What remains unverified?
```

## 7. Agent output quarantine

Agent outputs go into draft inboxes, not directly into accepted artifacts.

## 8. Claim strength labels

Every claim should carry one of:

```text
Observed
Supported
Inferred
Hypothesized
Speculative
Contested
Validated
Rejected
```

This is probably one of the most important UI decisions.

---

# 9. Data structure implications

The data model should be graph-first conceptually, but not necessarily graph-database-first technically.

The core entities:

```text
Workspace
StrategyCase
Source
SourceChunk
EvidenceItem
Actor
Ranking
PositionMap
OutcomeRequirement
StrategicClaim
StrategicLogic
Option
ChoiceCascade
StrategyBet
Experiment
ExecutionWorkstream
Task / ImplementationSlice
ValidationMetric
EvidenceRecord
ValueClaim
DecisionRecord
OpenQuestion
Risk
AgentRun
AuditEvent
GraphEdge
```

The most important table/object is **GraphEdge**.

Why? Because the app’s value is traceability.

Suggested edge types:

```text
supports
contradicts
derives_from
assumes
tests
implements
blocks
resolves
compares_with
supersedes
claims_value_for
validates
weakens
requires
```

Example trace:

```text
SourceChunk
→ supports EvidenceItem
→ supports Ranking
→ supports StrategicClaim
→ derives_from SLD
→ supports StrategyBet
→ tests Experiment
→ validates ValueClaim
```

This is the app’s spine.

---

# 10. API implications

The API should not be organized only around documents. It should be organized around **case objects, graph links, gates, and state transitions**.

## Core API groups

```text
/workspaces
/cases
/sources
/chunks
/evidence
/actors
/rankings
/position-maps
/outcomes
/claims
/logic
/options
/choice-cascades
/bets
/experiments
/execution
/validation
/value-claims
/decisions
/open-questions
/risks
/agent-runs
/audit-events
/exports
/gates
/trace
```

## High-value API actions

| API action | Purpose |
|---|---|
| `POST /cases` | Create strategy case. |
| `POST /cases/{id}/sources` | Import source. |
| `POST /sources/{id}/chunk` | Chunk source. |
| `POST /sources/{id}/extract-evidence` | Create draft evidence. |
| `POST /evidence/{id}/accept` | Human approval gate. |
| `POST /evidence/{id}/reject` | Reject evidence. |
| `GET /trace/{object_type}/{object_id}` | Show provenance chain. |
| `POST /rankings` | Create actor ranking. |
| `POST /outcomes` | Create ORD outcome. |
| `POST /strategic-logic` | Create SLD claim/thesis. |
| `POST /bets/{id}/approve` | Approve only if gates pass. |
| `POST /experiments/{id}/record-result` | Convert result into evidence. |
| `POST /execution/slices/{id}/verify` | Verify only with evidence. |
| `GET /cases/{id}/gates` | Show blocked/passed gates. |
| `POST /decisions` | Create SDR. |
| `POST /exports/case/{id}` | Export case. |

## Gate API pattern

This matters a lot.

Instead of letting the frontend decide whether something can be approved, the backend should own gate checks.

Example:

```text
POST /bets/{bet_id}/approve
```

Returns either:

```json
{
  "status": "approved",
  "decision_id": "sdr_123"
}
```

or:

```json
{
  "status": "blocked",
  "failed_gates": [
    "missing_counterevidence_review",
    "missing_kill_criteria",
    "missing_validation_method"
  ]
}
```

That prevents UI-only discipline from becoming fake discipline.

---

# 11. The most important UX decision

Make the user’s next action always based on **the weakest link in the strategy chain**.

The app should constantly ask:

```text
What is the highest-leverage missing proof, decision, or design object?
```

Examples:

- “You have enough source material, but only 8% has been reviewed into accepted evidence.”
- “Your ORD has five outcomes, but only two have acceptance criteria.”
- “Your SLD has a strong thesis, but no counterargument review.”
- “Your bet has a clear thesis, but no kill criteria.”
- “Your EDS has workstreams, but two have no owner.”
- “Your VSD has metrics, but three do not link to outcomes.”
- “Your VRD claims value, but the proof level is only inferred.”

That creates real progress because the app is not rewarding activity. It is directing the user toward the next constraint.

---

# 12. Recommended MVP screen set

For MVP, I would not build all 20 screens as separate full modules. I’d build this smaller but complete set:

| MVP screen | Why |
|---|---|
| Workspace Dashboard | Case selection and health. |
| Case Cockpit | Central control plane. |
| Source Library | Import reality. |
| Evidence Inbox / ERD | Build evidence base. |
| Actor + MCGCS Map | Model position. |
| ORD Workspace | Define outcomes. |
| SLD Workspace | Define strategic logic. |
| Choice + Bet Builder | Make strategy falsifiable. |
| EDS/VSD Builder | Convert to execution and validation. |
| Adaptive Case Board | Track evidence-gated execution. |
| VRD / Review | Claim value and learn. |
| Decision/Open Question Rail | Cross-cutting governance. |
| Trace View | Provenance inspection. |

That is still ambitious, but it preserves the full spine.

The first vertical slice should be:

```text
Case → Source → Evidence → Actor/Ranking → ORD → SLD claim → Bet → VSD test → Implementation slice → Evidence record
```

That proves the app’s essence. Everything else can deepen from there.

## Prompt:
6/21/2026, 1:45:53 PM

excellent. we can build all the screens using atomic ui patterns so instead of building each separate screen we just create different groupings of atoms/molecule/etc  which makes it easier. Also lets give this teeth--I like the timeboxing approach so we can make this connect to calendars like icloud, outlooks, or google calendar, using timeboxes instead of todo lists. so for anything one wants to do , at minimun there is a time cost. so one has to estimate and commit that cost by blocking off time on the calendar. if it is not blocked off, it does not exist, it's just a wish. for example it there is something one wants to do they can extimate it will take one 30 minute sitting and they block off a day say next tuesday at 1:30 to 2 pm to pay the cost (execute/implement) , which may be right or wrong, they will take notes after (why was it completed or not, etc, what should they doubledown on or change--hypothesis) or they can estimate it will take two weeks of 30 minute sessions and timebox the actual calendar time. the calendar is a value expression, just like money. what you spend in time or money shows what you value. a goal unwritten and not timeboxed is just a wish. do you understand?

## Response:
6/21/2026, 1:45:54 PM

> **Designing timeboxing features for the app**
>
> I need to respond with a clear, direct approach about integrating timeboxing and calendar features. There's no need to bring in the uploaded file unless absolutely relevant. I’ll focus on atomic UI patterns, timeboxing as a value expression, and calendar functioning as a commitment ledger. I’ll define the principles, data model, and API implications. I’ll avoid over-complicating things and keep it simple.
>
> **Designing calendar integration and task states**
>
> I’ll focus on designing the system for calendar integration without diving into specific APIs like iCloud, Google, or Microsoft because those are stable but subject to change. Instead, I’ll focus on the core concept: Timeboxes are cost commitments, and tasks should have states—such as Wish, Estimated, Scheduled, Executed, Reviewed, and Verified. I’ll also reinforce that calendar-backed execution should be an invariant in the design.
>
> Thought for 12s

Yes — I understand. This is a major improvement because it turns Strategy Kernel from a “thinking system” into a **commitment system**.

The principle becomes:

```text
A strategy is not real until it has evidence.
An action is not real until it has a timebox.
A priority is not real until it consumes calendar, money, attention, or opportunity cost.
```

That gives the app teeth.

## The core upgrade: calendar-backed strategy execution

Right now we have this chain:

```text
source → evidence → claim → decision → bet → experiment → execution → value claim
```

With your timeboxing idea, we add a hard execution truth:

```text
decision → bet → execution slice → time cost estimate → calendar commitment → execution note → evidence → learning update
```

The app should treat a task without a timebox as **not yet committed**.

Not bad. Not invalid. Just not committed.

The language matters:

```text
Wish = desirable but not scoped
Intent = defined but not costed
Commitment = costed and timeboxed
Execution = timebox occurred
Verified = evidence was produced
Learned = review note updated the case
```

That is much stronger than a todo list.

---

# 1. New product principle

I would add this as a core invariant:

```text
No execution commitment exists without a timebox.
```

A task can exist as a draft, idea, option, or backlog item. But it should not count as “planned work” until it has:

```text
owner
estimated duration
calendar slot or recurrence
expected output
evidence requirement
review prompt
```

This gives the app a clean anti-completion-theater rule:

```text
If it is not timeboxed, it is not planned.
If it happened but produced no note/evidence, it is not verified.
If it missed its timebox, it becomes learning data.
```

That last part is important. Missing the timebox is not just failure. It is evidence about friction, capacity, priority, avoidance, bad estimation, unclear scope, or weak commitment.

---

# 2. Timeboxing changes the execution model

Instead of todos, the app should have **Commitment Blocks**.

A Commitment Block is a calendar-backed cost unit.

## Commitment Block fields

| Field | Purpose |
|---|---|
| Commitment ID | Stable object ID. |
| Linked case | Which strategy case this belongs to. |
| Linked bet / task / experiment | Why this work exists. |
| Owner | Who is paying the time cost. |
| Estimated duration | Expected cost. |
| Calendar slot | When the cost will be paid. |
| Work mode | Deep work, admin, call, review, research, build, decision, recovery. |
| Expected output | What should exist after the block. |
| Evidence requirement | What proves the block created progress. |
| Review prompt | What the user must answer after. |
| Actual duration | What it really cost. |
| Completion status | Executed, missed, rescheduled, abandoned, blocked. |
| Learning note | Why it did or did not work. |

This is much better than a task checkbox.

A checkbox says:

```text
Did you do it?
```

A Commitment Block asks:

```text
Did you pay the cost?
Did the cost produce evidence?
Was the estimate right?
What did we learn?
Should we double down, change, defer, or kill it?
```

---

# 3. Journey update with timeboxes

The strategic journey now has a cost layer at every step.

| Journey step | Work artifact | Timebox affordance |
|---|---|---|
| Open Case | Case Charter | Block time to frame the case. |
| Establish Reality | ERD | Block source review and evidence extraction sessions. |
| Define Outcomes | ORD | Block outcome writing and acceptance review. |
| Build Logic | SLD | Block synthesis, comparison, and red-team sessions. |
| Create Options | Destruction/Creation | Block creative recombination sessions. |
| Choose and Bet | Choice Cascade + Bet | Block decision sessions. |
| Design Execution | EDS | Block execution design sessions. |
| Validate | VSD | Block experiment setup and review sessions. |
| Execute | Adaptive Case Board | Block implementation sessions. |
| Claim Value | VRD | Block proof gathering and narrative creation. |
| Review | Strategy Review | Block reflection and framework update sessions. |

Each stage should answer:

```text
What is the next valuable block of work?
How much time will it cost?
When will that cost be paid?
What output should exist afterward?
What evidence will prove progress?
```

---

# 4. Atomic UI implication

You are right: do not build 20 hard-coded screens. Build reusable atoms, molecules, organisms, and templates.

The screens become **different compositions of the same strategic components**.

## Atoms

| Atom | Purpose |
|---|---|
| EvidenceBadge | Shows accepted/draft/weak/contradicted evidence state. |
| ProofLevelBadge | Observed, supported, inferred, hypothesized, speculative, validated. |
| TimeCostChip | Shows estimated time cost. |
| CalendarSlotChip | Shows scheduled time. |
| CommitmentStatePill | Wish, intent, committed, executed, verified, missed. |
| GateStatusIcon | Passed, blocked, weak, missing. |
| SourceLink | Opens source provenance. |
| DecisionMarker | Shows linked SDR. |
| ConfidenceBadge | Shows confidence level. |
| BlockerBadge | Shows unresolved blocker. |
| ActualVsEstimatedChip | Shows estimation accuracy. |

## Molecules

| Molecule | Purpose |
|---|---|
| TimeboxComposer | Estimate duration, choose calendar, define expected output. |
| CostCommitmentCard | Shows task + estimate + calendar slot + evidence gate. |
| PostBlockReviewForm | Captures what happened after the timebox. |
| EvidenceAttachControl | Attach proof to a task, claim, bet, or milestone. |
| GateChecklist | Shows what is missing before advancement. |
| TraceMiniMap | Shows source → evidence → decision → task chain. |
| RescheduleReasonPicker | Captures why timebox moved. |
| FrictionNoteCapture | Captures why work was not completed. |
| HypothesisUpdateBox | Converts experience into updated belief. |
| CalendarConflictWarning | Shows time/capacity conflict. |

## Organisms

| Organism | Purpose |
|---|---|
| CaseCockpitHeader | Shows case status, phase, evidence health, commitment health. |
| JourneyStagePanel | Shows stage status and next best work. |
| EvidenceReviewQueue | Review extracted evidence. |
| StrategyArtifactEditor | Edit ERD/ORD/SLD/EDS/VSD/VRD views. |
| CommitmentLedger | Shows all scheduled, missed, completed, and verified blocks. |
| CalendarCommitmentBoard | Calendar-facing execution planner. |
| AdaptiveExecutionBoard | Shows tasks by commitment state, not todo state. |
| ValidationCoveragePanel | Shows which assumptions/outcomes have validation blocks. |
| ValueRealizationPanel | Shows proven value claims. |
| AgentDraftInbox | Shows agent work requiring review. |

## Templates

| Template | Used for |
|---|---|
| CaseDashboardTemplate | Workspace and case cockpit. |
| StrategyArtifactTemplate | ERD, ORD, SLD, EDS, VSD, VRD. |
| EvidenceWorkflowTemplate | Source library and evidence inbox. |
| CommitmentWorkflowTemplate | Calendar-backed execution. |
| ReviewWorkflowTemplate | Post-timebox review and learning. |
| TraceabilityTemplate | Provenance and graph inspection. |

This makes the UI scalable. ERD, ORD, SLD, EDS, VSD, and VRD do not need totally separate bespoke screens. They can share artifact editor, evidence rail, gate checklist, decision rail, and timebox controls.

---

# 5. The new execution states

Replace simple todo states with commitment states.

```text
Wish
Intent
Estimated
Committed
Active
Executed
Needs Review
Verified
Missed
Rescheduled
Blocked
Abandoned
Superseded
```

## What each state means

| State | Meaning |
|---|---|
| Wish | Something the user says they want but has not scoped or costed. |
| Intent | The work is defined but has no time estimate. |
| Estimated | The work has a time cost but no calendar slot. |
| Committed | The work has a calendar slot. |
| Active | The current timebox is underway. |
| Executed | The timebox happened. |
| Needs Review | The block ended but no reflection/evidence was captured. |
| Verified | Evidence proves the block created progress. |
| Missed | Calendar slot passed without execution. |
| Rescheduled | Slot moved with reason captured. |
| Blocked | Could not execute because dependency failed. |
| Abandoned | User chose not to pursue. |
| Superseded | Replaced by a better commitment or strategy. |

This is much more honest than “todo / doing / done.”

---

# 6. What each timebox affords

A timebox is not just a calendar event. It creates several affordances.

| Affordance | What it enables |
|---|---|
| Scarcity | Forces the user to confront actual capacity. |
| Commitment | Converts intention into calendar-backed action. |
| Estimation learning | Compares expected vs actual cost. |
| Priority revelation | Shows what the user truly values through time allocation. |
| Friction detection | Missed/rescheduled blocks reveal hidden blockers. |
| Evidence capture | Block ends with proof or learning note. |
| Strategy feedback | Execution experience updates assumptions and plans. |
| Anti-fantasy pressure | Prevents unlimited goals from living in a fake backlog. |

The line “calendar is a value expression” is product-defining. I would make it part of the product philosophy.

```text
The calendar is the user’s value ledger.
Time spent is revealed priority.
Unscheduled work is uncommitted desire.
```

---

# 7. UI flow for adding any work item

When the user creates anything actionable, the app should guide them through a commitment funnel.

## Step 1 — Define the work

```text
What are you trying to move forward?
What case/bet/outcome does this support?
What output should exist after the work?
```

## Step 2 — Estimate the cost

```text
How many sessions?
How long per session?
What kind of attention does it require?
What dependencies must be true first?
```

## Step 3 — Schedule the cost

```text
Pick calendar
Pick slot
Set recurrence if needed
Add prep/recovery buffer if needed
```

## Step 4 — Define proof

```text
What evidence will prove the block created progress?
```

Examples:

```text
Accepted evidence item
Drafted SLD section
Completed customer call
Experiment result recorded
Decision record created
Implementation test passed
Review note captured
```

## Step 5 — Execute

Calendar event happens.

## Step 6 — Review

After the block, the app asks:

```text
Did you do the work?
Was the estimate right?
What was produced?
What evidence was created?
What blocked or slowed you?
What changed in your hypothesis?
Should this be repeated, changed, killed, or escalated?
```

## Step 7 — Update the case

The review becomes evidence.

This is the magic:

```text
Execution notes become strategic evidence.
```

---

# 8. Calendar integration model

We should treat calendar systems as adapters.

Initial calendar targets:

```text
Google Calendar
Microsoft Outlook / Microsoft 365 Calendar
Apple iCloud Calendar
Local ICS export/import
```

For MVP, I would support **ICS export first** before full two-way sync. That lets the product prove the behavior without getting stuck in connector complexity.

## Calendar integration levels

| Level | Capability | Recommendation |
|---|---|---|
| Level 0 | Manual timebox inside app | Build first. |
| Level 1 | Export `.ics` calendar event | MVP-friendly. |
| Level 2 | One-way push to Google/Outlook/iCloud | Add after core works. |
| Level 3 | Two-way sync and missed-event detection | Later. |
| Level 4 | Calendar intelligence and capacity planning | Later premium capability. |

This avoids the same trap as NotebookLM integration: do not make external connectors block the core product.

The app can still enforce the rule internally:

```text
A commitment needs a scheduled timebox.
```

But the calendar integration can mature in stages.

---

# 9. Data structure additions

Add these entities.

## Timebox

```json
{
  "timebox_id": "tbx_...",
  "case_id": "case_...",
  "linked_object_type": "Task|Experiment|Review|Decision|EvidenceReview|ImplementationSlice",
  "linked_object_id": "obj_...",
  "owner_id": "usr_...",
  "title": "string",
  "estimated_minutes": 30,
  "scheduled_start": "datetime",
  "scheduled_end": "datetime",
  "calendar_provider": "Internal|Google|Outlook|ICloud|ICS",
  "external_calendar_event_id": "string|null",
  "attention_mode": "DeepWork|Admin|Call|Review|Research|Build|Decision|Recovery",
  "expected_output": "string",
  "evidence_required": ["EV-MAN", "EV-SRC"],
  "status": "Estimated|Committed|Active|Executed|NeedsReview|Verified|Missed|Rescheduled|Blocked|Abandoned|Superseded",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## TimeboxReview

```json
{
  "review_id": "tbr_...",
  "timebox_id": "tbx_...",
  "executed": true,
  "actual_minutes": 42,
  "completed_expected_output": false,
  "output_summary": "string",
  "evidence_links": ["ev_..."],
  "blockers": ["string"],
  "friction_notes": "string",
  "hypothesis_update": "string",
  "next_action": "Repeat|Reschedule|Split|Escalate|Kill|ChangeApproach|Done",
  "created_at": "datetime"
}
```

## CapacityBudget

```json
{
  "capacity_budget_id": "cap_...",
  "owner_id": "usr_...",
  "period_start": "date",
  "period_end": "date",
  "available_minutes": 600,
  "committed_minutes": 420,
  "reserved_buffer_minutes": 120,
  "strategic_theme_allocations": [
    {
      "theme": "GodSpeed MVP",
      "target_minutes": 300,
      "committed_minutes": 240,
      "actual_minutes": 180
    }
  ]
}
```

## ValueLedgerEntry

```json
{
  "ledger_entry_id": "vle_...",
  "case_id": "case_...",
  "entry_type": "Time|Money|Attention|OpportunityCost",
  "linked_object_type": "Timebox|Purchase|Decision|Bet",
  "linked_object_id": "obj_...",
  "amount": 30,
  "unit": "minutes",
  "strategic_value": "string",
  "created_at": "datetime"
}
```

This lets the app show revealed priorities.

---

# 10. API additions

## Timebox API

```text
POST /timeboxes
GET /cases/{case_id}/timeboxes
PATCH /timeboxes/{timebox_id}
POST /timeboxes/{timebox_id}/commit
POST /timeboxes/{timebox_id}/reschedule
POST /timeboxes/{timebox_id}/mark-missed
POST /timeboxes/{timebox_id}/review
POST /timeboxes/{timebox_id}/verify
```

## Calendar API

```text
GET /calendar/providers
POST /calendar/connect
POST /calendar/events
PATCH /calendar/events/{event_id}
DELETE /calendar/events/{event_id}
POST /calendar/ics/export
POST /calendar/sync
```

## Capacity API

```text
GET /capacity/{owner_id}
POST /capacity/budgets
GET /capacity/budgets/{budget_id}/allocation
GET /capacity/conflicts
```

## Gate API changes

A task approval or execution transition should call backend gates.

Example:

```text
POST /implementation-slices/{slice_id}/commit
```

Blocked response:

```json
{
  "status": "blocked",
  "failed_gates": [
    "missing_estimated_minutes",
    "missing_calendar_timebox",
    "missing_expected_output",
    "missing_evidence_requirement"
  ]
}
```

Successful response:

```json
{
  "status": "committed",
  "timebox_id": "tbx_123",
  "calendar_event_id": "cal_456"
}
```

---

# 11. New gates that give it teeth

## Gate: Action Commitment

A work item cannot move from Intent to Committed unless it has:

```text
estimated duration
scheduled timebox
owner
expected output
evidence requirement
```

## Gate: Execution Verification

A timebox cannot move to Verified unless it has:

```text
post-block review
actual duration
output note
evidence link or explicit no-evidence reason
next action decision
```

## Gate: Strategy Capacity

An EDS cannot be approved unless its workstreams have a realistic time-cost plan.

```text
Required strategic work exceeds available capacity by 14 hours this month.
Choose:
- reduce scope
- extend timeline
- add owner
- defer lower-value work
```

That is powerful. It forces strategy to confront capacity.

## Gate: Value Alignment

The app should show:

```text
You say this strategy is Priority 1, but only 3% of committed time supports it.
```

This is where the “calendar as value expression” becomes brutally useful.

---

# 12. The “Wish → Cost → Commitment → Evidence” loop

This should become a core UX pattern.

```text
Wish
↓ define
Intent
↓ estimate
Costed Intent
↓ schedule
Commitment
↓ execute
Experience
↓ review
Evidence
↓ update
Learning
```

This maps beautifully to your strategy stack:

| Strategy artifact | Timebox role |
|---|---|
| ERD | Timeboxes for evidence review. |
| ORD | Timeboxes for outcome definition. |
| SLD | Timeboxes for synthesis and critique. |
| EDS | Timeboxes for execution design and implementation. |
| VSD | Timeboxes for experiments and reviews. |
| VRD | Timeboxes for value proof and communication. |

The app should make this visible.

---

# 13. How this changes “next best action”

Before, next best action was based on weak evidence or missing artifacts.

Now it also considers capacity and time commitment.

Examples:

```text
Your next best action is not “write the SLD.”
Your next best action is “schedule one 45-minute SLD thesis block.”
```

Or:

```text
You have 7 open strategy tasks but only 90 minutes of strategic capacity this week.
Choose the one that unlocks the most evidence.
```

Or:

```text
This bet is approved but has no time committed to validation.
It is currently a belief, not a strategy in motion.
```

This is exactly the right kind of friction.

---

# 14. Atomic UI pattern: Commitment Card

This should be one of the app’s core molecules.

## Commitment Card

Elements:

```text
Title
Linked strategy object
Why it matters
Estimated time cost
Scheduled slot
Expected output
Evidence required
Current status
Post-block review status
Actual vs estimated duration
Next action
```

Example:

```text
Review 12 customer discovery notes
Linked to: ERD-004 / Case: GodSpeed ICP
Estimated cost: 45 minutes
Scheduled: Tuesday 1:30–2:15 PM
Expected output: 8 accepted evidence items
Evidence required: EV-SRC + EV-MAN
Status: Committed
```

Afterward:

```text
Actual: 62 minutes
Output: 5 accepted evidence items, 3 open questions
Learning: Notes were less structured than expected; need extraction template.
Next action: Schedule second 45-minute block.
```

This is the core behavioral loop.

---

# 15. Atomic UI pattern: Value Ledger

This should be another core organism.

## Value Ledger

Shows:

```text
Time committed by case
Time spent by case
Time missed by case
Time spent by artifact
Time spent by strategic bet
Time spent by outcome
Money spent
Evidence produced per hour
Validated learning per hour
Value claims supported
```

The app should be able to show the painful truth:

```text
You spent 9 hours on architecture exploration and 0 hours on customer evidence this week.
```

For your use case, that is gold. Not as guilt — as strategic feedback.

---

# 16. Important nuance: avoid shame UX

The philosophy is hard-edged, but the UX should not shame the user.

Use language like:

```text
This is not yet committed.
This timebox was missed.
This estimate was off by 40 minutes.
This may indicate hidden friction.
What should change?
```

Avoid:

```text
You failed.
You procrastinated.
You are not committed.
```

The product should be candid, not punitive.

The best stance:

```text
Your calendar is evidence. Let’s read it honestly.
```

---

# 17. What this means for the spec rewrite

When we rewrite the spec, I would add a full section called:

```text
Calendar-Backed Commitment System
```

It should include:

```text
- Timebox entity
- Commitment states
- Calendar integrations
- Capacity budgeting
- Post-timebox review
- Value ledger
- Time-cost gates
- Missed/rescheduled timebox learning
- “No timebox, no commitment” invariant
```

And update the core loop to:

```text
Source
→ Evidence
→ Outcome
→ Strategic Logic
→ Bet
→ Execution Design
→ Timebox Commitment
→ Execution Review
→ Validation Evidence
→ Value Claim
→ Strategy Evolution
```

That is a much stronger product.

## Bottom line

You are not just adding calendar integration.

You are adding a **cost-of-action discipline**.

That makes Strategy Kernel a different category from a planning app. It becomes a system that forces every strategic claim to pay two prices:

```text
epistemic price = evidence
execution price = time
```

That is the spine.

## Prompt:
6/21/2026, 2:01:46 PM

excellent also as part of planning the user should be able to to map inputs/ingredients, outputs/artifacts/results expected for each step, tools and techniques for each step. my philosophy is that action and thinking should not intertwine. you plan then when it is time to act, you act mindlessly, flowing the plan, for any exceptions or idea that come up during execution, they should be captured to review review later at a designated time where you can make decisions, execution should be mindless except for problem solving unexpected exceptions because your can't plan for everything--however case-based (cmmn style) project management should help with that via discretionary tasks. do you understand? is my approach sound

## Response:
6/21/2026, 2:01:48 PM

> **Clarifying planning vs. execution modes**
>
> The user asked if the approach is sound. My response will be straightforward: yes, with a small correction. I’ll explain that planning and execution should ideally be separate — decision-making is for planning, while execution uses simple cognition to handle the immediate tasks. I don’t think a citation is necessary right now.
>
> Thought for 8s

Yes — I understand, and your approach is sound **if we define it as separating decision-making from execution**, not eliminating thinking during execution.

The sharper formulation is:

```text
Planning mode = decide what should happen.
Execution mode = follow the plan, solve only local exceptions, capture everything else.
Review mode = interpret what happened and make new decisions.
```

That is very strong. It prevents the common failure mode where a person “plans” while executing, changes direction midstream, follows every new idea, and then ends the session with motion but no proof.

## The core rule

I would add this to the product philosophy:

```text
Do not make strategy decisions during execution unless an exception requires immediate judgment.
Capture new ideas, blockers, and deviations for the next review block.
```

That gives you three clean mental modes:

| Mode | Purpose | User behavior | App behavior |
|---|---|---|---|
| **Plan** | Decide the work | Think, compare, choose, define inputs/outputs/tools | Full reasoning UI |
| **Execute** | Pay the time cost | Follow the plan, produce output, capture exceptions | Low-distraction runbook UI |
| **Review** | Learn and adapt | Interpret results, update assumptions, decide next move | Reflection + decision UI |

This is exactly where CMMN-style case management fits. You cannot pre-plan every path, but you can predefine what counts as a normal path, an exception, a discretionary task, a blocker, or a decision trigger.

## Add a “Work Package” layer

Every actionable thing should become a **Work Package** before it can be timeboxed.

A Work Package should include:

| Field | Purpose |
|---|---|
| Objective | Why this work exists. |
| Linked case/bet/outcome | What strategy object it supports. |
| Inputs / ingredients | What must be available before starting. |
| Expected output | What artifact/result should exist afterward. |
| Tools | What tools, files, prompts, systems, or people are needed. |
| Technique / method | How the work should be performed. |
| Time estimate | What the work will cost. |
| Timebox | When the cost will be paid. |
| Evidence requirement | What proves progress happened. |
| Exception policy | What to do if something unexpected occurs. |
| Capture rule | Where to put ideas/blockers during execution. |
| Review prompt | What questions to answer afterward. |

The gate should be:

```text
No timebox without a work package.
No work package without inputs, outputs, method, and evidence.
```

That is how you prevent vague calendar blocking like “work on strategy.” The block must say exactly what kind of work is being paid for.

## Planning screen implication

Each journey step should have a planning panel like this:

```text
Step: Build SLD thesis

Inputs:
- Accepted evidence from ERD
- ORD outcomes
- Actor/ranking map
- MCGCS position map
- Existing open questions

Expected outputs:
- Draft strategic thesis
- 3 load-bearing assumptions
- 2 counterarguments
- 1 open question if evidence is weak

Tools:
- SLD workspace
- Evidence rail
- Critic agent
- Comparison matrix

Technique:
- Compare current path vs two alternatives
- Identify what must be true
- Mark unsupported claims

Evidence:
- EV-MAN review note
- Linked accepted evidence
- SDR if thesis is accepted

Time cost:
- 45 minutes

Exception rule:
- If a major missing evidence gap appears, capture it as OQ and continue drafting only if possible.
```

Now execution becomes simple. The user does not stare at a blank screen wondering what to do. They follow the prepared packet.

## Execution screen implication

When the timebox starts, the UI should switch into **Execution Mode**.

It should hide most strategy-editing complexity and show only:

| Element | Purpose |
|---|---|
| Current work package | What am I doing right now? |
| Timer / calendar block | What time cost am I paying? |
| Inputs checklist | Do I have what I need? |
| Step-by-step method | What do I follow? |
| Expected output | What should exist by the end? |
| Capture bar | Quick capture for ideas, blockers, exceptions. |
| Evidence attach area | Attach output/proof. |
| Stop conditions | When should I stop and review instead of improvising? |

The execution UI should not invite re-planning. It should invite **following**.

A good execution rule:

```text
During execution, new ideas go to capture.
Only immediate blockers get solved.
Strategic decisions wait for review.
```

## Exception handling

This is where your approach needs nuance.

Execution should be “mindless” only for the planned path. But real work has surprises. So the app needs an **Exception Policy** for every work package.

Exception types:

| Exception | Execution behavior |
|---|---|
| Missing input | Stop or create blocker. |
| Tool unavailable | Use fallback if predefined; otherwise capture blocker. |
| New idea | Capture only; do not chase. |
| Scope expansion | Capture as option; continue original work. |
| Evidence contradiction | Capture contradiction; continue if safe. |
| Safety/quality issue | Stop execution and escalate to review. |
| Simple local problem | Solve inside timebox if it does not change the strategy. |
| Major strategic implication | Capture and defer to review block. |

This keeps execution from becoming chaos while still allowing judgment where reality demands it.

## Review mode

After the timebox, the app should force a short review before the work can be considered verified.

Review questions:

```text
Was the planned output produced?
What evidence was attached?
Was the time estimate accurate?
What inputs were missing?
What exceptions occurred?
What ideas were captured?
What should be doubled down on, changed, split, killed, or reviewed later?
Did this update any assumption, bet, outcome, or decision?
```

That review converts execution into learning.

The key transformation is:

```text
timebox experience → review note → evidence / open question / decision / next work package
```

## How this fits the larger Strategy Kernel stack

This adds a new operational spine underneath the strategy documents:

```text
ERD / ORD / SLD / EDS / VSD / VRD
↓
Work Packages
↓
Timeboxes
↓
Execution Mode
↓
Post-Block Review
↓
Evidence / Learning / Decisions
```

So the documents define the strategy. The work packages define the costed actions. The timeboxes commit the cost. The reviews turn action into evidence.

## My recommendation

Add three concepts to the spec:

1. **Work Package** — the planned unit of action with inputs, outputs, tools, method, evidence, and exception policy.
2. **Execution Mode** — a low-distraction runbook view that prevents mid-execution strategy drift.
3. **Review Block** — a designated decision-making window where captured exceptions, ideas, and blockers are processed.

The strongest rule is:

```text
Thinking produces the plan.
Timeboxing commits the plan.
Execution follows the plan.
Review updates the plan.
```

Your approach is sound because it protects focus, makes commitment concrete, and turns missed execution into useful evidence instead of vague guilt. The only adjustment I’d make is to avoid saying execution is fully “mindless.” I’d call it **low-decision execution**: follow the plan unless reality produces an exception that the plan explicitly allows you to handle.

## Prompt:
6/21/2026, 2:07:59 PM

i accept your recommendations. also we should include pomodoro to acknowledge the limits of human attention, pomos (pomodoros, ie 25 minute time spans with 5 minute breaks should be used as the base time units because that is the the bell curve for human attention and extended sessions should be considered from 3 hour intervals --which should be sufficient for deep work or the smallest project), what do you think?

## Response:
6/21/2026, 2:08:00 PM

> **Considering pomodoro technique and attention research**
>
> The pomodoro technique is widely used, but I’m not sure about the relationship between human attention and the "bell curve" across 3-hour intervals. It could be helpful to reference reliable sources to clarify the details. I should check official or scientific research to be more precise.
>
> **Searching for Pomodoro technique and attention research**
>
> [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique)
> [Pomodoro-Technik](https://de.wikipedia.org/wiki/Pomodoro-Technik)
> [Prediction of Reaction Time and Vigilance Variability from Spatiospectral Features of Resting-State EEG in a Long Sustained Attention Task](https://arxiv.org/abs/1910.10076)
> [Why the Pomodoro Technique Is the Productivity Booster You Need to Try](https://www.verywellmind.com/pomodoro-technique-history-steps-benefits-and-drawbacks-6892111)
>
> Thought for 6s

Yes - I agree with adding Pomodoro, with one correction: I would **not** claim 25 minutes is *the* bell curve of human attention. That’s too strong. The Pomodoro Technique’s classic pattern is 25 minutes of work plus a short break, commonly 5 minutes, and after several pomodoros a longer break. It is a useful behavioral unit, not a universal biological law. ([Wikipedia](https://en.wikipedia.org/wiki/Pomodoro_Technique?utm_source=chatgpt.com))

The right product rule is:

```text
Use pomodoros as the default commitment currency, not as a rigid truth about all humans or all work.
```

## Recommended time-unit model

I’d make the app use **Pomos** as the base unit:

```text
1 pomo = 25 minutes focused work + 5 minute break
```

Then model larger work in stacks:

| Unit | Structure | Use case |
|---|---:|---|
| Micro block | 10-15 min | Capture, cleanup, quick review, admin |
| 1 pomo | 25 + 5 | Small focused action |
| 2 pomos | 55-60 min total | Normal focused work session |
| 4 pomos | ~2 hours with breaks | Strong work block |
| 6 pomos | ~3 hours with breaks | Deep work / smallest meaningful project block |
| Multi-session packet | repeated pomos over days/weeks | Larger strategic work |

The **3-hour interval** is a good “deep work packet,” but I’d define it as approximately **6 pomos**, not one uninterrupted 3-hour grind.

```text
Deep Work Packet = 6 pomos = about 3 hours including breaks
```

That aligns better with your philosophy because it still respects human attention limits. Sustained attention often declines over time, especially in vigilance-style tasks, so structured breaks are a practical design choice. ([Wikipedia](https://en.wikipedia.org/wiki/Attention?utm_source=chatgpt.com))

## How this changes Strategy Kernel

The app should not ask only:

```text
How many minutes will this take?
```

It should ask:

```text
How many pomos will this cost?
```

That creates a clean value ledger.

Examples:

```text
Review 10 customer notes = 2 pomos
Draft SLD thesis = 2 pomos
Red-team strategy bet = 1 pomo
Run customer outreach batch = 3 pomos
Write value realization memo = 4 pomos
Build MVP vertical slice = 6-pomo deep work packet
```

This makes time feel like money:

```text
You have 12 strategic pomos available this week.
You committed 8 to product architecture, 2 to customer evidence, 2 to writing.
Does this match your stated priority?
```

That is exactly the kind of honest feedback this app should produce.

## Add “attention mode” to the work package

Every work package should include both **cost** and **attention type**.

| Attention mode | Recommended pomo pattern |
|---|---|
| Capture | 1 micro block or 1 pomo |
| Evidence review | 1-2 pomos |
| Synthesis | 2-4 pomos |
| Deep creation | 4-6 pomos |
| Decision review | 1-2 pomos |
| Execution/build | 2-6 pomos |
| Admin/setup | 1 pomo |
| Recovery/reflection | 1 pomo |

This matters because 3 hours of deep synthesis is not the same as 3 hours of admin work. The app should budget **attention quality**, not just clock time.

## New invariant

I’d add this:

```text
INV-TIME-001 - Pomo-Based Commitment

Every committed work package must declare:
- estimated pomo cost
- calendar slot or recurrence
- attention mode
- expected output
- evidence requirement
- review requirement
```

And another:

```text
INV-TIME-002 - No Invisible Labor

Work that is not timeboxed does not count as committed execution capacity.
```

## How it prevents completion theater

This gives the app sharper gates.

A strategy bet cannot quietly sit there as “approved” unless it has committed validation time:

```text
Bet approved but not in motion:
- 0 pomos committed to validation
- 0 experiments scheduled
- no review block scheduled
```

An EDS cannot pretend to be executable if the time cost exceeds capacity:

```text
Execution design requires 42 pomos this month.
Available strategic capacity: 18 pomos.
Status: infeasible until scope, timeline, or ownership changes.
```

That is the kind of brutal clarity you want.

## My recommendation

Use Pomodoro as the **default time currency**, but allow customization:

```text
Default pomo = 25/5
User can configure = 30/5, 45/10, 50/10, etc.
```

Do not make customization the first-class behavior in MVP, though. Keep the product opinionated:

```text
Default: 25/5
Deep work packet: 6 pomos / about 3 hours
All work must estimate pomo cost
All committed work must be calendar-backed
All executed work must produce review/evidence
```

That gives Strategy Kernel a real operating rhythm:

```text
Plan in artifacts.
Commit in pomos.
Execute in timeboxes.
Review into evidence.
Evolve the strategy.
```

---

**Sources:**

- [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique?utm_source=chatgpt.com)

## Prompt:
6/21/2026, 2:27:08 PM

excellent. the final element is to build this on top of my notes app. see attached

[Attachment: chat (3).md]

[Attachment: chat (2).md]

## Response:
6/21/2026, 2:27:09 PM

> **Clarifying strategy for NexusNotes integration**
>
> I need to recommend building the Strategy Kernel as a layer within NexusNotes, rather than making it a separate app. The NexusNotes can act as the substrate, and the Strategy Kernel would serve as a protocol or plugin. I'll map concepts to the app's notes structure, considering node types, scheduling, and more, while addressing potential data model and UI reuse. Lastly, I'll ensure sources are cited properly, potentially using citation markers in UI snippets.
>
> **Clarifying architecture with citations**
>
> I need to ensure the citation is correct, possibly using the specified citation marker without line numbers, or citing to a specific reference. I'll include filecite markers within paragraphs for clarity. The architecture should be mapped like this: NexusNotes as PKM kernel, and Strategy Kernel as an extension. I'll also cite relevant spec details, like the offline-first approach, and emphasize the right composition of layers. No artifact generation needed.
>
> Thought for 19s

Yes - this is the right foundation. **Strategy Kernel should not be a separate app sitting beside NexusNotes. It should be a domain layer on top of NexusNotes.**

The clean architecture is:

```text
NexusNotes = knowledge substrate
Strategy Kernel = strategic operating system built on that substrate
```

NexusNotes already gives you the hard things Strategy Kernel needs: local-first markdown source of truth, ULID nodes, graph links, backlinks, cloning, daynotes, scheduling, derived SQLite indexing, and a Tauri/TSRX app shell. The NexusNotes spec explicitly says markdown files are the durable source of truth and SQLite is only a rebuildable cache, which matches Strategy Kernel’s evidence/provenance philosophy perfectly. `chat (3).md`

## 1. The core design decision

Do **not** build Strategy Kernel as its own storage system.

Build it as a **Strategy Pack** or **Domain Protocol** inside NexusNotes.

```text
NexusNotes Core
├── Node / Branch / Ref / Daynote / Activity / Vault
├── Markdown source of truth
├── SQLite derived index
├── Graph service
├── Daynote service
├── TSRX rendering
└── Strategy Kernel Extension
    ├── Strategy Case nodes
    ├── ERD / ORD / SLD / EDS / VSD / VRD artifacts
    ├── Work Packages
    ├── Pomodoro Timeboxes
    ├── Evidence gates
    ├── SDRs / Decisions
    ├── Strategy graph edges
    └── Strategy UI templates
```

This keeps NexusNotes general-purpose while letting Strategy Kernel become a serious strategic workflow layer.

## 2. Why NexusNotes is a strong substrate

NexusNotes already has the right primitives.

| NexusNotes primitive | Strategy Kernel use |
|---|---|
| **Node** | Every strategy object becomes a node: case, evidence, claim, bet, outcome, work package, timebox. |
| **Branch** | Same object can appear in multiple contexts without duplication. |
| **Clone / multi-parent placement** | One evidence item can belong to ERD, SLD, VSD, and VRD at the same time. |
| **Refs / backlinks** | Provenance, support, contradiction, dependency, and traceability. |
| **Tags** | Quick filtering: `#strategy/case`, `#evidence/accepted`, `#timebox/missed`. |
| **Daynotes** | Automatic activity ledger and review surface. |
| **scheduled_date** | Lightweight future appearance, but not enough for exact calendar timeboxing. |
| **TSRX rendering** | Custom strategy panels, cards, gates, ledgers, and artifact views. |
| **SQLite index** | Fast queries over the derived graph. |
| **Markdown vault** | Portable, inspectable, local-first source of truth. |

The “every outline item is a Node” model is especially important because it means a strategy bet, a work package, a timebox, a decision record, and an evidence item can all be first-class addressable objects, not just rows hidden in a database. `chat (3).md`

## 3. Strategy Kernel should be a protocol over nodes

Each Strategy Kernel object should be stored as a NexusNotes node with a `type` and structured frontmatter.

Example node types:

```text
strategy_case
strategy_artifact
evidence_item
outcome_requirement
strategic_claim
strategic_logic
strategy_option
choice_cascade
strategy_bet
experiment
execution_workstream
work_package
timebox
timebox_review
decision_record
open_question
risk
value_claim
agent_run
```

This means Strategy Kernel documents are not static documents. They are **views over linked nodes**.

```text
ERD = view over accepted evidence nodes
ORD = view over outcome requirement nodes
SLD = view over strategic claim / logic / assumption nodes
EDS = view over workstream and work package nodes
VSD = view over validation / experiment / metric nodes
VRD = view over value claim and proof nodes
```

That is the right move. The source of truth stays granular and graph-based. The “documents” are generated readable surfaces.

## 4. Do not overload NexusNotes `scheduled_date`

NexusNotes already supports `scheduled_date`, where a node appears on a future daynote without altering activity capture. `chat (3).md` That is useful, but Strategy Kernel needs more.

`scheduled_date` is date-level.

Strategy Kernel needs **time-cost commitment**:

```text
date
start time
end time
estimated pomos
actual pomos
attention mode
calendar provider
expected output
evidence requirement
post-block review
```

So keep `scheduled_date` for lightweight scheduling, but add a richer `timebox` node type.

## 5. Strategy Kernel object model on top of NexusNotes

### Strategy Case node

```yaml
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
open_questions:
  - ((01HX...))
active_bets:
  - ((01HY...))
```

### Evidence item node

```yaml
type: evidence_item
evidence_type: DirectQuote
status: Accepted
proof_level: Observed
source_chunk: ((01SRC...))
supports:
  - ((01CLAIM...))
contradicts: []
confidence: high
```

### Strategy bet node

```yaml
type: strategy_bet
status: Draft
linked_choice_cascade: ((01CHOICE...))
target_actor: ((01ACTOR...))
assumptions:
  - ((01ASSUMP...))
counterevidence_reviewed: false
success_metric: null
kill_criteria: null
```

### Work package node

```yaml
type: work_package
status: Intent
linked_case: ((01CASE...))
linked_bet: ((01BET...))
objective: Draft SLD thesis
inputs:
  - ((01ERD...))
  - ((01ORD...))
expected_outputs:
  - Draft strategic thesis
  - 3 load-bearing assumptions
  - 2 counterarguments
tools:
  - SLD workspace
  - Evidence rail
  - Critic agent
technique: Compare current path against two alternatives
evidence_required:
  - EV-MAN
  - linked_claims
exception_policy: Capture new ideas; only solve local blockers
```

### Timebox node

```yaml
type: timebox
status: Committed
linked_work_package: ((01WP...))
estimated_pomos: 2
pomo_pattern: 25/5
attention_mode: Synthesis
scheduled_start: 2026-06-23T13:30:00-04:00
scheduled_end: 2026-06-23T14:30:00-04:00
calendar_provider: Google
external_calendar_event_id: null
expected_output: Draft SLD thesis
review_required: true
```

### Timebox review node

```yaml
type: timebox_review
linked_timebox: ((01TBX...))
executed: true
actual_pomos: 3
completed_expected_output: partial
evidence_links:
  - ((01EV...))
friction_notes: Source evidence was weaker than expected.
hypothesis_update: Need stronger ICP evidence before finalizing SLD.
next_action: Schedule second SLD block.
```

This is the right structure because every meaningful object remains linkable, cloneable, reviewable, and visible in the graph.

## 6. Strategy Kernel should use NexusNotes daynotes as the execution ledger

NexusNotes’ daynote service automatically records creates and modifies into daily activity records. `chat (3).md` Strategy Kernel should build on that.

A daynote should show:

```text
Created today
Modified today
Scheduled today
Committed timeboxes today
Executed timeboxes today
Missed timeboxes today
Review blocks due today
Evidence produced today
Decisions made today
```

This gives you a daily strategic ledger.

The daynote becomes more than a journal. It becomes:

```text
What did I claim to value today?
What did I spend time on?
What evidence did that produce?
What changed in the strategy?
```

## 7. Graph edges become the strategy spine

NexusNotes already computes refs/backlinks and supports dangling links. `chat (3).md` Strategy Kernel should add typed edge semantics on top.

You can represent typed edges either in frontmatter or inline syntax. I’d start with frontmatter for reliability.

Core edge types:

```text
supports
contradicts
derives_from
assumes
tests
implements
blocks
resolves
supersedes
requires
validates
claims_value_for
scheduled_by
reviewed_by
```

Example trace:

```text
Source Chunk
→ supports Evidence Item
→ supports Strategic Claim
→ supports SLD
→ supports Strategy Bet
→ requires Work Package
→ scheduled_by Timebox
→ reviewed_by Timebox Review
→ validates Value Claim
```

That is the product’s core promise.

## 8. Atomic UI fits NexusNotes perfectly

You do not need bespoke screens. You need **TSRX strategy components** that render different node types.

NexusNotes already positions TSRX as the rich rendering layer for node bodies, while preserving markdown as the source substrate. `chat (3).md` Strategy Kernel can use TSRX components like:

```text
<StrategyCaseCockpit />
<EvidenceRail />
<GateChecklist />
<TraceMap />
<WorkPackageCard />
<TimeboxComposer />
<PomoLedger />
<PostBlockReview />
<DecisionRecord />
<OpenQuestionPanel />
<ValueClaimCard />
```

The same underlying node can render differently depending on context.

For example, a `strategy_bet` node can appear as:

```text
- a card on the Bet Board
- a section in the SLD
- a dependency in the EDS
- a validation target in the VSD
- a trace node in the graph view
- a calendar-linked commitment source
```

That is exactly why multi-parent nodes and clones matter.

## 9. Extension architecture recommendation

Add a new layer to NexusNotes:

```text
Domain Extension Layer
```

Updated abstraction stack:

```text
1. Storage Layer - OKF markdown files
2. Serialization Layer - Markdown/frontmatter/link parsing
3. Index Layer - SQLite derived cache
4. Core Domain Layer - Node, Branch, Ref, Daynote, Activity
5. Extension Domain Layer - Strategy Kernel object types and gates
6. Application Layer - Tauri IPC commands
7. Presentation Layer - TSRX components and templates
```

This keeps the base app clean.

NexusNotes should not “know strategy” in its core. It should know how to support typed nodes, typed edges, renderers, commands, and derived indexes.

Strategy Kernel supplies the domain pack.

## 10. Required NexusNotes additions to support Strategy Kernel

Your current NexusNotes spec already gets you 70-80% there. I would add these extension capabilities.

### A. Custom node types

NexusNotes already has `type` as extensible, so Strategy Kernel can add its own types. Good.

### B. Typed relationships

Base refs are not enough. Strategy Kernel needs semantic edges.

Add:

```text
GraphEdge
from_ulid
to_ulid
edge_type
status
created_at
created_by
metadata
```

SQLite can index this, but markdown/frontmatter remains source of truth.

### C. View definitions

A “screen” should be a saved view over nodes.

Example:

```yaml
type: view
view_type: strategy_case_cockpit
query:
  case: ((01CASE...))
  include:
    - artifacts
    - gates
    - evidence
    - decisions
    - timeboxes
```

### D. Gate engine

Add a domain gate service.

Examples:

```text
can_approve_bet
can_commit_work_package
can_verify_timebox
can_claim_value
can_close_case
```

The backend must own these gates. The UI can display them, but not enforce them alone.

### E. Calendar adapter

Keep this outside the PKM core.

```text
CalendarAdapter
├── Internal calendar
├── ICS export
├── Google Calendar
├── Outlook Calendar
└── iCloud Calendar
```

MVP should start with internal timeboxes + ICS export.

### F. Pomodoro capacity ledger

Add derived queries:

```text
pomos committed by case
pomos spent by case
pomos missed by case
pomos by artifact
pomos by bet
evidence produced per pomo
```

Again: derived index, not source of truth.

## 11. The right build order

Do not build the full strategy UI first.

Build this vertical slice:

```text
NexusNotes node
→ strategy_case node
→ evidence_item node
→ strategy_bet node
→ work_package node
→ timebox node
→ timebox_review node
→ gate check
→ daynote activity
→ trace view
```

That proves the integration.

MVP vertical slice:

1. Create Strategy Case as NexusNotes node.
2. Add Evidence Item node linked to source.
3. Create Strategy Bet node linked to evidence.
4. Create Work Package node linked to bet.
5. Estimate pomo cost.
6. Create Timebox node.
7. Export timebox to `.ics`.
8. Complete post-timebox review.
9. Attach evidence.
10. Gate moves timebox to Verified.
11. Daynote shows the activity.
12. Trace view shows source → evidence → bet → work package → timebox → review.

That is the spine.

## 12. Potential danger: polluting the note app

One caution: Strategy Kernel should not make NexusNotes feel like every note must become a strategy object.

Avoid that by making Strategy Kernel an optional **workspace mode** or **case mode**.

```text
Normal NexusNotes mode:
- write notes
- outline
- link
- clone
- daynotes

Strategy Kernel mode:
- evidence gates
- work packages
- pomos
- strategy artifacts
- decisions
- validation
```

The same vault can support both.

## 13. Revised product framing

The best framing is:

```text
NexusNotes is the local-first knowledge substrate.
Strategy Kernel is the evidence-gated strategy and execution protocol running on top of it.
```

Or more sharply:

```text
NexusNotes stores the mind.
Strategy Kernel makes the mind pay the cost of action.
```

## 14. What should change in the spec rewrite

When we rewrite the Strategy Kernel spec, we should add a major section:

```text
Built on NexusNotes
```

It should state:

```text
- Strategy Kernel MUST use NexusNotes Node as the base object.
- Strategy Kernel MUST preserve markdown as source of truth.
- Strategy Kernel MUST NOT store strategy-critical state only in SQLite.
- Strategy Kernel MUST use Branches/clones for multi-context placement.
- Strategy Kernel MUST use refs/backlinks/typed edges for provenance.
- Strategy Kernel MUST use Daynotes for activity and review surfaces.
- Strategy Kernel SHOULD use TSRX components for strategy-specific UI.
- Strategy Kernel SHOULD treat calendar/timebox sync as an adapter, not core storage.
```

The implementation plan should then have two tracks:

```text
Track A - NexusNotes Core Conformance
Track B - Strategy Kernel Extension
```

The Strategy Kernel extension must not violate the NexusNotes invariants. The attached NexusNotes implementation plan is already explicit that agents must not store data only in SQLite, must preserve invariants, must record evidence, and must stop on ambiguity or invariant failure. `chat (2).md`

## Bottom line

This is not just compatible. It is the stronger architecture.

Strategy Kernel should be built as:

```text
a typed, evidence-gated, calendar-backed strategy protocol
running on a local-first NexusNotes graph substrate.
```

That gives you portability, traceability, daynote capture, graph reasoning, markdown durability, and atomic UI composition without rebuilding a PKM engine from scratch.

## Prompt:
6/21/2026, 2:28:35 PM

no merge it synergistically to form StrategyNotes app

## Response:
6/21/2026, 2:28:38 PM

> **Focusing on file citation and file search output**
>
> I need to clarify how to merge information into the StrategyNotes app and mention the integrated architecture––NexusNotes and Strategy Kernel fusion. I should check if the necessary citations are available from the uploaded files and make sure I’m using the correct file search outputs for that.
>
> Thought for 20s

Correct - **StrategyNotes** should be the unified app, not “NexusNotes plus a Strategy Kernel extension.”

The better merge is:

```text id="3u54av"
StrategyNotes = notes + strategy + execution + evidence + time commitment
```

Not:

```text id="ock70o"
NexusNotes core + Strategy Kernel plugin
```

That framing matters because the product is not a generic PKM app with strategy features bolted on. It is a **strategy-native notes app** where notes, evidence, decisions, work packages, timeboxes, and value claims are all first-class knowledge objects.

## The new product thesis

StrategyNotes is an offline-first, markdown-native strategy notes application where every note can become part of a traceable strategy case, every strategic claim can be linked to evidence, and every intended action must be costed, timeboxed, reviewed, and converted into learning.

The original NexusNotes foundation is still valuable: it already defines a local-first markdown graph where each node is both an outline item and a page, with durable markdown as the source of truth and SQLite as a rebuildable cache. `chat (3).md` But in StrategyNotes, that foundation is not “under” a separate strategy app. It becomes the **native object model** for strategic thinking and action.

## The merged identity

The clean framing:

```text id="54d29q"
NexusNotes answered: How should knowledge be stored, linked, cloned, rendered, and logged?

Strategy Kernel answered: How should strategy be evidenced, decided, executed, validated, and claimed?

StrategyNotes answers: How should a person or team think, decide, schedule, act, and learn from one local-first strategic knowledge graph?
```

That is the synthesis.

## What StrategyNotes is

StrategyNotes is a **strategy-native PKM and execution system**.

It combines:

| Layer | What it contributes |
|---|---|
| Notes layer | Markdown-native nodes, outlines, bodies, links, backlinks, tags, clones. |
| Evidence layer | Sources, chunks, evidence items, proof levels, contradictions, provenance. |
| Strategy layer | ERD, ORD, SLD, EDS, VSD, VRD, choice cascades, bets, decisions. |
| Execution layer | Work packages, pomos, timeboxes, calendar commitments, execution reviews. |
| Learning layer | Daynotes, activity logs, post-block reviews, value claims, strategy evolution. |
| Governance layer | Gates, invariants, audit trail, agent output quarantine, source-of-truth rules. |

The note is the atom. Strategy is the grammar. Time is the cost. Evidence is the proof.

## Core object model

Keep the NexusNotes **Node** as the atomic unit, but expand it so StrategyNotes has strategy-native node types.

Base object:

```text id="ycwid1"
Node = addressable markdown object
```

StrategyNotes node types:

```text id="ix5i0u"
note
journal
source
source_chunk
evidence_item
strategy_case
case_charter
erd
ord
sld
eds
vsd
vrd
decision_record
actor
ranking
mcgcs_position
strategic_claim
assumption
counterevidence
option
choice_cascade
strategy_bet
experiment
metric
work_package
timebox
timebox_review
value_claim
open_question
risk
agent_run
view
template
```

This works because the NexusNotes model already treats every outline item as a first-class node with a ULID identity, body, refs, tags, properties, and schedule metadata. `chat (3).md`

## The major schema shift

Instead of thinking:

```text id="0901uo"
Strategy objects live in a strategy module.
```

Think:

```text id="4x6u2o"
Strategy objects are typed notes.
```

So an evidence item is a note.  
A strategy bet is a note.  
A timebox is a note.  
A decision record is a note.  
A value claim is a note.  
A work package is a note.

That gives you one system of truth.

## The StrategyNotes graph

NexusNotes already supports refs, backlinks, clones, tags, and daynote activity. `chat (3).md` StrategyNotes adds **typed strategic relationships**.

Core edge types:

```text id="wbvj50"
supports
contradicts
derives_from
assumes
tests
implements
blocks
resolves
requires
validates
weakens
supersedes
claims_value_for
scheduled_by
reviewed_by
created_from
```

Example:

```text id="vddjtp"
Source Chunk
→ supports Evidence Item
→ supports Strategic Claim
→ derives_from SLD
→ supports Strategy Bet
→ requires Work Package
→ scheduled_by Timebox
→ reviewed_by Timebox Review
→ validates Value Claim
```

That is the StrategyNotes spine.

## The document stack becomes generated views

ERD, ORD, SLD, EDS, VSD, and VRD should not be static files. They should be **living views over linked nodes**.

| Artifact | What it really is |
|---|---|
| Case Charter | View over case scope, arena, stakeholders, non-goals, initial hypothesis. |
| ERD | View over accepted evidence, sources, contradictions, gaps. |
| ORD | View over outcome requirement nodes and acceptance criteria. |
| SLD | View over strategic claims, logic, assumptions, comparisons, tradeoffs. |
| EDS | View over work packages, owners, dependencies, interfaces, capacity. |
| VSD | View over experiments, metrics, validation coverage, kill criteria. |
| VRD | View over value claims, evidence, before/after comparisons, lessons learned. |

That keeps the app flexible. Users can write freely as notes, but the app can still assemble disciplined strategy artifacts.

## Daynotes become the execution ledger

The existing daynote idea is crucial. NexusNotes already specifies automated activity capture: node creation/modification gets logged to daynotes, daynotes are lazily created, and scheduling does not alter actual activity capture. `chat (3).md`

In StrategyNotes, the daynote becomes a daily strategic ledger:

```text id="s1syh2"
What did I create?
What did I modify?
What was scheduled?
What timeboxes were committed?
What timeboxes were executed?
What was missed?
What evidence was produced?
What decisions were made?
What changed in the strategy?
```

That is much stronger than journaling. It turns the calendar and notes into a record of revealed values.

## The key product principle

StrategyNotes should enforce two prices:

```text id="2v1c0a"
Epistemic price = evidence.
Execution price = time.
```

A claim that has no evidence is not accepted.  
A task that has no timebox is not committed.  
A timebox that has no review is not learned from.  
A value claim that has no proof is not validated.

That is the system’s teeth.

## StrategyNotes modes

Instead of separate apps or plugins, use modes over the same graph.

| Mode | Purpose |
|---|---|
| Notes Mode | Capture, write, outline, link, clone, search. |
| Evidence Mode | Source review, evidence extraction, acceptance, contradiction mapping. |
| Strategy Mode | ERD/ORD/SLD/choice cascade/bet design. |
| Planning Mode | Work packages, inputs, outputs, tools, methods, evidence requirements. |
| Execution Mode | Low-decision runbook view for active timeboxes. |
| Review Mode | Post-timebox reflection, learning, decisions, next actions. |
| Value Mode | VRD, proof, before/after, stakeholder claims. |

Same nodes. Different affordances.

## Atomic UI implication

Now the UI components should be StrategyNotes-native, not Strategy Kernel components inside NexusNotes.

Core atoms:

```text id="yt9jhw"
NodeTypeBadge
ProofLevelBadge
EvidenceStatePill
GateStatusIcon
PomoCostChip
CalendarCommitmentChip
TraceLink
DecisionMarker
ContradictionBadge
SourceBadge
```

Core molecules:

```text id="v5qzss"
StrategyNodeCard
EvidenceCard
ClaimCard
BetCard
WorkPackageCard
TimeboxCard
PostBlockReviewForm
GateChecklist
TraceMiniMap
PomoEstimator
CalendarCommitter
ExceptionCaptureBar
```

Core organisms:

```text id="wu1jna"
StrategyCaseCockpit
EvidenceInbox
ArtifactViewBuilder
MCGCSMap
ChoiceCascadeCanvas
BetBoard
PlanningBoard
ExecutionRunbook
PomoLedger
DaynoteLedger
ValueRealizationPanel
TraceExplorer
```

The “screens” are just compositions of these organisms.

## Data architecture

The merged app should have one source-of-truth principle:

```text id="0115x4"
Markdown files are the durable source of truth.
SQLite is a derived, rebuildable index.
Strategy-critical state must never live only in SQLite.
```

That is already a NexusNotes invariant and should survive the merge. `chat (3).md`

Recommended architecture:

```text id="is53e2"
1. Storage Layer
   OKF-style markdown vault

2. Serialization Layer
   Frontmatter, markdown body, inline refs, typed relationship metadata

3. Index Layer
   SQLite derived cache for nodes, branches, refs, edges, gates, timeboxes, search

4. Graph Layer
   Nodes, branches, backlinks, clones, tags, typed strategy edges

5. Strategy Domain Layer
   Cases, artifacts, evidence, claims, choices, bets, work packages, validation, value

6. Commitment Layer
   Pomos, timeboxes, calendar adapters, capacity ledger, post-block reviews

7. Gate Layer
   Approval checks, evidence requirements, timebox requirements, validation requirements

8. Presentation Layer
   TSRX strategy components, outliner, cockpit, runbook, dashboards
```

This is not a plugin layer. It is a single domain stack.

## API shape

The API should be organized around nodes plus domain transitions.

Base node APIs:

```text id="2c1og0"
POST /nodes
GET /nodes/{id}
PATCH /nodes/{id}
POST /nodes/{id}/clone
GET /nodes/{id}/backlinks
GET /nodes/{id}/trace
GET /daynotes/{date}
```

Strategy APIs:

```text id="3jym4q"
POST /strategy-cases
POST /evidence/{id}/accept
POST /claims
POST /outcomes
POST /choice-cascades
POST /bets/{id}/approve
POST /experiments/{id}/record-result
POST /value-claims/{id}/validate
```

Commitment APIs:

```text id="d8rewf"
POST /work-packages
POST /work-packages/{id}/estimate
POST /work-packages/{id}/commit
POST /timeboxes
POST /timeboxes/{id}/start
POST /timeboxes/{id}/review
POST /timeboxes/{id}/verify
POST /calendar/ics/export
```

Gate APIs:

```text id="snpsu8"
GET /gates/{object_type}/{object_id}
POST /gates/{object_type}/{object_id}/check
```

The backend must own gates. UI-only discipline is fake discipline.

## Build order for StrategyNotes

Do not build NexusNotes first and StrategyNotes later as a plugin. Build a **minimal integrated vertical slice**.

### Slice 1 - StrategyNotes core node

```text id="53mbl4"
Create typed markdown node
→ store frontmatter
→ index node
→ render node
→ log activity to daynote
```

### Slice 2 - Evidence object

```text id="p61m1x"
Create source node
→ create evidence item node
→ link evidence to source
→ accept evidence
→ show trace
```

### Slice 3 - Strategy case

```text id="5ffua7"
Create strategy_case node
→ attach evidence
→ create ORD outcome
→ create SLD claim
→ show case cockpit
```

### Slice 4 - Strategy bet

```text id="189arw"
Create bet node
→ require evidence, assumptions, counterevidence, success metric, kill criteria
→ approve only if gates pass
```

### Slice 5 - Work package and pomo timebox

```text id="1hd6dq"
Create work package
→ define inputs/outputs/tools/technique
→ estimate pomos
→ commit calendar block
→ execute
→ review
→ attach evidence
```

### Slice 6 - Daynote ledger

```text id="v8dhuw"
Daynote shows created/modified/scheduled nodes
→ plus committed/executed/missed timeboxes
→ plus evidence produced
→ plus decisions made
```

### Slice 7 - Value claim

```text id="b0vafg"
Experiment/timebox evidence
→ validates or weakens bet
→ supports value claim
→ VRD view updates
```

That proves the whole app.

## The updated spec name and framing

Use:

```text id="nwatgr"
StrategyNotes Specification
```

Not NexusNotes. Not Strategy Kernel.

Subtitle:

```text id="xl4gxb"
A local-first, markdown-native strategic knowledge and execution system.
```

Problem statement:

```text id="nvgp95"
StrategyNotes stores knowledge, strategy, decisions, work, time commitments, execution reviews, and value claims as a single linked graph of durable markdown nodes. It solves the gap between thinking, planning, acting, and learning by requiring evidence for claims and timeboxed commitments for execution.
```

## Bottom line

You are right to push back.

The strongest architecture is not:

```text id="nzt1h9"
NexusNotes + Strategy Kernel
```

It is:

```text id="cw2uwb"
StrategyNotes
```

A single app where:

```text id="81mp27"
notes are strategic objects,
strategy artifacts are living views,
tasks are work packages,
commitments are pomos on a calendar,
execution produces evidence,
daynotes become the value ledger,
and the whole system remains local-first, markdown-native, graph-based, and evidence-gated.
```

That is the product.

## Prompt:
6/21/2026, 2:46:20 PM

ok as such provide the spec using this template

[Attachment: Evidence_Based_Agent_Implementation_Plan_Template.md]

## Response:
6/21/2026, 2:46:21 PM

> **Clarifying spec and implementation plan**
>
> The user asked for a spec using a template, but the template seems to be for an implementation plan, not a spec. They didn’t specify a file download and have mentioned no artifacts until a rewrite. I’ll clarify by providing the plan using the template and separately provide the spec, formatted as SPEC.md.
>
> **Providing spec using template in Markdown**
>
> The user wants a spec using a template—likely in Markdown format. I’ll provide it as content without creating a file unless requested explicitly. Although a downloadable could be nice, I’ll stick to the content for now. I’ll cite the template file and possibly previous notes if useful.
>
> Thought for 21s

Yes. The attached template is an **Evidence-Based Agent Implementation Plan** template, not a normal product-spec template, so I’m using it as the **agent-followable build plan for StrategyNotes** while embedding the StrategyNotes PRD/SDS/INV/TST traceability inside it. That matches the template’s purpose: force agents to build by dependency order and prove progress with evidence, not summaries. `Evidence_Based_Agent_Implementation_Plan_Template.md`

Here is the populated version.

**document: **

# StrategyNotes Evidence-Based Agent Implementation Plan

Status: Draft v1

Owner: Sam Prime

Spec: `SPEC.md` - StrategyNotes Specification

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

- Build the local-first markdown node substrate before strategy-specific workflows.
- Preserve markdown files as the durable source of truth.
- Treat SQLite as a rebuildable derived cache only.
- Build shared contracts before dependent behavior.
- Use TDD for known behavior slices.
- Use evidence gates before marking work complete.
- Keep workstreams MECE.
- Run autonomous loops only against machine-checkable or review-checkable criteria.
- Preserve invariants even when tests are incomplete.
- Do not let optional features block core conformance.
- Do not implement behavior that lacks a linked PRD, SDS, invariant, or test.
- If behavior is ambiguous, record an open question instead of inventing policy.
- If an agent changes shared contracts, dependent agents must be notified before continuing.
- Agent outputs must enter draft/review states, not accepted artifacts.
- All execution objects must move through work package, pomo estimate, calendar commitment, execution review, and evidence verification.

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

```markdown
## EV-{{ID}} - {{TITLE}}

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
```

Result:
```text
{{PASTE_RELEVANT_OUTPUT_OR_SUMMARY}}
```

Files changed:
- {{FILE_1}}
- {{FILE_2}}

Fidelity notes:
{{HOW_THIS_MATCHES_THE_SPEC}}

Remaining gaps:
{{WHAT_IS_NOT_YET_VERIFIED}}

Status:
{{Accepted | Needs Review | Rejected | Blocked}}
```

### Minimum evidence by slice type

For pure logic:

```text
Unit tests + typecheck
```

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

### Phase 0 - Project skeleton and verification harness

Must happen first.

Owns:

- Repository structure
- Tauri/Rust core scaffold or selected implementation shell
- Frontend app scaffold
- Test framework
- Typecheck/lint/build commands
- `SPEC.md`
- `PLAN.md`
- `AGENT_STATE.md`
- `EVIDENCE.md`
- `OPEN_QUESTIONS.md`
- `CHANGELOG.md`
- Shared command list

Outputs:

- Buildable empty app
- One no-op command or service call
- Working test command
- Working typecheck/build command

Evidence required:

- EV-BLD or EV-TST showing harness runs
- EV-TRACE showing initial PRD/SDS/INV/TST map

---

### Phase 1 - Shared contracts and types

Depends on:

- Phase 0

Owns:

- Node, Branch, Ref, Tag, Property, Daynote, ActivityEntry
- TypedEdge
- StrategyCase
- StrategyArtifact
- EvidenceItem
- OutcomeRequirement
- StrategicClaim
- StrategyBet
- WorkPackage
- PomoEstimate
- Timebox
- TimeboxReview
- DecisionRecord
- ValueClaim
- OpenQuestion
- Risk
- AgentRun
- GateResult
- Error categories
- Adapter interfaces
- Event shapes

Why this is early:

```text
Parallel agents need stable contracts.
Without this phase, later agents create incompatible local models.
```

Evidence required:

- EV-TYP across shared types
- EV-CT for serialization and adapter interfaces
- EV-TRACE linking contracts to SDS IDs

---

### Phase 2 - Markdown storage and serialization rules

Depends on:

- Phase 1

Owns:

- Markdown file format
- Frontmatter schema
- Deterministic serialization
- Unknown-key preservation
- ULID/path identity
- Inline links and refs
- Tag parsing
- Typed edge encoding in frontmatter or markdown
- Strategy object storage format
- Work package and timebox storage format

Why this is early:

```text
StrategyNotes must remain portable.
If the markdown contract is weak, the rest of the app becomes database-dependent.
```

Evidence required:

- TST-STORAGE parse/serialize tests
- TST-GRAPH inline ref/tag tests
- TST-STORAGE unknown-key preservation tests
- EV-TRACE for INV-DUR, INV-PORT, INV-EDGE

---

### Phase 3 - SQLite index and rebuild contract

Depends on:

- Phase 2

Owns:

- SQLite schema
- Derived tables for nodes, branches, refs, typed_edges, evidence, strategy objects, timeboxes, daynotes
- Rebuild from markdown
- Missing/corrupt index recovery
- Search index if selected
- Index schema versioning

Why this comes before domain workflows:

```text
Strategy workflows require fast queries, but the index must remain disposable.
```

Evidence required:

- Rebuild equivalence tests
- Corrupt index recovery tests
- Index loss no-data-loss test
- EV-TRACE for INV-DUR

---

### Phase 4 - Graph service and activity/daynote service

Depends on:

- Phase 2
- Phase 3

Owns:

- Node create/update/delete
- Branch placement
- Multi-parent clone behavior
- Backlinks
- Typed edge traversal
- Daynote lazy creation
- Activity entries on create/modify
- Scheduled node appearance
- Daynote activity rendering

Evidence required:

- Clone edit/delete tests
- Cycle rejection tests
- Backlink and typed-edge tests
- Daynote creation/activity tests
- Scheduling tests
- EV-TRACE for INV-CLONE, INV-DAY, INV-EDGE

---

### Phase 5 - Strategy domain model and case lifecycle

Depends on:

- Phase 4

Owns:

- Strategy case creation
- Case Charter
- Case phase states
- ERD/ORD/SLD/EDS/VSD/VRD artifact objects
- Artifact generation as views over linked nodes
- Strategy case cockpit data model
- Actor, ranking, and MCGCS models
- Choice cascade model
- Strategy decision records

Evidence required:

- Case lifecycle tests
- Artifact view generation tests
- Actor/ranking/MCGCS tests
- SDR creation tests
- EV-TRACE from PRD-008 through PRD-017

---

### Phase 6 - Evidence, claims, contradiction, and traceability

Depends on:

- Phase 5

Owns:

- Source and source chunk objects
- Evidence extraction drafts
- Evidence acceptance/rejection
- Proof levels
- Claim states
- Contradiction linking
- Source-to-value trace traversal
- Evidence rail data model
- Trace explorer backend

Evidence required:

- Evidence state transition tests
- Claim acceptance gate tests
- Counterevidence visibility tests
- Trace traversal tests
- EV-SRC and EV-TRACE evidence records

---

### Phase 7 - Gate engine

Depends on:

- Phase 5
- Phase 6

Owns:

- Gate definition model
- Gate check engine
- Case phase transition gates
- Evidence acceptance gates
- Strategy bet approval gates
- Work package commitment gates
- Timebox verification gates
- Value claim validation gates
- Backend-owned gate enforcement

Evidence required:

- Gate pass tests
- Gate blocked tests
- API or service contract tests
- EV-TRACE for every INV gate

---

### Phase 8 - Work package planning model

Depends on:

- Phase 7

Owns:

- WorkPackage object
- Inputs/ingredients map
- Expected outputs/artifacts/results map
- Tools required
- Techniques/methods
- Exception policy
- Capture rule
- Review prompt
- Discretionary task model
- CMMN-style sentries/triggers/milestones

Evidence required:

- Work package validation tests
- Missing input/output/tool/method blocked tests
- Discretionary task tests
- Exception capture tests
- EV-TRACE for PRD-018, SDS-WORK, SDS-EXEC

---

### Phase 9 - Pomodoro timebox and capacity model

Depends on:

- Phase 8

Owns:

- PomoEstimate
- Default 25/5 pomo pattern
- Configurable pomo pattern if selected
- Deep Work Packet model: recommended 6 pomos / about 3 hours with breaks
- Timebox states
- Capacity budgets
- Pomo ledger
- Actual vs estimated cost
- Missed/rescheduled/blocked state handling

Evidence required:

- Pomo estimate tests
- Timebox state transition tests
- Capacity infeasibility tests
- Missed/rescheduled review tests
- EV-TRACE for PRD-019 through PRD-024

---

### Phase 10 - Calendar adapters

Depends on:

- Phase 9

Owns:

- Internal StrategyNotes calendar
- ICS export
- ICS import if selected
- Google Calendar adapter
- Outlook/Microsoft 365 Calendar adapter
- iCloud/CalDAV adapter if selected
- Provider error handling
- External event ID mapping
- Calendar sync reconciliation

MVP recommendation:

```text
Build internal timeboxes and ICS export first.
Do not make Google, Outlook, or iCloud required for core correctness.
```

Evidence required:

- ICS file generation test
- Adapter contract tests
- Calendar provider smoke tests or EV-SKIP
- Local state preserved when provider fails
- EV-TRACE for INV-CAL

---

### Phase 11 - Execution mode and review loop

Depends on:

- Phase 8
- Phase 9

Owns:

- Low-decision execution runbook UI/backend
- Active timebox start/end
- Inputs checklist
- Step/method display
- Expected output display
- Exception capture bar
- Idea/blocker/deviation capture
- Evidence attachment
- Post-timebox review
- Hypothesis update
- Next action decision

Evidence required:

- Execution mode state tests
- Exception capture tests
- Post-block review required tests
- Verification blocked without review tests
- EV-TRACE for INV-EXEC and INV-REVIEW

---

### Phase 12 - StrategyNotes UI system

Depends on:

- Phase 5 through Phase 11 contracts

Owns:

- Atomic UI component library
- Strategy case cockpit
- Evidence inbox
- Artifact view builder
- MCGCS map
- Choice cascade canvas
- Bet board
- Planning board
- Execution runbook
- Pomo ledger
- Daynote ledger
- Trace explorer
- Value realization panel
- Agent draft inbox
- TSRX rendering integration

Evidence required:

- Component tests
- UI snapshot evidence
- Manual review or screenshot evidence
- Accessibility checks for critical flows
- EV-TRACE for SDS-UI

---

### Phase 13 - Agent draft and review system

Depends on:

- Phase 6
- Phase 7
- Phase 12

Owns:

- AgentRun object
- Agent input/output capture
- Draft quarantine
- Human accept/reject/split/merge controls
- Agent prompt templates
- Agent trace links
- Agent failure/error categories
- Agent authority limits

Evidence required:

- Agent draft never auto-accepted test
- Human approval transition test
- Agent output trace test
- EV-TRACE for PRD-026, SDS-AGENT, INV-HUMAN

---

### Phase 14 - Value realization and review

Depends on:

- Phase 7
- Phase 9
- Phase 11

Owns:

- ValueClaim object
- VRD view
- Before/after comparison
- Proof level
- Stakeholder value map
- Lessons learned
- Strategy review record
- Framework evolution note
- Case close gate

Evidence required:

- Value claim blocked without proof test
- VRD generation test
- Case close blocked without review test
- Lessons learned capture test
- EV-TRACE for PRD-014, PRD-024, INV-VALUE

---

### Phase 15 - Observability and conformance

Depends on:

- Phases 0 through 14

Owns:

- Structured logs
- Audit trail
- Runtime snapshot
- Evidence dashboard
- Full regression suite
- Traceability review
- Orphan code check
- Known limitations
- Final fidelity review

Evidence required:

- Full test suite
- Typecheck/lint/build
- Log/snapshot tests
- Fidelity review records
- EV-SMOKE for full vertical slice

---

## 4. MECE Workstreams

### Workstream A - Foundation and contracts

Mission:

Create the shared app substrate every other agent depends on.

Owns:

- Project skeleton
- Test harness
- Typecheck/build/lint commands
- Shared domain types
- Error categories
- Adapter interfaces
- Event shapes
- Agent state/evidence files

Does not own:

- Strategy behavior
- Calendar provider behavior
- UI implementation

Blocks:

- All downstream implementation

Evidence required:

- Empty test harness passes
- Shared contracts compile
- Contract tests exist for important interfaces

---

### Workstream B - Markdown vault and serialization

Mission:

Make markdown the durable source of truth.

Owns:

- Markdown frontmatter schema
- Deterministic serialization
- Node identity
- Inline refs/tags
- Typed edge persistence
- Unknown-key preservation
- Atomic file writes

Does not own:

- SQLite query behavior
- Strategy gate policy
- UI rendering

Blocks:

- Index
- Graph
- Strategy domain objects

Evidence required:

- Parse/serialize tests
- Round-trip tests
- Rebuild compatibility tests

---

### Workstream C - Index and graph services

Mission:

Provide fast derived graph queries without becoming the source of truth.

Owns:

- SQLite schema
- Rebuild process
- Ref/backlink resolution
- Typed edge traversal
- Branch/clone behavior
- Daynote indexing

Does not own:

- Markdown schema decisions
- Strategy semantics

Blocks:

- Evidence trace
- Case cockpit
- Daynote ledger

Evidence required:

- Rebuild tests
- Clone tests
- Backlink/edge tests

---

### Workstream D - Strategy domain model

Mission:

Define strategy-native objects as typed notes.

Owns:

- StrategyCase
- ERD/ORD/SLD/EDS/VSD/VRD
- SDR
- Actor/ranking/MCGCS
- Choice cascade
- Strategy bet
- Experiment/metric/value claim

Does not own:

- Work package/timebox execution
- Calendar adapters

Blocks:

- Gate engine
- Case cockpit
- Value realization

Evidence required:

- Domain object tests
- Artifact view tests
- Strategy lifecycle tests

---

### Workstream E - Evidence and traceability

Mission:

Make claims accountable to source reality.

Owns:

- Source/source chunk
- Evidence item
- Evidence status
- Proof levels
- Contradiction linking
- Trace traversal
- Evidence rail

Does not own:

- Strategy document rendering
- Calendar state

Blocks:

- Claim gates
- Bet approval
- Value realization

Evidence required:

- Evidence state tests
- Trace tests
- Counterevidence tests

---

### Workstream F - Gate engine

Mission:

Make progress claims backend-enforced.

Owns:

- Gate definitions
- Gate engine
- Approval state transitions
- Blocked gate reporting
- Gate API/service

Does not own:

- UI display only
- Domain object storage

Blocks:

- Bet approval
- Work commitment
- Timebox verification
- Value claims

Evidence required:

- Gate pass/fail tests
- Contract tests
- Invariant trace review

---

### Workstream G - Work package and CMMN execution planning

Mission:

Separate planning from execution.

Owns:

- Work packages
- Inputs/ingredients
- Outputs/artifacts/results
- Tools/techniques
- Exception policies
- Discretionary tasks
- Sentries/triggers/milestones
- Capture rules

Does not own:

- Calendar provider integration
- Strategy artifact schema

Blocks:

- Timeboxing
- Execution mode

Evidence required:

- Work package validation tests
- Exception policy tests
- Discretionary task tests

---

### Workstream H - Pomo, timebox, and capacity ledger

Mission:

Make time cost explicit.

Owns:

- Pomo estimate
- Timebox states
- Capacity budget
- Value/time ledger
- Actual vs estimate
- Missed/rescheduled/blocker states
- Review-required state

Does not own:

- External calendar providers
- Strategy claim logic

Blocks:

- Calendar integration
- Execution mode

Evidence required:

- Timebox state tests
- Capacity tests
- Review required tests

---

### Workstream I - Calendar adapters

Mission:

Connect commitments to real calendars without corrupting local state.

Owns:

- Internal calendar
- ICS export
- ICS import if selected
- Google Calendar adapter
- Outlook adapter
- iCloud/CalDAV adapter if selected
- Provider error mapping

Does not own:

- Local timebox source of truth
- Work package planning

Blocks:

- External calendar sync

Evidence required:

- ICS tests
- Adapter contract tests
- Smoke tests or EV-SKIP

---

### Workstream J - Execution and review UX

Mission:

Support low-decision execution and disciplined learning.

Owns:

- Execution runbook
- Active timebox view
- Exception capture
- Evidence attachment
- Post-block review
- Hypothesis update
- Next action decision

Does not own:

- Strategy planning logic
- Calendar provider sync

Blocks:

- Verified execution
- Learning loop

Evidence required:

- Execution flow tests
- Review tests
- UI evidence

---

### Workstream K - UI component system

Mission:

Build reusable StrategyNotes UI from atomic components.

Owns:

- Atoms
- Molecules
- Organisms
- Templates
- TSRX renderers
- Case cockpit
- Evidence inbox
- Bet board
- Planning board
- Daynote ledger
- Trace explorer

Does not own:

- Backend gate authority
- Storage persistence rules

Blocks:

- User-facing workflows

Evidence required:

- Component tests
- Snapshot/UI evidence
- Manual review notes

---

### Workstream L - Agent draft and governance

Mission:

Keep agent outputs useful but bounded.

Owns:

- AgentRun
- Draft quarantine
- Human review controls
- Prompt generation
- Agent trace links
- Agent failure handling

Does not own:

- Human approval policy itself
- Core storage rules

Blocks:

- Safe AI-assisted workflows

Evidence required:

- Draft quarantine tests
- Human approval tests
- Agent trace tests

---

### Workstream M - Observability and conformance

Mission:

Prove the implementation matches the spec.

Owns:

- Logs
- Runtime snapshots
- Audit trail
- Evidence dashboard
- Full test suite
- Traceability review
- Fidelity review
- Known limitations

Does not own:

- New feature implementation unless explicitly assigned

Blocks:

- Release

Evidence required:

- Full evidence bundle
- Remaining gaps list
- Final acceptance decision

---

## 5. Parallelization Rules

### Safe to parallelize early

These can run once skeleton and shared contracts exist:

- Markdown parse/serialize
- ULID/path identity
- Typed edge schema design
- Pure validation rules
- Error categories
- Logging format
- Component stubs

Why:

```text
They are mostly pure or interface-bound.
They do not mutate shared runtime state.
```

### Safe to parallelize later

These can run once core interfaces are stable:

- UI components behind stable domain contracts
- Calendar adapters behind timebox contract
- Agent draft workflow behind review contract
- Observability snapshot
- ICS export
- Import/export

Why:

```text
They depend on contracts but do not own central state transitions.
```

### Do not aggressively parallelize

Keep these tightly coordinated:

- Markdown/frontmatter schema
- SQLite schema
- Node identity model
- Gate engine
- Timebox state machine
- Strategy bet approval logic
- Daynote/activity logging
- Calendar sync reconciliation
- Shared type/interface changes

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

#### Slice S-STORAGE-001 - Markdown node round-trip

Spec links:

- PRD-001
- PRD-003
- SDS-STORAGE
- INV-DUR
- INV-PORT

Dependency:

- Phase 1 shared types

Test first:

- TST-STORAGE-001 - parse node markdown with frontmatter and body, serialize it, parse again, and prove equivalent domain state.

Failure cases:

- Missing required ID
- Invalid frontmatter
- Unknown frontmatter keys
- Malformed typed edge list

Evidence:

- EV-TST
- EV-TYP
- EV-TRACE

Done when:

- Round-trip test passes.
- Invalid input tests pass.
- Evidence is recorded.

---

#### Slice S-EVID-001 - Evidence cannot be accepted without provenance

Spec links:

- PRD-009
- SDS-EVID
- INV-EVID
- TST-EVID

Dependency:

- Source and EvidenceItem contracts

Test first:

- TST-EVID-001 - evidence item with no source link and no manual basis cannot move to Accepted.

Failure cases:

- Missing source
- Source exists but unresolved
- Manual basis missing reviewer

Evidence:

- EV-TST
- EV-TRACE

Done when:

- Acceptance gate blocks invalid evidence.
- Valid evidence can be accepted.
- Evidence record exists.

---

#### Slice S-BET-001 - Strategy bet approval gate

Spec links:

- PRD-017
- SDS-GATE
- INV-BET
- TST-GATE

Dependency:

- Evidence, Claim, StrategyBet, GateResult contracts

Test first:

- TST-GATE-001 - bet cannot be approved without linked choice, evidence basis, assumptions, counterevidence review, success metric, kill criteria, and owner.

Evidence:

- EV-TST
- EV-TRACE

Done when:

- Missing each required field produces a typed failed gate.
- Valid bet produces accepted gate result and SDR.

---

#### Slice S-WORK-001 - Work package must define action ingredients

Spec links:

- PRD-018
- SDS-WORK
- INV-WORK
- TST-WORK

Dependency:

- WorkPackage contract

Test first:

- TST-WORK-001 - work package cannot move to Ready unless objective, inputs, outputs, tools, technique, exception policy, and evidence requirement exist.

Evidence:

- EV-TST
- EV-TRACE

---

#### Slice S-TIME-001 - No commitment without pomo estimate and timebox

Spec links:

- PRD-019
- PRD-020
- SDS-TIME
- INV-TIME
- TST-TIME

Dependency:

- WorkPackage Ready state

Test first:

- TST-TIME-001 - work package cannot move to Committed unless it has estimated pomos, scheduled start/end, owner, expected output, and evidence requirement.

Evidence:

- EV-TST
- EV-TRACE

---

#### Slice S-REVIEW-001 - No verified timebox without post-block review

Spec links:

- PRD-022
- PRD-023
- SDS-TIME
- INV-REVIEW
- TST-REVIEW

Dependency:

- Timebox state machine

Test first:

- TST-REVIEW-001 - executed timebox cannot move to Verified unless a review exists with actual pomos, output summary, evidence link or explicit no-evidence reason, and next action decision.

Evidence:

- EV-TST
- EV-TRACE

---

### When not to use strict TDD

Strict TDD may be inappropriate when:

- Exploring unknown calendar provider API behavior.
- Investigating Tauri/WebView platform behavior.
- Testing iCloud/CalDAV reliability.
- Designing first-pass visual layout.

Use a spike:

```markdown
### SPIKE-{{ID}} - {{TITLE}}

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

- The next task is linked to specific spec IDs.
- The completion condition is checkable.
- The agent has a command or review criterion for verification.
- The loop has a stop condition.
- The loop records evidence after each iteration.
- The loop does not modify shared contracts without explicit handoff.

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

- A diff
- A test or verification update
- Command output
- Evidence record
- Updated agent state
- Clear next action or blocker

### Loop anti-patterns

Do not allow:

- “All tasks complete” without evidence.
- Rewriting the spec to match implementation.
- Skipping tests because the code looks correct.
- Continuing after invariant failure.
- Parallel agents editing the same contract.
- Ambiguous work inside an autonomous loop.
- Massive refactors without slice-level verification.
- Accepting agent-generated strategy claims without human review.
- Treating calendar sync as the source of truth.

---

## 8. Auto-Research and Spike Loops

### When auto-research is allowed

Use auto-research for:

- Current Tauri behavior
- Current SQLite/FTS behavior
- Current Google Calendar API behavior
- Current Microsoft Graph Calendar API behavior
- iCloud/CalDAV feasibility
- ICS file format edge cases
- TSRX runtime behavior
- Local filesystem watcher behavior
- Markdown parsing libraries
- ULID library monotonicity

Do not use auto-research for:

- Inventing product intent
- Overriding explicit spec decisions
- Replacing tests
- Expanding scope

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
## RESEARCH-{{ID}} - {{TITLE}}

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
## FID-{{ID}} - {{SLICE_TITLE}}

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

### Gate 1 - Contracts stable

Pass criteria:

- Shared types compile.
- Interface contracts are documented.
- Serialization contracts exist.
- Mocks match real adapter shapes.
- No workstream owns the same behavior as another.

Evidence:

- EV-TYP
- EV-CT
- EV-TRACE

---

### Gate 2 - Local-first substrate works

Pass criteria:

- Node markdown is created.
- Node markdown is parsed and serialized.
- SQLite index is built from markdown.
- Index can be deleted and rebuilt.
- Daynote activity captures creation/modification.
- Backlinks and typed edges resolve.

Evidence:

- EV-TST
- EV-BLD
- EV-TRACE

---

### Gate 3 - Strategy case spine works

Pass criteria:

- Strategy case can be created.
- Evidence item can be linked to source.
- ORD outcome can be created.
- SLD claim can be created.
- Strategy bet can be drafted.
- Trace view shows source → evidence → claim → bet.

Evidence:

- EV-TST
- EV-SMOKE
- EV-TRACE

---

### Gate 4 - Evidence and bet gates work

Pass criteria:

- Evidence cannot be accepted without provenance.
- Claims carry proof level.
- Contradictions remain visible.
- Bet cannot be approved without required fields.
- Approved bet creates or links to SDR.

Evidence:

- EV-TST
- EV-TRACE
- EV-AUDIT

---

### Gate 5 - Work package and timebox loop works

Pass criteria:

- Work package requires inputs, outputs, tools, technique, evidence requirement, exception policy.
- Work package cannot be committed without pomo estimate.
- Work package cannot be committed without timebox.
- Timebox can be scheduled internally.
- ICS export works or is explicitly skipped.
- Executed timebox requires post-block review.
- Verified timebox requires evidence or explicit no-evidence reason.

Evidence:

- EV-TST
- EV-ICS
- EV-SMOKE
- EV-TRACE

---

### Gate 6 - Execution/review loop works

Pass criteria:

- Execution mode shows runbook, inputs, expected output, method, capture bar.
- New ideas are captured, not forced into immediate strategy changes.
- Blockers and exceptions are classified.
- Review creates evidence, open question, decision, or next work package.
- Daynote ledger shows execution activity.

Evidence:

- EV-TST
- EV-UI
- EV-AUDIT
- EV-TRACE

---

### Gate 7 - Value realization works

Pass criteria:

- Value claim links to ORD outcome and evidence.
- Proof level is required.
- VRD view generates from value claims and evidence.
- Case cannot close without value finding or explicit no-value finding.
- Lessons learned are captured.

Evidence:

- EV-TST
- EV-TRACE
- EV-MAN

---

### Gate 8 - Release conformance

Pass criteria:

- Full tests pass.
- Typecheck/lint/build pass.
- Invariant tests pass.
- Traceability review passes.
- Fidelity review passes.
- Known gaps are documented.
- No unresolved blocking questions remain.

Evidence:

- EV-TST
- EV-TYP
- EV-LINT
- EV-BLD
- EV-TRACE
- FID records

---

## 11. Open Questions

### OQ-001 - Exact markdown schema for typed strategy edges

Why it matters:

Typed edges must be durable and reconstructable from markdown, not SQLite-only.

Affected IDs:

- PRD-005
- SDS-GRAPH
- INV-EDGE
- INV-PORT

Options:

- Option A: Store typed edges in frontmatter.
- Option B: Store typed edges as inline markdown syntax.
- Option C: Store typed edges in both, with frontmatter authoritative.

Recommended choice:

Option A for MVP. It is easier to parse and test. Inline rendering can come later.

Decision:

Pending.

Owner:

Sam / Architecture Agent

Status:

Open

---

### OQ-002 - MVP calendar integration level

Why it matters:

Full Google/Outlook/iCloud sync can slow the MVP.

Affected IDs:

- PRD-020
- PRD-025
- SDS-CAL
- INV-CAL

Options:

- Option A: Internal timeboxes only.
- Option B: Internal timeboxes + ICS export.
- Option C: One-way Google/Outlook sync.
- Option D: Full two-way sync.

Recommended choice:

Option B for MVP.

Decision:

Pending.

Owner:

Sam / Calendar Agent

Status:

Open

---

### OQ-003 - Pomo customization in MVP

Why it matters:

Default 25/5 keeps the product opinionated, but users may need different cycles.

Affected IDs:

- PRD-019
- SDS-TIME
- INV-TIME

Options:

- Option A: Fixed 25/5 in MVP.
- Option B: User-configurable from day one.
- Option C: Fixed 25/5 plus deep-work preset.

Recommended choice:

Option C.

Decision:

Pending.

Owner:

Sam / Product Agent

Status:

Open

---

### OQ-004 - Materialized artifacts vs generated views

Why it matters:

ERD/ORD/SLD/EDS/VSD/VRD must be readable, but the source of truth should remain graph-based.

Affected IDs:

- PRD-009 through PRD-014
- SDS-STRAT
- INV-PORT

Options:

- Option A: Artifacts are generated views only.
- Option B: Artifacts are markdown nodes manually edited.
- Option C: Artifacts are materialized markdown views generated from graph nodes, with protected generated sections.

Recommended choice:

Option C.

Decision:

Pending.

Owner:

Sam / Architecture Agent

Status:

Open

---

### OQ-005 - External file edit activity

Why it matters:

The app must decide whether external edits appear in daynotes and strategy ledgers.

Affected IDs:

- PRD-007
- SDS-DAY
- INV-DAY

Options:

- Option A: External edits count as modifications.
- Option B: External edits update index but do not create activity.
- Option C: User-configurable.

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

### RISK-001 - Generic notes app drift

Description:

The app becomes a PKM app with light strategy templates instead of a strategy-native system.

Likely failure mode:

Agents build notes/outliner features but skip evidence gates, timeboxes, and validation.

Affected workstreams:

- D
- E
- F
- G
- H

Mitigation:

- Build strategy vertical slice early.
- Do not accept UI-only progress.
- Require source → evidence → bet → work package → timebox → review trace.

Detection:

- Gate 3 and Gate 5 fail.

Owner:

Product/Architecture Agent

Status:

Open

---

### RISK-002 - Database becomes hidden source of truth

Description:

Strategy-critical state ends up only in SQLite.

Likely failure mode:

Rebuild loses gates, typed edges, timeboxes, or reviews.

Affected workstreams:

- B
- C
- D
- H

Mitigation:

- Every strategy object must serialize to markdown.
- Rebuild equivalence tests required.
- Index deletion smoke test required.

Detection:

- INV-DUR test fails.

Owner:

Storage Agent

Status:

Open

---

### RISK-003 - Calendar integration delays core product

Description:

External provider work blocks local timebox behavior.

Likely failure mode:

MVP stalls on OAuth, iCloud, or sync edge cases.

Affected workstreams:

- H
- I

Mitigation:

- Build internal timeboxes and ICS export first.
- Treat provider sync as optional adapter.

Detection:

- Calendar smoke tests blocked by credentials.

Owner:

Calendar Agent

Status:

Open

---

### RISK-004 - Completion theater through UI percentages

Description:

The UI rewards filled sections instead of verified progress.

Likely failure mode:

Users feel progress because documents look complete.

Affected workstreams:

- F
- K
- M

Mitigation:

- Use maturity states, not percent complete.
- Display evidence debt, gate failures, and proof levels.

Detection:

- UI allows artifact to show complete without passed gates.

Owner:

UI Agent

Status:

Open

---

### RISK-005 - Planning and execution collapse into each other

Description:

Users re-plan mid-execution and lose flow.

Likely failure mode:

Execution mode becomes another strategy-editing workspace.

Affected workstreams:

- G
- J
- K

Mitigation:

- Execution mode only shows runbook, inputs, method, expected output, capture bar, and evidence attach.
- New ideas go to capture, not immediate plan mutation.

Detection:

- Execution mode allows unrestricted strategy object editing.

Owner:

Execution UX Agent

Status:

Open

---

### RISK-006 - Agent authority creep

Description:

AI-generated content becomes accepted strategy without human review.

Likely failure mode:

Agent drafts directly update ERD, SLD, bets, or value claims.

Affected workstreams:

- E
- F
- L

Mitigation:

- Draft quarantine.
- Human approval gate.
- AgentRun trace required.

Detection:

- Agent output appears in accepted artifact without human approval event.

Owner:

Agent Governance Agent

Status:

Open

---

## 13. Definition of Done

The project is done only when:

- [ ] All in-scope PRDs have implementation or explicit deferral.
- [ ] All in-scope SDS items have tests or documented verification.
- [ ] All invariants have direct tests.
- [ ] Core failure behaviors are tested.
- [ ] Markdown remains the durable source of truth.
- [ ] SQLite can be deleted and rebuilt without losing strategy-critical state.
- [ ] Strategy cases, evidence, claims, bets, work packages, timeboxes, reviews, and value claims serialize to markdown.
- [ ] Evidence acceptance gates work.
- [ ] Strategy bet approval gates work.
- [ ] Work package commitment gates work.
- [ ] Timebox verification gates work.
- [ ] Value claim validation gates work.
- [ ] Calendar integration smoke tests pass or are clearly skipped with reason.
- [ ] UI shows maturity/gate states instead of fake completion percentages.
- [ ] Daynote ledger captures activity, scheduled work, timeboxes, reviews, decisions, and evidence.
- [ ] External integrations are behind contracts.
- [ ] Operator-visible errors exist for startup, storage, gates, calendar, execution, and sync failures.
- [ ] Evidence records exist for completed slices.
- [ ] Fidelity review is accepted.
- [ ] Documentation matches actual behavior.
- [ ] No unresolved blocking questions remain.
- [ ] Known limitations are documented.

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
{{SLICE_ID}} - {{TITLE}}

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

- EV-TST for each state transition
- EV-ICS for calendar export
- EV-TRACE for source-to-value chain
- EV-UI for cockpit/daynote/trace display
- EV-MAN review of the full flow

I would treat this as `PLAN.md`, not `SPEC.md`. The companion `SPEC.md` should define the actual product contract in stable normative language. This plan is what keeps coding agents from drifting, especially around the dangerous parts: source-of-truth, gates, calendar commitments, and fake completion.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)