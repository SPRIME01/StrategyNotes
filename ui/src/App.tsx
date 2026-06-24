import { useState, useEffect, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  GateStatusBadge, ProofLevelBadge, NodeTypeBadge, EvidenceStateBadge,
  PomoCostBadge, MaturityChip, ContradictionBadge, SectionLabel, CapacityMeter,
} from "./atoms";
import { api, type GateResult } from "./api";
import { Sidebar, type ViewId } from "./components/layout/Sidebar";
import { NotesScreen } from "./views/NotesScreen";
import { JournalView } from "./views/JournalView";
import { useKeyboardShortcuts, ShortcutsHelp } from "./hooks/useKeyboardShortcuts";
import { useTypedNodes, useNode } from "./hooks/useTypedNodes";
import {
  fmString, fmList, fmBool, nodeTitle, nodeExcerpt, fmFilled, type GraphNode,
} from "./lib/node";

const POMOS_AVAILABLE = 24; // ponytail: per-cycle capacity budget; make configurable later

// ─── shell ───

export function App() {
  const [view, setView] = useState<ViewId>("cockpit");
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);

  const { helpOpen, setHelpOpen, shortcuts } = useKeyboardShortcuts([
    {
      combo: "mod+n",
      description: "New note",
      allowInInput: true,
      action: async () => {
        try {
          const n = await api.createNote("Untitled note");
          setPendingNoteId(String(n.id));
        } catch { /* backend not running */ }
        setView("notes");
      },
    },
    {
      combo: "mod+j",
      description: "Go to today's journal",
      allowInInput: true,
      action: () => setView("journal"),
    },
  ]);

  // Editor screens render their own full 3-panel EditorLayout.
  if (view === "notes") return <NotesScreen onSelectView={setView} initialNoteId={pendingNoteId} />;
  if (view === "journal") return <JournalView onSelectView={setView} />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar active={view} onSelect={setView} onNewPage={() => setView("notes")} />

      <div className="flex flex-1 flex-col">
        <header className="flex h-12 items-center gap-4 border-b bg-surface-1 px-4">
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span className="text-muted-ink">markdown is the source of truth — everything else is generated</span>
          </div>
          <CapacityMeter committed={0} available={POMOS_AVAILABLE} />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1340px]">
            {view === "cockpit" && <CaseCockpit />}
            {view === "evidence" && <EvidenceInbox />}
            {view === "erd" && <ErdView />}
            {view === "bets" && <BetBoard />}
            {view === "trace" && <TraceExplorer />}
            {view === "work" && <WorkPlanner />}
            {view === "runbook" && <ExecutionRunbook />}
            {view === "daynote" && <DaynoteLedger />}
            {view === "vrd" && <VrdView />}
            {view === "agent" && <AgentDraftInbox />}
          </div>
        </main>
      </div>

      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} shortcuts={shortcuts} />
    </div>
  );
}

// ─── shared page chrome ───

function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-muted-ink">{kicker}</div>
      <h1 className="text-2xl font-normal tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      {title && (
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LoadingRow({ label }: { label: string }) {
  return <p className="text-sm text-muted-ink">Loading {label}…</p>;
}

// Honest empty state — never fake data (RISK-001 guardrail).
function EmptyState({ noun, hint }: { noun: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground">No {noun} yet{hint ? ` — ${hint}` : ""}.</p>
        <p className="mt-1 text-xs text-faint">Start the backend, or create one from the Notes screen and set its type.</p>
      </CardContent>
    </Card>
  );
}

// ─── 1. Case Cockpit — projection over strategy_case + evidence/bet/timebox ───

const STAGES = ["establish_reality", "define_outcomes", "develop_logic", "choose_and_bet", "design_execution", "validate", "realize_value", "review"];
const ARTIFACT_TYPES = ["erd", "ord", "sld", "eds", "vsd", "vrd"] as const;

