// Notes screen — the 3-panel editor (DESIGN.md §9): list rail · editor · context.
//
// What changed and why:
//   · the list was nine bordered CARDS; it is now a hairline-separated row list
//   · the delete control was a role="button" INSIDE a <button>; they are siblings now
//   · four "Untitled / Empty note" rows gave no way to tell empty from failed
//   · copy feedback used alert(); it is a toast now
//   · the ULID under the title is gone in favour of a human-readable type + status

import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, Search, Trash2 } from "lucide-react";
import { Sidebar, type ViewId } from "../components/layout/Sidebar";
import { EditorLayout } from "./EditorLayout";
import { EditorHeader } from "../components/editor/EditorHeader";
import { NoteEditor } from "../components/editor/NoteEditor";
import { ContextPanel } from "../components/editor/ContextPanel";
import { Button } from "../components/ui/button";
import { FilterPill, Input } from "../components/ui/field";
import { Surface } from "../components/ui/surface";
import { EmptyBlock } from "../components/ui/async";
import { useToast } from "../components/ui/toast";
import { ConfirmButton, NodeTypeChip, StatusChip, nodeTypeLabel } from "../atoms";
import { cn } from "../lib/utils";
import { fmString, nodePreview, type GraphNode } from "../lib/node";
import { exportOkfBundle, splitConcepts, isReservedOkfName } from "../lib/okf";
import { api } from "../api";
import { useNotes } from "../hooks/useNotes";
import type { MentionResult } from "../components/editor/MentionAutocomplete";

type Note = GraphNode;

/** Server errors reach the client as `400 …` or `contract violation: …`. Those
 *  prefixes are log detail; a toast is read by a person deciding whether to
 *  trust a destructive action, so they get stripped here. */
