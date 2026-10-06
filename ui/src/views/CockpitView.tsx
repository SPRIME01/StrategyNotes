// Case Cockpit — layout family "Cockpit": status spine, standing, debt, one action.
//
// Its job on arrival is to answer one question: what is blocking this case, and
// what do I do next? It previously answered two contradictory capacity numbers
// and offered no action at all (PRODUCT.md anti-reference: "read-only dashboard
// suite").

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { POMOS_AVAILABLE } from "../hooks/useWorkspace";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Row, RowGrid, Surface, Unset } from "../components/ui/surface";
import { CapacityMeter, MaturityChip } from "../atoms";
import { fmFilled, fmList, fmString, nodeTitle } from "../lib/node";
import { cn } from "../lib/utils";
import type { ViewId } from "../components/layout/Sidebar";

const STAGES = [
  "establish reality", "define outcomes", "develop logic", "choose and bet",
  "design execution", "validate", "realize value", "review",
] as const;

const ARTIFACTS = [
  { id: "erd", label: "ERD", full: "Evidence Reality Dossier" },
  { id: "ord", label: "ORD", full: "Outcome Requirements" },
  { id: "sld", label: "SLD", full: "Strategic Logic" },
  { id: "eds", label: "EDS", full: "Execution Design" },
  { id: "vsd", label: "VSD", full: "Validation Strategy" },
  { id: "vrd", label: "VRD", full: "Value Realization" },
] as const;

