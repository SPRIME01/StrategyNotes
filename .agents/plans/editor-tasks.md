# Editor Screen - Task Checklist

**Plan:** `editor-screen.md`
**Created:** 2026-06-23
**Mockup:** `.tmp/strategy_notes_screens/Editor.png`

---

## Phase 1: Core Layout

- [ ] **TASK-E01** Create `EditorLayout` 3-panel container
  - `ui/src/views/EditorLayout.tsx`
  - Props: sidebar, editor, contextPanel slots
  - Responsive: collapse sidebar < 768px, hide context < 1024px
  - CSS Grid or Flexbox with fixed + flexible columns

- [ ] **TASK-E02** Create `EditorHeader` component
  - `ui/src/components/editor/EditorHeader.tsx`
  - Breadcrumb (clickable, navigate to parent)
  - Date display for journal mode
  - Action buttons: Share, More (dropdown)

- [ ] **TASK-E03** Create `NoteEditor` wrapper component
  - `ui/src/components/editor/NoteEditor.tsx`
  - Wraps MarkdownEditor (from TASK-N20)
  - Connects to note store (load/save)
  - 1-second debounced autosave

- [ ] **TASK-E04** Create `ContextPanel` component
  - `ui/src/components/editor/ContextPanel.tsx`
  - Collapsible (toggle button in header)
  - Sections: Linked, Quick Actions, Core Concepts
  - Persist open/closed state

- [ ] **TASK-E05** Add `NewPageButton` to sidebar
  - `ui/src/components/layout/NewPageButton.tsx`
  - Fixed position at sidebar bottom
  - Creates note + navigates to editor
  - Register `Cmd+N` / `Ctrl+N` shortcut

---

## Phase 2: Journal Features

- [ ] **TASK-E06** Create `JournalDateNav` component
  - `ui/src/components/journal/JournalDateNav.tsx`
  - Large date display (--font-display, 28px)
  - Left/right arrows for prev/next day
  - Calendar picker (react-day-picker or similar)
  - Dot indicators for days with entries

- [ ] **TASK-E07** Create `JournalView` screen
  - `ui/src/views/JournalView.tsx`
  - Composes: EditorLayout + JournalDateNav + NoteEditor
  - Route: `/journal` and `/journal/:date`
  - **Note:** Supersedes TASK-N25 from notes-tasks.md

- [ ] **TASK-E08** Implement journal auto-creation
  - On navigate to empty date → create journal node
  - Node type: `journal`
  - Title: formatted date (e.g., "Jun 22nd, 2026")
  - Insert template for first-time users

- [ ] **TASK-E09** Add journal keyboard shortcut
  - `Cmd+J` / `Ctrl+J` → navigate to today's journal
  - Register in global shortcut handler
  - Works from any screen

---

## Phase 3: Block System

- [ ] **TASK-E10** Create `CommandPalette` component
  - `ui/src/components/editor/CommandPalette.tsx`
  - Trigger: `/` at start of line or empty block
  - Fuzzy search through block types
  - Keyboard navigation (up/down/enter/esc)
  - Insert markdown syntax on selection

- [ ] **TASK-E11** Create `MentionAutocomplete` component
  - `ui/src/components/editor/MentionAutocomplete.tsx`
  - Trigger: `@` anywhere in text
  - Search notes API (title match)
  - Show preview snippet
  - Insert `[[Title]]` on selection

- [ ] **TASK-E12** Create `CalloutBlock` component
  - `ui/src/components/editor/CalloutBlock.tsx`
  - Variants: tip (blue), warn (amber), info (gray)
  - Icon + styled container
  - CodeMirror decoration or widget

---

## Phase 4: Context Panel Sections

- [ ] **TASK-E13** Implement `LinkedSection`
  - `ui/src/components/editor/LinkedSection.tsx`
  - Fetches backlinks for current note
  - Compact list with title + snippet
  - Click to navigate
  - Reuses backlinks API (TASK-N05)

- [ ] **TASK-E14** Implement `QuickActionsSection`
  - `ui/src/components/editor/QuickActionsSection.tsx`
  - Buttons: New note, Link item, Add to graph, Share
  - Show keyboard hints
  - Wire up actions

- [ ] **TASK-E15** Implement `CoreConceptsSection`
  - `ui/src/components/editor/CoreConceptsSection.tsx`
  - Static links for onboarding
  - Evidence, Strategy, Traceability concepts
  - Hide after user dismisses

---

## Phase 5: Polish

- [ ] **TASK-E16** Implement keyboard shortcut system
  - `ui/src/hooks/useKeyboardShortcuts.ts`
  - Global registry for shortcuts
  - Conflict detection (warn on duplicate)
  - `?` key opens help modal

- [ ] **TASK-E17** Add editor loading/saving states
  - Skeleton loader while note loads
  - "Saving..." / "Saved" indicator in header
  - Error toast on save failure
  - Retry mechanism

- [ ] **TASK-E18** Mobile responsive layout
  - < 768px: Sidebar collapses to hamburger overlay
  - < 1024px: Context panel hidden by default
  - Touch-friendly: larger tap targets
  - Swipe gestures for panel toggle

---

## Dependencies

### Must Complete First (from notes-feature.md)

| Task | Description | Status |
|------|-------------|--------|
| TASK-N19 | Select editor library | [ ] |
| TASK-N20 | MarkdownEditor base component | [ ] |
| TASK-N03 | Backlinks module (Rust) | [ ] |
| TASK-N05 | Backlinks API endpoint | [ ] |

### Should Complete First (from remediation-plan.md)

| Task | Description | Status |
|------|-------------|--------|
| TASK-001 | Add surface-2/3/4 tokens | [ ] |
| TASK-002 | Add border-strong token | [ ] |
| TASK-004 | Add radius scale tokens | [ ] |

---

## Testing Checklist

### Unit Tests

- [ ] `EditorLayout.test.tsx` - renders 3 panels, collapses responsively
- [ ] `EditorHeader.test.tsx` - breadcrumb clicks, date display
- [ ] `NoteEditor.test.tsx` - autosave triggers, dirty state
- [ ] `JournalDateNav.test.tsx` - navigation, date formatting
- [ ] `CommandPalette.test.tsx` - search, keyboard nav, insertion
- [ ] `MentionAutocomplete.test.tsx` - search, selection

### Integration Tests

- [ ] Load note → edit → save → reload → content persisted
- [ ] Navigate journal dates → correct entry loads
- [ ] Empty journal date → auto-creates entry
- [ ] Backlinks update when wikilinks added
- [ ] Keyboard shortcuts work from any screen

### E2E Tests (Playwright)

- [ ] Full editor workflow: open → edit → save → verify
- [ ] Journal navigation: today → previous day → calendar pick
- [ ] Command palette: `/heading` → inserts `#`
- [ ] Mention: `@note` → selects → inserts `[[Note]]`
- [ ] Mobile: hamburger menu, panel toggles

---

## Definition of Done

A task is complete when:

1. Component implemented and renders correctly
2. Unit tests written and passing
3. Props documented (JSDoc or Storybook)
4. Accessibility verified (keyboard nav, screen reader)
5. Mobile responsive behavior verified
6. Integrates with design tokens from index.css
7. PR reviewed and merged

---

## Cross-Reference

| Editor Task | Supersedes | Notes |
|-------------|------------|-------|
| TASK-E07 (JournalView) | TASK-N25 | More detailed spec |
| TASK-E11 (MentionAutocomplete) | Extends TASK-N21 | Adds @ trigger |
| TASK-E13 (LinkedSection) | Uses TASK-N17 | Reuses BacklinksPanel |
