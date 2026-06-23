# Notes Feature Implementation Plan

**Status:** Draft
**Created:** 2026-06-23
**SPEC References:** §1.3, §1.4, §3.3, §4.1, §4.2, §4.3, §11, §12.1

---

## 1. Overview

StrategyNotes is fundamentally a "strategy-native **notes app**" (SPEC §1.4). The Notes layer is the substrate upon which all other modes (Evidence, Strategy, Planning, Execution, Review, Value) are built. Every strategy object is a typed note.

### Goals

1. Implement Notes mode: "Capture, write, outline, link, clone, search" (§3.3)
2. Enable creation/editing of `note` and `journal` node types (§4.1)
3. Provide full markdown editing with wikilinks, tags, backlinks, clones (§12.1)
4. Integrate with existing core infrastructure (body parsing, search, graph)

### Non-Goals (This Phase)

- Strategy-specific node creation UI (separate feature)
- Agent drafting of notes (Governance mode)
- Daynote auto-capture (automatic, not manual UI)

---

## 2. Data Model (Backend - Rust)

### 2.1 Node Structure (Already Implemented in `core/src/node.rs`)

```rust
struct Node {
    id: Ulid,
    node_type: NodeType,      // note, journal, evidence_item, etc.
    title: String,
    body: Body,               // Markdown content
    frontmatter: Frontmatter, // YAML with typed edges
    branches: Vec<Ulid>,      // Multi-parent placements
    created_at: DateTime,
    updated_at: DateTime,
}
```

### 2.2 Body Parsing (Existing in `core/src/body.rs`)

Per SPEC §4.3, body is authoritative for:
- **Wikilinks:** `[[Title]]` → resolved to node ID
- **ULID refs:** `((01ABC...))` → direct reference
- **Tags:** `#tag-name` → extracted and indexed
- **Transclusions:** `![[Title]]` → embed content

**Required enhancements:**
- [ ] TASK-N01: Add `parse_for_editing()` to return edit ranges for syntax highlighting
- [ ] TASK-N02: Add `resolve_all_refs()` batch resolution for editor preview

### 2.3 Backlinks (New - `core/src/backlinks.rs`)

```rust
struct BacklinkIndex {
    // source_id → Vec<target_id> (forward links)
    // target_id → Vec<source_id> (backlinks)
}

impl BacklinkIndex {
    fn get_backlinks(&self, node_id: Ulid) -> Vec<BacklinkEntry>;
    fn rebuild_from_graph(&mut self, graph: &Graph);
}
```

- [ ] TASK-N03: Create `backlinks.rs` module
- [ ] TASK-N04: Integrate backlink rebuild on node save
- [ ] TASK-N05: Expose backlinks via API endpoint

### 2.4 Clone/Branch Operations (Existing in `core/src/graph.rs`)

Per SPEC INV-CLONE:
- Clones are equal placements (no original/copy distinction)
- Edit propagation to all clones
- Cycle rejection via `Places` edge validation

**Required enhancements:**
- [ ] TASK-N06: Add `clone_node()` operation
- [ ] TASK-N07: Add `get_all_placements()` for clone indicator

---

## 3. API Layer (Backend - Tauri/Server)

### 3.1 Notes CRUD Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notes` | GET | List notes (paginated, filterable by tag) |
| `/notes` | POST | Create new note |
| `/notes/:id` | GET | Get note with backlinks |
| `/notes/:id` | PUT | Update note body/frontmatter |
| `/notes/:id` | DELETE | Delete note (soft) |
| `/notes/:id/backlinks` | GET | Get backlinks for note |
| `/notes/:id/clone` | POST | Clone note to new parent |
| `/notes/search` | GET | Full-text search (FTS5) |
| `/notes/resolve` | POST | Batch resolve wikilinks to IDs |

- [ ] TASK-N08: Implement notes CRUD in `server/src/routes/notes.rs`
- [ ] TASK-N09: Add Tauri commands for notes operations

### 3.2 Real-time Updates (WebSocket)

- [ ] TASK-N10: Emit `note:updated` events for live collaboration
- [ ] TASK-N11: Emit `backlinks:changed` when links modified

---

## 4. UI Components (Frontend - React/Shadcn)

### 4.1 Design Tokens (from Open Design)

Use existing tokens from `ui/src/index.css`:
- `--color-card` for note cards
- `--color-surface-2` for editor background (add per TASK-001)
- `--color-primary` for links
- `--font-mono` for code blocks
- `--font-sans` for body text

### 4.2 Atoms (New - `ui/src/components/notes/`)

| Component | Description | SPEC Reference |
|-----------|-------------|----------------|
| `WikilinkChip` | Clickable link chip with hover preview | §4.3 |
| `TagChip` | Clickable tag with filter action | §4.3 |
| `BacklinkItem` | Single backlink entry with context | §3.3 |
| `CloneIndicator` | Badge showing clone count/locations | INV-CLONE |
| `NodeTypeBadge` | Type indicator (note, journal, etc.) | §11.1 |

