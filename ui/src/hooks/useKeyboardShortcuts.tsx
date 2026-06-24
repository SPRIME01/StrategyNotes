// TASK-E16 — Global keyboard shortcut registry. Registers shortcuts, detects
// conflicts, and renders a help modal on `?`.
// ponytail: one window keydown listener + a lookup map. No external shortcut lib.

import { useEffect, useState } from "react";

export interface Shortcut {
  /** e.g. "mod+n" — mod = ⌘ on mac, Ctrl elsewhere. */
  combo: string;
  description: string;
  action: () => void;
  /** Disable inside text inputs (default true for typing shortcuts). */
  allowInInput?: boolean;
}

export interface RegisteredShortcut extends Omit<Shortcut, "action"> {}

function isMac() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

function eventCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey || (isMac() && e.metaKey)) parts.push("mod");
  else if (e.ctrlKey) parts.push("mod"); // treat Ctrl on win/linux as mod
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  parts.push(e.key.toLowerCase());
  return parts.join("+");
}

function inTextTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [helpOpen, setHelpOpen] = useState(false);

  // Conflict detection: warn on duplicate combos (no silent override).
  useEffect(() => {
    const seen = new Map<string, string>();
    for (const s of shortcuts) {
      const prev = seen.get(s.combo);
      if (prev) console.warn(`[shortcuts] conflict: "${s.combo}" → "${prev}" and "${s.description}"`);
      seen.set(s.combo, s.description);
    }
  }, [shortcuts]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Help modal toggle on `?`.
      if (e.key === "?" && !inTextTarget(e)) {
        e.preventDefault();
        setHelpOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") { setHelpOpen(false); return; }

      const combo = eventCombo(e);
      for (const s of shortcuts) {
        if (s.combo !== combo) continue;
        if (!s.allowInInput && inTextTarget(e)) return; // don't hijack typing
        e.preventDefault();
        s.action();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);

  return { helpOpen, setHelpOpen, shortcuts: shortcuts.map(({ action: _, ...rest }) => rest) };
}

export function ShortcutsHelp({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts: RegisteredShortcut[];
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border-strong bg-surface-2 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Keyboard shortcuts</h2>
          <button onClick={onClose} className="text-faint hover:text-foreground">✕</button>
        </div>
        <div className="flex flex-col gap-1">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-sm">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-ink">
                {s.combo.replace("mod", isMac() ? "⌘" : "Ctrl")}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
