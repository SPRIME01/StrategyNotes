// TASK-E11 — Mention autocomplete. Triggered by `@`. Searches notes by title,
// shows a preview snippet, inserts [[Title]] on selection. Extends the
// wikilink autocomplete (TASK-N21) with the `@` trigger.

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "../../lib/utils";

export interface MentionResult {
  id: string;
  title: string;
  preview?: string;
}

export function MentionAutocomplete({
  query,
  results,
  onSelect,
  onClose,
}: {
  query: string;
  results: MentionResult[];
  onSelect: (m: MentionResult) => void;
  onClose: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? results.filter((r) => r.title.toLowerCase().includes(q)) : results;
    return list.slice(0, 8);
  }, [results, query]);

  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [query]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  // Keyboard nav is handled globally here via a window listener while mounted.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); const m = filtered[active]; if (m) onSelect(m); }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, active, onSelect, onClose]);

  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full left-6 mb-1 z-50 w-72 rounded-lg border border-border-strong bg-surface-3 p-2 text-xs text-muted-foreground shadow-lg">
        No notes match “{query}”.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-6 mb-1 z-50 w-72 overflow-hidden rounded-lg border border-border-strong bg-surface-3 shadow-lg"
    >
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-faint">
        Mention a note
      </div>
      {filtered.map((m, i) => (
        <button
          key={m.id}
          data-idx={i}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect(m)}
          className={cn(
            "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors",
            i === active ? "bg-primary/15" : "hover:bg-surface-4",
          )}
        >
          <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-ink" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-foreground">{m.title || "Untitled"}</div>
            {m.preview && <div className="truncate text-[11px] text-muted-ink">{m.preview}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}
