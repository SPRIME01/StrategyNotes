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
