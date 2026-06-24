# Editor Screen Implementation Plan

**Status:** Draft
**Created:** 2026-06-23
**Mockup:** `.tmp/strategy_notes_screens/Editor.png`
**Related:** `notes-feature.md`, `notes-tasks.md`

---

## 1. Overview

The Editor screen is the primary interface for note-taking in StrategyNotes. It provides a full-featured markdown editing experience with contextual linking, quick actions, and reference panels.

### Goals

1. Implement the 3-panel Editor layout (sidebar, editor, context panel)
2. Create a Journal view with date-based navigation
3. Enable rich markdown editing with block-aware formatting
4. Integrate contextual panels for linked items, actions, and concepts
5. Support seamless navigation between notes

### Relationship to Notes Feature

This plan extends `notes-feature.md` by specifying the **Editor screen** in detail. The Notes feature plan covers:
- Data model (nodes, backlinks, clones)
- API endpoints
- Component library

This plan covers:
- Editor screen layout and composition
- Journal-specific UI behavior
- Right-panel context features
- Block-based editing workflow

---

## 2. Screen Layout (from Mockup)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ StrategyNotes                              [Share] [⋮]                         │
├──────────────┬─────────────────────────────────────────────┬───────────────────┤
│              │ Notes / Journal                              │                   │
│  SIDEBAR     │ ────────────────────────────────────────────│   CONTEXT PANEL   │
│              │ Jun 22nd, 2026                    [+] [⋯]   │                   │
│ ┌──────────┐ │                                              │ ┌───────────────┐ │
│ │ Notes    │ │ Welcome to StrategyNotes                    │ │ Linked        │ │
│ │          │ │                                              │ │ ─────────────  │ │
│ │ All Notes│ │ StrategyNotes is a local-first notes        │ │ About this page│ │
│ │ Journal ◀│ │ workspace for strategic work...             │ │ Another item   │ │
│ │ Graph Vw │ │                                              │ │               │ │
│ ├──────────┤ │ Tip: Working with blocks                    │ ├───────────────┤ │
│ │ Reality  │ │ ┌────────────────────────────────────────┐  │ │ Quick Actions │ │
│ │          │ │ │ Type /block to insert a new block.    │  │ │ ─────────────  │ │
│ │ Cockpit  │ │ │ Type @mention to reference a note.    │  │ │ • New note    │ │
│ │ Evidence │ │ └────────────────────────────────────────┘  │ │ • Link item   │ │
│ ├──────────┤ │                                              │ │               │ │
│ │ Strategy │ │ 1. Capture today's thinking                 │ ├───────────────┤ │
│ │          │ │    Use bullets to capture thoughts...       │ │ Core Concepts │ │
│ │ Trace    │ │                                              │ │ ─────────────  │ │
│ │ Bet Board│ │ 2. Link work with intention                 │ │ • Evidence    │ │
│ ├──────────┤ │    Connect work packages to the Work/       │ │ • Strategy    │ │
│ │ Execution│ │    Timebox Planner...                       │ │ • Traceability│ │
│ │          │ │                                              │ │               │ │
│ │ Runbook  │ │ 3. Maintain traceability                    │ │               │ │
│ │ Daynotes │ │    Build traceable links to evidence...     │ │               │ │
│ ├──────────┤ │                                              │ │               │ │
│ │ Learning │ │ 4. Review and decide                        │ │               │ │
│ │ VRD      │ │    Use the graph to see connections...      │ │               │ │
│ ├──────────┤ │                                              │ │               │ │
│ │ Agents   │ │                                              │ │               │ │
│ └──────────┘ │                                              │ └───────────────┘ │
│              │                                              │                   │
│ [+ New Page] │                                              │                   │
└──────────────┴─────────────────────────────────────────────┴───────────────────┘
```

### 2.1 Panel Specifications

| Panel | Width | Behavior |
|-------|-------|----------|
| **Sidebar** | 252px (fixed) | Collapsible, uses `--sidebar-w` token |
| **Editor** | Flexible (fill) | Min 480px for editing comfort |
| **Context Panel** | 280px (fixed) | Collapsible, toggle via toolbar |

---

## 3. Component Breakdown

### 3.1 Sidebar (Enhanced)

The sidebar extends the existing navigation with a Notes section at the top:

```tsx
// ui/src/components/layout/Sidebar.tsx

