// Notes screen (TASK-E01..E05 composition). The "All Notes" editor: a note
// list + NoteEditor inside the EditorLayout, with the ContextPanel on the
// right. Replaces the inline NotesView from App.tsx with the proper 3-panel
// editor structure from editor-screen.md.

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Sidebar, type ViewId } from "../components/layout/Sidebar";
import { EditorLayout } from "./EditorLayout";
import { EditorHeader } from "../components/editor/EditorHeader";
import { NoteEditor } from "../components/editor/NoteEditor";
import { ContextPanel } from "../components/editor/ContextPanel";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { fmString, type GraphNode } from "../lib/node";
import { exportOkfBundle, splitConcepts, isReservedOkfName } from "../lib/okf";
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

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "note", label: "Notes" },
  { id: "evidence_item", label: "Evidence" },
  { id: "strategic_claim", label: "Claims" },
  { id: "strategy_bet", label: "Bets" },
  { id: "work_package", label: "Work" },
] as const;

export function NotesScreen({
  onSelectView,
  initialNoteId,
}: {
  onSelectView: (id: ViewId) => void;
  initialNoteId?: string | null;
}) {
  const store = useNotes();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(initialNoteId ?? null);
  const [ftsIds, setFtsIds] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import OKF concept files: parse each → create typed nodes (gate-safe;
  // status stripped server-side). Reserved names (index.md/log.md) skipped.
  const importOkf = async (files: FileList) => {
    let count = 0;
    for (const file of Array.from(files)) {
      if (isReservedOkfName(file.name)) continue;
      const text = await file.text();
      for (const c of splitConcepts(text)) {
        try {
          await api.createNode({ type: c.type, frontmatter_yaml: c.frontmatterYaml, body: c.body });
          count++;
        } catch { /* skip on error, keep going */ }
      }
    }
    await store.reload();
    if (count > 0) alert(`Imported ${count} concept${count > 1 ? "s" : ""} from OKF.`);
  };

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

  // Debounced SQLite FTS5 search query
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setFtsIds(null);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      api.search(q).then((results) => {
        if (!cancelled) {
          setFtsIds(results.map((r) => r.id));
        }
      }).catch(() => {});
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = store.notes;
    if (typeFilter !== "all") {
      list = list.filter((n) => n.type === typeFilter);
    }
    if (q) {
      list = list.filter((n) => {
        if (ftsIds && ftsIds.includes(n.id)) return true;
        const title = fmString(n, "title").toLowerCase();
        const body = (n.body ?? "").toLowerCase();
        return title.includes(q) || body.includes(q);
      });
    }
    return list.slice(0, 100);
  }, [store.notes, query, typeFilter, ftsIds]);

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
                  placeholder="Search notes (FTS5)…"
                  className="w-full rounded-md border bg-surface-2 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-md border px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                title="Import OKF concept files (.md)"
              >
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,text/markdown"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files?.length) void importOkf(e.target.files); e.target.value = ""; }}
              />
            </div>

            {/* type filter bar */}
            <div className="flex flex-wrap gap-1 border-b bg-surface-1 px-2 py-1.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                    typeFilter === f.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
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
                onPromote={(newId, newType) => {
                  if (newType) store.retype(newId, newType);
                  setActiveId(newId);
                  void store.reload();
                }}
                onOpenNote={(t) => {
                  const found = store.notes.find((n) => fmString(n, "title").toLowerCase() === t.toLowerCase() || n.id === t);
                  if (found) setActiveId(found.id);
                }}
                onPromoteBlock={async (title, body) => {
                  const n = await store.create(title, body);
                  return n?.id ?? null;
                }}
                resolveRef={async (id) => {
                  try {
                    const n = await api.getNode(id) as unknown as GraphNode;
                    return { title: fmString(n, "title"), body: n.body ?? "" };
                  } catch { return null; }
                }}
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
          onLinkItem={() => {
            if (active) {
              const link = `[[${fmString(active, "title") || active.id}]]`;
              navigator.clipboard?.writeText(link);
              alert(`Copied link ${link} to clipboard! Paste it into any note.`);
            }
          }}
          onAddToGraph={() => {
            if (active) onSelectView("trace");
          }}
          onShare={async () => {
            if (active) {
              const text = `# ${fmString(active, "title") || "Untitled"}\n\n${active.body ?? ""}`;
              await navigator.clipboard?.writeText(text);
              alert("Note copied to clipboard as Markdown!");
            } else {
              void exportBundle();
            }
          }}
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
      <div className="flex items-center justify-between gap-1.5">
        <span className="truncate text-sm font-medium">{fmString(note, "title") || "Untitled"}</span>
        <div className="flex items-center gap-1 shrink-0">
          {note.type !== "note" && (
            <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted-ink">
              {note.type.replace(/_/g, " ")}
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onDelete(); } }}
            className="text-faint hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </span>
        </div>
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
