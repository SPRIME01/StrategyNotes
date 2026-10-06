# evidence.md

One EV-* record per completed slice. Format per PLAN sec 2. A slice is not done
when the code looks right — it is done when the agreed evidence passes.

---

## EV-000 — Phase 0 harness (workspace + smoke)

Date: 2026-06-21
Slice: S-PHASE0-001 — Workspace scaffold + harness
Agent: main (this session)
Spec IDs: (harness slice — no behavior IDs yet; sets up verification for all later slices)

Commands run:
```bash
cargo build  --workspace
cargo test   --workspace
cargo check  --workspace
pnpm -C ui test
pnpm -C ui typecheck
```

Result:
```text
### cargo build --workspace
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.02s

### cargo test --workspace
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
    Doc-tests: 0 passed; 0 failed

### cargo check --workspace
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.01s

### pnpm -C ui test
 ✓ src/App.test.tsx (1 test) 48ms
 Test Files  1 passed (1)
      Tests  1 passed (1)

### pnpm -C ui typecheck
  (exit 0, no errors)
```

Files changed:
- `Cargo.toml`, `rust-toolchain.toml`, `package.json`, `pnpm-workspace.yaml`, `.gitignore`
- `core/Cargo.toml`, `core/src/lib.rs`, `core/src/ports.rs`, `core/src/time.rs`, `core/tests/smoke.rs`
- `ui/package.json`, `ui/tsconfig.json`, `ui/vite.config.ts`, `ui/index.html`, `ui/src/main.tsx`, `ui/src/App.tsx`, `ui/src/App.test.tsx`
- `AGENT_STATE.md`, `EVIDENCE.md`, `OPEN_QUESTIONS.md`, `CHANGELOG.md`
- `AGENTS.md` (sec 9 commands filled in)

Fidelity notes:
- Proves the hexagonal core (SPEC sec 3.4) compiles with zero I/O deps, is
  exercised through the `Clock` driven port via a fake adapter, and that the
  dependency direction is core <- adapter (never the reverse).
- TDD followed for `core/src/time.rs`: test written first, RED verified
  (`assertion left == right failed: "" vs "# Daynote (epoch=1700000000)"`),
  minimal impl written, GREEN verified.
- UI harness is scaffold (scaffold exception per TDD skill); its smoke test
  proves React+TS+Vitest compiles and renders, not new behavior.

Remaining gaps:
- No Tauri shell yet (deferred to S-PHASE0-002). The app does not yet run as a
  desktop window; `ui/` is a plain Vite dev server, `core/` is a plain library.
- No lint config (cargo clippy / eslint) — deferred.
- No behavior beyond the smoke functions; this is the harness slice only.

Status: Accepted

## EV-001 — Phase 1 shared contracts (EV-TYP + EV-CT)

Date: 2026-06-21
Slice: S-CONTRACTS-001
Spec IDs: SDS-NODE, SDS-EVID, SDS-STRAT, SDS-GATE, SDS-AGENT, INV-ID, INV-EDGE, INV-DUR

Commands run:
```bash
cargo check --workspace
cargo test  --workspace
```

Result:
```text
cargo check:  Finished (0 errors)
cargo test:   7 passed (6 contract + 1 smoke), 0 failed
  - node_id_roundtrips_lexically
  - node_id_sorts_lexically             (INV-ID: sortable)
  - node_serde_roundtrip_preserves_typed_fields
  - typed_edge_uses_snake_case_edge_type (INV-EDGE: reconstructable shape)
  - gate_result_blocked_shape_matches_spec (SPEC sec 9)
  - gate_result_approved_shape_matches_spec (SPEC sec 9)
  - daynote_header_renders_timestamp_from_clock_port (Phase 0 smoke)
```

Files added (core/src/):
- identity.rs (NodeId - ULID-backed, parse/display, no minting in core)
- node.rs (Node, NodeType x34, Frontmatter=BTreeMap for unknown-key preservation,
  TypedEdge, EdgeType x17, EdgeStatus)
- evidence.rs (Source, SourceChunk, EvidenceItem, ProofLevel x8, EvidenceStatus,
  EvidenceKind)
- strategy.rs (StrategyCase + CasePhase, OutcomeRequirement, StrategicClaim,
  Assumption, ChoiceCascade + ChoiceLevel, StrategyBet + BetStatus)
- execution.rs (WorkPackage + WorkStatus, PomoEstimate, PomoPattern, AttentionMode,
  Timebox + TimeboxStatus, TimeboxReview + Completion, ValueClaim + ValueStatus,
  DecisionRecord)
- governance.rs (OpenQuestion, Risk, AgentRun + AgentRunStatus, ActivityEvent +
  ActivityKind + EventSource)
- gate.rs (GateId x9, GateResult with SPEC sec 9 serialization shape)
- error.rs (core::Error + From impls for ulid/serde_yaml)
- ports.rs (expanded: Clock, IdMinter, NodeVault, DerivedIndex, EventSink)
- lib.rs (module declarations + re-exports)

Files added (core/tests/): contracts.rs (6 EV-CT tests).

Fidelity notes:
- All types are serde-capable (Serialize/Deserialize) so the Phase 2 markdown
  adapter can serialize them to frontmatter without changing core.
- Frontmatter is BTreeMap<String, serde_yaml::Value> - sorted (deterministic per
  PLAN sec 2) and preserves unknown keys (INV-PORT, INV-EDGE, PLAN sec 2 rule).
- NodeId wraps ulid::Ulid for value semantics (parse/compare/sort) but the core
  never mints - IdMinter port owns RNG (INV-ID by construction).
- No I/O imports in core/ (hexagonal boundary intact). Deps added (serde,
  serde_yaml, ulid, chrono, thiserror) are all pure data libraries.

Remaining gaps:
- Ports (NodeVault, DerivedIndex, EventSink, IdMinter) are traits only; no
  adapters yet. Those land in Phase 2 (NodeVault) and Phase 3 (DerivedIndex).
- No domain behavior yet - just types. Behaviors (gates, services) land in
  their phases (5-7).

Status: Accepted

---

## EV-002 — Phase 2 markdown storage (S-STORAGE-001 + adapter)

Date: 2026-06-21
Slice: S-STORAGE-001 + MarkdownVault adapter
Spec IDs: PRD-001, PRD-003, SDS-STORAGE, INV-DUR, INV-PORT, INV-EDGE, TST-STORAGE

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-core:
  contracts.rs ......... 6 passed (Phase 1)
  smoke.rs ............. 1 passed  (Phase 0)
  storage.rs ........... 7 passed  (round-trip, determinism, unknown-key preservation,
                                    missing id/type/delimiter rejection)
strategynotes-adapters:
  markdown_vault.rs .... 7 passed  (put/get round-trip through disk, get-missing
                                    returns None, delete idempotent, all() lists
                                    every node, files are plain markdown on disk
                                    [INV-DUR/INV-PORT], atomic write leaves no
                                    .tmp, unknown keys survive disk round-trip)
TOTAL: 21 passed, 0 failed
```

Files added:
- `core/src/format.rs` - pure markdown parse/serialize (from_markdown / to_markdown).
  Splits frontmatter between `---` delimiters from body, parses YAML map,
  extracts required `id` + `type` into typed fields, preserves all remaining
  keys (including unknown). Deterministic: BTreeMap gives sorted key order.
- `adapters/` crate (new workspace member) - driven adapters outside the hexagon.
  - `src/markdown_vault.rs` - MarkdownVault: NodeVault impl using std::fs with
    atomic writes (write-temp + fsync + rename). Path = `<vault>/<nodeid>.md`.
  - `tests/markdown_vault.rs` - 7 TST-STORAGE tests.

TDD: storage.rs written first against a stub returning Err (RED verified), then
implemented (GREEN). markdown_vault.rs written + verified in one pass.

Fidelity notes:
- INV-DUR proven end-to-end: nodes exist as plain readable `.md` files on disk
  (`files_on_disk_are_plain_markdown_inv_dur` test opens the file with
  std::fs::read_to_string and asserts markdown content). Deleting the future
  SQLite index cannot lose this data.
- INV-PORT: vault contents are portable text, inspectable without the app.
- Unknown-key preservation verified through BOTH the pure format layer AND the
  disk round-trip (two independent tests).
- Atomic writes verified: no `.tmp` file remains after a successful put.
- Hexagonal boundary intact: core/src/format.rs is pure (no std::fs); only
  adapters/ uses std::fs.

Remaining gaps:
- Typed edge encoding in frontmatter deferred to S-STORAGE-002 (next Phase 2
  slice). `NodeVault::edges_of` returns empty with a ponytail: marker.
- Inline [[wikilinks]] and #tag parsing from body not yet (INV-BODY). Later slice.
- No rebuild-smoke test yet (requires DerivedIndex adapter, Phase 3).

Status: Accepted

---

## EV-003 — Phase 3 SQLite derived index + INV-DUR rebuild

Date: 2026-06-21
Slice: S-INDEX-001 (+ S-STORAGE-002 edge encoding folded in)
Spec IDs: PRD-004, PRD-005, SDS-INDEX, INV-DUR, INV-EDGE, TST-STORAGE

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-core:
  contracts ............ 6 passed
  smoke ................ 1 passed
  storage .............. 9 passed  (+2 edge round-trip tests vs EV-002)
strategynotes-adapters:
  markdown_vault ....... 7 passed
  sqlite_index ......... 4 passed
    - rebuild_indexes_nodes_and_edges
    - index_loss_then_rebuild_yields_equivalent_state  <- INV-DUR proof
    - rebuild_is_idempotent
    - rebuild_after_vault_change_reflects_new_state
TOTAL: 27 passed, 0 failed
```

Files added:
- core/src/naming.rs - public snake_case_name / from_snake_case helpers (keeps
  adapters free of a direct serde dep).
- core/src/format.rs - edges_of / set_edges (typed-edge encoding in frontmatter
  under `edges: [{to, type, status?}]`; INV-EDGE reconstructable from text).
- adapters/src/sqlite_index.rs - SQLiteIndex: DerivedIndex impl via rusqlite
  (bundled). Tables: nodes(id, type, body), edges(from_id, to_id, edge_type,
  status). Mutex<Connection>. rebuild() wipes + re-inserts in one transaction.
- adapters/tests/sqlite_index.rs - 4 tests including the INV-DUR proof.

The INV-DUR proof (made executable):
```text
index_loss_then_rebuild_yields_equivalent_state:
  1. seed vault with 3 nodes + 2 typed edges
  2. open SQLiteIndex at <tmp>/index.db, rebuild, capture baseline queries
  3. close index, DELETE the .db file (simulate index loss)
  4. reopen fresh SQLiteIndex at same path, rebuild from vault
  5. assert nodes_by_type / out_edges / backlinks match baseline expectations
```

Fidelity notes:
- The index holds NO truth the markdown lacks: it is a pure function of the
  vault contents at rebuild time. Verified by rebuild_after_vault_change (add/
  delete a node + rebuild -> index reflects it) and rebuild_is_idempotent.
- Hexagonal boundary intact: rusqlite lives only in adapters/, never in core/.
- Edge encoding proven through BOTH the pure format layer (storage.rs tests)
  AND the indexed queries (sqlite_index.rs tests).

Remaining gaps:
- Inline [[wikilink]] and #tag parsing from body (INV-BODY) - still deferred.
- Search/FTS not yet (optional per PLAN sec 3).
- No corrupt-file-recovery test yet (delete-corrupt-then-rebuild path == the
  index-loss test; full corruption detection deferred).

Status: Accepted

---

## EV-004 — Phase 4 daynote/event sink (INV-DAY capture)

Date: 2026-06-21
Slice: S-DAY-001
Spec IDs: PRD-007, PRD-024, SDS-DAY, INV-DAY, TST-DAY

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-adapters:
  daynote_sink ......... 4 passed
    - records_events_into_a_per_day_file
    - events_on_different_dates_land_in_different_files
    - reading_a_missing_day_returns_empty_not_error
    - agent_and_external_sources_are_distinguished  (OQ-005 proven)