function readableError(raw: string): string {
  return raw
    .replace(/^\d{3}\s+/, "")
    .replace(/^(?:contract violation|gate blocked|node not found|invalid node id):\s*/i, "");
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
  onCreated,
}: {
  onSelectView: (id: ViewId) => void;
  initialNoteId?: string | null;
  onCreated?: () => void;
}) {
  const store = useNotes();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(initialNoteId ?? null);
  const [ftsIds, setFtsIds] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importOkf = async (files: FileList) => {
    let count = 0;
    let failed = 0;
    for (const file of Array.from(files)) {
      if (isReservedOkfName(file.name)) continue;
      const text = await file.text();
      for (const c of splitConcepts(text)) {
        try {
          await api.createNode({
            type: c.type,
            frontmatter_yaml: c.frontmatterYaml,
            body: c.body,
          });
          count++;
        } catch {
          failed++;
        }
      }
    }
    await store.reload();
    notify(
      failed > 0
        ? `Imported ${count} concept${count === 1 ? "" : "s"}; ${failed} could not be imported.`
        : `Imported ${count} concept${count === 1 ? "" : "s"}.`,
      failed > 0 ? "bad" : "ok",
    );
  };

  const active = useMemo(
    () => store.notes.find((n) => n.id === activeId) ?? null,
    [store.notes, activeId],
  );

  useEffect(() => {
    if (!activeId && store.notes.length > 0 && !store.loading) setActiveId(store.notes[0].id);
  }, [store.notes, store.loading, activeId]);

  useEffect(() => {
    if (!initialNoteId) return;
    setActiveId(initialNoteId);
    store.reload();
    onCreated?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNoteId]);

  // Debounced full-text search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setFtsIds(null);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      api
        .search(q)
        .then((results) => {
          if (!cancelled) setFtsIds(results.map((r) => r.id));
        })
        .catch(() => {
          if (!cancelled) setFtsIds([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of store.notes) m.set(n.type, (m.get(n.type) ?? 0) + 1);
    return m;
  }, [store.notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = store.notes;
    if (typeFilter !== "all") list = list.filter((n) => n.type === typeFilter);
    if (q) {
      list = list.filter((n) => {
        if (ftsIds && ftsIds.includes(n.id)) return true;
        return (
          fmString(n, "title").toLowerCase().includes(q) ||
          (n.body ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list.slice(0, 100);
  }, [store.notes, query, typeFilter, ftsIds]);

  const mentionCandidates: MentionResult[] = useMemo(
    () =>
      store.notes.slice(0, 50).map((n) => ({
        id: n.id,
        title: fmString(n, "title") || nodeTypeLabel(n.type),
        preview: (n.body ?? "").slice(0, 60),
      })),
    [store.notes],
  );

  const select = (id: string) => setActiveId(id);
  const create = async () => {
    const n = await store.create();
    if (n) setActiveId(n.id);
    else notify("Could not create a note. The local server did not respond.", "bad");
  };

  const countsFor = (id: string) =>
    id === "all" ? store.notes.length : (counts.get(id) ?? 0);

  return (
    <EditorLayout
      sidebar={
        <Sidebar active="notes" onSelect={onSelectView} onNewPage={create} />
      }
      listRail={
        <Surface tone={1} className="flex h-full min-h-0 w-[300px] flex-col border-r">
          <div className="flex shrink-0 items-center gap-2 border-b p-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search notes"
                placeholder="Search notes…"
                className="h-7 py-0 pl-7 pr-2 text-[13px]"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              title="Import OKF concept files (.md)"
            >
              <FileUp className="size-3.5" aria-hidden="true" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,text/markdown"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void importOkf(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex shrink-0 flex-wrap gap-1 border-b px-2 py-1.5">
            {TYPE_FILTERS.map((f) => (
              <FilterPill
                key={f.id}
                active={typeFilter === f.id}
                count={countsFor(f.id)}
                onClick={() => setTypeFilter(f.id)}
              >
                {f.label}
              </FilterPill>
            ))}
          </div>

          <div className="scroll-region min-h-0 flex-1">
            {store.loading ? (
              <div className="flex flex-col gap-1.5 p-2" aria-busy="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-12 rounded-md bg-surface-2" aria-hidden="true" />
                ))}
                <span className="sr-only">Loading notes</span>
              </div>
            ) : store.error ? (
              <div className="p-2">
                <EmptyBlock
                  noun="notes"
                  hint="The local server did not respond, so this is unread rather than empty. Start the server and retry."
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-2">
                <EmptyBlock
                  noun={query ? `notes matching “${query}”` : typeFilter === "all" ? "notes" : typeFilter.replace(/_/g, " ")}
                  hint={
                    query || typeFilter !== "all"
                      ? "Clear the search or the type filter to see the rest."
                      : "Press ⌘N to capture one. Capture stays frictionless: nothing is deleted when you re-type it."
                  }
                  action={
                    <Button size="sm" onClick={create}>
                      New note
                    </Button>
                  }
                />
              </div>
            ) : (
              filtered.map((n) => (
                <NoteRow
                  key={n.id}
                  note={n}
                  active={n.id === activeId}
                  onSelect={() => select(n.id)}
                  onDelete={async () => {
                    const title = fmString(n, "title") || "Untitled note";
                    const failure = await store.remove(n.id);
                    // The server refuses deletes that would orphan a reference
                    // (INV-DUR). Reporting success here would be the one answer
                    // a user must never get for a destructive action.
                    if (failure) {
                      notify(readableError(failure), "bad");
                      return;
                    }
                    if (activeId === n.id) setActiveId(null);
                    notify(`Deleted “${title}”.`, "info");
                  }}
                />
              ))
            )}
          </div>
        </Surface>
      }
      header={
        <EditorHeader
          breadcrumb={["Notes", active ? fmString(active, "title") || "Untitled" : "All Notes"]}
          onBreadcrumbClick={(i) => {
            if (i === 0) onSelectView("notes");
          }}
          saveState={store.saveState}
          onShare={() => void exportBundle(notify)}
        />
      }
      editor={
        <div className="flex h-full min-w-0">
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
                  const found = store.notes.find(
                    (n) =>
                      fmString(n, "title").toLowerCase() === t.toLowerCase() || n.id === t,
                  );
                  if (found) setActiveId(found.id);
                  else notify(`No note named “${t}”.`, "info");
                }}
                onPromoteBlock={async (title, body) => {
                  const n = await store.create(title, body);
                  return n?.id ?? null;
                }}
                resolveRef={async (id) => {
                  try {
                    const n = (await api.getNode(id)) as unknown as GraphNode;
                    return { title: fmString(n, "title"), body: n.body ?? "" };
                  } catch {
                    return null;
                  }
                }}
                searchNotes={async (q) =>
                  mentionCandidates.filter((m) =>
                    m.title.toLowerCase().includes(q.toLowerCase()),
                  )
                }
                saveState={store.saveState}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="t-row text-muted-foreground">No note open</p>
                <p className="t-body max-w-[42ch] text-muted-ink">
                  Pick one from the list, or press ⌘N to start capturing. The note is the atom here;
                  strategy is what you build on top of it.
                </p>
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
            if (!active) return;
            const link = `[[${fmString(active, "title") || active.id}]]`;
            navigator.clipboard
              ?.writeText(link)
              .then(() => notify(`Copied ${link}. Paste it into any note.`, "ok"))
              .catch(() => notify("The clipboard is not available in this context.", "bad"));
          }}
          onAddToGraph={() => onSelectView("trace")}
          onShare={async () => {
            if (!active) return void exportBundle(notify);
            const text = `# ${fmString(active, "title") || "Untitled"}\n\n${active.body ?? ""}`;
            try {
              await navigator.clipboard?.writeText(text);
              notify("Note copied to the clipboard as Markdown.", "ok");
            } catch {
              notify("The clipboard is not available in this context.", "bad");
            }
          }}
          onLinked={() => store.reload()}
        />
      }
    />
  );
}