function CaseCockpit() {
  const cases = useTypedNodes("strategy_case");
  const evidence = useTypedNodes("evidence_item");
  const claims = useTypedNodes("strategic_claim");
  const bets = useTypedNodes("strategy_bet");
  const timeboxes = useTypedNodes("timebox");

  const c = cases.nodes[0];
  const stageIdx = c ? Math.max(0, STAGES.indexOf(fmString(c, "phase"))) : -1;

  const draftedEvidence = evidence.nodes.filter((e) => fmString(e, "status").toLowerCase() !== "accepted").length;
  const claimsLackProof = claims.nodes.filter((cl) => fmList(cl, "supports").length === 0).length;
  const betsLackKill = bets.nodes.filter((b) => !fmFilled(b, "kill_criteria")).length;
  const committedPomos = timeboxes.nodes.reduce((s, t) => s + Number(fmString(t, "pomos") || 0), 0);

  if (cases.loading) return <LoadingRow label="case" />;
  if (!c) return <EmptyState noun="strategy case" hint="create one via the API (POST /api/cases)" />;

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        kicker={`CASE · ${c.id.slice(0, 14)}`}
        title={nodeTitle(c)}
        sub={`Owner: ${fmString(c, "owner") || "—"} · Arena: ${fmString(c, "arena") || "—"}`}
      />

      <Panel title="Lifecycle">
        <div className="flex flex-wrap items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${
                i < stageIdx ? "bg-gate-ok-bg text-gate-ok" : i === stageIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-faint"
              }`}>
                {i < stageIdx ? "✓ " : ""}{s.replace(/_/g, " ").slice(0, 12)}
              </div>
              {i < STAGES.length - 1 && <div className="h-px w-3 bg-border" />}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-4">
        <ArtifactsPanel />
        <Panel title="Evidence Debt">
          <div className="flex flex-col gap-1.5">
            <DebtRow n={draftedEvidence} tone={draftedEvidence ? "bad" : "ok"} label="drafted, not accepted" />
            <DebtRow n={claimsLackProof} tone={claimsLackProof ? "warn" : "ok"} label="claims lack proof" />
            <DebtRow n={betsLackKill} tone={betsLackKill ? "warn" : "ok"} label="bets lack kill criteria" />
          </div>
        </Panel>
        <Panel title="Strategy Capacity">
          <div className="flex flex-col gap-2">
            <CapacityMeter committed={committedPomos} available={POMOS_AVAILABLE} />
            <p className="text-xs text-muted-foreground">{committedPomos} of {POMOS_AVAILABLE} pomos committed this cycle.</p>
          </div>
        </Panel>
      </div>

      <NextBestAction draftedEvidence={draftedEvidence} betsLackKill={betsLackKill} bets={bets.nodes} />
    </div>
  );
}

function DebtRow({ n, tone, label }: { n: number; tone: "ok" | "warn" | "bad"; label: string }) {
  const cls = tone === "bad" ? "text-gate-bad" : tone === "warn" ? "text-gate-warn" : "text-gate-ok";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-normal tabular ${cls}`} style={{ fontFamily: "var(--font-display)" }}>{n}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function ArtifactsPanel() {
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  useTypePresence(ARTIFACT_TYPES, setPresence);
  return (
    <Panel title="Artifacts">
      <div className="flex flex-col gap-2">
        {ARTIFACT_TYPES.map((t) => (
          <div key={t} className="flex items-center justify-between">
            <span className="text-sm uppercase text-muted-foreground">{t}</span>
            {presence[t]
              ? <MaturityChip maturity="Drafted" />
              : <span className="text-faint">—</span>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// Fetch only existence (IDs) for a set of types — cheap, no per-node resolve.
function useTypePresence(types: readonly string[], set: (m: Record<string, boolean>) => void) {
  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(types.map(async (t) => {
        try { const ids = await api.nodesByType(t); return [t, ids.length > 0] as const; }
        catch { return [t, false] as const; }
      }));
      if (alive) set(Object.fromEntries(entries));
    })();
    return () => { alive = false; };
  }, [types, set]);
}

function NextBestAction({ draftedEvidence, betsLackKill, bets }: { draftedEvidence: number; betsLackKill: number; bets: GraphNode[] }) {
  let msg = "Case is in good shape — keep capturing evidence and timeboxing work.";
  if (draftedEvidence > 0) msg = `${draftedEvidence} drafted evidence item${draftedEvidence > 1 ? "s" : ""} not yet accepted. Accept or reject them to close the reality gap.`;
  else if (betsLackKill > 0) {
    const b = bets.find((x) => !fmFilled(x, "kill_criteria"));
    msg = `Your bet "${b ? nodeTitle(b) : "?"}" lacks kill criteria. Fill the INV-BET requirements to unlock approval.`;
  }
  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="py-4">
        <SectionLabel>Next Best Action</SectionLabel>
        <p className="mt-1 text-lg" style={{ fontFamily: "var(--font-display)" }}>{msg}</p>
      </CardContent>
    </Card>
  );
}

// ─── 2. Evidence Inbox ───

function EvidenceInbox() {
  const { nodes, loading } = useTypedNodes("evidence_item");
  const [gate, setGate] = useState<Record<string, GateResult>>({});

  const accept = async (id: string) => {
    try { const r = await api.acceptEvidence(id); setGate((g) => ({ ...g, [id]: r })); }
    catch { setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } })); }
  };

  if (loading) return <PageWithHead kicker="REALITY" title="Evidence Inbox"><LoadingRow label="evidence" /></PageWithHead>;
  if (nodes.length === 0) return <PageWithHead kicker="REALITY" title="Evidence Inbox"><EmptyState noun="evidence" /></PageWithHead>;

  return (
    <PageWithHead kicker="REALITY" title="Evidence Inbox" sub="Triage draft evidence. The gap between Drafted and Accepted is the work.">
      <div className="flex flex-col gap-2">
        {nodes.map((e) => {
          const status = fmString(e, "status");
          return (
            <Card key={e.id} className={status === "Drafted" ? "border-dashed border-gate-warn/40" : ""}>
              <CardContent className="flex items-start gap-3 py-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ProofLevelBadge level={fmString(e, "proof_level", "—")} />
                    <EvidenceStateBadge state={status} />
                    {fmFilled(e, "source_chunk") && <Badge variant="outline" className="text-[10px] font-mono">{fmString(e, "source_chunk").slice(0, 12)}</Badge>}
                  </div>
                  <p className="text-sm">{nodeExcerpt(e)}</p>
                </div>
                {status === "Drafted" && <Button size="sm" variant="outline" onClick={() => accept(e.id)}>Accept</Button>}
                <GateStatusBadge gate={gate[e.id] ?? null} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageWithHead>
  );
}

// ─── 3. Bet Board ───

const BET_REQS: [string, string][] = [
  ["linked_choice", "linked choice"],
  ["assumptions", "assumptions"],
  ["counterevidence_reviewed", "counterevidence reviewed"],
  ["success_metric", "success metric"],
  ["kill_criteria", "kill criteria"],
  ["owner", "owner"],
];

function BetBoard() {
  const { nodes, loading, reload } = useTypedNodes("strategy_bet");
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const cols = [
    { id: "draft", label: "Draft" }, { id: "blocked", label: "Blocked" },
    { id: "approved", label: "Approved" }, { id: "killed", label: "Killed" },
  ];

  const approve = async (b: GraphNode) => {
    try { const r = await api.approveBet(b.id); setGate((g) => ({ ...g, [b.id]: r })); }
    catch { setGate((g) => ({ ...g, [b.id]: { status: "blocked", failed_gates: ["unreachable"] } })); }
    reload();
  };

  if (loading) return <PageWithHead kicker="STRATEGY" title="Bet Board"><LoadingRow label="bets" /></PageWithHead>;

  return (
    <PageWithHead kicker="STRATEGY" title="Bet Board" sub="Every bet must pass the INV-BET gate before approval. A blocked bet looks blocked.">
      {nodes.length === 0 ? <EmptyState noun="bets" /> : (
        <div className="grid grid-cols-4 gap-4">
          {cols.map((col) => (
            <div key={col.id} className="flex flex-col gap-2">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-ink">{col.label}</div>
              {nodes.filter((b) => fmString(b, "status").toLowerCase() === col.id).map((b) => (
                <Card key={b.id} className={col.id === "blocked" ? "border-gate-bad/40" : col.id === "approved" ? "border-gate-ok/30" : ""}>
                  <CardContent className="flex flex-col gap-2 py-3">
                    <p className="text-sm font-medium">{nodeExcerpt(b)}</p>
                    <div className="flex flex-col gap-1">
                      {BET_REQS.map(([key, label]) => {
                        const filled = key === "assumptions" ? fmList(b, key).length > 0 : key === "counterevidence_reviewed" ? fmBool(b, key) : fmFilled(b, key);
                        return (
                          <div key={label} className="flex items-center gap-1.5 text-[11px]">
                            <span className={filled ? "text-gate-ok" : "text-gate-bad"}>{filled ? "✓" : "✕"}</span>
                            <span className={filled ? "text-muted-foreground" : "text-gate-bad"}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                    {fmString(b, "status").toLowerCase() === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => approve(b)}>Approve [INV-BET]</Button>
                    )}
                    <GateStatusBadge gate={gate[b.id] ?? null} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </PageWithHead>
  );
}

// ─── 4. Trace Explorer — walks typed edges from a chosen root ───

function TraceExplorer() {
  const { nodes: roots, loading } = useTypedNodes("strategy_bet");
  const [rootId, setRootId] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const [tracing, setTracing] = useState(false);

  const id = rootId ?? roots[0]?.id ?? null;
  // re-run trace when id changes
  useTrace(id, setTrace, setTracing);

  return (
    <PageWithHead kicker="STRATEGY" title="Trace Explorer" sub="Source → evidence → claim → bet → work → timebox → review → value. Counterevidence stays visible.">
      {loading ? <LoadingRow label="roots" /> : roots.length === 0 ? <EmptyState noun="traceable nodes" hint="draft a bet first" /> : (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="text-muted-ink">root:</span>
          <select value={id ?? ""} onChange={(e) => { setRootId(e.target.value); }} className="rounded-md border bg-surface-1 px-2 py-1 text-xs">
            {roots.map((r) => <option key={r.id} value={r.id}>{nodeTitle(r)}</option>)}
          </select>
        </div>
      )}
      <Panel title="Reachable from root">
        {tracing ? <LoadingRow label="trace" /> : trace.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reachable nodes (or root has no outgoing typed edges yet).</p>
        ) : (
          <div className="flex flex-col gap-1 font-mono text-xs">
            {trace.map((tid) => <TraceLine key={tid} id={tid} />)}
          </div>
        )}
      </Panel>
      <Panel title="Counterevidence (INV-CONTRA)">
        <div className="flex items-center gap-2 text-sm">
          <ContradictionBadge />
          <span className="text-muted-foreground">Contradictions surface here when a node has outgoing <code>contradicts</code> edges.</span>
        </div>
      </Panel>
    </PageWithHead>
  );
}

function TraceLine({ id }: { id: string }) {
  const { node } = useNode(id);
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary">
      <NodeTypeBadge type={node ? node.type : "—"} />
      <span className="text-foreground">{node ? nodeTitle(node) : id}</span>
      <span className="ml-auto text-faint">{id.slice(0, 18)}</span>
    </div>
  );
}

// ponytail: tiny effect wrapper to re-fetch trace when id changes.
function useTrace(id: string | null, setTrace: (s: string[]) => void, setTracing: (b: boolean) => void) {
  useOncePerValue(id, () => {
    if (!id) { setTrace([]); return; }
    setTracing(true);
    api.trace(id).then((t) => setTrace(t.reachable)).catch(() => setTrace([])).finally(() => setTracing(false));
  });
}

// ─── 5. Work Planner ───

function WorkPlanner() {
  const { nodes, loading } = useTypedNodes("work_package");
  if (loading) return <PageWithHead kicker="EXECUTION" title="Work / Timebox Planner"><LoadingRow label="work packages" /></PageWithHead>;
  return (
    <PageWithHead kicker="EXECUTION" title="Work / Timebox Planner" sub="No timebox = not committed (INV-TIME). A wish, not work.">
      {nodes.length === 0 ? <EmptyState noun="work packages" /> : (
        <div className="flex flex-col gap-3">
          {nodes.map((w) => {
            const status = fmString(w, "status");
            const committed = status.toLowerCase() === "committed";
            return (
              <Card key={w.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2">
                    <NodeTypeBadge type="work_package" />
                    <Badge variant={committed ? "gate-ok" : "gate-warn"}>{status || "Intent"}</Badge>
                    <span className="text-sm font-medium">{nodeExcerpt(w)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <PomoCostBadge pomos={Number(fmString(w, "pomos")) || 0} />
                    {fmFilled(w, "linked_bet") && <Badge variant="outline" className="text-[10px]">bet: {fmString(w, "linked_bet").slice(0, 12)}</Badge>}
                    {committed
                      ? <Badge variant="gate-ok" className="text-[10px]">▣ timebox committed</Badge>
                      : <Badge variant="gate-warn" className="border-dashed text-[10px]">◇ no timebox — it's a wish</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageWithHead>
  );
}

// ─── 6. Execution Runbook ───

function ExecutionRunbook() {
  const { nodes, loading } = useTypedNodes("timebox");
  const active = nodes.find((t) => fmString(t, "status").toLowerCase() === "committed");
  if (loading) return <PageWithHead kicker="EXECUTION" title="Execution Runbook"><LoadingRow label="timeboxes" /></PageWithHead>;
  return (
    <PageWithHead kicker="EXECUTION" title="Execution Runbook" sub="Low-decision mode. Capture ideas, don't mutate strategy mid-execution (INV-EXEC).">
      {active ? (
        <div className="grid grid-cols-2 gap-4">
          <Panel title="Work Package"><p className="text-sm font-mono">{fmString(active, "work_package")}</p></Panel>
          <Panel title="Expected Output"><p className="text-sm">{fmString(active, "expected_output") || "—"}</p></Panel>
          <Panel title="Method"><p className="text-sm">Build the smallest end-to-end path; capture ideas in the bar below.</p></Panel>
          <Panel title="Capture Bar">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">💡 Idea</Button>
              <Button size="sm" variant="ghost">⚠ Blocker</Button>
              <Button size="sm" variant="ghost">⚡ Exception</Button>
              <Button size="sm" variant="outline">📎 Attach Evidence</Button>
            </div>
          </Panel>
        </div>
      ) : <EmptyState noun="committed timebox" hint="schedule one (POST /api/timeboxes)" />}
    </PageWithHead>
  );
}

// ─── 7. Daynote Ledger — vault-backed log (OKF log.md equivalent) ───

function DaynoteLedger() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useDaynote(date, setContent, setLoading);

  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <PageWithHead kicker="LEARNING" title="Daynote Ledger" sub="Your calendar is evidence. Read it honestly. (OKF log.md)">
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="text-muted-ink">date:</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border bg-surface-1 px-2 py-1 text-xs" />
      </div>
      <Panel>
        {loading ? <LoadingRow label="daynote" /> : lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded for {date}.</p>
        ) : (
          <pre className="font-mono text-xs leading-relaxed text-muted-foreground">{lines.join("\n")}</pre>
        )}
      </Panel>
    </PageWithHead>
  );
}

// ─── 8. VRD / Value ───

function VrdView() {
  const { nodes, loading } = useTypedNodes("value_claim");
  if (loading) return <PageWithHead kicker="LEARNING" title="VRD / Value Realization"><LoadingRow label="value claims" /></PageWithHead>;
  return (
    <PageWithHead kicker="LEARNING" title="VRD / Value Realization" sub="Weak claims surface as DEBT, never smoothed. INV-VALUE.">
      {nodes.length === 0 ? <EmptyState noun="value claims" /> : (
        <div className="flex flex-col gap-2">
          {nodes.map((v) => {
            const hasProof = fmList(v, "evidence_links").length > 0;
            return (
              <Card key={v.id} className={hasProof ? "border-gate-ok/30" : "border-gate-bad/40"}>
                <CardContent className="flex items-start gap-3 py-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <ProofLevelBadge level={fmString(v, "proof_level", "—")} />
                      <Badge variant="outline">{fmString(v, "status", "Drafted")}</Badge>
                    </div>
                    <p className="text-sm">{nodeExcerpt(v)}</p>
                    {!hasProof && <p className="text-xs text-gate-bad">PROOF DEBT: no evidence links (INV-VALUE)</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageWithHead>
  );
}

// ─── 9. Agent Draft Inbox ───

function AgentDraftInbox() {
  const { nodes, loading, reload } = useTypedNodes("agent_run");
  if (loading) return <PageWithHead kicker="GOVERNANCE" title="Agent Draft Inbox"><LoadingRow label="agent runs" /></PageWithHead>;
  return (
    <PageWithHead kicker="GOVERNANCE" title="Agent Draft Inbox" sub="INV-HUMAN: agent output is draft-only until a human approves.">
      {nodes.length === 0 ? <EmptyState noun="agent drafts" /> : (
        <div className="flex flex-col gap-2">
          {nodes.map((a) => (
            <Card key={a.id} className="border-l-4 border-l-gate-warn">
              <CardContent className="flex items-start gap-3 py-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="gate-warn">{fmString(a, "agent", "agent")}</Badge>
                    <Badge variant="outline">{fmString(a, "status", "Drafted")}</Badge>
                  </div>
                  <p className="text-sm">{nodeExcerpt(a)}</p>
                  <p className="text-[11px] text-muted-ink">No auto-accept; reviewer required.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={async () => { try { await api.acceptAgentRun(a.id, "Sam"); reload(); } catch {} }}>Accept (Sam)</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { try { await api.rejectAgentRun(a.id); reload(); } catch {} }}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWithHead>
  );
}

// ─── shared view wrapper ───

function PageWithHead({ kicker, title, sub, children }: { kicker: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <div>
      <PageHead kicker={kicker} title={title} sub={sub} />
      {children}
    </div>
  );
}

// ─── ERD (generated) — a living view over accepted evidence nodes (OKF index style) ───

function ErdView() {
  const { nodes, loading } = useTypedNodes("evidence_item");
  const accepted = nodes.filter((e) => fmString(e, "status").toLowerCase() === "accepted");
  if (loading) return <PageWithHead kicker="REALITY" title="Evidence Reality Dossier (generated)"><LoadingRow label="evidence" /></PageWithHead>;
  return (
    <PageWithHead
      kicker="REALITY · GENERATED"
      title="Evidence Reality Dossier"
      sub="An ERD is not a static file — it is regenerated from accepted evidence nodes every time you open it."
    >
      {accepted.length === 0 ? (
        <EmptyState noun="accepted evidence" hint="accept evidence in the Evidence Inbox" />
      ) : (
        <Panel>
          <div className="flex flex-col gap-2">
            {accepted.map((e) => {
              const contradicts = fmList(e, "contradicts");
              return (
                <div key={e.id} className="border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <ProofLevelBadge level={fmString(e, "proof_level", "—")} />
                    {fmFilled(e, "source_chunk") && <Badge variant="outline" className="text-[10px] font-mono">src: {fmString(e, "source_chunk").slice(0, 10)}</Badge>}
                    {contradicts.length > 0 && <ContradictionBadge />}
                  </div>
                  <p className="mt-1 text-sm">{nodeExcerpt(e)}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-faint">{e.id.slice(0, 18)}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
      <p className="mt-3 text-xs text-muted-ink">
        {accepted.length} of {nodes.length} evidence items accepted. Drafted items are excluded from the dossier until they pass the acceptance gate.
      </p>
    </PageWithHead>
  );
}

// ─── effect helpers (ponytail: avoid pulling in a heavier effect-per-deps lib) ───

/** Run `fn` once when `value` changes (keyed effect). */
function useOncePerValue(value: unknown, fn: () => void) {
  useEffect(() => { fn(); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useDaynote(date: string, setContent: (s: string) => void, setLoading: (b: boolean) => void) {
  useEffect(() => {
    setLoading(true);
    api.daynote(date).then((d) => setContent(d.content || "")).catch(() => setContent("")).finally(() => setLoading(false));
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps
}
