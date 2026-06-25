// TASK-E10 — Command palette. Triggered by `/` at line start. Fuzzy filter
// over block types; keyboard nav (up/down/enter/esc). On select, the parent
// inserts the command's markdown syntax.
// ponytail: substring filter (case-insensitive). Upgrade to fuzzysort if the
// list grows past ~50 items.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Type, Heading1, Heading2, List, ListOrdered, CheckSquare, Quote, Code, Minus, Lightbulb, AlertTriangle, Box,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface BlockCommand {
  id: string;
  label: string;
  icon: typeof Type;
  shortcut?: string;
  description?: string;
  /** Markdown to insert at the line start (mutually exclusive with `action`). */
  insert?: string;
  /** Action command: run a handler instead of inserting text. */
  action?: "promote-block";
}

export const BLOCK_COMMANDS: BlockCommand[] = [
  { id: "text", label: "Text", icon: Type, description: "Plain text block", insert: "" },
  { id: "heading1", label: "Heading 1", icon: Heading1, shortcut: "# ", insert: "# " },
  { id: "heading2", label: "Heading 2", icon: Heading2, shortcut: "## ", insert: "## " },
  { id: "bullet", label: "Bullet List", icon: List, shortcut: "- ", insert: "- " },
  { id: "numbered", label: "Numbered List", icon: ListOrdered, shortcut: "1. ", insert: "1. " },
  { id: "todo", label: "To-do", icon: CheckSquare, shortcut: "- [ ] ", insert: "- [ ] " },
  { id: "quote", label: "Quote", icon: Quote, shortcut: "> ", insert: "> " },
  { id: "code", label: "Code", icon: Code, shortcut: "```", insert: "```\n\n```" },
  { id: "divider", label: "Divider", icon: Minus, shortcut: "---", insert: "\n---\n" },
  { id: "tip", label: "Tip Callout", icon: Lightbulb, insert: "> [!tip] \n" },
  { id: "warn", label: "Warning Callout", icon: AlertTriangle, insert: "> [!warn] \n" },
  { id: "node", label: "Node (promote block)", icon: Box, description: "Make this block a first-class node (PRD-002)", action: "promote-block" },
];

export function CommandPalette({
  query,
  onSelect,
  onClose,
}: {
  query: string;
  onSelect: (cmd: BlockCommand) => void;
  onClose: () => void;
}) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? BLOCK_COMMANDS.filter((c) => c.label.toLowerCase().includes(q)) : BLOCK_COMMANDS;
    return list.slice(0, 9);
  }, [query]);

  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActive(0); }, [query]);

  // Steal keyboard navigation via a capture-phase window listener so it works
  // even though CodeMirror owns the key stream while mounted.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); const cmd = results[active]; if (cmd) onSelect(cmd); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [results, active, onSelect, onClose]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  if (results.length === 0) {
    return (
      <div className="command-palette w-64 rounded-lg border border-border-strong bg-surface-3 p-3 text-xs text-muted-foreground shadow-lg">
        No matching block.
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="command-palette w-64 overflow-hidden rounded-lg border border-border-strong bg-surface-3 shadow-lg"
    >
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-faint">
        Insert block
      </div>
      {results.map((cmd, i) => (
        <button
          key={cmd.id}
          data-idx={i}
          onMouseEnter={() => setActive(i)}
          onClick={() => onSelect(cmd)}
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
            i === active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-surface-4",
          )}
        >
          <cmd.icon className="size-4 shrink-0 text-muted-ink" />
          <span className="flex-1">{cmd.label}</span>
          {cmd.shortcut && <span className="font-mono text-[10px] text-faint">{cmd.shortcut}</span>}
        </button>
      ))}
    </div>
  );
}
