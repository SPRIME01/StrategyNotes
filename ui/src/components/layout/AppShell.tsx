// Responsive app shell — DESIGN.md §14.
//
//   ≥1024   full 252px rail
//   768–1023 52px icon rail
//   <768    overlay drawer behind a menu button
//
// The manifesto's old passive tagline is gone: a top bar that says nothing is
// deleted, not styled (DESIGN.md §1). The bar now carries the one thing that is
// workspace-wide and functional: case scope, capacity, connection state.

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar, ConnectionDot, type ViewId } from "./Sidebar";
import { CapacityMeter } from "../../atoms";
import { Select } from "../ui/field";
import { cn } from "../../lib/utils";

const NAV_MIN = 1024;
const ICON_MIN = 768;

export function AppShell({
  active,
  onSelect,
  onNewPage,
  sidebarFooter,
  bar,
  children,
  className,
}: {
  active: ViewId;
  onSelect: (id: ViewId) => void;
  onNewPage?: () => void;
  sidebarFooter?: ReactNode;
  /** Workspace bar. Omit on the editor screens, which pass their own header. */
  bar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? NAV_MIN : window.innerWidth,
  );
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
        if (window.innerWidth >= ICON_MIN) setDrawer(false);
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const narrow = width < ICON_MIN;
  const collapsed = width >= ICON_MIN && width < NAV_MIN;

  const rail = (collapsedMode: boolean) => (
    <Sidebar
      active={active}
      onSelect={(id) => {
        onSelect(id);
        if (narrow) setDrawer(false);
      }}
      onNewPage={onNewPage}
      footer={sidebarFooter}
      collapsed={collapsedMode}
    />
  );

  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background text-foreground", className)}>
      <SkipLink targetId="view-content" />
      {/* persistent rail */}
      {!narrow && rail(collapsed)}

      {/* drawer */}
      {narrow && drawer && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            aria-label="Close navigation"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0">{rail(false)}</div>
          <button
            onClick={() => setDrawer(false)}
            aria-label="Close navigation"
            className="t-fast absolute left-[268px] top-3 rounded-md bg-surface-3 p-2 text-foreground hover:bg-surface-4"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {bar && (
          <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-surface-1 px-2 sm:px-4">
            {narrow && (
              <button
                onClick={() => setDrawer(true)}
                aria-label="Open navigation"
                aria-expanded={drawer}
                className="t-fast -ml-1 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              >
                <Menu className="size-4" />
              </button>
            )}
            <div className="min-w-0 flex-1">{bar}</div>
          </div>
        )}
        <main id="view-content" tabIndex={-1} className="scroll-region min-h-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * The workspace bar's CONTENTS. AppShell owns the bar's chrome (border, height)
 * so the narrow-width menu button can sit inside it without a double border.
 * Nothing decorative here: case scope, capacity, connection state.
 */
export function WorkspaceBar({
  cases,
  caseId,
  onCaseChange,
  committed,
  available,
  online,
}: {
  cases: { id: string; title: string }[];
  caseId: string | null;
  onCaseChange: (id: string | null) => void;
  committed: number;
  available: number;
  online: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {cases.length > 0 && (
          <label className="flex min-w-0 items-center gap-2">
            <span className="t-label hidden shrink-0 text-faint sm:inline">case</span>
            <Select
              aria-label="Filter every view by strategy case"
              value={caseId ?? ""}
              onChange={(e) => onCaseChange(e.target.value || null)}
              title={cases.find((c) => c.id === caseId)?.title ?? "All cases"}
              className="h-7 min-w-0 flex-1 py-0 text-xs sm:w-[min(420px,46vw)] sm:flex-none"
            >
              <option value="">All cases</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.id}
                </option>
              ))}
            </Select>
          </label>
        )}
        {!online && (
          <span className="t-datum hidden truncate text-gate-bad lg:inline">
            local server not responding
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <ConnectionDot ok={online} />
        <div className="flex items-center gap-2">
          <span className="t-label hidden text-faint md:inline">capacity</span>
          <CapacityMeter committed={committed} available={available} />
        </div>
      </div>
    </div>
  );
}

/** Standard page body: generous padding, capped measure, consistent rhythm. */
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

/**
 * Skip-to-content. Twelve nav links sit before the first actionable element, so
 * a keyboard user would tab through the whole rail on every view (WCAG 2.4.1).
 * Visually hidden until focused, then pinned to the top-left.
 */
function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="t-fast sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-2 focus-visible:top-2 focus-visible:z-[200] focus-visible:rounded-md focus-visible:bg-surface-3 focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-sm focus-visible:text-foreground"
    >
      Skip to content
    </a>
  );
}
