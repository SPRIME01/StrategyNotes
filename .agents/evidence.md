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