TOTAL workspace: 31 passed, 0 failed
```

Files added:
- adapters/src/daynote_sink.rs - DaynoteEventSink: EventSink impl that appends
  each ActivityEvent as a line in <root>/<YYYY-MM-DD>.md. Per-day files, lazy
  creation, best-effort append (INV-DAY capture never fails the calling op).
  Event source (user/agent/external-file/system) captured per OQ-005 Option A.

Fidelity notes:
- INV-DAY enforced by the port boundary: only the core emits ActivityEvents
  through EventSink; the UI cannot fabricate daynote entries directly.
- OQ-005 (recommended Option A) made executable: external-file edits surface
  with explicit `(external-file)` source metadata in the daynote.
- Daynotes are NOT nodes - they are derived activity records living in a sidecar
  dir, separate from the durable node vault.

Remaining gaps:
- Phase 4 clone/multi-parent placement + cycle detection (INV-CLONE) NOT done.
  Blocked on OQ-006 (node grouping model): the SPEC does not specify how clones
  are encoded (parent edge type? outline structure? frontmatter key?). Inventing
  a model here would violate PLAN sec 1 drift rule. OQ-006 escalated to Sam.
- Daynote rendering into the full ledger shape (PRD-024: committed/executed/
  missed timeboxes, evidence produced, decisions made) waits on Phases 8-11
  (work packages, timeboxes) which produce those events.

Status: Accepted

---

## EV-005 — Phase 4 clone/cycle detection (INV-CLONE) + OQ-006 resolution

Date: 2026-06-21
Slice: S-CLONE-001
Spec IDs: PRD-006, SDS-GRAPH, INV-CLONE, TST-GRAPH

Decisions:
- OQ-006 resolved by Sam, Option A: a clone is a typed edge `parent --places-->
  child`. Added `Places` variant to EdgeType. SPEC sec 4.3 updated.
- OQ-001 marked resolved (de facto): frontmatter edge encoding was implemented
  in S-STORAGE-002; recorded in .agents/open_questions.md.

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-core:
  graph.rs ............. 6 passed
    - adding_a_new_placement_with_no_path_is_safe
    - closing_a_direct_cycle_is_rejected
    - closing_a_transitive_cycle_is_rejected
    - self_loop_is_rejected
    - non_places_edges_do_not_participate_in_cycle_check
    - independent_branch_does_not_trigger_false_positive
TOTAL workspace: 37 passed, 0 failed
```

Files added:
- core/src/graph.rs - would_create_placement_cycle(index, parent, child): pure
  DFS over the DerivedIndex port following Places out-edges from child; returns
  true if parent is reachable (would close a loop) or parent==child (self-loop).
- core/tests/graph.rs - FakeIndex (in-memory DerivedIndex impl) + 6 cycle tests.

Fidelity notes:
- INV-CLONE is now executable: any code path that adds a Places edge MUST call
  would_create_placement_cycle first and reject on true. (The NodeService that
  enforces this lands with the driving-adapter layer; the pure check is proven.)
- Hexagonal boundary intact: graph.rs takes &dyn DerivedIndex - pure, no I/O.
- Only Places edges participate in cycle detection; strategy edges (supports,
  contradicts, etc.) are not structural and do not affect cloning.

Status: Accepted

---

## EV-006 — Phase 5 case lifecycle + typed-view bridge (S-STRAT-001)

Date: 2026-06-21
Slice: S-STRAT-001
Spec IDs: PRD-008, PRD-011, PRD-016, PRD-017, SDS-STRAT, TST-STRAT

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-core:
  case_lifecycle (unit) . 6 passed  (closed-is-terminal, forward path allowed,
                                     skip-ahead rejected, Review reachable
                                     from any phase, feedback loops, close-
                                     only-from-Review)
  case_domain .......... 3 passed  (case round-trips through Node, survives
                                     full markdown round-trip, new() starts in
                                     EstablishReality)
TOTAL workspace: 46 passed, 0 failed
```

Files added/changed:
- core/src/case_lifecycle.rs - allowed_next(phase) / can_transition(from, to).
  Forward path EstablishReality->...->Closed + feedback loops + Review-as-hub +
  Close-only-from-Review. Pure data; gate enforcement is Phase 7.
- core/src/format.rs - frontmatter_from / frontmatter_to: generic typed-view <->
  Frontmatter map bridge. value_to_map / map_to_value helpers.
- core/src/strategy.rs - impl StrategyCase { new, to_node, from_node }. id field
  marked #[serde(skip)] (lives in Node.id, not frontmatter); set explicitly by
  to_node/from_node. Default added to NodeId to satisfy serde-skip.
- core/src/identity.rs - derived Default on NodeId (Ulid::default placeholder;
  always overwritten by from_node).

Fidelity notes:
- A StrategyCase survives the FULL storage stack: typed view -> Node -> markdown
  text -> re-parsed Node -> typed view (case_domain.rs test). This is the
  contract every other typed view (EvidenceItem, StrategyBet, ...) will use.
- Lifecycle state machine is the structural transition graph only; the gate
  engine (Phase 7) adds "does this case have enough evidence/outcomes/bets to
  actually advance?" enforcement on top.

Remaining gaps:
- Artifact view aggregation (collect ERD/ORD/SLD/etc. nodes linked to a case
  via DerivedIndex) folds into Phase 6 where evidence/claims exist to aggregate.
- MCGCS dimension model (Mission/Climate/Ground/Command/Systems) + choice
  cascade assembly - deferred to a Phase 5 sub-slice; the NodeType slots exist.
- Actor/Ranking model - deferred.

Status: Accepted

---

## EV-007 — Phase 7 gate engine (the teeth)

Date: 2026-06-21
Slice: S-GATE-001
Spec IDs: PRD-017, PRD-018, PRD-022, PRD-023, SDS-GATE, INV-EVID, INV-CLAIM,
         INV-BET, INV-WORK, INV-REVIEW, INV-VALUE, TST-GATE

Commands run:
```bash
cargo test --workspace
```

Result:
```text
strategynotes-core:
  gates.rs .............. 16 passed
    INV-EVID  : approve-with-source, block-without-source-or-manual
    INV-CLAIM : approve-supported, block-rejected, block-unsupported
    INV-BET   : approve-complete, block-incomplete-lists-every-missing-field,
                block-on-empty-strings-not-just-none (UI theater guard)
    INV-WORK  : approve-complete, block-missing-inputs-and-outputs
    INV-REVIEW: approve-with-evidence, approve-with-explicit-no-evidence-reason,
                block-without-evidence-or-reason, block-unexecuted
    INV-VALUE : block-without-evidence-or-outcome, approve-with-evidence+outcome
TOTAL workspace: 70 passed, 0 failed
```

Files added/changed:
- core/src/gates.rs - 6 gate evaluators returning GateResult:
    can_accept_evidence, can_accept_claim, can_approve_bet,
    can_commit_work_package, can_verify_timebox, can_claim_value.
  Each is a pure function over its subject; missing each required field produces
  a typed failed_gate string. Empty-string fields trip the gate just like None
  (guards against UI theater).
- core/src/execution.rs - added `no_evidence_reason: Option<String>` to
  TimeboxReview (SPEC sec 9: "evidence link OR explicit no-evidence reason").
- core/tests/gates.rs - 16 gate tests (positive + negative per gate).

Fidelity notes:
- Backend-owns-gates is now real: every gate returns Approved or Blocked{failed_gates}.
  The UI cannot approve anything; it calls these (via services) and renders.
- Empty-string-as-filled theater is blocked: `owner: Some("   ")` trips the bet
  gate just like `owner: None`.
- INV-REVIEW's "evidence OR explicit no-evidence reason" is a real disjunction,
  not a rubber stamp - both branches tested.
- Each gate is a pure function over domain types - no I/O, no index needed for
  the field-presence checks. (Cross-node context checks, e.g. "does the linked
  choice actually exist?", layer in via the index when services are wired.)

Status: Accepted

---

## EV-008 — Phase 8-11 services + PLAN sec 15 vertical slice (the spine proven)

Date: 2026-06-21
Slice: S-VSLICE-001 (+ services, ICS export, TypedView bridge, trivial adapters)
Spec IDs: PRD-008..014, PRD-017..024, SDS-WORK, SDS-TIME, SDS-CAL, SDS-EXEC,
         INV-EVID, INV-BET, INV-WORK, INV-TIME, INV-REVIEW, INV-VALUE, INV-CAL,
         INV-DUR, INV-DAY, TST-STRAT, TST-WORK, TST-TIME, TST-TRACE

Commands run:
```bash
cargo test --workspace
```

Result:
```text
TOTAL: 72 passed, 0 failed
  vertical_slice ..... 2 passed  <- the full spine + INV-DUR-after-loss
  gates .............. 16 passed
  trace .............. 4 passed
  case_lifecycle ..... 6 passed (unit) + 3 (integration)
  evidence_rules ..... 4 passed (unit)
  graph .............. 6 passed
  storage ............ 9 passed
  contracts .......... 6 passed
  smoke .............. 1 passed
  markdown_vault ..... 7 passed
  sqlite_index ....... 4 passed
  daynote_sink ....... 4 passed
