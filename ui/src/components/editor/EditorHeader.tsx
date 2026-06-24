// TASK-E02 — Editor header: breadcrumb (clickable), optional date display,
// save indicator, Share / More actions. Pure presentational; the parent owns
// navigation + action handlers.

import { ChevronRight, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface EditorHeaderProps {
  breadcrumb: string[];
  onBreadcrumbClick?: (index: number) => void;
  date?: Date;
  saveState?: SaveState;
  onShare?: () => void;
  onMore?: () => void;
}

export function EditorHeader({
  breadcrumb,
  onBreadcrumbClick,
  date,
  saveState = "idle",
  onShare,
  onMore,
}: EditorHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm">
      {/* breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1 text-muted-foreground">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3 shrink-0 text-faint" />}
            <button
              onClick={() => onBreadcrumbClick?.(i)}
              disabled={!onBreadcrumbClick}
              className={cn(
                "truncate rounded px-1",
                i === breadcrumb.length - 1
                  ? "font-medium text-foreground"
                  : "hover:text-foreground",
                onBreadcrumbClick ? "cursor-pointer" : "cursor-default",
              )}
            >
              {crumb}
            </button>
          </span>
        ))}
      </nav>

      {date && (
        <span className="shrink-0 text-muted-ink" style={{ fontFamily: "var(--font-display)" }}>
          {formatJournalDate(date)}
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <SaveIndicator state={saveState} />
        {onShare && (
          <button onClick={onShare} className="rounded-md border px-2 py-1 text-xs hover:bg-secondary" title="Share">
            <Share2 className="size-3.5" />
          </button>
        )}
        {onMore && (
          <button onClick={onMore} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" title="More">
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const map: Record<SaveState, { text: string; cls: string }> = {
    idle: { text: "", cls: "" },
    saving: { text: "Saving…", cls: "text-muted-ink" },
    saved: { text: "Saved", cls: "text-gate-ok" },
    error: { text: "Save failed", cls: "text-gate-bad" },
  };
  const { text, cls } = map[state];
  return <span className={cn("text-[11px] font-mono", cls)}>{text}</span>;
}

// Shared date formatter for journal display. Ordinal day, abbreviated month.
// ponytail: hand-rolled — no date-fns dependency for one format.
export function formatJournalDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate();
  const ord = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${ord}, ${d.getFullYear()}`;
}
