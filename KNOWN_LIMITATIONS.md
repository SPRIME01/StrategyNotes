# KNOWN_LIMITATIONS.md — StrategyNotes

Honest gaps as of the post-MVP calendar build. Each is either deferred by
design, blocked by the build environment, or behind a feature flag awaiting
credentials.

## Closed in this build (were gaps, now implemented + tested)
- ~~`[[wikilink]]` title→id resolution~~ — CLOSED. Backlinks resolve wikilinks
  by node title (FTS5 + title column + backlinks UNION).
- ~~FTS5 search~~ — CLOSED. FTS5 virtual table with unicode61 tokenizer replaced
  LIKE; snippet() excerpts; rebuildable.
- ~~Real calendar providers (stubs only)~~ — CLOSED. Real CalDAV / Google /
  Microsoft adapters (CalendarProviderAdapter impls) over an HttpTransport trait;
  contract-tested via MockHttpTransport. Live-provider smoke is EV-SKIP without
  credentials; the reqwest transport is feature-gated.

## By design (scope)
1. **Multi-user / sync** — out of scope (PRD-030). StrategyNotes is local-first
   single-user.
2. **UI polish** — organisms render real data + gate results, but no design
   system / animation / responsive work (deferred to the UI phase, which is
   next before build/run).
3. **FTS5 ranking/tokenization tuning** — FTS5 is in; advanced ranking is a
   future enhancement, not a gap.

## Build-environment blocked (EV-SKIP)
4. **Tauri desktop build/run.** Build env lacks `webkit2gtk-4.1-dev`. The
   `src-tauri/` scaffold (Option A subprocess) is correct and excluded from the
   workspace. Install instructions in README.
5. **Live calendar-provider smoke.** No credentials (Google/Outlook OAuth,
   CalDAV app-passwords). Contract tests via MockHttpTransport cover the adapter
   logic; the feature-gated ReqwestTransport is the real network path.
6. **UI screenshot verification.** No display; component tests cover data flow.

## Feature-flagged (require enable + credentials)
7. **Real provider network calls** — `cargo build -p strategynotes-calendar
   --features google` (or microsoft/caldav) compiles ReqwestTransport. Adapters
   take a pre-obtained OAuth token / CalDAV credentials; OAuth token-refresh
   flow is the integration layer's job (the adapter takes the live token).

## Not yet implemented (honest)
8. **Conflict resolver UI** — the sync engine flags Conflict status; the UI
   surface (use-local/use-remote/duplicate/manual-merge) is part of the UI
   phase (deferred).
9. **Full recurrence editing** — display/import/export of recurring events
   works; complex exception editing (this-occurrence / this-and-following) is
   deferred per the spec's non-goals.

## Non-issues (verified)
- Markdown is source of truth; SQLite is rebuildable; rebuild equivalence tested.
- Sync metadata is non-strategy-critical SQLite (loss = re-sync, not data loss).
- Secrets behind the SecretStore port; FileSecretStore (plaintext) is dev-only;
  Stronghold is the Tauri production path.
- Every gate is backend-owned; the UI never decides approval.
- INV-CAL: provider failure (5xx / 412 / timeout) returns ProviderError; the
  local Timebox is never mutated through the adapter boundary.