- [ ] TASK-N12: Create `WikilinkChip` component
- [ ] TASK-N13: Create `TagChip` component
- [ ] TASK-N14: Create `BacklinkItem` component
- [ ] TASK-N15: Create `CloneIndicator` component

### 4.3 Molecules (New)

| Component | Description |
|-----------|-------------|
| `NoteCard` | Preview card in list view (title, excerpt, tags, date) |
| `BacklinksPanel` | Collapsible panel showing all backlinks |
| `TagsBar` | Horizontal scrollable tag filter |
| `OutlineTree` | Hierarchical note structure (if using outline mode) |

- [ ] TASK-N16: Create `NoteCard` component
- [ ] TASK-N17: Create `BacklinksPanel` component
- [ ] TASK-N18: Create `TagsBar` component

### 4.4 Editor Component

| Component | Description |
|-----------|-------------|
| `MarkdownEditor` | Full markdown editor with wikilink support |

**Editor Requirements:**
- Syntax highlighting for markdown, wikilinks, tags
- Autocomplete for `[[` (wikilink) and `#` (tag)
- Live preview mode (split or toggle)
- Keyboard shortcuts (Cmd+B bold, Cmd+K link, etc.)

**Library Options:**
1. **CodeMirror 6** (recommended) - extensible, good for custom syntax
2. **Milkdown** - WYSIWYG markdown, plugin architecture
3. **TipTap** - ProseMirror-based, rich extensions

- [ ] TASK-N19: Evaluate and select editor library
- [ ] TASK-N20: Implement `MarkdownEditor` with wikilink extension
- [ ] TASK-N21: Add autocomplete for wikilinks (search as you type)
- [ ] TASK-N22: Add autocomplete for tags

---

## 5. Notes Screen Layout

### 5.1 Screen Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar]        │ [Main Content]                               │
│                  │                                              │
│ ┌──────────────┐ │ ┌────────────────────────────────────────┐  │
│ │ + New Note   │ │ │ [Breadcrumb: Notes > My Note Title]    │  │
│ ├──────────────┤ │ ├────────────────────────────────────────┤  │
│ │ 🔍 Search    │ │ │                                        │  │
│ ├──────────────┤ │ │   [MarkdownEditor]                     │  │
│ │ [TagsBar]    │ │ │                                        │  │
│ ├──────────────┤ │ │   Full markdown editing area           │  │
│ │              │ │ │   with wikilinks, tags, etc.           │  │
│ │ [NotesList]  │ │ │                                        │  │
│ │              │ │ │                                        │  │
│ │ • Note A     │ │ ├────────────────────────────────────────┤  │
│ │ • Note B     │ │ │ [BacklinksPanel]                       │  │
│ │ • Note C     │ │ │   - Linked from: Note X                │  │
│ │ ...          │ │ │   - Linked from: Note Y                │  │
│ │              │ │ └────────────────────────────────────────┘  │
│ └──────────────┘ │                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Navigation Integration

Add to existing NAV structure in `App.tsx`:

```tsx
const NAV_GROUPS = [
  {
    label: "Notes",  // NEW - First position (foundation layer)
    items: [
      { id: "notes", label: "All Notes", icon: FileText },
      { id: "journal", label: "Journal", icon: BookOpen },
    ]
  },
  {
    label: "Reality",
    items: [
      { id: "cockpit", label: "Case Cockpit" },
      { id: "evidence", label: "Evidence Inbox" },
    ]
  },
  // ... existing groups
];
```

- [ ] TASK-N23: Add Notes group to navigation
- [ ] TASK-N24: Create `NotesView` screen component
- [ ] TASK-N25: Create `JournalView` screen component

### 5.3 View Modes

| Mode | Description |
|------|-------------|
| **List** | Default - scrollable list of note cards |
| **Graph** | Visual node graph (future - P2) |
| **Outline** | Hierarchical tree view (future - P2) |

- [ ] TASK-N26: Implement List view mode
- [ ] TASK-N27: Add view mode toggle (list only for MVP)

---

## 6. Integration Points

### 6.1 With Existing Systems

| System | Integration |
|--------|-------------|
| **Search** (`core/src/search.rs`) | FTS5 already implemented - add notes endpoint |
| **Graph** (`core/src/graph.rs`) | Use existing edge/relationship APIs |
| **Body parsing** (`core/src/body.rs`) | Extend for editor syntax ranges |
| **Trace** (`core/src/trace.rs`) | Wikilink resolution already implemented |

### 6.2 With Strategy Modes

Notes can be **promoted** to strategy types:
- Note → Evidence Item (add evidence fields)
- Note → Strategy Bet (add hypothesis fields)
- Journal → Daynote (automatic, not manual)

