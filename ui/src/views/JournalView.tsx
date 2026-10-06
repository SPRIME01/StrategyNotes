// Journal screen — a date-keyed editor in the 3-panel layout.
//
// A journal entry is a note whose title is the formatted date (markdown-native,
// INV-PORT). The entry is auto-created when a day is opened; the surface is a
// plain editor with the Proof Burden context panel, same as Notes.

import { useEffect, useMemo, useState } from "react";
import { Sidebar, type ViewId } from "../components/layout/Sidebar";
import { EditorLayout } from "./EditorLayout";
import { EditorHeader } from "../components/editor/EditorHeader";
import { NoteEditor } from "../components/editor/NoteEditor";
import { ContextPanel } from "../components/editor/ContextPanel";
import { JournalDateNav } from "../components/journal/JournalDateNav";
import { formatJournalDate, JOURNAL_TEMPLATE } from "../components/journal/JournalDateNav";
import { useNotes } from "../hooks/useNotes";
import { useToast } from "../components/ui/toast";
import { fmString } from "../lib/node";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function JournalView({ onSelectView }: { onSelectView: (id: ViewId) => void }) {
  const store = useNotes();
  const { notify } = useToast();
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const formatted = formatJournalDate(date);

  const entryDays = useMemo(() => {
    const out: string[] = [];
    const months: Record<string, string> = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    for (const n of store.notes) {
      const title = fmString(n, "title");
      const m = title.match(/^([A-Z][a-z]{2})\s+(\d{1,2})(?:st|nd|rd|th),\s+(\d{4})$/);
      if (m && months[m[1]]) {
        out.push(`${m[3]}-${months[m[1]]}-${m[2].padStart(2, "0")}`);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(title)) {
        out.push(title);
      }
    }
    return out;
  }, [store.notes]);

  useEffect(() => {
    const existing = store.notes.find((n) => fmString(n, "title") === formatted);
    if (existing) {
      store.setActiveId(existing.id);
      return;
    }
    if (store.loading) return;
    void store
      .create(formatted, JOURNAL_TEMPLATE(date))
      .then((n) => {
        if (n) store.setActiveId(n.id);
        else notify("Could not open a journal entry for this day.", "bad");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted, store.loading]);

  const note =
    (store.active && fmString(store.active, "title") === formatted ? store.active : null) ??
    store.notes.find((n) => fmString(n, "title") === formatted) ??
    null;

  return (
    <EditorLayout
      sidebar={
        <Sidebar active="journal" onSelect={onSelectView} onNewPage={() => onSelectView("notes")} />
      }
      header={
        <EditorHeader
          breadcrumb={["Notes", "Journal"]}
          onBreadcrumbClick={(i) => {
            if (i === 0) onSelectView("notes");
          }}
          saveState={store.saveState}
        />
      }
      editor={
        <div className="flex h-full min-w-0 flex-col">
          <div className="shrink-0 border-b bg-surface-1 px-3 py-2 sm:px-6">
            <JournalDateNav
              date={date}
              onDateChange={(d) => setDate(startOfDay(d))}
              entries={entryDays}
            />
          </div>
          {note ? (
            <NoteEditor
              note={note}
              noteTitles={store.noteTitles}
              tags={store.tags}
              onChange={(body) => store.patch(note.id, body)}
              onTitleChange={() => {
                // journal titles are date-derived; keep read-only feel
              }}
              onSave={(body) => store.save(note.id, body)}
              onPromoteBlock={async (title, body) => {
                const n = await store.create(title, body);
                return n?.id ?? null;
              }}
              onOpenNote={() => onSelectView("notes")}
              saveState={store.saveState}
              placeholder="Capture today's thinking…"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="t-row text-muted-foreground">
                {store.loading ? "Loading journal…" : "Opening this day…"}
              </p>
              {store.error && (
                <p className="t-body max-w-[46ch] text-gate-bad">
                  The local server did not respond, so this day could not be opened. That is not the
                  same as there being no entry.
                </p>
              )}
            </div>
          )}
        </div>
      }
      contextPanel={
        <ContextPanel
          node={note}
          onNavigateNote={(id) => {
            store.setActiveId(id);
            onSelectView("notes");
          }}
          onNewNote={() => onSelectView("notes")}
          onLinked={() => store.reload()}
        />
      }
    />
  );
}

export { formatJournalDate };