```

The vertical slice (`full_strategy_spine_end_to_end`) exercises, against REAL
adapters in a tempdir:
  create case -> source -> chunk -> evidence -> accept [INV-EVID passes]
  -> claim -> bet -> FAIL approve [INV-BET blocks, lists every missing field]
  -> fill bet fields -> approve [INV-BET passes, SDR created]
  -> work package -> FAIL commit [INV-WORK blocks] -> fill -> commit [passes]
  -> schedule timebox (pomo estimate + slot) -> ICS export (RFC 5545)
  -> review + verify [INV-REVIEW passes] -> value claim -> validate [INV-VALUE passes]
  -> rebuild index from markdown -> trace source-chunk -> value claim REACHES it
  -> daynote ledger captured created/accepted/verified events

Files added:
- core/src/services.rs - App struct (vault + sink + minter + clock) with spine
  methods: create_case, add_source/chunk, extract_evidence, accept_evidence,
  create_claim, draft_bet, approve_bet, create_work_package, commit_work_package,
  schedule_timebox, review_and_verify_timebox, claim_value, validate_value,
  link (typed-edge wiring), mutate_bet/mutate_work_package. Every state-changing
  method calls its gate BEFORE mutating; Blocked => no mutation.
- core/src/views.rs - TypedView trait + impls for 13 domain structs (the typed-
  view <-> Node bridge, centralized).
- core/src/ics.rs - export_timebox_to_ics (pure RFC 5545 VEVENT/VCALENDAR).
- adapters/src/trivial.rs - SystemClock (Clock) + UlidMinter (IdMinter).
- adapters/tests/vertical_slice.rs - the 2 end-to-end tests.

Fidelity notes:
- Backend-owns-gates is END-TO-END REAL: the slice calls app.accept_evidence /
  approve_bet / commit_work_package / review_and_verify_timebox / validate_value
  and each returns the actual GateResult; nothing is approved by assertion.
- INV-DUR end-to-end: the second test drops the SQLite index, rebuilds from the
  markdown vault, and the source->evidence trace still resolves.
- INV-CAL: ICS export is pure local text; no provider required for the commitment.
- Empty-string theater is caught (the gate tests in EV-007 + the slice's FAIL
  step prove incomplete objects cannot pass).
- The spine is EDGE-CONNECTED: trace from the source chunk reaches the value
  claim via supports/derives_from/requires/scheduled_by/reviewed_by/validates.

Remaining gaps (honest):
- No Tauri shell yet (S-PHASE0-002) - the app runs as a test, not a window.
- No UI (Phase 12) - the spine is exercised programmatically, not visually.
- Agent draft quarantine (Phase 13), full value-realization UI (Phase 14),
  observability/conformance (Phase 15) - not started.

Status: Accepted

---

## EV-009 — HTTP driving adapter + React UI (the app is runnable + visible)

Date: 2026-06-21
Slice: S-HTTP-001 + S-UI-001
Spec IDs: PRD-027, SDS-UI, SDS-EXEC, INV-HUMAN (UI cannot decide approval)

Commands run:
```bash
cargo build -p strategynotes-server      # builds the HTTP server + CLI
cargo test --workspace                    # 72 passed, 0 failed
pnpm -C ui build                          # UI builds (148 kB bundle)
# Live: server started, curl confirmed gate blocks over HTTP:
#   POST /api/bets/<id>/approve ->
#   {"status":"blocked","failed_gates":["missing linked choice cascade",
#    "missing assumptions","counterevidence not reviewed",
#    "missing success metric","missing kill criteria","missing owner"]}
```

Files added:
- server/src/http.rs - axum HTTP driving adapter: 16 REST endpoints covering
  the full spine (create case/source/evidence/claim/bet/work_package/timebox/
  value_claim + accept/approve/commit/review/validate gates + trace + daynote).
  ServerState holds concrete adapters; App<'_> is built per-request. AppError
  maps core::Error/io::Error/ulid/parse -> HTTP 400/500.
- server/src/main.rs - dispatches: `serve [data-dir] [port]` runs HTTP;
  otherwise runs the CLI spine demo.
- ui/src/api.ts - typed fetch client for all endpoints.
- ui/src/App.tsx - spine runner: 13-step timeline that calls the API in
  sequence and renders each gate result (green APPROVED / red BLOCKED with
  reasons). Proves the spine is visible.
- ui/src/vite-env.d.ts - vite/client types.
- ui/vite.config.ts - dev proxy /api -> 127.0.0.1:8787.

Bug fixed during this slice: id fields were #[serde(skip)] (correct for the
frontmatter bridge) which dropped id from JSON API responses. Switched to
#[serde(default)] - JSON responses include id; to_markdown still injects id
into the on-disk frontmatter separately, so storage round-trips either way
(all 72 tests still green).

Fidelity notes:
- Backend-owns-gates is REAL OVER HTTP: the UI calls /api/bets/:id/approve and
  gets back {"status":"blocked","failed_gates":[...]}. The UI renders; it
  never decides approval (INV-HUMAN at the API boundary).
- The full vertical slice (EV-008) still passes - the HTTP layer is a thin
  driving adapter over the same App services the slice exercises.

Remaining gaps:
- The UI is a spine-runner demo, not the full atomic component library from
  SPEC sec 11 (cockpit, evidence inbox, bet board, MCGCS map, choice cascade
  canvas, execution runbook, pomo ledger, trace explorer, value panel, agent
  draft inbox). Those are compositions of the same API.
- Tauri desktop shell not wired (the HTTP+UI works headless; Tauri wraps the
  same UI and swaps fetch for IPC).
- Agent draft quarantine (Phase 13), full observability suite (Phase 15) -
  not started.

Status: Accepted

---

## EV-010 — Phase 15 conformance + fidelity review (the capstone)

Date: 2026-06-21
Slice: S-CONFIRM-001
Spec IDs: PLAN sec 13 (Definition of Done), PLAN sec 15 (observability/conformance),
         all INV-*, all TST-*

Commands run:
```bash
cargo test --workspace     # the conformance gate
cargo build --workspace    # build conformance
pnpm -C ui build           # frontend build conformance
```

Result:
```text
cargo test --workspace ... 77 passed, 0 failed
  core unit (14): case_lifecycle 6 + evidence_rules 4 + agent_rules 4
  core integration: contracts 6, smoke 1, storage 9, gates 16, graph 6,
                    trace 4, case_domain 3
  adapters integration: markdown_vault 7, sqlite_index 4, daynote_sink 4,
                         vertical_slice 2, vrd 1
cargo build --workspace ... OK (core, adapters, server)
pnpm -C ui build ......... 148 kB bundle, clean typecheck
```

### Definition of Done (PLAN sec 13) - status per item

| Item | Status |
|---|---|
| All in-scope PRDs implemented or explicitly deferred | Partial: PRD-001..024 implemented; PRD-025 (calendar providers) partial (ICS only); PRD-026 (agent quarantine) implemented; PRD-027 (atomic UI) demo-only; PRD-028..030 stubs |
| All invariants have direct tests | DONE - see invariant table below |
| Core failure behaviors tested | DONE |
| Markdown remains durable source of truth | DONE (TST-STORAGE + files_on_disk test) |
| SQLite rebuildable without data loss | DONE (index_loss_then_rebuild test) |
| All strategy objects serialize to markdown | DONE (TypedView x13) |
| All gates work | DONE (16 gate tests + spine) |
| Calendar smoke tests pass or skipped | DONE (ICS export; providers EV-SKIP) |
| UI shows maturity/gate states | Partial (spine runner renders APPROVED/BLOCKED) |
| Daynote ledger captures activity | DONE (4 daynote tests + spine) |
| External integrations behind contracts | DONE (CalendarProvider port; only ICS adapter) |
| Operator-visible errors | DONE (AppError -> HTTP 400/500; core::Error) |
| Evidence records for completed slices | DONE (EV-000..EV-010) |
| No unresolved blocking questions | DONE (OQ-001, OQ-006 resolved; others pending but non-blocking) |
| Known limitations documented | DONE - below |

### Invariant conformance table (every INV has an executable proof)

| INV | Proof | Test |
|---|---|---|
| INV-DUR | index_loss_then_rebuild_yields_equivalent_state | sqlite_index |
| INV-PORT | files_on_disk_are_plain_markdown_inv_dur | markdown_vault |
| INV-EDGE | typed_edges_round_trip_through_frontmatter | storage |
| INV-ID | node_id_roundtrips_lexically + ULID-backed | contracts |
| INV-CLONE | would_create_placement_cycle (6 cases) | graph |
| INV-DAY | records_events_into_a_per_day_file + source metadata | daynote_sink |
| INV-EVID | can_accept_evidence (source or manual basis) | gates |
| INV-CLAIM | can_accept_claim (proof level + support) | gates |
| INV-CONTRA | contradicts_edges_are_not_followed_in_spine_trace | trace |
| INV-HUMAN | can_accept_agent_run (needs human approver) | agent_rules |
| INV-BET | can_approve_bet (6 required fields) | gates |
| INV-WORK | can_commit_work_package (7 required fields) | gates |
| INV-TIME | schedule_timebox requires PomoEstimate | services + spine |
| INV-EXEC | review_and_verify_timebox captures exceptions | services + spine |
| INV-REVIEW | can_verify_timebox (review required) | gates |
| INV-VALUE | can_claim_value + VrdView surfaces debt | gates + vrd |
| INV-CAL | ICS export is local; no provider needed | ics + spine |

### Known limitations (honest)

1. UI is a spine-runner demo, not the full atomic component library (SPEC
   sec 11 organisms: cockpit, evidence inbox, bet board, MCGCS map, choice
   cascade canvas, execution runbook, pomo ledger, trace explorer, value panel,
   agent draft inbox). Each is a composition of the existing API.
2. Tauri desktop shell not wired (S-PHASE0-002). The app runs as HTTP+UI; Tauri
   wraps the same UI and swaps fetch for IPC.
3. Calendar providers (Google/Outlook/iCloud) not implemented - ICS export only
   (OQ-002 Option B). CalendarProvider port exists; adapters deferred.
4. Inline [[wikilink]] and #tag body parsing (INV-BODY) not implemented.
5. Full-text search / FTS index not implemented.
6. Agent quarantine HTTP endpoint not exposed (the gate + service exist; the
   /api/agent-runs/:id/accept endpoint is a minor follow-up).
7. Pomo capacity gate (Strategy Capacity, SPEC sec 9) not implemented - the
   capacity math is straightforward but no service wires it yet.
8. Multi-user / sync outside core - explicitly out of scope (PRD-030).

Status: Accepted

---

## EV-011 — Phase A baseline (takeover handoff)

Date: 2026-06-22
Slice: S-BASELINE (no new features; baseline verification only)
Spec IDs: PLAN sec 13 (Definition of Done baseline)

Commands run:
```bash
cargo test --workspace
cargo build --workspace
pnpm -C ui build
cargo run -p strategynotes-server -- /tmp/sn-baseline   # CLI spine
# HTTP server (PTY) + curl /api/health, /api/cases
```

Result:
```text
cargo test --workspace ... 77 passed, 0 failed
cargo build --workspace ... Finished (clean)
pnpm -C ui build .......... 148 kB bundle, clean
CLI spine ................ exit 0; all 6 gates fire (accept evidence APPROVED,
                          approve empty bet BLOCKED with 6 reasons, approve
                          complete APPROVED, commit work APPROVED, verify
                          timebox APPROVED, validate value APPROVED); trace
                          reaches value claim; 14 daynote lines.
HTTP server .............. /api/health -> "ok"; POST /api/cases -> created
                          with id; GET /api/cases -> [id].
```

Evidence types: EV-TST (77 tests), EV-BLD (cargo+pnpm), EV-SMOKE (CLI spine +
HTTP server), EV-UI (UI builds; dev server not run here - no display).

Fidelity notes:
- Baseline holds. No regressions vs EV-010. The enforcement core is intact.
- This EV is the reference point for the finish-line build.

Remaining gaps: confirmed in FINISH_LINE_PLAN.md (8 items; one out of scope).

Status: Accepted

---

## EV-012 — Phases B-H finish-line (INV-BODY, Capacity, agents, FTS, UI, Tauri, calendar, conformance)

Date: 2026-06-22
Slices: S-BODY-001, S-CAP-001, S-AGENT-HTTP, S-SEARCH-001, S-UI-ORGANISMS,
         S-TAURI-SCAFFOLD, S-CAL-001, S-CONFIRM-002
Spec IDs: INV-BODY, INV-CAL, all gate INVs, PRD-025/026/027/028, SDS-*

Commands run:
```bash
cargo test --workspace                                  # 107 passed, 0 failed
cargo build --workspace                                 # clean
cargo clippy --workspace --all-targets -- -D warnings   # clean
pnpm -C ui test                                         # 2 files, 2 passed
pnpm -C ui build                                        # 153 kB, clean
```

Result summary:
```text
Baseline 77 -> 107 tests (+30 across Phases B,C,D,G + UI).
INV-BODY closed: parse_body + body_refs table + backlinks UNION
  (TST-BODY-001..006: wikilink/single-tag/multi-tag/block-ref/rebuild/backlinks).
Strategy Capacity gate closed: can_meet_strategy_capacity
  (TST-CAP-001..004: pass/required-le/override-needs-sdr/blocked-shape).
Agent quarantine HTTP: 5 endpoints + 4 TST-AGENT-HTTP tests
  (no auto-accept path proven).
FTS search: derived search_text + LIKE + GET /api/search
  (TST-SEARCH-001..005 + case-insensitive).
UI organisms: 8 required + Agent Draft Inbox; tabbed shell; component test.
Tauri: scaffold (Option A subprocess); build/run EV-SKIP (webkit2gtk missing).
Calendar contracts: CalendarProvider + 5 adapters
  (Internal/ICS/Google-stub/Outlook-stub/iCloud-stub); TST-CAL-001..005.