/**
 * One note in the list. The delete control is a SIBLING of the select button,
 * not a role="button" nested inside it (a screen reader announced one button
 * containing another, and keyboard focus entered a phantom control).
 */
function NoteRow({
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
  const rawTitle = fmString(note, "title");
  const status = fmString(note, "status");
  const preview = nodePreview(note, 110);
  const typed = note.type !== "note";

  // An untitled typed node is not an "Untitled note": it is an evidence item with
  // nothing written yet. Naming it after its type keeps the row legible and keeps
  // the fact visible without making it look like a failure to load.
  const title = rawTitle || (typed ? `Untitled ${nodeTypeLabel(note.type)}` : "Untitled");
  const secondary = preview
    ? preview
    : typed
      ? `No ${note.type.replace(/_/g, " ")} recorded yet`
      : "Empty note";

  return (
    <div
      className={cn(
        "group relative flex items-start border-b border-border/60 transition-colors",
        active ? "bg-surface-2" : "hover:bg-surface-2",
      )}
    >
      {active && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px] bg-primary" />
      )}
      <button
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="min-w-0 flex-1 px-3 py-2 text-left"
      >
        <span
          className={cn(
            "t-row block truncate",
            !rawTitle && "text-muted-foreground",
          )}
          title={title}
        >
          {title}
        </span>
        <p className="t-body mt-0.5 line-clamp-2 break-any text-[12px] text-muted-ink">
          {secondary}
        </p>
        {(typed || status) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {typed && <NodeTypeChip type={note.type} />}
            {status && <StatusChip status={status} />}
          </div>
        )}
      </button>
      <ConfirmButton
        size="icon-sm"
        // Hover/focus reveal keeps the rail quiet; arming keeps the pointer over
        // it, so the confirm step is never invisible.
        className="mr-1.5 mt-1.5 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
        label="Delete"
        ariaLabel={`Delete ${title}`}
        onConfirm={onDelete}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </ConfirmButton>
    </div>
  );
}

async function exportBundle(
  notify: (m: string, t?: "info" | "ok" | "bad") => void,
) {
  const types = [
    "note", "evidence_item", "strategic_claim", "strategy_bet",
    "work_package", "timebox", "value_claim", "strategy_case",
  ];
  const nodes: GraphNode[] = [];
  for (const ty of types) {
    try {
      const ids = await api.nodesByType(ty);
      const resolved = await Promise.all(
        ids.map((id) => api.getNode(id).then((n) => n as unknown as GraphNode).catch(() => null)),
      );
      nodes.push(...resolved.filter((n): n is GraphNode => n !== null));
    } catch {
      notify(`Could not read ${ty.replace(/_/g, " ")}. The bundle is incomplete.`, "bad");
    }
  }
  let daynote = "";
  try {
    daynote = (await api.daynote(new Date().toISOString().slice(0, 10))).content || "";
  } catch {
    // the daynote is an optional part of the bundle
  }
  const bundle = exportOkfBundle(nodes, daynote, "StrategyNotes export");
  const blob = new Blob([bundle], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `strategynotes-${new Date().toISOString().slice(0, 10)}.okf.md`;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${nodes.length} nodes as a portable markdown bundle.`, "ok");
}

