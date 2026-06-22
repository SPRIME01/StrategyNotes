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

---

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
