// TASK-E13 — Linked section. Backlinks to the current note (reuses the
// backlinks API, TASK-N05). Compact list: title + snippet. Click navigates.

import { useEffect, useState } from "react";
import { api } from "../../api";

export interface Backlink {
  id: string;
  title: string;
  snippet?: string;
}

export function LinkedSection({
  noteId,
  onNavigate,
}: {
  noteId: string;
  onNavigate?: (id: string) => void;
}) {
  const [links, setLinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getBacklinks(noteId)
      .then(async (ids) => {
        const resolved = await Promise.all(
          ids.slice(0, 12).map(async (id) => {
            try {
              const n = await api.getNode(id);
              const body = typeof n.body === "string" ? n.body : "";
              return {
                id,
                title: String((n as Record<string, unknown>).title ?? "Untitled"),
                snippet: body.slice(0, 60),
              } satisfies Backlink;
            } catch {
              return { id, title: id.slice(0, 12), snippet: "" } satisfies Backlink;
            }
          }),
        );
        if (!cancelled) setLinks(resolved);
      })
      .catch(() => { if (!cancelled) setLinks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [noteId]);

  if (loading) return <p className="text-xs text-muted-ink">Loading…</p>;
  if (links.length === 0) {
    return <p className="text-xs text-muted-foreground">No notes link here yet.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {links.map((bl) => (
        <button
          key={bl.id}
          onClick={() => onNavigate?.(bl.id)}
          className="rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
        >
          <div className="truncate text-xs font-medium text-foreground">{bl.title || "Untitled"}</div>
          {bl.snippet && <div className="truncate text-[11px] text-muted-ink">{bl.snippet}</div>}
        </button>
      ))}
    </div>
  );
}
