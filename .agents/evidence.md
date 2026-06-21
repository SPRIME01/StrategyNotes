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
