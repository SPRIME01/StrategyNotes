# AGENT_STATE.md

Living state for agents working in this repo. NOT a source of truth (precedence
#7 per PLAN sec 1).

Last updated: 2026-06-22 (finish-line build complete)

## Status
Finish-line build (Phases A-H) complete. See CONFORMANCE.md for the final
acceptance checklist and KNOWN_LIMITATIONS.md for honest gaps.

## Conformance gate
```
cargo test --workspace ... 107 passed, 0 failed
cargo build --workspace ... clean
cargo clippy --workspace --all-targets -- -D warnings ... clean
pnpm -C ui test/build ... clean
```

## What landed this build
- INV-BODY inline parsing (B1) + index integration + backlinks.
- Strategy Capacity gate with SDR override (B2).
- Agent quarantine HTTP endpoints (C) — no auto-accept path.
- FTS search (D) — derived, rebuildable.
- 8 UI organisms + Agent Draft Inbox + tabbed shell (E).
- Tauri scaffold (F) — EV-SKIP build/run (webkit2gtk missing).
- CalendarProvider + 5 adapters (G) — INV-CAL boundary.
- Conformance docs (H) — CONFORMANCE/KNOWN_LIMITATIONS/README/evidence EV-012.

## Next action (recommendation for next release)
1. Depped machine: build/run Tauri (EV-SKIP here); add icon set.
2. Title→id resolution for [[wikilink]] (KNOWN_LIMITATIONS #7).
3. Real calendar providers behind feature flags (KNOWN_LIMITATIONS #2).
4. UI design polish: split organisms.tsx into atomic library + design tokens.
5. FTS5 upgrade (KNOWN_LIMITATIONS #4).

## Non-negotiables (still locked)
No core rewrite without failing test; no invariant weakening; markdown = truth;
SQLite = derived; providers never source of truth; agent output quarantined;
work needs package+pomo+timebox; timebox needs review; value needs proof;
no done-without-evidence.
