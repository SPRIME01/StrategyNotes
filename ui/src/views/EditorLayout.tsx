// Editor screen container — layout family "3-panel" (DESIGN.md §9).
//
//   [ list rail | editor | context panel ]
//
//   ≥1024  three panels, context panel inline and collapsible (⌘\ to toggle)
//   768–1023  context panel becomes an overlay
//   <768   list rail becomes a drawer, context panel becomes an overlay
//
// The previous version hid the context panel entirely below 1024 (`hidden lg:block`),
// so on a laptop the Proof Burden panel simply did not exist. It is now reachable
// at every width. ponytail: CSS grid, no layout library.

import { useEffect, useState, type ReactNode } from "react";
import { Menu, PanelRight, X } from "lucide-react";
import { cn } from "../lib/utils";

const CONTEXT_KEY = "sn.editor.contextOpen";
const ICON_MIN = 768;
const CONTEXT_MIN = 1024;

export function EditorLayout({
  sidebar,
  header,
  editor,
  contextPanel,
  listRail,
}: {
  sidebar: ReactNode;
  header?: ReactNode;
  editor: ReactNode;
  contextPanel: ReactNode;
  /** Notes screen only: the note list. Becomes a drawer below 768px. */
  listRail?: ReactNode;
}) {
  const [contextOpen, setContextOpen] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(CONTEXT_KEY);
      if (saved !== null) return saved === "1";
    } catch {
      // storage disabled → fall through to the width default
    }
    return typeof window === "undefined" || window.innerWidth >= CONTEXT_MIN;
  });
  const [listOpen, setListOpen] = useState(false);
  const [narrow, setNarrow] = useState(
    () => typeof window === "undefined" || window.innerWidth < CONTEXT_MIN,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(CONTEXT_KEY, contextOpen ? "1" : "0");
    } catch {
      // non-fatal
    }
  }, [contextOpen]);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        setNarrow(w < CONTEXT_MIN);
        if (w < ICON_MIN) setListOpen(false);
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ⌘\ toggles the context panel. Owned here: this layout owns the state.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "\\" || e.key === "|")) {
        e.preventDefault();
        setContextOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <SkipLink targetId="view-content" />
      {/* nav rail — persistent ≥768, drawer below */}
      {narrow ? (
        <>
          {listOpen && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Notes">
              <button
                aria-label="Close notes"
                onClick={() => setListOpen(false)}
                className="absolute inset-0 bg-black/60"
              />
              <div className="absolute inset-y-0 left-0">{listRail ?? sidebar}</div>
              <button
                onClick={() => setListOpen(false)}
                aria-label="Close notes"
                className="t-fast absolute left-[316px] top-3 rounded-md bg-surface-3 p-2 hover:bg-surface-4"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        rail(sidebar)
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-surface-1 px-3">
          {narrow && listRail && (
            <button
              className="t-fast -ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-surface-3 hover:text-foreground md:hidden"
              onClick={() => setListOpen(true)}
              aria-label="Open notes list"
              aria-expanded={listOpen}
            >
              <Menu className="size-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">{header}</div>
          <ContextToggle
            open={contextOpen}
            onToggle={() => setContextOpen((o) => !o)}
          />
        </div>

        <div id="view-content" tabIndex={-1} className="flex min-h-0 flex-1">
          {narrow ? (
            <div className="min-w-0 flex-1 overflow-hidden">{editor}</div>
          ) : (
            <>
              {listRail && <div className="min-w-0">{listRail}</div>}
              <div className="min-w-0 flex-1 overflow-hidden">{editor}</div>
              {contextOpen && (
                <div className="scroll-region w-[280px] shrink-0 border-l bg-surface-1">
                  {contextPanel}
                </div>
              )}
            </>
          )}
        </div>

        {/* Context panel is an overlay below 1024 so it is never simply absent. */}
        {narrow && contextOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Context panel">
            <button
              aria-label="Close context panel"
              onClick={() => setContextOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <div className="scroll-region relative h-full w-[min(320px,86vw)] border-l bg-surface-1">
              <button
                onClick={() => setContextOpen(false)}
                aria-label="Close context panel"
                className="t-fast absolute right-2 top-2 z-10 rounded-md bg-surface-3 p-1.5 hover:bg-surface-4"
              >
                <X className="size-3.5" />
              </button>
              {contextPanel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function rail(node: ReactNode) {
  return <div className="hidden md:block">{node}</div>;
}

function ContextToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "t-fast flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
        open
          ? "border-primary/40 bg-accent-dim text-foreground"
          : "border-border text-muted-foreground hover:bg-surface-3",
      )}
      title="Toggle context panel (⌘\\)"
      aria-label={open ? "Hide context panel" : "Show context panel"}
      aria-pressed={open}
    >
      <PanelRight className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{open ? "Hide panel" : "Context"}</span>
    </button>
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
