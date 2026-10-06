// Work / Timebox Planner — layout family A (Ledger).
//
// The app's central refusal: work without a timebox is a wish. So the ledger is
// sorted by commitment state and the pomo cost is the leading datum, because
// that is the number the user is actually trading against.
//
// Commitment is DERIVED, never asserted: a work package counts as having a
// timebox only if a timebox node actually names it in its frontmatter
// (`work_package: <ulid>`). The old version read the work package's own
// `status`, which no scheduling endpoint ever set — so every row stayed
// "no timebox, a wish" after a successful reservation, and the seed data's four
// real timeboxes were invisible. INV-DUR: the relationship lives in markdown
// and is read back from it; nothing is remembered in the index alone.

import { useState } from "react";
import { CalendarClock, PackageCheck, Plus } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { FilterPill, Input, Select } from "../components/ui/field";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface, Unset } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import { GateResult as GateVerdict, NodeTypeChip, RefusalNote, StatusChip } from "../atoms";
import { facetHref, facetHrefOr, nodeHref } from "./FacetPage";
import { fmString, nodeExcerpt, nodeTitle, type GraphNode } from "../lib/node";
import { cn } from "../lib/utils";

type Filter = "all" | "wish" | "committed";

/** "Oct 6, 00:27" — a scheduled window must read as a time, not a ULID. */
function when(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkPlanner({ caseId }: { caseId?: string | null }) {
  const { nodes, loading, error, reload } = useTypedNodes("work_package");
  const { nodes: timeboxes, reload: reloadTimeboxes } = useTypedNodes("timebox");
  const { nodes: bets } = useTypedNodes("strategy_bet");
  const [objective, setObjective] = useState("");
  const [linkedBet, setLinkedBet] = useState("");
  const [creating, setCreating] = useState(false);
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const [filter, setFilter] = useState<Filter>("all");
  /** Unsaved edit-in-progress, keyed by work package id. Cleared once the server
   *  has the value, or on failure so the field snaps back to the truth. */
  const [draftPomos, setDraftPomos] = useState<Record<string, string>>({});
  const { notify } = useToast();

  const refresh = () => {
    reload();
    reloadTimeboxes();
  };

  // work_package id -> the timebox that names it, from the vault.
  const timeboxFor = new Map<string, GraphNode>();
  for (const t of timeboxes) {
    const wp = fmString(t, "work_package");
    if (wp && !timeboxFor.has(wp)) timeboxFor.set(wp, t);
  }

  const serverPomos = (w: GraphNode) => Number(fmString(w, "pomos")) || 0;
  const pomosOf = (w: GraphNode) => draftPomos[w.id] ?? String(serverPomos(w));
  const hasTimebox = (w: GraphNode) => timeboxFor.has(w.id);

  const wishes = nodes.filter((w) => !hasTimebox(w));
  const shown = filter === "all" ? nodes : filter === "wish" ? wishes : nodes.filter(hasTimebox);

  /** Persist the estimate. `status` is stripped server-side, so this cannot
   *  touch lifecycle state (INV-WORK — gates stay backend-owned). */
  const savePomos = async (w: GraphNode) => {
    const raw = draftPomos[w.id];
    if (raw === undefined) return;
    const n = Math.max(0, Math.min(99, Math.round(Number(raw) || 0)));
    if (n === serverPomos(w)) {
      setDraftPomos((d) => {
        const { [w.id]: _drop, ...rest } = d;
        return rest;
      });
      return;
    }
    try {
      await api.patchNode(w.id, { frontmatter: { pomos: n } });
      refresh();
    } catch {
      // Snap back to the stored value rather than leaving a lie on screen.
      setDraftPomos((d) => {
        const { [w.id]: _drop, ...rest } = d;
        return rest;
      });
      notify("The pomo estimate could not be saved.", "bad");
    }
  };

  const commit = async (id: string, title: string) => {
    try {
      const r = await api.commitWorkPackage(id);
      setGate((g) => ({ ...g, [id]: r }));
      notify(
        r.status === "approved" ? `Committed "${title}"` : `"${title}" is blocked by a gate`,
        r.status === "approved" ? "ok" : "bad",
      );
      refresh();
    } catch {
      setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } }));
      notify("The server did not respond. Nothing was committed.", "bad");
    }
  };

  const schedule = async (w: GraphNode) => {
    const title = nodeTitle(w);
    // INV-TIME: a timebox is scheduled against a cost the work actually carries.
    // Reading the draft as well means clicking Timebox straight after typing an
    // estimate works — the click blurs the field, but we do not depend on that.
    const pomos = Math.max(0, Math.min(99, Math.round(Number(pomosOf(w)) || 0)));
    if (pomos < 1) {
      notify(`Set a pomo estimate for "${title}" before reserving a timebox.`, "bad");
      return;
    }
    try {
      if (pomos !== serverPomos(w)) {
        await api.patchNode(w.id, { frontmatter: { pomos } });
      }
      await api.scheduleTimebox(w.id, pomos, `Execution for ${title}`);
      notify(`Reserved a ${pomos}-pomo timebox for "${title}".`, "ok");
      refresh();
    } catch {
      notify("The timebox could not be reserved. Nothing changed.", "bad");
    }
  };

  /** Draft a work package. `linked_bet` is required by the model (INV-WORK: work
   *  hangs off an approved strategy, never off nothing), so a bet must exist
   *  first — the form says so instead of failing at submit time. */
  const createWorkPackage = async () => {
    const text = objective.trim();
    const bet = linkedBet || bets[0]?.id || "";
    if (!text || !caseId || !bet || creating) return;
    setCreating(true);
    try {
      await api.createWorkPackage(caseId, bet, text);
      setObjective("");
      notify("Drafted a work package. Estimate its cost, then reserve a timebox.", "ok");
      refresh();
    } catch {
      notify("The work package could not be created. Nothing was written.", "bad");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="execution"
        title="Work / Timebox Planner"
        sub="Work without a reserved timebox is a wish, not a commitment. Estimate in pomos, then put it on the calendar."
      />

      {/* Above AsyncState so it survives the empty state: a planner with no
          packages must still be able to receive its first one. */}
      {!caseId ? (
        <p className="t-body text-faint">
          A work package belongs to a case. Pick one in the app bar to draft one here.
        </p>
      ) : bets.length === 0 ? (
        <p className="t-body text-faint">
          Work hangs off a bet (INV-WORK).{" "}
          <a href="#bets" className="text-primary underline-offset-4 hover:underline">
            Draft a bet
          </a>{" "}
          first, then come back to plan the execution.
        </p>
      ) : (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void createWorkPackage();
          }}
        >
          <label htmlFor="new-wp-objective" className="sr-only">
            Work package objective
          </label>
          <Input
            id="new-wp-objective"
            className="min-w-0 flex-1"
            placeholder="Objective — what will exist when this is done?"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
          <label htmlFor="new-wp-bet" className="sr-only">
            Linked bet
          </label>
          <Select
            id="new-wp-bet"
            className="w-auto min-w-[12rem]"
            value={linkedBet || bets[0]?.id || ""}
            onChange={(e) => setLinkedBet(e.target.value)}
          >
            {bets.map((b) => (
              <option key={b.id} value={b.id}>
                {nodeTitle(b)}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            variant="default"
            size="md"
            disabled={!objective.trim() || creating}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {creating ? "Adding…" : "Add package"}
          </Button>
        </form>
      )}

      <AsyncState
        label="work packages"
        loading={loading}
        error={error}
        onRetry={refresh}
        empty={nodes.length === 0}
        noun="work packages"
        emptyHint="A work package is a bounded unit of execution: an objective, its inputs and outputs, a method, an exception policy, and the evidence it must produce."
      >
        <Surface>
          <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
            <RegionTitle className="mr-auto">Packages</RegionTitle>
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")} count={nodes.length}>
              All
            </FilterPill>
            <FilterPill active={filter === "wish"} onClick={() => setFilter("wish")} count={wishes.length}>
              Wishes
            </FilterPill>
            <FilterPill active={filter === "committed"} onClick={() => setFilter("committed")} count={nodes.filter(hasTimebox).length}>
              Committed
            </FilterPill>
          </div>

          <div>
            {shown.length === 0 ? (
              <p className="t-body px-3 py-6 text-muted-foreground">
                Nothing in this filter.
              </p>
            ) : (
              shown.map((w) => {
                const committed = hasTimebox(w);
                const timebox = timeboxFor.get(w.id);
                const pomos = serverPomos(w);
                const title = nodeTitle(w);
                const reservedPomos = Number(
                  (timebox?.frontmatter?.estimate as { pomos?: number } | undefined)?.pomos,
                ) || 0;
                const starts = timebox ? when(fmString(timebox, "scheduled_start")) : null;
                const ends = timebox ? when(fmString(timebox, "scheduled_end")) : null;
                return (
                  <Row key={w.id}>
                    <RowGrid>
                      <div className="flex w-[56px] shrink-0 flex-col items-start gap-0.5">
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          inputMode="numeric"
                          className="t-datum w-[46px] px-1 py-1 text-center text-xs"
                          value={pomosOf(w)}
                          aria-label={`Pomo estimate for ${title}`}
                          title="Pomo estimate"
                          onChange={(e) =>
                            setDraftPomos((d) => ({ ...d, [w.id]: e.target.value }))
                          }
                          onBlur={() => savePomos(w)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          }}
                        />
                        <span
                          className={cn(
                            "text-[10px] leading-none",
                            pomos > 0 ? "text-faint" : "text-gate-warn",
                          )}
                        >
                          {pomos > 0 ? "pomos" : "estimate"}
                        </span>
                      </div>

                      <RowBody>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <NodeTypeChip type={w.type} to={facetHref("type", w.type)} />
                          <StatusChip
                            status={fmString(w, "status", "intent")}
                            to={facetHrefOr("status", fmString(w, "status"))}
                          />
                          <span
                            className={cn(
                              "t-datum inline-flex items-center gap-1 whitespace-nowrap",
                              committed ? "text-gate-ok" : "text-gate-warn",
                            )}
                          >
                            <span aria-hidden="true">{committed ? "▣" : "◇"}</span>
                            {committed ? "timebox reserved" : "no timebox, a wish"}
                          </span>
                          {committed && (starts || ends) && (
                            <span className="t-datum whitespace-nowrap text-muted-ink">
                              {starts ?? "?"} → {ends ?? "?"}
                              {/* Display-only: what the calendar is actually holding. The work
                                  package's own estimate stays whatever is stored on it — the UI
                                  does not write data on read. */}
                              {reservedPomos > 0 && (
                                <span className="text-faint"> ({reservedPomos}p)</span>
                              )}
                            </span>
                          )}
                        </div>
                        <a href={nodeHref(w.id)} className="t-row mt-1 block break-any hover:underline">
                          {nodeExcerpt(w, 200)}
                        </a>
                        <p className="t-body mt-0.5 text-muted-ink">
                          Bet{" "}
                          {fmString(w, "linked_bet") ? (
                            <span className="t-datum text-muted-foreground">
                              {fmString(w, "linked_bet").slice(0, 10)}
                            </span>
                          ) : (
                            <Unset label="not linked to a bet" />
                          )}
                        </p>
                      </RowBody>

                      <RowActions>
                        {!committed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => commit(w.id, title)}
                            title="Run the work commitment gate"
                          >
                            <PackageCheck className="size-3.5" aria-hidden="true" />
                            Commit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => schedule(w)}
                          disabled={pomos < 1}
                          title={
                            pomos < 1
                              ? "Set a pomo estimate first — a timebox with no cost is not a commitment"
                              : committed
                                ? "Reserve another timebox for this work"
                                : "Reserve a calendar timebox for this work"
                          }
                        >
                          <CalendarClock className="size-3.5" aria-hidden="true" />
                          Timebox
                        </Button>
                        <GateVerdict gate={gate[w.id] ?? null} />
                      </RowActions>
                    </RowGrid>
                  </Row>
                );
              })
            )}
          </div>
        </Surface>

        <RefusalNote>
          The app will not treat work as committed until a pomo estimate and a calendar timebox both
          exist. That refusal is the feature.
        </RefusalNote>
      </AsyncState>
    </div>
  );
}
