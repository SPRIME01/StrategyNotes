// Notes screen (TASK-E01..E05 composition). The "All Notes" editor: a note
// list + NoteEditor inside the EditorLayout, with the ContextPanel on the
// right. Replaces the inline NotesView from App.tsx with the proper 3-panel
// editor structure from editor-screen.md.

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Sidebar, type ViewId } from "../components/layout/Sidebar";
import { EditorLayout } from "./EditorLayout";
import { EditorHeader } from "../components/editor/EditorHeader";
import { NoteEditor } from "../components/editor/NoteEditor";
import { ContextPanel } from "../components/editor/ContextPanel";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { fmString, type GraphNode } from "../lib/node";
import { exportOkfBundle } from "../lib/okf";
import { api } from "../api";
import { useNotes } from "../hooks/useNotes";
import type { MentionResult } from "../components/editor/MentionAutocomplete";

type Note = GraphNode;

// Export the workspace as an OKF bundle (concepts + index + log). Gathers the
// main strategy types + today's daynote and triggers a download.
async function exportBundle() {
  const types = ["note", "evidence_item", "strategic_claim", "strategy_bet", "work_package", "timebox", "value_claim", "strategy_case"];
  const nodes: GraphNode[] = [];
  for (const ty of types) {
    try {
      const ids = await api.nodesByType(ty);
      const resolved = await Promise.all(ids.map((id) => api.getNode(id).then((n) => n as unknown as GraphNode).catch(() => null)));
      nodes.push(...resolved.filter((n): n is GraphNode => n !== null));
    } catch { /* skip type */ }
  }
  let daynote = "";
  try { daynote = (await api.daynote(new Date().toISOString().slice(0, 10))).content || ""; } catch {}
  const bundle = exportOkfBundle(nodes, daynote, "StrategyNotes export");
  const blob = new Blob([bundle], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `strategynotes-${new Date().toISOString().slice(0, 10)}.okf.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NotesScreen({
  onSelectView,
  initialNoteId,
}: {
  onSelectView: (id: ViewId) => void;
  initialNoteId?: string | null;
}) {
  const store = useNotes();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(initialNoteId ?? null);

  const active = useMemo(
    () => store.notes.find((n) => n.id === activeId) ?? null,
    [store.notes, activeId],
  );

  // Select an initial note once loaded, if none chosen.
  useEffect(() => {
    if (!activeId && store.notes.length > 0 && !store.loading) setActiveId(store.notes[0].id);
  }, [store.notes, store.loading, activeId]);

  // React to Cmd+N creating a note from anywhere: reload + select the new id.
  useEffect(() => {
    if (!initialNoteId) return;
    setActiveId(initialNoteId);
    store.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNoteId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (n: GraphNode) => {
      const title = fmString(n, "title").toLowerCase();
      const body = (n.body ?? "").toLowerCase();
      return title.includes(q) || body.includes(q);
    };
    const list = q ? store.notes.filter(match) : store.notes;
    return list.slice(0, 100);
  }, [store.notes, query]);

  const mentionCandidates: MentionResult[] = useMemo(
    () => store.notes.slice(0, 50).map((n) => ({ id: n.id, title: fmString(n, "title"), preview: (n.body ?? "").slice(0, 60) })),
    [store.notes],
  );

  const select = (id: string) => setActiveId(id);
  const create = async () => { const n = await store.create(); if (n) setActiveId(n.id); };

  return (
    <EditorLayout
      sidebar={
        <Sidebar
          active="notes"
          onSelect={onSelectView}
          onNewPage={create}
        />
      }
      header={
        <EditorHeader
          breadcrumb={["Notes", active ? fmString(active, "title") || "All Notes" : "All Notes"]}
          onBreadcrumbClick={(i) => { if (i === 0) onSelectView("notes"); }}
          saveState={store.saveState}
          onShare={exportBundle}
        />
      }
      editor={
        <div className="flex h-full">
          {/* note list */}
          <div className="flex w-[300px] shrink-0 flex-col border-r bg-surface-1">
            <div className="flex items-center gap-2 border-b p-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes…"
                  className="w-full rounded-md border bg-surface-2 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
              {store.loading && <p className="px-2 py-3 text-sm text-muted-ink">Loading…</p>}
              {!store.loading && filtered.length === 0 && (
                <p className="px-2 py-3 text-sm text-muted-foreground">No notes. Create one or start the backend.</p>
              )}
              {filtered.map((n) => (
                <NoteListCard
                  key={n.id}
                  note={n}
                  active={n.id === activeId}
                  onSelect={() => select(n.id)}
                  onDelete={() => store.remove(n.id)}
                />
              ))}
            </div>
          </div>

          {/* editor */}
          <div className="min-w-0 flex-1">
            {active ? (
              <NoteEditor
                note={active}
                noteTitles={store.noteTitles}
                tags={store.tags}
                mentionCandidates={mentionCandidates}
                onChange={(body) => store.patch(active.id, body)}
                onTitleChange={(title) => store.patch(active.id, active.body ?? "", title)}
                onSave={(body) => store.save(active.id, body)}
                onPromote={(newId) => { setActiveId(newId); store.reload(); }}
                searchNotes={async (q) =>
                  mentionCandidates.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()))
                }
                saveState={store.saveState}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a note or press ⌘N.
              </div>
            )}
          </div>
        </div>
      }
      contextPanel={
        <ContextPanel
          node={active}
          onNavigateNote={select}
          onNewNote={create}
          onLinked={() => store.reload()}
        />
      }
    />
  );
}

function NoteListCard({
  note,
  active,
  onSelect,
  onDelete,
}: {
  note: Note;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const body = note.body ?? "";
  const tags = Array.from(body.matchAll(/#([\w-]+)/g)).map((m) => m[1]);
  const wikilinks = Array.from(body.matchAll(/\[\[([^\]]+)\]\]/g)).map((m) => m[1]);
  return (
    <button
      onClick={onSelect}
      className={cn(
        "mb-1 block w-full rounded-md border p-2 text-left transition-colors",
        active ? "border-primary/50 bg-surface-2" : "border-transparent hover:bg-surface-2",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{fmString(note, "title") || "Untitled"}</span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onDelete(); } }}
          className="shrink-0 text-faint hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </span>
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-ink">{(note.body ?? "").slice(0, 80) || "Empty note"}</p>
      {(tags.length > 0 || wikilinks.length > 0) && (
        <div className="mt-1 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[9px]">#{t}</Badge>)}
          {wikilinks.slice(0, 2).map((w) => <Badge key={w} variant="outline" className="text-[9px] text-primary">[[{w}]]</Badge>)}
        </div>
      )}
    </button>
  );
}
