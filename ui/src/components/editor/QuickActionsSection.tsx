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
  // Only render an action the host actually wired up. A permanently disabled
  // button is worse than an absent one: it advertises a capability the surface
  // does not have (PRODUCT.md anti-reference: "full of dead controls").
  const actions = [
    { label: "New note", icon: FilePlus2, hint: "⌘N", onClick: onNewNote },
    { label: "Link item", icon: Link2, hint: "@", onClick: onLinkItem },
    { label: "Add to graph", icon: Network, hint: undefined, onClick: onAddToGraph },
    { label: "Share", icon: Share2, hint: undefined, onClick: onShare },
  ].filter((a): a is typeof a & { onClick: () => void } => Boolean(a.onClick));

  if (actions.length === 0) {
    return <p className="t-body text-[12px] text-faint">None on this surface.</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="t-fast flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-surface-3 hover:text-foreground"
        >
          <a.icon className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
          <span>{a.label}</span>
          {a.hint && (
            <kbd className="t-datum ml-auto rounded border border-border px-1 text-[9px] text-faint">
              {a.hint}
            </kbd>
          )}
        </button>
      ))}
    </div>
  );
}
