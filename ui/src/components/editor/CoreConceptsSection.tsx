// TASK-E15 — Core concepts. Static onboarding links to Evidence, Strategy,
// Traceability concepts. Dismissible; the dismissal is remembered in
// localStorage so it doesn't nag returning users.

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";

const DISMISS_KEY = "sn.editor.conceptsDismissed";

const CONCEPTS = [
  { label: "Evidence", hint: "A strategy is not real until it has evidence." },
  { label: "Strategy", hint: "Choices and bets, gated before commitment." },
  { label: "Traceability", hint: "Source → evidence → claim → bet → work." },
];

export function CoreConceptsSection() {
  const [dismissed, setDismissed] = useState<boolean>(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => { localStorage.setItem(DISMISS_KEY, dismissed ? "1" : "0"); }, [dismissed]);

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="flex items-center gap-1.5 text-[11px] text-faint hover:text-muted-foreground"
      >
        <BookOpen className="size-3" /> Show concepts
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto text-faint hover:text-foreground"
        title="Dismiss"
      >
        <X className="size-3" />
      </button>
      {CONCEPTS.map((c) => (
        <div key={c.label} className="rounded-md px-2 py-1 hover:bg-surface-2">
          <div className="text-xs font-medium text-foreground">{c.label}</div>
          <div className="text-[11px] text-muted-ink">{c.hint}</div>
        </div>
      ))}
    </div>
  );
}
