# KNOWN_LIMITATIONS.md — StrategyNotes

Honest gaps as of the finish-line build. Each is either deferred by design or
blocked by the build environment.

## By design (scope)
1. **Multi-user / sync** — out of scope (PRD-030). StrategyNotes is local-first
   single-user. Sync would be a future adapter outside the core.
2. **Real calendar providers** — Google/Outlook/iCloud adapters are stubs that
   report `Unavailable` without credentials and error on use (never fake
   success). Real HTTP adapters live behind feature flags
   (`google`/`outlook`/`icloud`); enable + provide credentials via env vars
   (`GOOGLE_CALENDAR_CREDENTIALS`, `OUTLOOK_CREDENTIALS`, `ICLOUD_CALDAV_CREDENTIALS`).
   OQ-002 (Option B: internal + ICS first) honored.
3. **UI is functional, not pixel-polished.** The 8 organisms render real data
   and real gate results, but there is no design system, no animation, no
   responsive layout work. The atomic component library (SPEC sec 11) is a
   single co-located file; splitting into atoms/molecules/organisms and a
   design-token layer is future polish.
4. **FTS is LIKE-based**, not FTS5. Sufficient for MVP correctness; FTS5
   ranking/tokenization is a future enhancement.

## Build-environment blocked (EV-SKIP)
5. **Tauri desktop build/run.** The build env lacks `webkit2gtk-4.1-dev`
   (cannot `apt install` — global install, safety rule). The `src-tauri/`
   scaffold is correct (Option A: spawns the axum backend subprocess + loads the
   React UI in a webview) and excluded from the workspace so the conformance
   gate stays green. To build on a depped machine:
   ```
   sudo apt install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev
   cd src-tauri && cargo run      # or `tauri dev` / `tauri build`
   ```
6. **UI screenshot verification.** No display in the build env. Component tests
   (Vitest + Testing Library with mocked fetch) cover data flow; visual
   verification is manual on a depped machine.

## Not yet implemented (honest)
7. **Title-resolution for `[[wikilink]]` by title.** INV-BODY parses body refs
   and they enter the index; backlinks resolve refs that target a node *by id*
   (`[[01HZX…]]`, `((01HZX…))`). Wikilinks by *title* (`[[GodSpeed MVP]]`) are
   indexed as refs but not yet resolved to a NodeId via title lookup (requires a
   title→id index). Tags are indexed but not yet queryable as a tag cloud.
8. **Pomo capacity ledger UI.** The Strategy Capacity gate (B2) is implemented
   and tested; the UI surface that shows "committed vs available pomos per
   window" is not built (the gate is reachable via services/HTTP).
9. **Real-provider smoke tests** for calendar — EV-SKIP (no credentials); mock
   contract tests cover the shape.

## Non-issues (verified)
- Markdown is source of truth; SQLite is rebuildable; rebuild equivalence is
  tested (`index_loss_then_rebuild_yields_equivalent_state`, TST-BODY-005).
- No strategy-critical state lives only in SQLite.
- Every gate is backend-owned; the UI never decides approval.