const NAV_GROUPS = [
  {
    label: "Notes",
    icon: FileText,
    items: [
      { id: "notes", label: "All Notes", icon: Files },
      { id: "journal", label: "Journal", icon: BookOpen, active: true },
      { id: "graph", label: "Graph View", icon: Network },
    ],
  },
  // ... existing groups (Reality, Strategy, Execution, Learning, Governance)
];
```

**New Component:** `NewPageButton`
- Position: Bottom of sidebar
- Action: Creates new note and navigates to editor
- Keyboard: `Cmd+N` / `Ctrl+N`

### 3.2 Editor Header

```tsx
// ui/src/components/editor/EditorHeader.tsx

interface EditorHeaderProps {
  breadcrumb: string[];       // ["Notes", "Journal"]
  date?: Date;                // For journal entries
  onShare?: () => void;
  onMore?: () => void;
}
```

**Elements:**
- Breadcrumb navigation (clickable)
- Date display (formatted: "Jun 22nd, 2026")
- Date picker for journal navigation
- Action buttons: Share, More (⋮)

### 3.3 Main Editor

The editor is the `MarkdownEditor` from `notes-feature.md` with these enhancements:

```tsx
// ui/src/components/editor/NoteEditor.tsx

interface NoteEditorProps {
  note: Note;
  onChange: (content: string) => void;
  onSave: () => void;
  autoSave?: boolean;         // Default: true, 1s debounce
}
```

**Block-Aware Features:**
- `/` command palette for block insertion
- `@` mention autocomplete for note references
- `[[` wikilink autocomplete (from notes-feature.md)
- `#` tag autocomplete (from notes-feature.md)

### 3.4 Context Panel

```tsx
// ui/src/components/editor/ContextPanel.tsx

interface ContextPanelProps {
  noteId: Ulid;
  isOpen: boolean;
  onToggle: () => void;
}
```

**Sections:**

#### Linked (Backlinks)
- Shows all notes linking TO this note
- Click to navigate
- Reuses `BacklinksPanel` from notes-feature.md

#### Quick Actions
- **New note** - Create linked note
- **Link item** - Insert wikilink via picker
- **Add to graph** - Pin to Graph View
- **Share** - Export or share note

#### Core Concepts
- Context-aware concept suggestions
- Links to Evidence, Strategy, Traceability docs
- Onboarding hints for new users

---

## 4. Journal View Specifics

The Journal view is a specialized Editor mode for date-based entries.

### 4.1 Date Navigation

```tsx
// ui/src/components/journal/JournalDateNav.tsx

interface JournalDateNavProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  hasEntries: (date: Date) => boolean;  // For dot indicators
}
```

**Features:**
- Large date display: "Jun 22nd, 2026"
- Left/right arrows for day navigation
- Calendar picker dropdown
- Dot indicators for days with entries

### 4.2 Auto-Creation

When navigating to a date without an entry:
1. Auto-create journal node with date as title
2. Insert welcome template for new users
3. Pre-populate with "Daynote" captures (from automatic logging)

### 4.3 Journal Template

```markdown
# Jun 22nd, 2026

## Today's Focus


## Notes


## Links & References

```

---

## 5. Block System

The mockup shows a block-aware editing paradigm. This extends basic markdown with structured blocks.

### 5.1 Block Types

| Block | Trigger | Purpose |
|-------|---------|---------|
| **Text** | Default | Standard markdown paragraph |
| **Bullet** | `- ` or `* ` | Unordered list |
| **Numbered** | `1. ` | Ordered list |
| **Todo** | `- [ ] ` | Checkbox item |
| **Heading** | `# `, `## `, etc. | Section headers |
| **Quote** | `> ` | Blockquote |
| **Code** | ``` ` ``` | Code fence |
| **Callout** | `/tip`, `/warn` | Info boxes |
| **Divider** | `---` | Horizontal rule |

### 5.2 Command Palette

Triggered by `/` at start of line or in empty block:

```tsx
// ui/src/components/editor/CommandPalette.tsx

const BLOCK_COMMANDS = [
  { id: "text", label: "Text", icon: Type, description: "Plain text block" },
  { id: "heading1", label: "Heading 1", icon: Heading1, shortcut: "# " },
  { id: "heading2", label: "Heading 2", icon: Heading2, shortcut: "## " },
  { id: "bullet", label: "Bullet List", icon: List, shortcut: "- " },
  { id: "numbered", label: "Numbered List", icon: ListOrdered, shortcut: "1. " },
  { id: "todo", label: "To-do", icon: CheckSquare, shortcut: "- [ ] " },
  { id: "quote", label: "Quote", icon: Quote, shortcut: "> " },
  { id: "code", label: "Code", icon: Code, shortcut: "```" },
  { id: "divider", label: "Divider", icon: Minus, shortcut: "---" },
  { id: "tip", label: "Tip Callout", icon: Lightbulb },
  { id: "warn", label: "Warning Callout", icon: AlertTriangle },
];
```

### 5.3 Mention System

Triggered by `@` anywhere in text:

```tsx
// ui/src/components/editor/MentionAutocomplete.tsx

interface MentionResult {
  type: "note" | "user" | "date";
  id: Ulid;
  title: string;
  preview?: string;
}
```

- Searches notes by title
- Shows preview snippet
- Inserts `[[Title]]` wikilink on selection

---

## 6. Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| New note | `⌘N` | `Ctrl+N` |
| Save | `⌘S` | `Ctrl+S` |
| Bold | `⌘B` | `Ctrl+B` |
| Italic | `⌘I` | `Ctrl+I` |
| Link | `⌘K` | `Ctrl+K` |
| Wikilink | `[[` | `[[` |
| Command palette | `/` | `/` |
| Mention | `@` | `@` |
| Tag | `#` | `#` |
| Toggle context panel | `⌘\` | `Ctrl+\` |
| Go to journal | `⌘J` | `Ctrl+J` |
| Search notes | `⌘P` | `Ctrl+P` |

---

## 7. State Management

### 7.1 Editor State

```tsx
// ui/src/stores/editorStore.ts

interface EditorState {
  // Current note
  activeNoteId: Ulid | null;
  content: string;
  isDirty: boolean;
  lastSaved: Date | null;

  // UI state
  contextPanelOpen: boolean;
  commandPaletteOpen: boolean;
  focusPosition: { line: number; column: number };

  // Journal-specific
  journalDate: Date | null;
  isJournalMode: boolean;
}
```

### 7.2 Autosave

```tsx
// Debounced autosave (1 second delay)
const debouncedSave = useDebouncedCallback(
  async (content: string) => {
    await updateNote(activeNoteId, { body: content });
    setLastSaved(new Date());
    setIsDirty(false);
  },
  1000
);

// Trigger on content change
useEffect(() => {
  if (isDirty) {
    debouncedSave(content);
  }
}, [content, isDirty]);
```

---

## 8. Task Checklist

### Phase 1: Core Editor Layout

- [ ] **TASK-E01** Create `EditorLayout` 3-panel container
  - `ui/src/views/EditorLayout.tsx`
  - Sidebar + Editor + Context Panel
  - Responsive collapse behavior

- [ ] **TASK-E02** Create `EditorHeader` component
  - `ui/src/components/editor/EditorHeader.tsx`
  - Breadcrumb, date display, action buttons

- [ ] **TASK-E03** Create `NoteEditor` wrapper component
  - `ui/src/components/editor/NoteEditor.tsx`
  - Integrates MarkdownEditor with note state
  - Autosave logic

- [ ] **TASK-E04** Create `ContextPanel` component
  - `ui/src/components/editor/ContextPanel.tsx`
  - Collapsible, sections for Linked/Actions/Concepts

- [ ] **TASK-E05** Add `NewPageButton` to sidebar
  - `ui/src/components/layout/NewPageButton.tsx`
  - Keyboard shortcut registration

### Phase 2: Journal Features

- [ ] **TASK-E06** Create `JournalDateNav` component
  - `ui/src/components/journal/JournalDateNav.tsx`
  - Date display, navigation arrows, calendar picker

- [ ] **TASK-E07** Create `JournalView` screen
  - `ui/src/views/JournalView.tsx`
  - Integrates EditorLayout with journal-specific behavior

- [ ] **TASK-E08** Implement journal auto-creation
  - Create entry on date navigation
  - Template insertion for new entries

- [ ] **TASK-E09** Add journal keyboard shortcut (`Cmd+J`)
  - Global shortcut registration
  - Navigate to today's journal

### Phase 3: Block System

- [ ] **TASK-E10** Create `CommandPalette` component
  - `ui/src/components/editor/CommandPalette.tsx`
  - Triggered by `/` key
  - Block type selection

- [ ] **TASK-E11** Create `MentionAutocomplete` component
  - `ui/src/components/editor/MentionAutocomplete.tsx`
  - Triggered by `@` key
  - Note search and insertion

- [ ] **TASK-E12** Create `CalloutBlock` component
  - `ui/src/components/editor/CalloutBlock.tsx`
  - Tip, Warning, Info variants
  - Styled containers

### Phase 4: Context Panel Sections

- [ ] **TASK-E13** Implement `LinkedSection` (backlinks)
  - Reuses BacklinksPanel logic
  - Compact list view

- [ ] **TASK-E14** Implement `QuickActionsSection`
  - Action buttons with keyboard hints
  - New note, Link item, Add to graph, Share

- [ ] **TASK-E15** Implement `CoreConceptsSection`
  - Static links for onboarding
  - Contextual based on content

### Phase 5: Polish

- [ ] **TASK-E16** Implement keyboard shortcut system
  - Global shortcut registry
  - Conflict detection
  - Help modal (`?` key)

- [ ] **TASK-E17** Add editor loading/saving states
  - Skeleton while loading
  - Save indicator in header
  - Error recovery

- [ ] **TASK-E18** Mobile responsive layout
  - Collapse sidebar to overlay
  - Hide context panel by default
  - Touch-friendly toolbar

---

## 9. Integration Points

### With notes-feature.md

| This Plan | notes-feature.md | Relationship |
|-----------|------------------|--------------|
| `NoteEditor` | `MarkdownEditor` | NoteEditor wraps MarkdownEditor |
| `ContextPanel.LinkedSection` | `BacklinksPanel` | Reuses backlink logic |
| `MentionAutocomplete` | Wikilink autocomplete (TASK-N21) | Extends with `@` trigger |
| `JournalView` | TASK-N25 | This plan supersedes that task |

### With remediation-plan.md

| Token/Component | Usage in Editor |
|-----------------|-----------------|
| `--color-surface-2` | Editor background |
| `--color-surface-3` | Context panel background |
| `--radius-lg` | Panel corners |
| Typography classes | Editor content styling |

---

## 10. Design Tokens Usage

```css
/* Editor-specific token applications */
.editor-layout {
  background: var(--color-bg);
}

.editor-main {
  background: var(--color-surface-2);  /* Slightly elevated */
  border-radius: var(--radius-lg);
}

.context-panel {
  background: var(--color-surface-1);
  border-left: 1px solid var(--color-border);
}

.editor-header {
  border-bottom: 1px solid var(--color-border);
}

.journal-date {
  font: 300 28px/1.15 var(--font-display);
  letter-spacing: -0.02em;
}

.command-palette {
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.4);
}
```

---

## 11. Acceptance Criteria

### Editor Complete When:

- [ ] 3-panel layout renders correctly
- [ ] Sidebar shows Notes section at top
- [ ] Editor loads and saves notes
- [ ] Autosave works (1s debounce)
- [ ] Context panel shows backlinks
- [ ] Keyboard shortcuts work

### Journal Complete When:

- [ ] Date navigation works
- [ ] Journal entries auto-create
- [ ] Calendar picker shows entries
- [ ] `Cmd+J` navigates to today

### Blocks Complete When:

- [ ] `/` opens command palette
- [ ] `@` triggers mention autocomplete
- [ ] Callout blocks render styled
- [ ] Block insertion works correctly

---

## 12. Dependencies

### From notes-feature.md (must complete first)

- **TASK-N19** Select editor library (CodeMirror 6 recommended)
- **TASK-N20** Implement MarkdownEditor base
- **TASK-N03** Backlinks module
- **TASK-N05** Backlinks API

### From remediation-plan.md (should complete first)

- **TASK-001** Add surface-2/3/4 tokens
- **TASK-002** Add border-strong token
- **TASK-004** Add radius scale tokens

---

## 13. Phased Implementation

### Phase 1: Core Layout (3-4 days)
TASK-E01 through TASK-E05

**Deliverable:** Basic editor with 3-panel layout, note loading/saving

### Phase 2: Journal (2-3 days)
TASK-E06 through TASK-E09

**Deliverable:** Journal view with date navigation, auto-creation

### Phase 3: Blocks (3-4 days)
TASK-E10 through TASK-E12

**Deliverable:** Command palette, mentions, callout blocks

### Phase 4: Context (2 days)
TASK-E13 through TASK-E15

**Deliverable:** Full context panel with all sections

### Phase 5: Polish (2 days)
TASK-E16 through TASK-E18

**Deliverable:** Keyboard shortcuts, loading states, mobile support

---

## Appendix: Mockup Reference

The mockup at `.tmp/strategy_notes_screens/Editor.png` shows:

1. **Header:** "Jun 22nd, 2026" with breadcrumb "Notes / Journal"
2. **Welcome content:** Intro to StrategyNotes
3. **Tip box:** "Working with blocks" - explains `/` and `@` commands
4. **Numbered sections:**
   - Capture today's thinking (bullet points)
   - Link work with intention (wikilinks to Timebox Planner)
   - Maintain traceability (links to Evidence)
   - Review and decide (links to Daynote Ledger)
5. **Right panel:** Linked items, Quick Actions, Core Concepts
