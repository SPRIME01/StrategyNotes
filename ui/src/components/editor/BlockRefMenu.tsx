// Block reference menu — offered when the user types `((` to reference a block
// in the current note. Mirrors MentionAutocomplete's keyboard handling
// (capture-phase window listener so CodeMirror's key stream is respected).
// On select, the block is promoted to a node and transcluded (see NoteEditor).

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { BlockItem } from "../../editor/block";

export function BlockRefMenu({
  query,
  blocks,
  onSelect,
  onClose,
}: {
  query: string;
  blocks: BlockItem[];
  onSelect: (blk: BlockItem) => void;
  onClose: () => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? blocks.filter((b) => b.content.toLowerCase().includes(q)) : blocks;
    return list.slice(0, 8);
  }, [blocks, query]);

  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [query]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); const b = filtered[active]; if (b) onSelect(b); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, active, onSelect, onClose]);

  if (filtered.length === 0) {
    return (
      <div className="w-80 rounded-lg border border-border-strong bg-surface-3 p-2 text-xs text-muted-foreground shadow-lg">
        No blocks to reference.
      </div>
    );
  }

  return (
    <div ref={ref} className="w-80 overflow-hidden rounded-lg border border-border-strong bg-surface-3 shadow-lg">
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-faint">
        Reference a block → node
      </div>
      {filtered.map((blk, i) => (
        <button
          key={blk.start}
          data-idx={i}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect(blk)}
          className={cn(
            "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors",
            i === active ? "bg-primary/15" : "hover:bg-surface-4",
          )}
        >
          <CornerDownRight className="mt-0.5 size-3 shrink-0 text-muted-ink" />
          <span className="truncate text-sm text-foreground">{blk.content}</span>
        </button>
      ))}
    </div>
  );
}
