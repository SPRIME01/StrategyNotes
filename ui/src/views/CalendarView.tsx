// Calendar — the commitment set as time, plus the portable export.
//
// INV-TIME makes the calendar the place a "commitment" stops being a claim:
// a work package without a reserved window here is still a wish. So this view
// groups by DAY (that is what a calendar is for) and leads each row with the
// window, not the work.
//
// Export is OQ-002 Option B — internal timeboxes + ICS is the whole calendar
// integration for the MVP (SPEC sec 12.1). No provider is dialed from here, so
// nothing this button does can touch local state (INV-CAL): it reads, writes a
// file to the user's disk, and leaves the vault alone.

import { useState } from "react";
import { Download } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import { PomoCostBadge, StatusChip } from "../atoms";
import { facetHrefOr, nodeHref } from "./FacetPage";
import { fmString, nodeTitle, type GraphNode } from "../lib/node";
import { cn } from "../lib/utils";

interface Slot {
  timebox: GraphNode;
  start: Date | null;
  end: Date | null;
}

function parse(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "13:00" — inside a day group the date is already said; only the time repeats. */
function clock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Group consecutive slots by local day, preserving schedule order. A timebox
 * with an unreadable window is NOT dropped (INV-CONTRA applies to data, not
 * just evidence) — it falls into its own trailing group so the gap is visible.
 */
function groupByDay(slots: Slot[]): { key: string; label: string; items: Slot[] }[] {
  const groups: { key: string; label: string; items: Slot[] }[] = [];
  for (const s of slots) {
    if (!s.start) {
      const last = groups[groups.length - 1];
      if (last && last.key === "undated") last.items.push(s);
      else groups.push({ key: "undated", label: "Undated", items: [s] });
      continue;
    }
    const key = dayKey(s.start);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(s);
    else groups.push({ key, label: dayLabel(s.start), items: [s] });
  }
  return groups;
}

function download(ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "strategynotes.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function CalendarView() {
  const { nodes: timeboxes, loading, error, reload } = useTypedNodes("timebox");
  const { nodes: workPackages } = useTypedNodes("work_package");
  const [exporting, setExporting] = useState(false);
  const { notify } = useToast();

  const wpById = new Map(workPackages.map((w) => [w.id, w]));
  const slots: Slot[] = timeboxes
    .map((t) => ({
      timebox: t,
      start: parse(fmString(t, "scheduled_start")),
      end: parse(fmString(t, "scheduled_end")),
    }))
    .sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity));
  const groups = groupByDay(slots);

  const exportCalendar = async () => {
    setExporting(true);
    try {
      const { ics } = await api.exportIcs();
      download(ics);
      notify(`Exported ${slots.length} timebox${slots.length === 1 ? "" : "es"} to strategynotes.ics.`, "ok");
    } catch {
      // INV-CAL / SDS-ERR: say what happened, and note that nothing local moved.
      notify("The calendar export failed. Your scheduled timeboxes are unchanged.", "bad");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="execution"
        title="Calendar"
        sub="Reserved time, grouped by day. A timebox here is what makes a work package a commitment; the .ics export is the portable copy — no external provider is involved."
      />

      <AsyncState
        label="timeboxes"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={slots.length === 0}
        noun="scheduled timeboxes"
        emptyHint="Nothing is on the calendar yet. Reserve a timebox from the Work / Timebox planner: estimate the cost in pomos, then put it on a window."
        emptyAction={
          <Button asChild variant="outline" size="sm">
            <a href="#work">Open the Work / Timebox planner</a>
          </Button>
        }
      >
        <Surface>
          <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
            <RegionTitle className="mr-auto">
              Timeboxes
            </RegionTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCalendar}
              disabled={exporting || slots.length === 0}
            >
              <Download aria-hidden="true" className="size-3.5" />
              {exporting ? "Exporting…" : "Export .ics"}
            </Button>
          </div>

          {groups.map((g) => (
            <div key={g.key}>
              <div
                className={cn(
                  "sticky top-0 z-10 flex items-baseline gap-2 border-b bg-surface-2/90 px-3 py-1.5 backdrop-blur",
                  g.key === "undated" && "text-gate-warn",
                )}
              >
                <span className="t-label text-muted-ink">{g.label}</span>
                <span className="t-datum text-faint" aria-label={`${g.items.length} timebox${g.items.length === 1 ? "" : "es"}`}>
                  {g.items.length}
                </span>
              </div>

              {g.items.map(({ timebox, start, end }) => {
                const wp = wpById.get(fmString(timebox, "work_package"));
                const expected = fmString(timebox, "expected_output");
                const pomos = Number(
                  (timebox.frontmatter?.estimate as { pomos?: number } | undefined)?.pomos,
                ) || 0;
                const status = fmString(timebox, "status", "committed");
                return (
                  <Row key={timebox.id}>
                    <RowGrid>
                      <span
                        className="t-datum w-[126px] shrink-0 whitespace-nowrap tabular-nums text-muted-ink"
                        aria-label={start && end ? "scheduled window" : "no scheduled window"}
                      >
                        {start ? clock(start) : "—"}
                        {" – "}
                        {end ? clock(end) : "—"}
                      </span>

                      <RowBody>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {wp ? (
                            <a href={nodeHref(wp.id)} className="t-row break-any hover:underline">
                              {nodeTitle(wp)}
                            </a>
                          ) : (
                            <span className="t-row text-faint">Unlinked timebox</span>
                          )}
                          <StatusChip status={status} to={facetHrefOr("status", status)} />
                          {expected && (
                            <span className="t-body line-clamp-1 min-w-0 text-muted-foreground">
                              {expected}
                            </span>
                          )}
                        </div>
                      </RowBody>

                      <RowActions>
                        {!start && (
                          <span className="t-datum text-gate-warn" title="This timebox has no readable window">
                            no window
                          </span>
                        )}
                        <PomoCostBadge pomos={pomos} />
                      </RowActions>
                    </RowGrid>
                  </Row>
                );
              })}
            </div>
          ))}
        </Surface>
      </AsyncState>
    </div>
  );
}
