// Global navigation sidebar. Extracted from App.tsx so EditorLayout can compose
// it as its first panel without duplicating the nav tree. Owns the NAV data.

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { NewPageButton } from "./NewPageButton";

export type ViewId =
  | "notes" | "journal"
  | "cockpit" | "evidence" | "erd"
  | "bets" | "trace"
  | "work" | "runbook"
  | "daynote" | "vrd"
  | "agent";

export interface NavDef {
  group: string;
  items: { id: ViewId; label: string }[];
}

export const NAV: NavDef[] = [
  { group: "Notes", items: [{ id: "notes", label: "All Notes" }, { id: "journal", label: "Journal" }] },
  { group: "Reality", items: [{ id: "cockpit", label: "Case Cockpit" }, { id: "evidence", label: "Evidence Inbox" }, { id: "erd", label: "ERD (generated)" }] },
  { group: "Strategy", items: [{ id: "bets", label: "Bet Board" }, { id: "trace", label: "Trace Explorer" }] },
  { group: "Execution", items: [{ id: "work", label: "Work / Timebox" }, { id: "runbook", label: "Execution Runbook" }] },
  { group: "Learning", items: [{ id: "daynote", label: "Daynote Ledger" }, { id: "vrd", label: "VRD / Value" }] },
  { group: "Governance", items: [{ id: "agent", label: "Agent Drafts" }] },
];

export function Sidebar({
  active,
  onSelect,
  onNewPage,
  footer,
  width = 252,
}: {
  active: ViewId;
  onSelect: (id: ViewId) => void;
  onNewPage?: () => void;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <aside
      className="flex shrink-0 flex-col border-r bg-surface-1"
      style={{ width, "--sidebar-w": `${width}px` } as React.CSSProperties}
    >
      <div className="flex h-12 items-center gap-2 px-4">
        <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          StrategyNotes
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {NAV.map((g) => (
          <div key={g.group} className="mb-3">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
              {g.group}
            </div>
            {g.items.map((it) => (
              <a
                key={it.id}
                href={`#${it.id}`}
                onClick={(e) => { e.preventDefault(); onSelect(it.id); }}
                className={cn(
                  "relative flex items-center rounded-md py-[7px] pr-[10px] pl-4 text-sm transition-colors",
                  active === it.id
                    ? "bg-surface-3 text-foreground before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {it.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      {onNewPage && <div className="border-t p-2"><NewPageButton onClick={onNewPage} /></div>}
      {footer}
    </aside>
  );
}