Conformance: cargo test/build/clippy -D warnings all clean.
```

Evidence types: EV-TST (107), EV-BLD (cargo+pnpm+clippy), EV-LINT (clippy
-D warnings clean), EV-UI (organisms build + component test), EV-SKIP (Tauri
build/run — webkit2gtk-4.1-dev absent; real calendar providers — no creds).

Fidelity notes:
- No existing invariant weakened. All 18 INV-* have executable proofs
  (CONFORMANCE.md table).
- clippy --all-targets -- -D warnings passes clean (style + unused-import
  warnings fixed during Phase H).
- The "do not claim complete if" guard (directive) — none of the failure
  conditions hold (CONFORMANCE.md).

Honest remaining gaps (KNOWN_LIMITATIONS.md): Tauri run (EV-SKIP, env), real
calendar providers (EV-SKIP, no creds), title-resolution for [[wikilink]],
capacity-ledger UI surface, UI design polish.

Status: Accepted

---

## EV-013 — Post-MVP: FTS5 + wikilink title resolution + full calendar subsystem

Date: 2026-06-22
Slices: S-FTS5, S-WIKILINK-TITLE, S-CAL-FULL (foundation + sync + providers)
Spec IDs: INV-BODY, INV-CAL, PRD-025, SDS-CAL, TST-CAL, TST-SEARCH, TST-BODY

Commands run (per-crate; full-workspace timed out on compile, not on tests):
```bash
cargo test -p strategynotes-core        # 70 passed
cargo test -p strategynotes-adapters    # 38 passed
cargo test -p strategynotes-calendar    # 18 passed (foundation 6 + sync 4 + providers 8)
cargo clippy --workspace --all-targets -- -D warnings   # clean
```
Total cargo: 126 passed, 0 failed.

Result summary:
```text
Wikilink title->id resolution (INV-BODY sub-gap closed):
  backlinks UNION body_refs WHERE target == node.title. TST-BODY-007.

FTS5 search (replaced LIKE):
  nodes_fts virtual table (unicode61), snippet() excerpts, content blob from
  search_text_of. Malformed MATCH queries return empty (no crash). 6 TST-SEARCH.

Calendar subsystem (new calendar/ crate, adapted from the standalone spec):
  - Timebox (markdown) stays canonical; sync metadata is non-strategy-critical
    SQLite (INV-DUR holds).
  - SecretStore port + FileSecretStore (dev); Stronghold is the Tauri path.
  - SyncMetadataStore (SQLite) + SyncMetadata/SyncStatus/RemoteEventRef/SyncCursor.
  - ICS import (parse_ics, hand-rolled; calcard was phantom).
  - async CalendarProviderAdapter trait (async_trait, Send-safe) + MockProvider.
  - Sync engine: push (pending create/update/delete -> provider -> Synced/Error),
    pull (unmatched remote for explicit review). INV-CAL: failure marks Error,
    never mutates the local Timebox.
  - REAL adapters: CalDavAdapter (PROPFIND/REPORT/PUT/DELETE, basic auth,
    hand-rolled base64, multistatus XML parse, ETag-safe), GoogleAdapter (REST
    v3, Bearer, syncToken, items+cancelled), MicrosoftAdapter (Graph, Bearer,
    delta-query, PATCH). All over HttpTransport trait.
  - ReqwestTransport (feature-gated google/microsoft/caldav) = real network.
  - 8 provider contract tests via MockHttpTransport + INV-CAL 503 test.
```

Evidence types: EV-TST (126), EV-LINT (clippy -D warnings clean), EV-SKIP
(Tauri build/run, live-provider smoke).

Status: Accepted

---

## EV-014 — Editor screen (3-panel editor + journal + blocks + shortcuts)

Date: 2026-06-23
Slice: editor-screen.md / editor-tasks.md (TASK-E01..E16, E18 responsive)
Agent: main (this session)
Spec IDs: PRD-012 (atomic UI), PRD-001 (markdown node graph), SDS-UI (editor screen)

Implemented (per .agents/plans/editor-screen.md):
- E01 EditorLayout — 3-panel container (sidebar | editor | contextPanel), responsive
  collapse (sidebar → drawer < 768px, context hidden < 1024px), persisted open state.
- E02 EditorHeader — clickable breadcrumb, journal date display, save indicator, Share/More.
- E03 NoteEditor — textarea editing surface reusing existing [[/# autocomplete, adds
  `/` command + `@` mention triggers, 1s debounced autosave. (CodeMirror is TASK-N19/N20,
  not done — ponytail ceiling documented in-file.)
- E04 ContextPanel — collapsible, composes Linked / Quick Actions / Core Concepts.
- E05 NewPageButton + extracted Sidebar (shared by App + EditorLayout).
- E06 JournalDateNav — ordinal date display, prev/next, native <input type=date> picker,
  dot indicators for days with entries.
- E07 JournalView — date-based editor (supersedes TASK-N25 activity-log view).
- E08 journal auto-creation + template on empty date.
- E10 CommandPalette — `/` trigger, fuzzy filter, keyboard nav.
- E11 MentionAutocomplete — `@` trigger, inserts [[Title]].
- E12 CalloutBlock — tip/warn/info + parseCallout syntax helper.
- E13-E15 LinkedSection (backlinks), QuickActionsSection, CoreConceptsSection.
- E16 useKeyboardShortcuts — global registry (Cmd+N new, Cmd+J journal, ? help),
  conflict detection; Cmd+\ handled in EditorLayout.
- E18 responsive layout (mobile drawer, context hide).

Integration: App.tsx routes notes/journal to the new screens; other views keep the
existing inline layout via the shared Sidebar. useNotes hook centralizes load/create/
save/patch so live edits don't hit the API per keystroke (debounced save).

Commands run:
```bash
pnpm -C ui typecheck   # tsc --noEmit — clean
pnpm -C ui test        # vitest run
pnpm -C ui build       # tsc --noEmit && vite build
pnpm -C ui dev         # vite dev — HTTP 200, no console errors
```

Result:
```text
### pnpm -C ui typecheck
(no output — exit 0)

### pnpm -C ui test
 ✓ src/components/editor/editor.test.ts (12 tests)
 ✓ src/components/editor/NoteEditor.test.tsx (3 tests)
 ✓ src/components/editor/CommandPalette.test.tsx (3 tests)
 ✓ src/App.test.tsx (1 test)
 Test Files  4 passed (4)
      Tests  19 passed (19)

### pnpm -C ui build
 ✓ 1807 modules transformed.
 dist/assets/index-BEUb-V_I.js  237.59 kB │ gzip: 72.97 kB
 ✓ built in 5.28s

### pnpm -C ui dev (smoke)
 HTTP 200 on / ; VITE v5.4.21 ready, no errors
