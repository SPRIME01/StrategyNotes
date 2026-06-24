// TASK-E01 — Editor screen 3-panel container.
// Layout: [ sidebar | editor | contextPanel ]. Sidebar is the global nav
// (passed as a slot by App so it stays a single source of truth). The context
// panel collapses below 1024px and persists its open state to localStorage.
//
// Responsive:
//   < 768px  → sidebar becomes a hamburger overlay (sidebar slot shown in drawer)
//   < 1024px → context panel hidden by default
// ponytail: CSS grid, no layout library.

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

const CONTEXT_KEY = "sn.editor.contextOpen";

export function EditorLayout({
  sidebar,
  header,
  editor,
  contextPanel,
}: {
  sidebar: ReactNode;
  header?: ReactNode;
  editor: ReactNode;
  contextPanel: ReactNode;
}) {
  const [contextOpen, setContextOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(CONTEXT_KEY);
    if (saved !== null) return saved === "1";
    return typeof window !== "undefined" && window.innerWidth >= 1024;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  useEffect(() => { localStorage.setItem(CONTEXT_KEY, contextOpen ? "1" : "0"); }, [contextOpen]);

  const toggleContext = () => setContextOpen((o) => !o);

  // Cmd+\ / Ctrl+\ toggles the context panel. Owned here because this layout
  // owns the open state.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "\\" || e.key === "|")) {
        e.preventDefault();
        setContextOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="editor-layout flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* sidebar — desktop */}
      <div className="hidden md:block">{sidebar}</div>

      {/* sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* editor region */}
      <div className="editor-main flex min-w-0 flex-1 flex-col">
        {header && (
          <div className="editor-header border-b bg-surface-1">
            <div className="flex h-12 items-center gap-3 px-4">
              <button
                className="rounded p-1 text-muted-foreground hover:bg-secondary md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                ☰
              </button>
              <div className="min-w-0 flex-1">{header}</div>
              <ContextToggle open={contextOpen} onToggle={toggleContext} />
            </div>
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-hidden">{editor}</div>
          {contextOpen && (
            <div className="context-panel hidden w-[280px] shrink-0 overflow-y-auto border-l bg-surface-1 lg:block">
              {contextPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContextToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "shrink-0 rounded-md border px-2 py-1 text-xs transition-colors",
        open ? "border-primary/40 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary",
      )}
      title="Toggle context panel (⌘\\)"
    >
      {open ? "-hide-panel-" : "+panel+"}
    </button>
  );
}
