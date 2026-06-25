// TASK-E07 / E08 — Journal screen. A date-based editor: navigate days, auto-
// create a journal note (type "note", title = formatted date) when none exists
// for the chosen day, and edit it in the full EditorLayout.
//
// Supersedes TASK-N25 (the activity-log JournalView in App.tsx).
//
// ponytail: journal entries are notes whose title is the formatted date —
// portable, markdown-native (INV-PORT). A dedicated "journal" node type could
// be added later; nothing here precludes it.

import { useEffect, useMemo, useState } from "react";
import { Sidebar, type ViewId } from "../components/layout/Sidebar";
import { EditorLayout } from "./EditorLayout";
import { EditorHeader } from "../components/editor/EditorHeader";
import { NoteEditor } from "../components/editor/NoteEditor";
import { ContextPanel } from "../components/editor/ContextPanel";
import { JournalDateNav } from "../components/journal/JournalDateNav";
import { formatJournalDate, JOURNAL_TEMPLATE } from "../components/journal/JournalDateNav";
import { useNotes } from "../hooks/useNotes";
import { fmString } from "../lib/node";

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

export function JournalView({ onSelectView }: { onSelectView: (id: ViewId) => void }) {
  const store = useNotes();
  const [date, setDate] = useState(() => startOfDay(new Date()));

  const formatted = formatJournalDate(date);

  // Days with entries (for dot indicators): notes whose title parses as a date.
  const entryDays = useMemo(() => {
    const out: string[] = [];
    for (const n of store.notes) {
      const title = fmString(n, "title");
      // Match our ordinal-date format loosely.
      const m = title.match(/^[A-Z][a-z]{2} \d{1,2}(st|nd|rd|th), \d{4}$/);
      if (m) out.push(title);
    }
    return out;
  }, [store.notes]);

  // Find or auto-create the journal note for the current date (E08).
  useEffect(() => {
    const existing = store.notes.find((n) => fmString(n, "title") === formatted);
    if (existing) { store.setActiveId(existing.id); return; }
    // Auto-create once the initial load completes (avoid clobbering on first paint).
    if (store.loading) return;
    store.create(formatted, JOURNAL_TEMPLATE(date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted, store.loading]);

  const note = store.active && fmString(store.active, "title") === formatted
    ? store.active
    : store.notes.find((n) => fmString(n, "title") === formatted) ?? null;

  return (
    <EditorLayout
      sidebar={<Sidebar active="journal" onSelect={onSelectView} onNewPage={() => onSelectView("notes")} />}
      header={
        <EditorHeader
          breadcrumb={["Notes", "Journal"]}
          onBreadcrumbClick={(i) => { if (i === 0) onSelectView("notes"); }}
          saveState={store.saveState}
        />
      }
      editor={
        <div className="flex h-full flex-col">
          <div className="border-b bg-surface-2 px-6 py-3">
            <JournalDateNav date={date} onDateChange={(d) => setDate(startOfDay(d))} entries={entryDays} />
          </div>
          {note ? (
            <NoteEditor
              note={note}
              noteTitles={store.noteTitles}
              tags={store.tags}
              onChange={(body) => store.patch(note.id, body)}
              onTitleChange={() => {/* journal titles are date-derived; keep read-only feel */}}
              onSave={(body) => store.save(note.id, body)}
              onPromoteBlock={async (title, body) => { const n = await store.create(title, body); return n?.id ?? null; }}
              onOpenNote={() => onSelectView("notes")}
              saveState={store.saveState}
              placeholder="Capture today's thinking…"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              {store.loading ? "Loading…" : "Creating journal entry…"}
            </div>
          )}
        </div>
      }
      contextPanel={
        <ContextPanel
          node={note}
          onNavigateNote={(id) => { store.setActiveId(id); onSelectView("notes"); }}
          onNewNote={() => onSelectView("notes")}
          onLinked={() => store.reload()}
        />
      }
    />
  );
}

export { formatJournalDate };
