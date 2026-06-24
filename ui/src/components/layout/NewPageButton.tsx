// TASK-E05 — New page button. Bottom of sidebar. Creates a note and the parent
// navigates to the editor. Cmd+N/Ctrl+N is registered globally in
// useKeyboardShortcuts; this component is just the visible affordance.

import { Plus } from "lucide-react";

export function NewPageButton({ onClick, label = "New Page" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Plus className="size-4" />
      <span>{label}</span>
      <kbd className="ml-auto rounded border border-border-strong px-1 text-[9px] font-mono text-faint">⌘N</kbd>
    </button>
  );
}
