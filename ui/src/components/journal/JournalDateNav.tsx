// TASK-E06 — Journal date navigation. Large display-font date, prev/next day
// arrows, a native <input type="date"> calendar picker, and dot indicators
// for days that have entries.
// ponytail: native date input instead of react-day-picker. The native picker
// is accessible, free, and portable. Upgrade only if dot-indicator calendars
// become a real UX requirement.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatJournalDate } from "../editor/EditorHeader";

export { formatJournalDate };

export function JournalDateNav({
  date,
  onDateChange,
  hasEntry,
  entries,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  hasEntry?: (d: Date) => boolean;
  /** ISO date strings (YYYY-MM-DD) known to have entries, for dots. */
  entries?: string[];
}) {
  const entrySet = entries ? new Set(entries) : null;
  const shift = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    onDateChange(d);
  };
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => shift(-1)}
        className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
        aria-label="Previous day"
      >
        <ChevronLeft className="size-4" />
      </button>

      <label className="journal-date cursor-pointer text-muted-ink" style={{ font: "300 28px/1.15 var(--font-display)", letterSpacing: "-0.02em" }}>
        {formatJournalDate(date)}
        <input
          type="date"
          value={iso(date)}
          onChange={(e) => { if (e.target.value) onDateChange(new Date(e.target.value + "T00:00:00")); }}
          className="sr-only"
        />
      </label>

      <button
        onClick={() => shift(1)}
        className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
        aria-label="Next day"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="ml-2 flex items-center gap-1">
        {[-2, -1, 0, 1, 2].map((off) => {
          const d = new Date(date);
          d.setDate(d.getDate() + off);
          const filled = entrySet ? entrySet.has(iso(d)) : hasEntry?.(d) ?? false;
          const isToday = off === 0;
          return (
            <button
              key={off}
              onClick={() => onDateChange(d)}
              className="flex flex-col items-center gap-1 rounded px-1 py-0.5 hover:bg-secondary"
              title={formatJournalDate(d)}
            >
              <span className={"text-[10px] font-mono " + (isToday ? "text-foreground" : "text-faint")}>
                {d.getDate()}
              </span>
              <span className={"h-1 w-1 rounded-full " + (filled ? "bg-primary" : "bg-transparent")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Journal template for new entries (TASK-E08).
export const JOURNAL_TEMPLATE = (date: Date) =>
  `# ${formatJournalDate(date)}\n\n## Today's Focus\n\n\n## Notes\n\n\n## Links & References\n\n`;
