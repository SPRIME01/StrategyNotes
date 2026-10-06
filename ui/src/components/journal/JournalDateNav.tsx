// Journal date navigation — layout family A header.
//
// ponytail: native date input instead of react-day-picker. The native picker is
// accessible, free, and portable. Upgrade only if dot-indicator calendars become
// a real UX requirement.
//
// Two corrections from verification:
//   · The strip showed bare day numbers (3 4 5 6 7) with no month or weekday
//     context, so it was unreadable. It now carries a weekday initial, an
//     explicit selected state, and a label.
//   · "Next day" let you walk into the future. A daynote is an activity record
//     (INV-DAY): there is nothing to record for a day that has not happened, so
//     the control is disabled at today.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatJournalDate } from "../editor/EditorHeader";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export { formatJournalDate };

const DAY_INITIAL = ["S", "M", "T", "W", "T", "F", "S"];

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
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = startOfToday();

  const shift = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    onDateChange(startOfDay(d));
  };

  const atToday = iso(date) === iso(today);
  const selectedIso = iso(date);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => shift(-1)}
          aria-label="Previous day"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        <label className="t-display cursor-pointer text-foreground">
          {formatJournalDate(date)}
          <span className="sr-only"> (choose another date)</span>
          <input
            type="date"
            max={iso(today)}
            value={selectedIso}
            onChange={(e) => {
              if (e.target.value) onDateChange(startOfDay(new Date(`${e.target.value}T00:00:00`)));
            }}
            className="sr-only"
            aria-label="Journal date"
          />
        </label>

        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => shift(1)}
          disabled={atToday}
          aria-label={atToday ? "Next day (today is the furthest day with activity)" : "Next day"}
          title={atToday ? "There is no activity to record for a future day" : "Next day"}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <nav aria-label="Days around the selected date" className="flex items-center gap-1">
        {[-2, -1, 0, 1, 2].map((off) => {
          const d = startOfDay(new Date(date.getTime() + off * 86400000));
          const filled = entrySet ? entrySet.has(iso(d)) : (hasEntry?.(d) ?? false);
          const selected = iso(d) === selectedIso;
          const future = d.getTime() > today.getTime();
          return (
            <button
              key={off}
              onClick={() => onDateChange(d)}
              disabled={future}
              aria-current={selected ? "date" : undefined}
              aria-label={`${formatJournalDate(d)}${filled ? ", has an entry" : ", no entry yet"}`}
              title={formatJournalDate(d)}
              className={cn(
                "t-fast flex w-8 flex-col items-center gap-1 rounded-md py-1",
                selected
                  ? "bg-surface-3 text-foreground"
                  : future
                    ? "cursor-not-allowed text-faint opacity-40"
                    : "text-muted-ink hover:bg-surface-3 hover:text-foreground",
              )}
            >
              <span className="t-datum text-[9px] uppercase opacity-70">
                {DAY_INITIAL[d.getDay()]}
              </span>
              <span className="t-datum font-semibold">{d.getDate()}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "size-1 rounded-full",
                  filled ? "bg-primary" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfToday() {
  return startOfDay(new Date());
}

// Journal template for new entries (TASK-E08).
export const JOURNAL_TEMPLATE = (date: Date) =>
  `# ${formatJournalDate(date)}\n\n## Today's Focus\n\n\n## Notes\n\n\n## Links & References\n\n`;
