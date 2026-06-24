// TASK-E14 — Quick actions. Buttons for new note, link item, add to graph,
// share. Each shows a keyboard hint where applicable.

import { FilePlus2, Link2, Share2, Network } from "lucide-react";

export function QuickActionsSection({
  onNewNote,
  onLinkItem,
  onAddToGraph,
  onShare,
}: {
  onNewNote?: () => void;
  onLinkItem?: () => void;
  onAddToGraph?: () => void;
  onShare?: () => void;
}) {
  const actions = [
    { label: "New note", icon: FilePlus2, hint: "⌘N", onClick: onNewNote },
    { label: "Link item", icon: Link2, hint: "@", onClick: onLinkItem },
    { label: "Add to graph", icon: Network, hint: undefined, onClick: onAddToGraph },
    { label: "Share", icon: Share2, hint: undefined, onClick: onShare },
  ];
  return (
    <div className="flex flex-col gap-0.5">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          disabled={!a.onClick}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors enabled:hover:bg-surface-2 enabled:hover:text-foreground disabled:opacity-40"
        >
          <a.icon className="size-3.5 text-muted-ink" />
          <span>{a.label}</span>
          {a.hint && <kbd className="ml-auto rounded border border-border px-1 text-[9px] font-mono text-faint">{a.hint}</kbd>}
        </button>
      ))}
    </div>
  );
}