- [ ] TASK-N28: Add "Promote to..." action menu
- [ ] TASK-N29: Implement note-to-evidence promotion

---

## 7. Phased Implementation

### Phase 1: Core Notes (MVP) - 2 weeks

| Task | Priority | Estimate |
|------|----------|----------|
| TASK-N03: Backlinks module | P1 | 4h |
| TASK-N05: Backlinks API | P1 | 2h |
| TASK-N08: Notes CRUD API | P1 | 4h |
| TASK-N09: Tauri commands | P1 | 2h |
| TASK-N19: Select editor | P1 | 2h |
| TASK-N20: MarkdownEditor base | P1 | 8h |
| TASK-N23: Nav integration | P1 | 1h |
| TASK-N24: NotesView screen | P1 | 8h |
| TASK-N16: NoteCard | P1 | 2h |
| TASK-N17: BacklinksPanel | P1 | 3h |

**Deliverable:** Basic note creation, editing, viewing with backlinks

### Phase 2: Enhanced Editing - 1 week

| Task | Priority | Estimate |
|------|----------|----------|
| TASK-N21: Wikilink autocomplete | P1 | 4h |
| TASK-N22: Tag autocomplete | P1 | 2h |
| TASK-N12: WikilinkChip | P2 | 2h |
| TASK-N13: TagChip | P2 | 2h |
| TASK-N18: TagsBar | P2 | 3h |
| TASK-N26: List view mode | P2 | 4h |

**Deliverable:** Full editing experience with autocomplete

### Phase 3: Advanced Features - 1 week

| Task | Priority | Estimate |
|------|----------|----------|
| TASK-N06: Clone operations | P2 | 4h |
| TASK-N07: Clone placements | P2 | 2h |
| TASK-N15: CloneIndicator | P2 | 2h |
| TASK-N25: JournalView | P2 | 4h |
| TASK-N28: Promote action | P3 | 4h |
| TASK-N10: WebSocket updates | P3 | 4h |

**Deliverable:** Clone support, journal view, promotion

---

## 8. Dependencies

### External Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| `@codemirror/view` | Editor core | ^6.x |
| `@codemirror/lang-markdown` | Markdown support | ^6.x |
| `@codemirror/autocomplete` | Autocomplete | ^6.x |

### Internal Dependencies

| Module | Status | Depends On |
|--------|--------|------------|
| `core/src/body.rs` | Exists | - |
| `core/src/search.rs` | Exists | - |
| `core/src/backlinks.rs` | **New** | graph, body |
| `server/routes/notes.rs` | **New** | core |
| `ui/components/notes/*` | **New** | shadcn, tokens |

---

## 9. Design Request

Since the Open Design prototype lacks a Notes screen, we need either:

**Option A: Request from Open Design**
- Commission Notes screen design matching existing visual language
- Include: list view, editor view, backlinks panel, tag filter

**Option B: Build from SPEC + Audit Tokens**
- Use existing design tokens from `index.html`
- Follow component patterns from Case Cockpit/Evidence Inbox
- Maintain typography scale, spacing rhythm, color semantics

**Recommendation:** Option B (faster iteration, SPEC is clear)

---

## 10. Acceptance Criteria

### MVP Complete When:

- [ ] User can create a new note from UI
- [ ] User can edit note body with markdown
- [ ] Wikilinks `[[Title]]` resolve to existing notes
- [ ] Tags `#tag` are extracted and displayed
- [ ] Backlinks panel shows all linking notes
- [ ] Full-text search finds notes by content
- [ ] Notes appear in navigation sidebar
- [ ] Notes list shows title, excerpt, date, tags

### Quality Gates:

- [ ] All core tests pass (`cargo test -p strategist-core`)
- [ ] UI tests pass (`pnpm test` in ui/)
- [ ] No accessibility violations (axe-core scan)
- [ ] Keyboard navigation works throughout
- [ ] Mobile responsive (min 375px width)

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Editor library learning curve | Medium | Spike first, document patterns |
| Wikilink resolution performance | Low | Already optimized in core (FTS5) |
| Design inconsistency without spec | Medium | Use existing components as templates |
| Backlink index rebuild cost | Low | Incremental updates, not full rebuild |

---

## Appendix A: SPEC Cross-References

| Requirement | SPEC Section | Implementation |
|-------------|--------------|----------------|
| Notes mode | §3.3 | NotesView, JournalView |
| Node types | §4.1 | `note`, `journal` in NodeType enum |
| Body parsing | §4.3 | `core/src/body.rs` |
| Wikilinks | §4.3 | TraceLink resolution |
| Tags | §4.3 | Extracted from body, indexed |
| Backlinks | §3.3 | BacklinksPanel, backlinks API |
| Clones | INV-CLONE | CloneIndicator, clone operations |
| Search | §12.1 | FTS5 via search.rs |
| Daynotes | §PRD-007 | Automatic, not manual (JournalView read-only) |