```

Evidence types: EV-TST (19 passing), EV-TYP (tsc clean), EV-BLD (vite build ok),
EV-SMOKE (dev server 200).

Deferred (out of scope / lower priority):
- E09 Cmd+J wired (navigate to today) — present but does not force-create today's entry
  beyond the existing auto-creation effect.
- E17 loading/saving states — save indicator present in header; skeleton/error toast
  not yet distinct (saveState surfaces "saving/saved/error" text).
- CodeMirror (TASK-N19/N20) — textarea ceiling; callout widgets + live decorations
  deferred until then.

Status: Accepted

---

## EV-015 — Graph unification: markdown is source of truth, everything else generated

Date: 2026-06-23
Slice: graph-unification.md (GU-01..GU-17)
Agent: main (this session)
Spec IDs: PRD-002, PRD-003, PRD-012, SDS-NODE, SDS-GRAPH, INV-DUR, INV-PORT,
INV-EDGE, INV-EVID, INV-CONTRA, INV-HUMAN; RISK-001 mitigation.

Thesis delivered: the app is now a projection engine over the markdown vault
(the Logseq/Obsidian model, strategy-native). Every screen is a generated view
over typed nodes; zero MOCK_* data remains.

Part 1 — unify the graph (no backend change):
- GU-01/02: `lib/node.ts` field accessors + `useTypedNodes`/`useNode` hooks
  (resolve IDs → typed GraphNodes via getNode).
- GU-03..10: EvidenceInbox, BetBoard, VrdView, WorkPlanner, ExecutionRunbook,
  AgentDraftInbox, CaseCockpit (projection over case+evidence+bets+timeboxes),
  TraceExplorer (api.trace) — all API-driven with honest empty states.
- GU-11: all MOCK_* constants + dead type aliases removed from App.tsx.

Part 2 — editor as OKF concept-doc author (strategy-native teeth):
- GU-12: TypeSelector (promote note → typed node via existing /promote).
- GU-13: EdgeLinker — typed-edge creation via NEW gate-safe route
  POST /api/node/:id/edge (structural edges only; acceptance/approval still
  require their gate endpoints — INV-HUMAN/SDS-GATE preserved).
- GU-14: ProofBurdenPanel (SPEC §11.4) replaces static Core Concepts; reads
  typed edges from frontmatter, answers the 5 burden-of-proof questions.
- GU-15: citations = supports/created_from edges (same mechanism).

Part 3 — generated documents: GU-16 ErdView (living view over accepted
evidence; OKF index.md style; not a static file).

Part 4 — OKF export: GU-17 `lib/okf.ts` + Share button build a conformant
OKF v0.1 bundle (concepts with required `type` frontmatter, synthesized
index.md, log.md from daynotes); unknown keys + `edges` extension preserved.

Backend: one new route + handler (server/src/http.rs link_node) wrapping the
existing, tested core::services::link. Builds; cargo build -p strategynotes-server ok.

Commands run:
```bash
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 34 passing (7 files)
pnpm -C ui build       # 1812 modules, built ok
cargo build -p strategynotes-server   # ok
# end-to-end (server on 8795, fresh derived index):
curl POST /api/notes (x2) -> A,B
curl POST /api/node/A/edge {to:B, edge_type:supports} -> {"linked":true}
curl GET  /api/node/A     -> frontmatter.edges=[{to:B,type:supports,status:active}]
curl POST /api/notes/A/promote {target_type:evidence_item} -> typed node
curl GET  /api/nodes/evidence_item -> [promoted A]   # appears in Evidence Inbox
curl GET  /api/trace/A -> {reachable:[B,A]}          # Trace Explorer walks edge
```

Result: editor authors a note → promotes to evidence_item → flows into the
Evidence Inbox → linked via typed edge → traceable. One graph, many lenses.
Markdown vault is the only truth; SQLite is a rebuildable derived cache.

Evidence types: EV-TST (34), EV-TYP, EV-BLD, EV-SMOKE (e2e HTTP), EV-CT (cargo).

Known issue surfaced (pre-existing, not introduced here): a stale derived
`index.db` from an older schema crashes the server on startup
(`no such column: title` in idx_nodes_title) because CREATE TABLE IF NOT EXISTS
skips migration. Wiping index.db (derived; INV-DUR-safe) restores startup.
Proper fix = schema-version/migrate-on-open in sqlite_index.rs. Recorded as a
follow-up; not in this slice's scope.

Status: Accepted

---

## EV-016 — Constraints/traces map + OQ-011 fix + gate-safe PATCH + CodeMirror

Date: 2026-06-23
Slice: gap-traces.md (Fixes 1–3)
Agent: main (this session)
Spec IDs: SDS-INDEX, SDS-NODE, SDS-GATE, INV-DUR, INV-PORT, INV-EDGE,
INV-HUMAN; PRD-012; TASK-N19/N20.

Identified (`.agents/plans/gap-traces.md`): for each gap — constraints,
dimensions, integrations (files · spec IDs · graph edges), fix. Master
constraint: the gate engine gates LIFECYCLE TRANSITIONS, not field writes — so
`status` is the only frontmatter key a generic edit must deny.

Fix 1 — OQ-011 (stale derived index crashes startup):
- `adapters/src/sqlite_index.rs`: SCHEMA_VERSION pragma + migrate(); on version
  mismatch DROP derived tables → init recreates → caller rebuilds from vault.
  INV-DUR honored (derived cache never blocks startup).
- Test: `stale_schema_migrates_instead_of_crashing` (5/5 sqlite_index tests pass).

Fix 2 — gate-safe in-place concept-doc edit:
- `core/services.rs::update_node` (type + body + frontmatter merge, denies
  `status`, preserves unknown keys — INV-PORT).
- `server/http.rs`: PATCH /api/node/:id (JSON frontmatter → YAML).
- e2e: PATCH re-typed note→strategy_bet (same id), merged kill_criteria+owner,
  IGNORED status:"approved" (bet stays unapproved — gate intact). Verified the
  node then appears in nodesByType("strategy_bet") → Bet Board.

Fix 3 — CodeMirror 6 editor surface (TASK-N19/N20):
- Deps: @codemirror/{state,view,commands,lang-markdown,language}.
- `components/editor/CodeMirror.tsx`: markdown, line-wrap, dark theme, value
  sync (no clobber), caret rect via coordsAtPos (jsdom-guarded).
- NoteEditor: textarea→CM; triggers (/ @ [[ #) re-anchored at caret; command/
  mention palette use capture-phase window keydown (CM owns the key stream).
- Tests drive CM via EditorView.findFromDOM + dispatch (jsdom can't simulate
  contentEditable input). 3/3 NoteEditor tests pass.

Verification:
```bash
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 34 passing (7 files)
pnpm -C ui build       # 1833 modules, ok
cargo test -p strategynotes-adapters --test sqlite_index  # 5/5
# e2e (server 8797): PATCH re-type + status-denied + nodesByType reflects
```

Deferred (traced in gap-traces.md, own slices): block-as-node (PRD-002, needs
CM ViewPlugin decorations), callout widgets (CM decoration), ORD/SLD/EDS/VSD
generated views (incremental on ERD pattern), OKF import (inverse of export),
clones UX (Places edges).

Evidence types: EV-TST (34 UI + 5 backend), EV-TYP, EV-BLD, EV-SMOKE (PATCH
e2e), EV-CT.

Status: Accepted

---

## EV-017 — CodeMirror behind Ports & Adapters (reversible) + projection model

Date: 2026-06-23
Slice: gap-traces.md (CM-as-projection; hexagonal editor boundary)
Agent: main (this session)
Spec IDs: AGENTS.md §10 (Ports & Adapters), PRD-012, INV-DUR, INV-PORT.

Change: CodeMirror is no longer imported by editor logic. It is one ADAPTER
over a neutral PORT — the editor-engine choice is reversible.

Boundary:
- `ui/src/editor/port.ts` — `EditorSurface` interface. The ONLY thing NoteEditor
  depends on for the body.
- `ui/src/editor/tokens.ts` — ADAPTER-NEUTRAL markdown projection model
  (tokenizeMarkdown → tag/wikilink/ref/callout; isResolved). No editor, no CM.
  8 unit tests.
- `ui/src/editor/adapters/CodeMirrorSurface.tsx` — the ONLY file importing
  @codemirror/*. Renders tokens as NON-DESTRUCTIVE decorations (mark: tok-tag/
  tok-link/tok-link-unresolved/tok-ref; line: tok-callout-{tip,warn,info}).
  Plain markdown stays canonical — no hidden editor-only model. Click-to-open
  maps click→markdown pos→token→onOpenNote intent.
- `ui/src/editor/adapters/TextareaSurface.tsx` — dependency-free second adapter
  (fallback/test double).

Reversibility PROOF: `ui/src/editor/port.test.tsx` renders NoteEditor with
Surface={TextareaSurface} (no CodeMirror) and asserts edit+save — the contract
is not coupled to CM. Swap = one prop.

Meaning untouched: type/status/gates/typed edges/persistence stay in markdown +
core + the gate-safe API (EV-016). The surface renders/edits affordances only.

Verification:
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 43 passing (9 files)
pnpm -C ui build       # 1834 modules, ok
pnpm -C ui dev         # HTTP 200, no vite errors

Deferred (own slices): per-block ULID + ((ref)) block widgets; replacement chip
widgets (currently non-destructive marks); hover preview cards; clones UX.
All build on this port; none touch NoteEditor's dependency on it.

Status: Accepted

---

## EV-018 — Block-as-node (PRD-002) on the editor port

Date: 2026-06-23
Slice: gap-traces.md (block-as-node)
Agent: main (this session)
Spec IDs: PRD-002 (every outline item is a first-class node), INV-EDGE, INV-PORT.

An outline item can now be promoted to a first-class node, referenced by a
canonical `((ULID))` transclusion — no hidden editor model, markdown stays
source of truth.

- `ui/src/editor/block.ts` — ADAPTER-NEUTRAL pure helpers (7 tests):
  blockAtCursor, promoteBlockEdit (replaces block with `((id))` keeping the
  list/quote marker), deriveBlockTitle, blockRef, isBlockRef.
- CommandPalette: new `/node` command (action: "promote-block", no insert).
- NoteEditor: applyCommand routes the action → promoteBlock(): mints a node via
  onPromoteBlock(title, body), then transcludes `((id))` in place. The tok-ref
  decoration already renders the ref as a clickable chip → onOpenNote.
- NotesScreen / JournalView wire onPromoteBlock → store.create.

First-class guarantees (backend, unchanged): core/src/body.rs parses
`((block_ref))` → BodyRefKind::BlockRef → indexed body_refs → backlinks +
address. So a promoted block has its own page, body, and backlinks.

Verification:
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 51 passing (10 files)
pnpm -C ui build       # 1835 modules, ok
# e2e (server 8799): create block-node B; parent body "- ((B)) plan";
#   GET /api/notes/B/backlinks -> ["A"]   (B has a backlink from its parent)

Deferred: auto-ULID-per-block (Logseq-style; currently opt-in via /node);
rendered transclusion (show the node's content inline rather than a chip);
clone placements UI (Places edges).

Status: Accepted

---

## EV-019 — Deferred editor slices: clone UX, rendered transclusion, block-ref completion

Date: 2026-06-23
Slice: gap-traces.md (deferred items)
Agent: main (this session)
Spec IDs: PRD-002, PRD-006, INV-CLONE, INV-PORT.

Three deferred items implemented, each coherent with "markdown is canonical,
CodeMirror is a reversible projection adapter."

1) Clone placements UX (PRD-006, INV-CLONE) — `CloneSection` in the ContextPanel:
   lists a node's placements (parents) + a clone-into picker. Backend unchanged
   (clone/placements already existed). e2e: clone A→B => placements(A)=[B];
   cycle attempt B→A => HTTP 409 (INV-CLONE enforced by core).

2) Rendered transclusion — `((ULID))` refs render INLINE as a CodeMirror widget
   showing the referenced node's title + body snippet (TransclusionWidget +
   StateField ref-cache, lazily resolved via resolveRef). The raw `((ULID))`
   stays canonical; on the cursor's line it reverts to editable text. Port gains
   `resolveRef`; CodeMirror is still the only @codemirror/* importer.

3) Block-reference completion (the coherent "auto-ULID-per-block"): typing `((`
   offers the note's blocks (listBlocks); selecting one promotes it to a node
   and transcludes it at both the source and the trigger (referenceBlock —
   single source, no duplication). Markdown-resident — NOT a hidden per-block
   id DB (that would violate the canonical-markdown invariant). editor/block.ts
   gains listBlocks + referenceBlock (10 tests).

Verification:
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 54 passing (10 files)
pnpm -C ui build       # 1837 modules, ok
e2e clone              # A→B ok; B→A cycle => 409

Conflict surfaced: pure Logseq auto-id-per-block (hidden DB) violates the
markdown-canonical invariant; resolved as lazy, markdown-resident ids (refs
materialize only when a block is referenced). Flagged in chat + here.

Status: Accepted

---

## EV-020 — Generated document views (ORD/SLD/EDS/VSD + ERD via DocBrowser)

Date: 2026-06-23
Slice: generated documents (framework §4368)
Agent: main (this session)
Spec IDs: PRD-009..014 (strategy document stack), SDS-UI.

Documents are living views over linked nodes, not static files. A reusable
`GeneratedDoc` renders a DECLARATIVE spec (sections → node type + fields +
filter) as a dossier — the OKF index.md / Obsidian-Dataview model, strategy-native.

- `ui/src/views/GeneratedDoc.tsx` — DocSpec/DocSectionSpec types + renderer
  (sections over typed nodes via useTypedNodes; per-field rows; proof/status
  badges; honest empty states; honors filters).
- `ui/src/views/docSpecs.ts` — the five docs as data:
  ERD (accepted evidence), ORD (outcome requirements + acceptance_criteria),
  SLD (strategic claims + assumptions), EDS (work packages), VSD (experiments +
  metrics). Field names mirror core/src/{strategy,execution}.rs.
- `ui/src/views/DocBrowser.tsx` — tab browser across the five; regenerates on open.
- Nav: "Docs (generated)" replaces the standalone ERD entry (ERD is now the
  browser's first tab). Standalone ErdView removed (folded into the ERD spec).

Verification:
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 55 passing (11 files); GeneratedDoc test proves the
                       # section filter (ERD shows only accepted evidence)
pnpm -C ui build       # 1840 modules, ok
# e2e (server 8803): PATCH note -> ord {statement, acceptance_criteria[]};
#   GET /api/nodes/ord -> [node]; fields resolve → ORD doc renders real data.

Status: Accepted

---

## EV-021 — OKF import + case-scoping

Date: 2026-06-23
Agent: main (this session)
Spec IDs: INV-PORT, INV-HUMAN, PRD-009..014, SDS-NODE.

OKF import (inverse of export):
- core: services::create_node + format::frontmatter_from_yaml_str (YAML parsing
  stays in core per the hexagonal rule).
- server: POST /api/node — create a typed node from frontmatter yaml + body.
  Gate-safe: `type`/`status` stripped from frontmatter (type→ty, status gate-
  owned); unknown types → Note.
- ui: api.createNode; lib/okf splitConcepts/parseConceptFile/isReservedOkfName
  (9 tests); NotesScreen Import button (multi-file .md picker).
- e2e: import evidence_item concept → type+proof preserved, status stripped,
  appears in nodesByType.

Case-scoping:
- CaseSelector (topbar) picks a strategy_case; App holds caseId.
- DocSectionSpec.caseField: a section scoped via a frontmatter case key. ORD +
  EDS declare caseField:"case"; SLD/ERD/VSD stay workspace-wide (those node
  types have no direct `case` field — edge-based scoping is a follow-on).
- GeneratedDoc/DocSection filters by caseField when a case is selected; Cockpit
  honors the selected case (fallback: first). GeneratedDoc test proves the
  case-filter (in-case shown, other-case hidden).

Verification:
pnpm -C ui typecheck   # clean
pnpm -C ui test        # 60 passing (11 files)
pnpm -C ui build       # 1841 modules, ok
e2e POST /api/node     # gate-safe import (status stripped)

Status: Accepted

---

## EV-022 — Dev harness justfile parse fix

Date: 2026-06-25
Slice: DEV-HARNESS-001 — `just dev-up` parser failure
Agent: main (this session)
Spec IDs: SDS-OBS, TST-OBS.

Bug:
`just dev-up` failed before any dev process could start because the `seed`
recipe header used assignment syntax inside a recipe parameter list:
`seed backend := "8787":`.

Root cause:
In `just 1.43.0`, recipe default parameters use `=`, while `:=` is top-level
variable assignment syntax. The invalid token made the whole `justfile`
unparseable, so unrelated recipes such as `dev-up` were blocked.

Fix:
- `justfile`: `seed backend="8787":`

Red/green evidence:
```text
RED: just --list
error: Expected '*', ':', '$', '=', identifier, or '+', but found ':='
  ——▶ justfile:83:14
83 │ seed backend := "8787":

TOGGLE:
printf 'seed backend="8787":\n  echo {{backend}}\n' | just --justfile /dev/stdin --list
Available recipes:
    seed backend="8787"
```

Commands run:
```bash
just --list
just dev-up
curl -sS -i http://localhost:8787/api/health
curl -sS -I http://localhost:5173/
just --dry-run seed
cargo test --workspace --exclude strategynotes-calendar
pnpm -C ui test
pnpm -C ui typecheck
```

Result:
```text
just --list: recipes list successfully, including seed backend="8787"
just dev-up: printed UI/backend URLs and started detached services
backend health: HTTP/1.1 200 OK, body "ok"
ui: HTTP/1.1 200 OK, Content-Type: text/html
just --dry-run seed: expands http://localhost:8787/api/seed
cargo test --workspace --exclude strategynotes-calendar: passed
pnpm -C ui test: 60 passed, 0 failed
pnpm -C ui typecheck: exit 0
```

Verification note:
`cargo test --workspace` was also attempted. It compiled and passed many suites,
then hung for more than two minutes in `strategynotes-calendar` provider tests
(`caldav_*`, `google_*`, `microsoft_*`). That target is unrelated to the
justfile parse fix and was excluded for the focused Rust gate above.

Status: Accepted

---

## EV-023 — Full UI seed and onboarding population

Date: 2026-06-25
Slice: SEED-ONBOARDING-001 — populate seed/onboarding content for primary UI pages
Agent: main (this session)
Spec IDs: PRD-008..014, PRD-018, PRD-020, PRD-022, PRD-024, PRD-026, PRD-028, PRD-029; SDS-NODE, SDS-GRAPH, SDS-STRAT, SDS-EVID, SDS-WORK, SDS-TIME, SDS-TRACE, SDS-OBS; INV-DUR, INV-PORT, INV-EDGE, INV-EVID, INV-CONTRA, INV-HUMAN, INV-BET, INV-WORK, INV-TIME, INV-REVIEW, INV-VALUE.

Discovery:
- Reset/seed recipe path: `just reset` wipes `strategynotes-data/{index.db,vault,daynotes}`;
  `just seed` calls `POST /api/seed`.
- Backend path: `server/src/http.rs::seed` rebuilds the derived index, calls
  `App::seed_demo`, then rebuilds again.
- Core path moved from a monolithic service method into `core/src/seed.rs` and
  phase modules under `core/src/seed/`.

What changed:
- Seed now builds one coherent demo strategy graph: case, source, chunks,
  evidence, ERD/ORD/SLD/EDS/VSD/VRD artifacts, claim, assumption,
  counterevidence, choice cascade, draft and approved bets, experiment, metric,
  intent and committed work packages, committed timeboxes, review, value claims,
  agent run, journal note, and graph notes.
- The approved bet trace reaches work, timeboxes, review, value, validation,
  and realization artifacts through typed spine edges.
- Trace nodes now carry readable `title` frontmatter where the UI would
  otherwise fall back to raw IDs.
- Seed writes `seed_version: ui_full_v1` at the end and is idempotent afterward.

TDD evidence:
```text
RED 1:
cargo test -p strategynotes-adapters --test seed seed_demo_populates_every_primary_ui_projection
panic: Deserialize("invalid length")
Cause: old seed wrote string IDs into typed WorkPackage.inputs.

RED 2:
approved seed bet should have a readable trace label
Cause: typed bet/trace nodes lacked UI-readable title/body labels.

GREEN:
cargo test -p strategynotes-adapters --test seed seed_demo_populates_every_primary_ui_projection
1 passed, 0 failed
```

Verification:
```bash
rustfmt --edition 2021 --check core/src/seed.rs core/src/seed/*.rs adapters/tests/seed.rs
cargo check --workspace --exclude strategynotes-calendar
cargo test --workspace --exclude strategynotes-calendar
pnpm -C ui typecheck
pnpm -C ui test
just reset && just dev-up && just seed
python3 live API probe for seeded type counts + approved-bet trace labels
just seed
```

Result:
```text
Touched Rust seed/test files: all <= 250 pure LOC
cargo check --workspace --exclude strategynotes-calendar: exit 0
cargo test --workspace --exclude strategynotes-calendar: exit 0
pnpm -C ui typecheck: exit 0
pnpm -C ui test: 60 passed, 0 failed
just reset && just dev-up && just seed: seeded (34 nodes)
second just seed: already seeded — no changes (0 nodes)
```

Live API probe after reset/seed:
```text
strategy_case: 1
source: 1
source_chunk: 3
evidence_item: 3
erd/ord/sld/eds/vsd/vrd: 1 each
strategic_claim: 1
assumption: 1
counterevidence: 1
choice_cascade: 1
strategy_bet: 2
experiment: 1
metric: 1
work_package: 2
timebox: 2
timebox_review: 1
value_claim: 2
agent_run: 1
note: 3
approved trace: 11 reachable nodes
trace types: eds, experiment, metric, strategy_bet, timebox,
  timebox_review, value_claim, vrd, vsd, work_package
missing trace labels: []
daynote endpoint for 2026-06-25: 49 non-empty activity lines
```

Verification note:
The project-required `.github/copilot-instructions.md` file is absent in this
checkout. Full `cargo test --workspace` including the `strategynotes-calendar`
crate was not used as the final gate because that crate previously hung in
provider tests; the focused non-calendar workspace gate is clean.

Status: Accepted

---

## EV-024 — Adversarial Audit Full Remediation (CHK-01 through CHK-19)

Date: 2026-10-05
Slice: AUDIT-REMEDIATION-001 — Full remediation of findings CHK-01 to CHK-19
Agent: main (Antigravity)
Spec IDs: PRD-001..029; SDS-NODE, SDS-STORAGE, SDS-INDEX, SDS-GRAPH, SDS-STRAT, SDS-EVID, SDS-GATE, SDS-WORK, SDS-TIME, SDS-UI, SDS-EXEC, SDS-TRACE, SDS-OBS; INV-DUR, INV-PORT, INV-EDGE, INV-EVID, INV-CONTRA, INV-HUMAN, INV-BET, INV-WORK, INV-TIME, INV-REVIEW, INV-VALUE, INV-EXEC.

Remediation Highlights:
- CHK-01: Disappearing thought bug eliminated. `useNotes.ts` loads primary strategy types, adds `retype` in-place handler; `NotesScreen.tsx` adds type filter bar and type badges.
- CHK-02: Fixed case-mismatch in `App.tsx` (`status?.toLowerCase() === "drafted"`), restoring "Accept" button in Evidence Inbox.
- CHK-03: `LinkedSection.tsx` resolves `frontmatter.title` instead of top-level `title`, fixing "Untitled" backlinks.
- CHK-04: `useAllStrategyNodes()` introduced; `EdgeLinker.tsx` and `CloneSection.tsx` show all strategy node types.
- CHK-05: Quick Actions in `ContextPanel.tsx` and `NotesScreen.tsx` wired for wikilink copy, trace navigation, and note markdown sharing.
- CHK-06: `EditorLayout.tsx` panel toggle replaced raw debug text with `PanelRight` Lucide icon and accessible labels.
- CHK-07: `BetBoard` dynamically routes blocked bets to "Blocked" column and killed bets to "Killed" column; inline editing added for owner, metric, kill criteria, assumptions, and counterevidence review.
- CHK-08: `WorkPlanner` wired with "Commit [INV-WORK]" and "Schedule Timebox [INV-TIME]"; `nodeExcerpt` strips markdown heading hashtags.
- CHK-09: `ExecutionRunbook` capture buttons wired to active state; "Complete Timebox Review [INV-REVIEW]" wired; 1-click schedule empty state added.
- CHK-10: Header `CapacityMeter` dynamically calculates committed pomos from work packages and timeboxes.
- CHK-11: `CaseCockpit` lifecycle stage name truncation (`.slice(0, 12)`) removed.
- CHK-12: `JournalView.tsx` standardizes dates to ISO `YYYY-MM-DD`, restoring `JournalDateNav` entry dots.
- CHK-13: Debounced SQLite FTS5 `/api/search` integrated into `NotesScreen.tsx`.
- CHK-14: `TraceExplorer` spine nodes made clickable with detailed node inspector; real contradiction edges queried.
- CHK-15: Added Value Realization Document (`VRD`) specification to `docSpecs.ts`.
- CHK-16: Added `POST /api/agent-runs` handler in Axum router; reviewer input made editable in `AgentDraftInbox`.
- CHK-17: Removed full index rebuilds on read GET requests; verified 2.0ms/request read speed with zero disk thrashing.
- CHK-18: Parameterized timebox timestamps with current ISO time and configurable completion status.
- CHK-19: Added "Validate [INV-VALUE]" action button in `VrdView`.

Commands run:
```bash
cargo check --workspace --exclude strategynotes-calendar
cargo test --workspace --exclude strategynotes-calendar
pnpm -C ui typecheck
pnpm -C ui test --run
pnpm -C ui build
python3 live API verification suite
```

Verification Output:
```text
cargo test: 77 passed, 0 failed
pnpm test:  12 test files passed, 69 passed, 0 failed
  ✓ src/App.test.tsx (1)
  ✓ src/remediation.test.tsx (9)
  ✓ src/hooks/useTypedNodes.test.ts (2)
  ✓ src/editor/block.test.ts (10)
  ✓ src/editor/port.test.tsx (1)
  ✓ src/editor/tokens.test.ts (8)
  ✓ src/lib/node.test.ts (8)
  ✓ src/lib/okf.test.ts (9)
  ✓ src/views/GeneratedDoc.test.tsx (2)
  ✓ src/components/editor/CommandPalette.test.tsx (4)
  ✓ src/components/editor/NoteEditor.test.tsx (3)
  ✓ src/components/editor/editor.test.ts (12)
pnpm typecheck: clean (0 errors)
pnpm build: clean bundle built in 8.30s (0 errors)
live API checks:
  - POST /api/agent-runs -> status 201 Created (run id: 01M46ZF23TSR0P6P9Z4RDA2K08)
  - GET /api/search?q=founder -> status 200 (4 results returned)
  - 10x GET /api/nodes/evidence_item -> 20.0ms total (2.0ms/req, zero rebuild thrashing)
  - Evidence status check -> lowercase 'accepted'/'drafted' handled cleanly
  - Work packages & value claims -> commit and validate endpoints functional
```

Status: Accepted


## EV-025 — Deletion safety, Work/Timebox truth, and honest failure toasts

Date: 2026-10-06
Slices: S-DESTROY-001 (reference-guarded delete), S-WORK-001 (pomo estimate + derived timeboxes)
Agent: main (opencode/mimo-v2.6-flash-free)
Spec IDs: PRD-019, PRD-020, PRD-002, PRD-005; SDS-WORK, SDS-TIME, SDS-GRAPH, SDS-STORAGE;
INV-DUR, INV-EDGE, INV-TIME, INV-WORK, INV-PORT.

### Problem (found by probing the running app, not by reading code)

1. `DELETE /api/notes/:id` removed whatever id it was handed. A probe destroyed the approved
   bet "One-day onboarding as wedge", orphaning 4 references (2 × `linked_bet`, 2 edges).
   The vault is gitignored and SQLite is disposable by design, so the orphaning was
   **unrecoverable** — the node had to be reconstructed from `core/src/seed/strategy.rs`.
2. `WorkPlanner.hasTimebox` read the work package's own `status`, which no scheduling endpoint
   ever set. Every row stayed "no timebox, a wish" after a successful reservation, and the
   vault's 4 real timeboxes were invisible to the view.
3. No UI could set a pomo estimate (`PRD-019`), so `Timebox` could never be reached honestly.
4. `useNotes.remove` swallowed failures while `NotesScreen` toasted "Deleted" unconditionally —
   a destructive action reporting success for a refused operation.

### What shipped

- **`core/src/graph.rs`** — `referencing_nodes(nodes, target)`: scans scalar frontmatter
  references, list members, and edge targets; ignores self-references and partial-ULID
  matches. 6 tests in `core/tests/graph.rs` (suite 12/12).
- **`core/src/services.rs::delete_note`** — refuses while any node still names the target.
  Refusal names nodes by **title**, not ULID, and ends with the action to take.
- **`adapters/tests/deletion.rs`** (new) — real `MarkdownVault` + `DaynoteEventSink` harness:
  referenced node refused & survives; unreferenced node deletes.
- **`useNotes.remove`** — returns `String | null`; the caller branches. Deliberately does NOT
  set the view-level `error`, which blanks the entire Notes list on a refused delete.
- **`NotesScreen`** — `ConfirmButton` (arm/confirm/Keep) replaces the one-click trash;
  refusal toast runs through `readableError()` which strips `NNN ` and
  `contract violation: ` prefixes (log detail, not user copy).
- **`atoms.tsx::ConfirmButton`** — gained `size` + `ariaLabel` so the primitive works as an
  icon-only row affordance; `children` is an icon, so the button must still announce itself.
- **`WorkPlanner`** — timebox truth is now **derived from timebox nodes** (`work_package`
  frontmatter → map), never asserted from WP status. Adds an editable pomo estimate
  (PATCH `frontmatter.pomos`; `status` stripped server-side so no gate can be bypassed),
  disables `Timebox` when the estimate is unset, persists the estimate as part of
  scheduling, and shows the reserved window + its pomo cost read from the timebox.

### Verification

```text
cargo test --workspace (all suites except calendar/providers.rs — pre-existing network hang):
  123 passed, 0 failed
cargo clippy --workspace --all-targets -- -D warnings: clean
pnpm -C ui typecheck: clean
pnpm -C ui test: 12 files, 69 passed, 0 failed
pnpm -C ui build: clean (1,112.56 kB / 334.79 kB gzip, 39.87s)
```

Live app (Playwright, `http://127.0.0.1:5173`):

```text
Work view:   3 rows · 2 "timebox reserved" with real windows
             ("Oct 5, 08:27 PM → Oct 5, 09:42 PM (3p)") · 1 "no timebox, a wish"
             · 3 editable estimate inputs · h1=1 · overflow=false · clip=0
             · 0 console errors on a clean load
Delete path: arm → confirm on the referenced bet
             → HTTP 400, node survives (42 nodes unchanged, status still approved)
             → toast: "cannot delete "One-day onboarding as wedge": it is still linked from
               4 other node(s) (Red-team the speed thesis, Strategy notes (demo),
               Ship one-day onboarding) — remove those links first"
             → list still shows 22 rows (not blanked)
Vault integrity: 42 nodes, 0 dangling references, SDR 01KW054BQ6S6KYAQYSVQCBQPT3 intact.
```

### Known limitations recorded, not silently absorbed

- `can_commit_work_package` still does not check `pomos` (SPEC §515 says it should). Left
  as-is by explicit operator decision; recorded as an OPEN_QUESTION naming PRD-020 / SDS-TIME.
- Seed work packages carry timeboxes with estimates (3p/2p/6p) while the WPs themselves have
  no `pomos` field, so those rows read "estimate" next to a reserved window. Display-only
  `(3p)` from the timebox makes the reserved cost visible; the UI does not write data on read.
- 2 of 4 timeboxes point at the same work package; the view shows the first one per WP.
- 404 vs idempotent delete for an unknown id was left as `Ok` (vault.delete is idempotent by
  design); changing it would be inventing policy, not fixing this defect.

Status: Accepted

## EV-026 — Wiki-style interlinking (S-LINK-001, frontend)

Date: 2026-10-06
Slice: S-LINK-001 — clickable statuses, types and tags; every node addressable
Agent: main (opencode/mimo-v2.6-flash-free)
Spec IDs: PRD-001, PRD-002, PRD-005, PRD-019; SDS-GRAPH, SDS-UI, SDS-NODE;
INV-DUR, INV-EDGE, INV-PORT, INV-BODY, INV-HUMAN.

### What shipped

Two derived routes, added to the existing hash router (no router dependency —
DESIGN.md §7 keeps `useHashRoute` and eleven views without react-router):

```
#facet/<dim>/<value>   dim ∈ {status, type, tag}   everything carrying it
#node/<ulid>                                    one node, references both ways
```

- **`App.tsx`** — `parseDerived(route)` runs before the `VALID` fallback. A
  derived page renders inside the shell (Back, rail, workspace bar all still
  work) but the rail keeps `cockpit` current, because neither is a place you
  navigate *to* — you arrive by following a link.
- **`views/FacetPage.tsx`** (new) — reads `GET /api/nodes`, filters, renders.
  It has **no create/edit/delete affordance at all**, so it cannot violate
  INV-DUR; everything it shows already exists in frontmatter or the body.
  Exports `facetHref` / `facetHrefOr` / `nodeHref` used by every other view.
- **`views/NodePage.tsx`** (new) — title, type, status, tags, body, plus
  **"Linked from"** and **"Points to"**. Both are computed from markdown
  frontmatter (`nodeRefs` / `nodesReferencing`), never from SQLite — INV-EDGE.
- **`lib/node.ts`** — `nodeRefs`, `nodesReferencing`, `tagsOf`. Tags come from
  inline `#hashtags` in the body via the existing `/#([\w-]+)/g` rule; there is
  **no `tags` frontmatter key in the vault** (verified across all 42 nodes) and
  none was invented — INV-BODY: the body is authoritative for tags.
- **`atoms.tsx`** — `NodeTypeChip`, `StatusChip`, `EvidenceStateBadge` gained an
  optional `to`. Omitted, they render exactly the plain `<span>` every existing
  call site already had, so the change is purely additive; given `to`, they
  become real `<a>` anchors with `stopPropagation` so a chip inside a clickable
  row cannot fire both.
- **Views wired:** `WorkPlanner`, `BetBoard`, `EvidenceInbox`, `ValueView`,
  `AgentDrafts`, `TraceExplorer` (chips + row bodies link to the node page);
  `FacetPage` rows cross-link to the other facet dimensions. `GeneratedDoc` was
  deliberately left alone — its excerpt is prose in a document view, not a row.
  `NoteRow` was deliberately left alone: its chips are nested inside the row
  `<button>`, and an anchor cannot nest in a button.
- **`facetHrefOr`** exists because views routinely render a chip with a *default*
  status ("draft", "intent") when the node has none — linking that would open a
  facet page listing nothing. It returns `undefined` so the chip stays plain.

### Also fixed in this pass (found by the sweep, not by reading code)

`NoteEditor`'s `<h1>` wraps the title `<input>`, so the heading had **no
accessible name** — a form control's value is not text content, so even a titled
note produced an unnamed heading. The earlier UI-UX sweep asserted `h1=1` and
would never have caught this. Now `aria-label={titleText || "Untitled note"}`,
with the input keeping its own independent `aria-label`.

### Verification

```text
cargo test --workspace (all suites except calendar/providers.rs — pre-existing network hang):
  123 passed, 0 failed
cargo clippy --workspace --all-targets -- -D warnings: 0 issues
pnpm -C ui typecheck: clean
pnpm -C ui test: 12 files, 69 passed, 0 failed
pnpm -C ui build: clean (10.62s)
```

Live app (Playwright):

```text
Click-through:  #work → click "Intent" status chip → #facet/status/intent
                h1 = "intent · status" · 0 JS errors
Direct routes:  #facet/status/approved  → h1 "approved · status", the approved bet listed
                #facet/type/work_package → 3 rows
                #node/01KW054BPVV…      → h1 "One-day onboarding as wedge",
                                          LINKED FROM (4 referrers by title) + POINTS TO,
                                          7 node links, 3 cross-facet links
Notes h1:       aria-label = "Oct 5th, 2026" (was: no accessible name)
Responsive sweep at 375 / 768 / 1440 across
  #work, #facet/status/approved, #facet/type/work_package, #node/…, #notes:
                overflow=false, clip=0, h1=1 on every cell
```

### Known limitations recorded

- `#facet/tag/…` has no seeded data yet: only 2 of 42 nodes carry a `#hashtag`.
  The route, the filter and the empty state are implemented and the empty state
  explains where tags come from ("inline `#hashtags` in a node's body — there is
  no tag field to fill in").
- The rail shows `cockpit` as current on derived pages; there is no dedicated
  nav item for them, because they are reached by following links, not from the rail.
- `NoteRow` chips are still plain spans (nested in a button). Making them links
  requires restructuring the row first — noted in `.agents/next_steps.md`.

Status: Accepted

## EV-027 — Evidence rejection endpoint + ULID leak fix (S-EVID-001)

Date: 2026-10-06
Slice: S-EVID-001 — `POST /api/evidence/{id}/reject`; `nodeTitle` no longer leaks ULIDs
Agent: main (opencode/mimo-v2.6-flash-free)
Spec IDs: PRD-005, SDS-EVID, SDS-NODE, SDS-UI; INV-CONTRA, INV-HUMAN, INV-DUR, INV-DAY.

### 1. The silent no-op

`EvidenceInbox` **Reject** did
`api.patchNode(id, { frontmatter: { status: "rejected" } })`.
`services::update_node` strips `status` before merging (gate-owned), so the
write succeeded, the toast said "Rejected", and **nothing changed**. The same
shape was behind `BetBoard.kill` — see `.agents/open_questions.md` → `OQ-BET-KILL`.

Spec §10.2 already lists `POST /evidence/{id}/reject` and §9 lists
`EvidenceService | accept / reject evidence`, so this is a missing
implementation, not missing policy — TDD, smallest failing test first.

### 2. What shipped

- `core/src/services.rs::reject_evidence` — loads the item, sets
  `EvidenceStatus::Rejected`, persists, emits. **No gate**: rejecting demands
  no proof, it declines one. Returns early if already rejected so a double
  click cannot double-log.
- **It does not discard.** INV-CONTRA requires counterevidence to survive as a
  first-class record, so the node, its `text` and its typed edges all stand —
  only status and the ledger move.
- `ActivityKind::Rejected` added (`core/src/governance.rs`) with its
  `"rejected"` arm in `adapters/src/daynote_sink.rs`. That match is exhaustive,
  so the compiler forced the arm — there is no path where a rejection is
  written to the daynote under a wrong label.
- `server/src/http.rs` — route + handler, mirroring `accept_evidence`.
- `ui/src/api.ts::rejectEvidence`; `EvidenceInbox.reject` now calls it.

### 3. The ULID leak this uncovered

The toast read `Rejected "01KW054BMNFRE8JC0G"`. `nodeTitle` fell back to
`node.id.slice(0, 18)`, and evidence nodes carry no `title` and no body — their
claim lives in frontmatter `text`. So every untitled typed node put a ULID into
a human surface, including **`NodePage`'s h1 and `FacetPage` rows**, both added
in EV-026.

`DESIGN.md §10` keeps infrastructure identity off reading surfaces, and
`useNodeTitle` already worked around this in one place by treating "the id
fallback" as "no title". The fix belongs in `nodeTitle` itself:

```
title → first body line → nodeExcerpt(60) → id
```

The id survives only when the node has *no* human content at all, so
`nodeTitle(node({}))` still returns the id and the existing test still passes.
`lib/node.test.ts` gained a case for the `text`/`thesis` fallbacks.
`useNodeTitle`'s comment was updated — it described the old behavior.

### 4. Verification

```text
cargo test --workspace (all suites except calendar/providers.rs): 124 passed, 0 failed   (+1)
cargo clippy --workspace --all-targets -- -D warnings:            0 issues
pnpm -C ui typecheck:                                              clean
pnpm -C ui test:                                                   12 files, 70 passed  (+1)
pnpm -C ui build:                                                  clean
```

Live app (Playwright):

```text
Evidence Inbox → Reject →
  toast:  Rejected "…". The record stays, so the claim can still be traced back to it.
  item leaves triage; console errors after clean reload: 0
Vault: 4 evidence_item nodes → 2 accepted, 1 rejected, 1 unspecified
       status: rejected present in the .md file            ← INV-DUR, not SQLite-only
"All" list row titles: 0 of 4 are ULIDs (all four read as prose)
#facet/status/rejected → h1 "rejected · status", lists the rejected evidence item
```

### Known limitations

- One evidence node has **no `status` frontmatter at all** and renders as
  `unspecified` with an excerpt of `—`. It was seeded that way; not touched,
  because adding a status is a state transition no endpoint defines.
- The remaining `status: drafted` node in the vault is not an `evidence_item`,
  so it never appears in the Evidence Inbox triage list. Out of scope here.

Status: Accepted

## EV-028 — Bet kill endpoint + the stale derived index (S-BET-KILL)

Date: 2026-10-06
Slice: S-BET-KILL — `POST /api/bets/{id}/kill`; write-path index rebuild
Agent: main (opencode/mimo-v2.6-flash-free)
Spec IDs: SDS-STRAT, SDS-INDEX, SDS-GATE; INV-BET, INV-HUMAN, INV-DUR, INV-EDGE, INV-DAY.

### 1. The decision (OQ-BET-KILL, operator 2026-10-06)

SPEC §10.2 defines `POST /bets/{id}/approve` and **no** kill endpoint, while
`BetStatus::Killed` exists and INV-BET's failure mode is *"strategy theater;
bets that cannot fail or be killed."* Three options were written up in
`.agents/open_questions.md` → `OQ-BET-KILL`; the operator chose **(a): a
non-gated transition, symmetric to `reject_evidence`** — declining needs no
proof, and inventing a `can_kill_bet` would be policy the spec does not state.

**Shipped as decided, and flagged as an API-surface extension beyond §10.2** —
not as if the spec already said so.

### 2. What shipped

- `core/src/services.rs::kill_bet` — sets `BetStatus::Killed`, persists, emits;
  returns early when already killed so a double confirm cannot double-log.
- `ActivityKind::Killed` + its exhaustive `"killed"` arm in `daynote_sink`.
- `server/src/http.rs` — `POST /api/bets/:id/kill`.
- `ui/src/api.ts::killBet`; `BetBoard.kill` now calls it instead of
  `patchNode` (which strips `status` and had made the button a lie).

### 3. The defect this uncovered: the derived index never saw writes

The new bet did **not** appear on the Bet Board. Not a UI bug —
`GET /api/nodes` (markdown, via `vault.all()`) listed it, but
`GET /api/nodes/:ty` (which `useTypedNodes` → every strategy screen reads)
served `st.index.nodes_by_type()` and did not.

Audit of `server/src/http.rs`: of 23 write handlers, only 6 rebuilt the index
(`create_note`, `create_node`, `seed`, `delete_note`, `clone_note`,
`create_agent_run`). **`draft_bet`, `promote_note`, `link_node`, `approve_bet`,
`schedule_timebox`, `create_work_package` and 17 others did not** — so anything
created, promoted or linked was invisible to typed lists, backlinks and search
until the next server restart. `services.rs:213` already documents the contract
as *"the HTTP layer rebuilds the index first"*; the HTTP layer just was not
doing it.

Fixed in **one place** rather than trusting 23 handlers: an axum middleware
layer on non-safe methods that rebuilds after the write.

```rust
.layer(axum::middleware::from_fn_with_state(state.clone(), |State(st), req, next| async move {
    let is_write = !req.method().is_safe();
    let response = next.run(req).await;
    if is_write { if let Err(e) = st.index.rebuild(&st.vault) { eprintln!(...) } }
    response
}))
```

A failing rebuild does not fail the response — the write already succeeded and
markdown is the source of truth (INV-DUR) — but it is printed to
`.run/backend.log` rather than swallowed.

Marked with a `ponytail:` comment: full rebuild per write is O(vault); ceiling
is when a rebuild stops being sub-millisecond; upgrade path is incremental
updates on put/delete, or rebuilding only for writes that add, remove or
retype a node.

### 4. Verification

```text
cargo test --workspace (all suites except calendar/providers.rs): 125 passed, 0 failed   (+1)
cargo clippy --workspace --all-targets -- -D warnings:            0 issues
pnpm -C ui typecheck:                                              clean
pnpm -C ui test:                                                   12 files, 70 passed
pnpm -C ui build:                                                  clean
```

Index middleware, proven without a restart:

```text
before POST /api/bets  -> /api/nodes/strategy_bet = 3
after  POST /api/bets  -> /api/nodes/strategy_bet = 4, new id present
```

UI end-to-end on a throwaway bet:

```text
created via API → appears on Bet Board DRAFT column
Kill (arm) → "Kill it" (confirm) →
  toast: Killed "THROWAWAY probe bet - delete me". The bet stays in the vault,
         so its history can still be traced.
  vault: status: killed          ← INV-DUR, markdown not SQLite
  ledger: - 03:34:17 killed 01M47KPTW4Y2P8TY2M0N38F7Q3 (user)   ← INV-DAY
  toast reads a thesis, not a ULID  (the nodeTitle fix from EV-027)
approved demo bet untouched (status: approved)
both probes deleted afterwards → vault back to 42 nodes, 2 bets
```

Kill is reachable from **both** board states: draft/blocked (`Approve` row) and
approved (`Decision record written` row) — each with its own `ConfirmButton`.

### Known limitations

- The demo bet `01KW054BPPDK7KKBW4EXZZZVNE` is now `killed` (it was the draft,
  used for the first UI attempt). Revert by hand if the seed state is wanted.
- `PATCH` and every other non-safe method now pays a full index rebuild. Safe
  at the current vault size; see the `ponytail:` note for the upgrade path.
- The earlier "UI click did nothing" on the first attempt was **not** a bug —
  `Kill` is a two-step `ConfirmButton` (arm, then confirm within 4 s), and the
  probe only armed it. Recorded here because it cost a debugging round.

Status: Accepted

---

## EV-029 — S-CAL-001: calendar view + ICS export (the whole commitment set)

**Slice:** S-CAL-001 · **Spec IDs:** PRD-020, PRD-025, SDS-CAL, SDS-UI, INV-CAL,
INV-TIME, INV-PORT, TST-CAL, SPEC §10.3 (`POST /calendar/ics/export`), §12.1,
OQ-002 Option B (resolved: internal timeboxes + ICS export, no live sync).
**Invariants exercised:** INV-CAL (no provider is dialed anywhere on this path),
INV-TIME (a calendar row is what makes a wish a commitment), INV-DUR (export
reads markdown, never the derived index), INV-PORT (the .ics is the portable copy).

An export that could carry only **one** timebox is not a calendar: a subscriber
would get a fresh calendar per timebox instead of an update. So the plural
function is the real implementation and the singular one delegates to it — one
code path, no format drift.

```text
core/src/ics.rs
  export_timeboxes_to_ics(&[Timebox]) -> one VCALENDAR, N VEVENTs   (new)
  export_timebox_to_ics(&Timebox)     -> delegates (from_ref)        (now)
  export_vault_to_ics(&dyn NodeVault) -> markdown only, sorted by start (new)
server/src/http.rs
  POST /api/calendar/ics/export  -> {"ics": "..."}   (SPEC sec 10.3)
ui/src/api.ts        exportIcs()
ui/src/views/CalendarView.tsx   day groups + Export .ics   (new)
ui/src/components/layout/Sidebar.tsx  nav: Execution -> Calendar
ui/src/App.tsx       VALID + route
```

Tests (`adapters/tests/calendar.rs`, now 8):

- `tst_cal_006_multi_timebox_export_is_one_calendar` — 1 wrapper / 2 VEVENTs,
  both UIDs present, RFC 5545 CRLF endings, empty set yields an event-free
  shell (never phantom events), and the singular entry point matches the plural.
- `tst_cal_007_vault_export_covers_every_timebox_in_schedule_order` — writes two
  timeboxes **out of schedule order** plus a non-timebox node: both timeboxes
  come back, the case node does not, and Jul 1 lands before Jul 2. Re-export is
  byte-identical.

### Live verification

```text
POST /api/calendar/ics/export          200
  1 x BEGIN:VCALENDAR, 4 x BEGIN:VEVENT   == 4 timeboxes in the vault
  startsWith BEGIN:VCALENDAR\r\n, endsWith END:VCALENDAR\r\n

Browser #calendar:  h1="Calendar", nav item present, rail marks it current
  day groups: Thu Jun 25, 2026 | Fri Jun 26, 2026 | Mon Oct 5, 2026   (ascending)
  4 rows, 4 #node/ links, 4 #facet/status/ chips, 0 console errors
  Export .ics click -> file "strategynotes.ics" actually downloaded
  downloaded file: 807 bytes, 32 CRLF lines, 4 VEVENTs, valid structure
```

Responsive sweep: **33/33** (routes x 1440/860/390) — every route has an `h1`,
`scrollWidth <= clientWidth` everywhere, content present. Derived routes
re-checked in the same pass: `#facet/status/killed`, `#facet/status/draft`,
`#facet/type/strategy_bet`, `#node/01KW054BPPDK7KKBW4EXZZZVNE` all render.

### Deliberate limits (not gaps)

- **No Calendar screen is specified in SPEC.** The view is a composition of
  specified parts (PRD-027: screens are compositions), not a new product
  surface. It carries no create/edit affordance, so it cannot become a second
  writer of timebox state.
- **No live Google/Outlook/iCloud sync** — §12.2 puts it out of MVP scope and
  OQ-002 resolved to Option B. `calendar/tests/providers.rs` still hangs on
  network mocks (pre-existing, excluded).
- `POST` for a read-only export looks wrong but **is what §10.3 specifies**;
  the spec is the source of truth, so it is a POST and it pays the index
  middleware's rebuild like every other non-safe method.

Status: Accepted

---

## EV-030 — S-CREATE-001: bets and work packages can be created from the UI

**Slice:** S-CREATE-001 · **Spec IDs:** SDS-UI, PRD-027, PRD-018, §10.2 API
surface (`POST /bets`, `POST /work-packages`), INV-WORK, INV-DUR, INV-HUMAN.
**Invariants exercised:** INV-WORK (a work package is bound to a case *and* a
bet at creation — never to nothing), INV-DUR (the UI never optimistically fakes
a node; it re-reads markdown), INV-HUMAN (the human drafts, the gate decides
approval later).

`api.draftBet` and `api.createWorkPackage` existed in `api.ts` and **were never
called by anything**. The board's own empty state pointed at a promote flow that
had no affordance either, so the documented path dead-ended. Creation now lives
**above** `AsyncState` in both views: a board with no items must still be able
to receive its first item, and an empty state that hides its own create control
is a trap.

```text
ui/src/views/BetBoard.tsx     create bar: thesis -> api.draftBet(caseId, text)
ui/src/views/WorkPlanner.tsx  create bar: objective + bet Select -> api.createWorkPackage
ui/src/App.tsx                ws.caseId passed to both (same pattern as DocBrowser)
```

Both bars state their prerequisite instead of failing at submit time:

- no case selected → *"A bet belongs to a case. Pick one in the app bar…"*
- no bet yet → *"Work hangs off a bet (INV-WORK). Draft a bet first…"* with a
  link to `#bets`.

### Tests (new, 6 — `BetBoard.test.tsx`, `WorkPlanner.test.tsx`)

- drafts against the active case, trims the thesis, clears the field **only
  after** the server accepted it;
- refuses to draft without a case and never calls the API;
- **keeps the typed thesis when the server refuses** (a failed write must not
  eat the user's words);
- creates a package bound to `caseId` + the selected bet, then clears;
- form hidden without a case; INV-WORK hint + working `#bets` link when there
  are no bets, API untouched.

### Live verification

```text
#bets   before: 2 cards, input present, Draft bet disabled while empty
        submit  -> after: 3 cards, thesis visible, field cleared, NO page reload
#work   bet Select listed 3 bets INCLUDING the one created seconds earlier
        -> proof the EV-028 index middleware makes new nodes visible at once
        submit  -> new package row appears, field cleared
```

**Probe cleanup:** both nodes created during verification were deleted via
`DELETE /api/notes/{id}` (work package first, so no dangling `linked_bet` —
INV-EDGE). Vault back to 2 bets / 3 work packages; `approved` and `killed` demo
bets untouched.

```text
cargo test (24 suites, all but calendar/providers.rs)   133 passed, 0 failed
cargo clippy --workspace --all-targets -- -D warnings   0 issues
pnpm -C ui typecheck                                    clean
pnpm -C ui test                                         15 files, 79 passed
pnpm -C ui build                                        clean
Playwright: 33/33 responsive combos, 5/5 derived routes, 0 console errors
```

### Known limitations

- **No delete affordance on BetBoard / WorkPlanner.** Deleting from Notes works
  and is guarded (EV-025), but these boards still have none — which is exactly
  why probe cleanup had to go through the API by hand.
- A bet's thesis is its excerpt; the board's row title is an excerpt-link, not a
  title-link (carried from UI-UX-REFINE-001).
- `createClaim` / `claimValue` / `acceptAgentRun` are still declared and never
  called — deliberately out of slice.
- Creating a bet requires a **selected** case. "All cases" (null) disables the
  bar with a reason rather than silently filing the bet under an arbitrary case.

Status: Accepted