export function CockpitView({
  onNavigate,
  committedPomos,
}: {
  onNavigate: (v: ViewId) => void;
  /** Passed from the shell's single workspace computation, never recomputed here. */
  committedPomos: number;
}) {
  const cases = useTypedNodes("strategy_case");
  const evidence = useTypedNodes("evidence_item");
  const claims = useTypedNodes("strategic_claim");
  const bets = useTypedNodes("strategy_bet");
  const records = useTypedNodes("decision_record");

  const c = cases.nodes[0] ?? null;
  const stageIdx = c ? Math.max(0, STAGES.findIndex((s) => s === fmString(c, "phase").toLowerCase().replace(/_/g, " "))) : -1;

  const drafted = evidence.nodes.filter((e) => fmString(e, "status").toLowerCase() !== "accepted");
  const claimsLackProof = claims.nodes.filter((cl) => fmList(cl, "supports").length === 0);
  const betsLackKill = bets.nodes.filter((b) => !fmFilled(b, "kill_criteria"));

  // Standing per artifact: which of the six strategy documents has a record.
  const standing = useMemo(() => {
    const byId = new Set<string>();
    for (const r of records.nodes) byId.add(fmString(r, "artifact").toLowerCase());
    // A bet is the Strategic Logic Document in node form: if any bet exists, the
    // SLD exists. Deriving it here keeps "standing" honest without a second source.
    if (bets.nodes.length > 0) byId.add("sld");
    return ARTIFACTS.map((a) => ({
      ...a,
      present: byId.has(a.id),
    }));
  }, [records.nodes, bets.nodes]);

  const debt = [
    { n: drafted.length, label: "evidence items drafted, not accepted", tone: drafted.length ? "bad" : "ok" },
    { n: claimsLackProof.length, label: "claims with no supporting evidence", tone: claimsLackProof.length ? "warn" : "ok" },
    { n: betsLackKill.length, label: "bets with no kill criteria", tone: betsLackKill.length ? "warn" : "ok" },
  ] as const;

  const next = nextAction(drafted, betsLackKill, bets.nodes);

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        kicker={c ? `case · ${c.id.slice(0, 8)}` : "reality"}
        title={c ? nodeTitle(c) : "Case Cockpit"}
        sub={
          c ? (
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Owner{" "}
                {fmString(c, "owner") ? (
                  <span className="text-foreground">{fmString(c, "owner")}</span>
                ) : (
                  <Unset label="no owner set" />
                )}
              </span>
              <span>
                Arena{" "}
                {fmString(c, "arena") ? (
                  <span className="text-foreground">{fmString(c, "arena")}</span>
                ) : (
                  <Unset label="no arena set" />
                )}
              </span>
            </span>
          ) : undefined
        }
      />

      <AsyncState
        label="case cockpit"
        loading={cases.loading}
        error={cases.error}
        onRetry={cases.reload}
      >
        {!c ? (
          <Surface tone={2} className="flex flex-col items-start gap-2 px-4 py-8">
            <p className="t-row text-muted-foreground">No strategy case yet</p>
            <p className="t-body max-w-[60ch] text-muted-ink">
              A case is the container for one strategic decision: its arena, its owner, and
              the bets inside it. Everything else in StrategyNotes hangs off one.
            </p>
            <Button
              size="sm"
              className="mt-1"
              onClick={() => onNavigate("notes")}
            >
              Start from a note
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </Surface>
        ) : (
          <>
            <LifecycleRail stageIdx={stageIdx} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Surface className="flex min-w-0 flex-col">
                <div className="border-b px-3 py-2">
                  <RegionTitle>Document standing</RegionTitle>
                </div>
                <div>
                  {standing.map((s) => (
                    <Row key={s.id}>
                      <RowGrid>
                        <span className="flex w-16 shrink-0 items-baseline gap-2">
                          <span className="t-datum font-semibold text-muted-foreground">{s.label}</span>
                        </span>
                        <span className="t-body min-w-0 flex-1 truncate text-muted-ink">{s.full}</span>
                        {s.present ? (
                          <MaturityChip maturity="Drafted" />
                        ) : (
                          <Unset label={`${s.label} not drafted`} />
                        )}
                      </RowGrid>
                    </Row>
                  ))}
                </div>
              </Surface>

              <Surface className="flex min-w-0 flex-col">
                <div className="border-b px-3 py-2">
                  <RegionTitle>Evidence debt</RegionTitle>
                </div>
                <div>
                  {debt.map((d) => (
                    <Row key={d.label}>
                      <RowGrid>
                        <span
                          className={cn(
                            "t-display w-14 shrink-0 tabular",
                            d.tone === "bad" ? "text-gate-bad" : d.tone === "warn" ? "text-gate-warn" : "text-gate-ok",
                          )}
                        >
                          {d.n}
                        </span>
                        <span className="t-body min-w-0 flex-1 text-muted-foreground">{d.label}</span>
                      </RowGrid>
                    </Row>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3 border-t px-3 py-2.5">
                  <CapacityMeter committed={committedPomos} available={POMOS_AVAILABLE} />
                  <span className="t-body text-muted-ink">committed this cycle</span>
                </div>
              </Surface>
            </div>

            <NextBestAction next={next} onNavigate={onNavigate} />
          </>
        )}
      </AsyncState>
    </div>
  );
}

function LifecycleRail({ stageIdx }: { stageIdx: number }) {
  return (
    <Surface className="px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="t-label text-muted-ink">Lifecycle</span>
        {stageIdx >= 0 && (
          <span className="t-datum text-primary">
            stage {stageIdx + 1} of {STAGES.length} · {STAGES[stageIdx]}
          </span>
        )}
      </div>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
        {STAGES.map((s, i) => {
          const done = i < stageIdx;
          const now = i === stageIdx;
          return (
            <li key={s} className="flex items-center gap-1">
              <span
                aria-current={now ? "step" : undefined}
                className={cn(
                  "t-datum rounded-sm px-1.5 py-1",
                  now && "bg-primary text-primary-foreground",
                  done && "bg-gate-ok-bg text-gate-ok",
                  !done && !now && "bg-surface-2 text-faint",
                )}
              >
                {done && <span aria-hidden="true">✓ </span>}
                {s}
                <span className="sr-only">{done ? " (passed)" : now ? " (current stage)" : " (not reached)"}</span>
              </span>
              {i < STAGES.length - 1 && <span aria-hidden="true" className="h-px w-2 bg-border" />}
            </li>
          );
        })}
      </ol>
    </Surface>
  );
}

interface NextAction {
  headline: string;
  detail: string;
  target: ViewId;
  cta: string;
}

function nextAction(
  drafted: ReturnType<typeof useTypedNodes>["nodes"],
  betsLackKill: ReturnType<typeof useTypedNodes>["nodes"],
  allBets: ReturnType<typeof useTypedNodes>["nodes"],
): NextAction {
  if (drafted.length > 0) {
    return {
      headline:
        drafted.length === 1
          ? "One evidence item is drafted, not accepted"
          : `${drafted.length} evidence items are drafted, not accepted`,
      detail:
        "The gap between drafted and accepted is the work. Accept or reject each one to close the reality gap.",
      target: "evidence",
      cta: "Triage evidence",
    };
  }
  if (betsLackKill.length > 0) {
    const b = allBets.find((x) => !fmFilled(x, "kill_criteria"));
    return {
      headline: `Bet "${b ? nodeTitle(b) : "?"}" has no kill criteria`,
      detail:
        "A bet without kill criteria cannot be approved. Add the missing requirements and it unlocks.",
      target: "bets",
      cta: "Open Bet Board",
    };
  }
  return {
    headline: "No blocking debt in this case",
    detail:
      "Keep capturing evidence and timeboxing work. Trace the lineage of any decision before you commit more time.",
    target: "trace",
    cta: "Trace the spine",
  };
}

function NextBestAction({ next, onNavigate }: { next: NextAction; onNavigate: (v: ViewId) => void }) {
  return (
    <Surface className="flex flex-wrap items-center gap-x-6 gap-y-3 border-primary/40 bg-primary/[0.06] px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <span className="t-label text-primary">Next best action</span>
        <p className="t-section mt-1 break-any">{next.headline}</p>
        <p className="t-body mt-0.5 max-w-[70ch] text-muted-foreground">{next.detail}</p>
      </div>
      <Button onClick={() => onNavigate(next.target)}>
        {next.cta}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Button>
    </Surface>
  );
}
