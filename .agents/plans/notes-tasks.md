# Notes Feature - Task Checklist

**Plan:** `notes-feature.md`
**Created:** 2026-06-23

---

## Phase 1: Core Notes (MVP)

### Backend - Rust

- [ ] **TASK-N03** Create `core/src/backlinks.rs` module
  - BacklinkIndex struct
  - get_backlinks() method
  - rebuild_from_graph() method

- [ ] **TASK-N04** Integrate backlink rebuild on node save
  - Hook into Graph::save_node()
  - Incremental update (not full rebuild)

- [ ] **TASK-N05** Expose backlinks via API endpoint
  - GET `/notes/:id/backlinks`
  - Include context snippet

- [ ] **TASK-N08** Implement notes CRUD in `server/src/routes/notes.rs`
  - GET /notes (list, paginated)
  - POST /notes (create)
  - GET /notes/:id (with backlinks)
  - PUT /notes/:id (update)
  - DELETE /notes/:id (soft delete)

- [ ] **TASK-N09** Add Tauri commands for notes operations
  - create_note
  - update_note
  - delete_note
  - get_note
  - list_notes
  - search_notes

### Frontend - React

- [ ] **TASK-N19** Evaluate and select editor library
  - Options: CodeMirror 6, Milkdown, TipTap
  - Criteria: wikilink extension, markdown, performance
  - Decision doc in `.agents/decisions/`

- [ ] **TASK-N20** Implement `MarkdownEditor` base component
  - `ui/src/components/notes/MarkdownEditor.tsx`
  - Basic markdown editing
  - Controlled component (value/onChange)

- [ ] **TASK-N23** Add Notes group to navigation
  - Update NAV_GROUPS in App.tsx
  - Add Notes and Journal items
  - Position first (foundation layer)

- [ ] **TASK-N24** Create `NotesView` screen component
  - `ui/src/views/NotesView.tsx`
  - Split layout: list + editor
  - State: selectedNote, searchQuery

- [ ] **TASK-N16** Create `NoteCard` component
  - `ui/src/components/notes/NoteCard.tsx`
  - Title, excerpt (first 100 chars)
  - Tags as chips
  - Updated date

- [ ] **TASK-N17** Create `BacklinksPanel` component
  - `ui/src/components/notes/BacklinksPanel.tsx`
  - Collapsible panel
  - List of BacklinkItem entries
  - Click to navigate

---

## Phase 2: Enhanced Editing

### Frontend - React

- [ ] **TASK-N21** Add wikilink autocomplete
  - Trigger on `[[`
  - Search notes by title
  - Insert `[[Title]]` on select

- [ ] **TASK-N22** Add tag autocomplete
  - Trigger on `#`
  - Search existing tags
  - Insert `#tag-name` on select

- [ ] **TASK-N12** Create `WikilinkChip` component
  - `ui/src/components/notes/WikilinkChip.tsx`
  - Clickable link with hover preview
  - Broken link indicator if unresolved

- [ ] **TASK-N13** Create `TagChip` component
  - `ui/src/components/notes/TagChip.tsx`
  - Clickable tag
  - Filter notes on click

- [ ] **TASK-N18** Create `TagsBar` component
  - `ui/src/components/notes/TagsBar.tsx`
  - Horizontal scrollable
  - Active tag highlighting
  - Clear filter button

- [ ] **TASK-N26** Implement List view mode
  - Virtualized list (react-window)
  - Sort: date, title, relevance
  - Filter: tags, search

---

## Phase 3: Advanced Features

### Backend - Rust

- [ ] **TASK-N06** Add `clone_node()` operation
  - Create Places edge
  - Validate no cycles (INV-CLONE)
  - Return updated node

- [ ] **TASK-N07** Add `get_all_placements()` method
  - Return Vec<(parent_id, path)>
  - For clone indicator

- [ ] **TASK-N10** Emit WebSocket `note:updated` events
  - On save
  - Include diff summary

- [ ] **TASK-N11** Emit `backlinks:changed` events
  - When links added/removed
  - Target node ID

### Frontend - React

- [ ] **TASK-N15** Create `CloneIndicator` component
  - `ui/src/components/notes/CloneIndicator.tsx`
  - Badge with clone count
  - Tooltip showing locations

- [ ] **TASK-N25** Create `JournalView` screen component
  - `ui/src/views/JournalView.tsx`
  - Day-based view
  - Read-only activity log
  - Link to full notes
  - **SUPERSEDED BY:** `editor-screen.md` TASK-E07 (more detailed spec)

- [ ] **TASK-N28** Add "Promote to..." action menu
  - Context menu on note
  - Options: Evidence Item, Strategy Bet
  - Opens type-specific form

- [ ] **TASK-N29** Implement note-to-evidence promotion
  - Copy note content
  - Add evidence fields
  - Create typed node

---

## Dependency Tasks (from Design Audit)

These tasks from `remediation-plan.md` should be completed before Notes:

- [ ] **TASK-001** Add surface-2/3/4 tokens (for editor backgrounds)
- [ ] **TASK-004** Add radius scale tokens (for editor corners)
- [ ] **TASK-009** Add typography utilities (for note content)

---

## Testing Checklist

### Unit Tests (Rust)

- [ ] `backlinks::tests::get_backlinks_returns_all_linking_nodes`
- [ ] `backlinks::tests::rebuild_handles_empty_graph`
- [ ] `clone::tests::clone_rejects_cycles`
- [ ] `notes::tests::crud_operations`

### Component Tests (React)

- [ ] `MarkdownEditor.test.tsx` - renders, accepts input
- [ ] `NoteCard.test.tsx` - displays all fields
- [ ] `BacklinksPanel.test.tsx` - renders links, handles empty
- [ ] `WikilinkChip.test.tsx` - resolves links, shows broken state

### Integration Tests

- [ ] Create note → appears in list
- [ ] Edit note → save → reload → content persisted
- [ ] Add wikilink → backlink appears on target
- [ ] Search → returns matching notes
- [ ] Clone → appears in multiple locations

### E2E Tests (Playwright)

- [ ] Full notes workflow: create → edit → link → search → delete
- [ ] Keyboard navigation through notes list
- [ ] Mobile responsive layout

---

## Definition of Done

A task is complete when:

1. Code implemented and compiles
2. Tests written and passing
3. Component documented (props, usage)
4. Accessibility checked (keyboard, screen reader)
5. Mobile responsive verified
6. PR reviewed and merged
