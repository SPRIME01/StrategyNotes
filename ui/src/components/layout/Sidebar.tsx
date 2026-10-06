// Global navigation. Owns the view tree; the single source of truth shared by
// the app shell and the editor screens (DESIGN.md §7).
//
// The rail is responsive: full ≥1024, icons 768–1023, overlay drawer <768.
// Active item carries aria-current and THREE cues (bar, fill, colour) so
// location never depends on colour alone.

import type { ReactNode } from "react";
import {
  Ban, BookOpen, CalendarClock, CalendarDays, ClipboardCheck, FileStack, GitBranch,
  LayoutGrid, Package, PlayCircle, Target, TrendingUp, Inbox,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { NewPageButton } from "./NewPageButton";

export type ViewId =
  | "notes" | "journal"
  | "cockpit" | "evidence" | "docs"
  | "bets" | "trace"
  | "work" | "calendar" | "runbook"
  | "daynote" | "vrd"
  | "agent";

export interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    group: "Notes",
    items: [
      { id: "notes", label: "All Notes", icon: FileStack },
      { id: "journal", label: "Journal", icon: CalendarDays },
    ],
  },
  {
    group: "Reality",
    items: [
      { id: "cockpit", label: "Case Cockpit", icon: LayoutGrid },
      { id: "evidence", label: "Evidence Inbox", icon: Inbox },
    ],
  },
  {
    group: "Strategy",
    items: [
      { id: "docs", label: "Docs", icon: BookOpen },
      { id: "bets", label: "Bet Board", icon: Target },
      { id: "trace", label: "Trace Explorer", icon: GitBranch },
    ],
  },
  {
    group: "Execution",
    items: [
      { id: "work", label: "Work / Timebox", icon: Package },
      { id: "calendar", label: "Calendar", icon: CalendarClock },
      { id: "runbook", label: "Execution Runbook", icon: PlayCircle },
    ],
  },
  {
    group: "Learning",
    items: [
      { id: "daynote", label: "Daynote Ledger", icon: CalendarDays },
      { id: "vrd", label: "VRD / Value", icon: TrendingUp },
    ],
  },
  {
    group: "Governance",
    items: [
      { id: "agent", label: "Agent Drafts", icon: ClipboardCheck },
    ],
  },
];

export function Sidebar({
  active,
  onSelect,
  onNewPage,
  footer,
  width = 252,
  /** Icon-only rail for 768–1023px. */
  collapsed = false,
}: {
  active: ViewId;
  onSelect: (id: ViewId) => void;
  onNewPage?: () => void;
  footer?: ReactNode;
  width?: number;
  collapsed?: boolean;
}) {
  return (
    <aside
      className="flex shrink-0 flex-col border-r bg-surface-1"
      style={{ width: collapsed ? 52 : width, "--sidebar-w": `${collapsed ? 52 : width}px` } as React.CSSProperties}
    >
      <div className={cn("flex h-12 shrink-0 items-center", collapsed ? "justify-center px-2" : "gap-2 px-3")}>
        <Mark />
        {!collapsed && (
          <span className="t-row truncate tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            StrategyNotes
          </span>
        )}
      </div>

      <nav
        aria-label="Primary"
        className={cn("scroll-region flex-1", collapsed ? "px-1.5 py-1.5" : "px-2 py-1.5")}
      >
        {NAV.map((g) => (
          <div key={g.group} className={cn(collapsed ? "mb-2" : "mb-3")}>
            {!collapsed && (
              <div className="t-label px-2 pb-1 text-faint">{g.group}</div>
            )}
            {collapsed && g.items[0] && (
              <div className="mb-1.5 h-px bg-border" aria-hidden="true" />
            )}
            <ul className="flex flex-col gap-px">
              {g.items.map((it) => {
                const on = active === it.id;
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      aria-current={on ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(it.id);
                      }}
                      title={collapsed ? it.label : undefined}
                      className={cn(
                        "t-fast relative flex min-w-0 items-center rounded-md text-sm",
                        collapsed ? "h-8 w-8 justify-center" : "gap-2 py-[7px] pr-2 pl-3",
                        on
                          ? "bg-surface-3 font-medium text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:rounded-full before:bg-primary"
                          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                      )}
                    >
                      <it.icon
                        className={cn("size-4 shrink-0", on ? "text-primary" : "text-faint")}
                        aria-hidden="true"
                      />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                      {collapsed && <span className="sr-only">{it.label}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {onNewPage && (
        <div className={cn("border-t", collapsed ? "p-1.5" : "p-2")}>
          {collapsed ? (
            <button
              onClick={onNewPage}
              aria-label="New page"
              title="New page (⌘N)"
              className="t-fast flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-3 hover:text-foreground"
            >
              <FilePlus />
            </button>
          ) : (
            <NewPageButton onClick={onNewPage} />
          )}
        </div>
      )}
      {footer}
    </aside>
  );
}

function Mark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-6 shrink-0 place-items-center rounded-[5px] bg-surface-3 font-mono text-[11px] font-bold text-primary"
    >
      SN
    </span>
  );
}

function FilePlus() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 3v5h5" />
      <path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7z" />
      <path d="M12 12v5M9.5 14.5h5" />
    </svg>
  );
}

/** Small connection indicator. Never silent about whether the backend is up. */
export function ConnectionDot({ ok }: { ok: boolean }) {
  return (
    <span className="flex items-center gap-1.5" title={ok ? "Local server connected" : "Local server not responding"}>
      <span
        aria-hidden="true"
        className={cn("size-[6px] rounded-full", ok ? "bg-gate-ok" : "bg-gate-bad")}
      />
      <span className="t-datum hidden text-muted-ink sm:inline">{ok ? "local" : "offline"}</span>
    </span>
  );
}

export { Ban };
