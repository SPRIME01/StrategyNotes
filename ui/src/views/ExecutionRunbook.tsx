// Execution Runbook — layout family A, low-decision mode.
//
// INV-EXEC: capture exceptions without forcing a strategy decision mid-execution.
// So there is no strategy editing here at all, and the capture bar used a native
// prompt() which discarded text on cancel. It is a real inline form now.

import { useState } from "react";
import {
  AlertTriangle, ClipboardList, FileOutput, Lightbulb, PlayCircle, Zap,
} from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { useNodeTitle } from "../hooks/useNodeTitle";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { Field, Textarea } from "../components/ui/field";
import { Callout, Datum, RegionTitle, Row, RowGrid, Surface, Unset } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import { GateResult as GateVerdict } from "../atoms";
import { fmString, nodeExcerpt, nodeTitle, type GraphNode } from "../lib/node";
import type { ViewId } from "../components/layout/Sidebar";

type CaptureKind = "idea" | "blocker" | "exception" | "evidence";

const CAPTURES: { id: CaptureKind; label: string; hint: string; Icon: typeof Lightbulb }[] = [
  { id: "idea", label: "Idea", hint: "Something worth thinking about later", Icon: Lightbulb },
  { id: "blocker", label: "Blocker", hint: "What stopped you", Icon: AlertTriangle },
  { id: "exception", label: "Exception", hint: "What you did differently, and why", Icon: Zap },
  { id: "evidence", label: "Evidence", hint: "Something you observed that counts", Icon: FileOutput },
];

/** The block's stated method, or null when it has none (excerpt returns "—"). */
function method(t: GraphNode): string | null {
  const raw =
    fmString(t, "method") || fmString(t, "technique") || nodeExcerpt(t, 300);
  const clean = raw.replace(/^—$/, "").trim();
  return clean || null;
}

export function ExecutionRunbook({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { nodes, loading, error, reload } = useTypedNodes("timebox");
  const active = nodes.find((t) => fmString(t, "status").toLowerCase() === "committed") ?? null;
  const workPackageId = active ? fmString(active, "work_package") : "";
  // Resolve the linked work package to a human title; a ULID is not a name.
  const workPackageLabel = useNodeTitle(workPackageId || null);
  const [gate, setGate] = useState<GateResult | null>(null);
  const [captures, setCaptures] = useState<{ kind: string; text: string; at: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<CaptureKind>("idea");
  const { notify } = useToast();

  const capture = () => {
    const text = draft.trim();
    if (!text) {
      notify("Nothing captured. Write the entry first.", "info");
      return;
    }
    setCaptures((p) => [
      ...p,
      { kind, text, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setDraft("");
    notify("Captured. It will not change your strategy on its own.", "ok");
  };

  const review = async () => {
    if (!active) return;
    try {
      const res = await api.reviewTimebox(active.id, 1, [], "Next cycle planned", "full");
      setGate(res.gate);
      notify(
        res.gate.status === "approved"
          ? "Timebox reviewed and verified."
          : "Review blocked. A timebox cannot be verified without evidence or an explicit reason.",
        res.gate.status === "approved" ? "ok" : "bad",
      );
      reload();
    } catch {
      notify("The server did not respond. The timebox is unchanged.", "bad");
    }
  };

  const quickSchedule = async () => {
    try {
      await api.scheduleTimebox("demo-wp", 1, "Quick execution block");
      notify("Reserved a 1-pomo timebox.", "ok");
      reload();
    } catch {
      notify("The timebox could not be reserved.", "bad");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="execution"
        title="Execution Runbook"
        sub="Low-decision mode. Run the work, capture what happens, and do not re-plan strategy in the middle of a block."
        action={
          active ? (
            <Button onClick={review}>
              <ClipboardList className="size-3.5" aria-hidden="true" />
              Complete review
            </Button>
          ) : undefined
        }
      />

      <AsyncState
        label="timeboxes"
        loading={loading}
        error={error}
        onRetry={reload}
      >
        {!active ? (
          <Surface className="flex flex-col items-start gap-2 px-4 py-8">
            <p className="t-row text-muted-foreground">No committed timebox is active</p>
            <p className="t-body max-w-[60ch] text-muted-ink">
              Execution mode needs a reserved timebox. Commit a work package and timebox it first,
              then come back here to run it.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onNavigate("work")}>
                Go to Work / Timebox
              </Button>
              <Button size="sm" variant="ghost" onClick={quickSchedule}>
                Reserve a 1-pomo block
              </Button>
            </div>
          </Surface>
        ) : (
          <>
            <Surface className="px-3 py-3">
              <RegionTitle>Active block</RegionTitle>
              <div className="mt-2.5 flex flex-wrap items-start gap-x-8 gap-y-3">
                <Datum label="Work package">
                  {workPackageLabel ? (
                    <span className="text-foreground">{workPackageLabel}</span>
                  ) : (
                    <Unset label="not linked to a work package" />
                  )}
                </Datum>
                <Datum label="Expected output">
                  <span className="text-foreground">
                    {fmString(active, "expected_output") || <Unset label="not stated" />}
                  </span>
                </Datum>
                <Datum label="Title">{nodeTitle(active)}</Datum>
              </div>
              <p className="t-body mt-3 max-w-[70ch] text-muted-foreground">
                {method(active) ??
                  "No method recorded. Build the smallest end-to-end path and capture what you learn."}
              </p>
            </Surface>

            <Surface className="flex min-w-0 flex-col">
              <div className="border-b px-3 py-2">
                <RegionTitle count={captures.length}>Capture bar</RegionTitle>
              </div>

              <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
                {CAPTURES.map(({ id, label, hint, Icon }) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={kind === id ? "secondary" : "ghost"}
                    aria-pressed={kind === id}
                    title={hint}
                    onClick={() => setKind(id)}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </Button>
                ))}
              </div>

              <div className="px-3 pb-3">
                <Field
                  label={CAPTURES.find((c) => c.id === kind)?.label ?? "Capture"}
                  hint={CAPTURES.find((c) => c.id === kind)?.hint}
                  htmlFor="runbook-capture"
                >
                  <Textarea
                    id="runbook-capture"
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        capture();
                      }
                    }}
                    placeholder="What happened? Ctrl or ⌘ plus Enter to capture."
                  />
                </Field>
                <div className="mt-2">
                  <Button size="sm" onClick={capture}>
                    <PlayCircle className="size-3.5" aria-hidden="true" />
                    Capture
                  </Button>
                </div>
              </div>

              {captures.length > 0 && (
                <div className="border-t">
                  {captures.map((c, i) => (
                    <Row key={i}>
                      <RowGrid>
                        <span className="t-datum w-16 shrink-0 uppercase text-muted-ink">
                          {c.kind}
                        </span>
                        <span className="t-body min-w-0 flex-1 break-any">{c.text}</span>
                        <span className="t-datum shrink-0 text-faint">{c.at}</span>
                      </RowGrid>
                    </Row>
                  ))}
                </div>
              )}
            </Surface>

            <Callout tone={gate?.status === "blocked" ? "bad" : "info"} className="px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="t-body flex-1 text-muted-foreground">
                  {gate?.status === "blocked"
                    ? "The review was blocked."
                    : gate?.status === "approved"
                      ? "Review verified. This block is now evidence of work."
                      : "A timebox cannot be verified without a post-block review."}
                </p>
                <GateVerdict gate={gate} />
              </div>
            </Callout>
          </>
        )}
      </AsyncState>
    </div>
  );
}
