import { useState, useEffect, type ReactNode, type ChangeEvent } from "react";
import { cn } from "./lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  GateStatusBadge, ProofLevelBadge, NodeTypeBadge, EvidenceStateBadge,
  PomoCostBadge, MaturityChip, ContradictionBadge, SectionLabel, CapacityMeter,
} from "./atoms";
import { api, type GateResult } from "./api";
import {
  TagsBar, SortControl, AutocompleteDropdown, detectCompletion,
  collectTags, CloneIndicator, PromoteMenu,
  type CompletionState, type SortMode,
} from "./components/notes";

// ─── types matching api.ts shapes ───

interface Case_ { id: string; title: string; phase: string; owner: string | null; arena: string | null }
interface Evidence_ { id: string; text: string; proof_level: string; status: string; source_chunk: string | null }
interface Bet_ {
  id: string; thesis: string; status: string;
  linked_choice: string | null; assumptions: unknown[]; counterevidence_reviewed: boolean;
  success_metric: string | null; kill_criteria: string | null; owner: string | null;
}
interface WorkPkg_ { id: string; objective: string; status: string; linked_bet: string | null }
interface Timebox_ { id: string; status: string; work_package: string }
interface ValueClaim_ { id: string; statement: string; proof_level: string; evidence_links: unknown[]; status: string }
interface AgentRun_ { id: string; agent: string; status: string; summary: string }

// ─── mock data (swap with api.ts calls; shapes match) ───

const MOCK_CASE: Case_ = { id: "01J..CASE", title: "GodSpeed Founder-Market Bet", phase: "choose_and_bet", owner: "Sam", arena: "founder/operator AI" };

const MOCK_EVIDENCE: Evidence_[] = [
  { id: "01J..EV1", text: "Speed is the primary buying criterion for our ICP", proof_level: "Observed", status: "Accepted", source_chunk: "01J..SC1" },
  { id: "01J..EV2", text: "Competitor X ships in 2 weeks; we ship in 1", proof_level: "Supported", status: "Accepted", source_chunk: "01J..SC2" },
  { id: "01J..EV3", text: "Customer churn correlates with onboarding length", proof_level: "Hypothesized", status: "Drafted", source_chunk: null },
];

const MOCK_BETS: Bet_[] = [
  { id: "01J..B1", thesis: "Win founder-market on speed", status: "draft",
    linked_choice: null, assumptions: [], counterevidence_reviewed: false,
    success_metric: null, kill_criteria: null, owner: null },
  { id: "01J..B2", thesis: "1-day onboarding as wedge", status: "approved",
    linked_choice: "01J..CC1", assumptions: ["01J..A1"], counterevidence_reviewed: true,
    success_metric: "3 paying customers in 60 days", kill_criteria: "<1% conversion after 100 demos", owner: "Sam" },
];

const MOCK_WORK: WorkPkg_[] = [
  { id: "01J..W1", objective: "Ship 1-day onboarding", status: "Committed", linked_bet: "01J..B2" },
  { id: "01J..W2", objective: "Red-team the speed thesis", status: "Intent", linked_bet: null },
];

const MOCK_TIMEBOXES: Timebox_[] = [
  { id: "01J..T1", status: "Committed", work_package: "01J..W1" },
  { id: "01J..T2", status: "Verified", work_package: "01J..W1" },
];

const MOCK_VALUE: ValueClaim_[] = [
  { id: "01J..V1", statement: "Shipped onboarding; 2 of 5 prospects converted", proof_level: "validated", evidence_links: ["01J..EV1"], status: "Validated" },
  { id: "01J..V2", statement: "Speed advantage is defensible for 12 months", proof_level: "speculative", evidence_links: [], status: "Drafted" },
];

const MOCK_AGENTS: AgentRun_[] = [
  { id: "01J..A1", agent: "critic", status: "Completed", summary: "Red-team: 3 assumptions untested, 1 falsified" },
];

const CAPACITY = { committed: 18, available: 24 };

// ─── shell ───

type View = "notes" | "journal" | "cockpit" | "evidence" | "trace" | "bets" | "work" | "runbook" | "daynote" | "vrd" | "agent";

const NAV: { group: string; items: { id: View; label: string }[] }[] = [
  { group: "Notes", items: [{ id: "notes", label: "All Notes" }, { id: "journal", label: "Journal" }] },
  { group: "Reality", items: [{ id: "cockpit", label: "Case Cockpit" }, { id: "evidence", label: "Evidence Inbox" }] },
  { group: "Strategy", items: [{ id: "bets", label: "Bet Board" }, { id: "trace", label: "Trace Explorer" }] },
  { group: "Execution", items: [{ id: "work", label: "Work / Timebox" }, { id: "runbook", label: "Execution Runbook" }] },
  { group: "Learning", items: [{ id: "daynote", label: "Daynote Ledger" }, { id: "vrd", label: "VRD / Value" }] },
  { group: "Governance", items: [{ id: "agent", label: "Agent Drafts" }] },
];

export function App() {
  const [view, setView] = useState<View>("cockpit");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* sidebar */}
      <aside className="flex w-[232px] shrink-0 flex-col border-r bg-surface-1">
        <div className="flex h-12 items-center gap-2 px-4">
          <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            StrategyNotes
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV.map((g) => (
            <div key={g.group} className="mb-3">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
                {g.group}
              </div>
              {g.items.map((it) => (
                <a
                  key={it.id}
                  href={`#${it.id}`}
                  onClick={(e) => { e.preventDefault(); setView(it.id); }}
                  className={cn(
                    "relative flex items-center rounded-md py-[7px] pr-[10px] pl-4 text-sm transition-colors",
                    view === it.id
                      ? "bg-surface-3 text-foreground before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {it.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="flex flex-1 flex-col">
        {/* topbar */}
        <header className="flex h-12 items-center gap-4 border-b bg-surface-1 px-4">
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span>GodSpeed Founder-Market Bet</span>
            <Badge variant="outline" className="capitalize">{MOCK_CASE.phase.replace(/_/g, " ")}</Badge>
          </div>
          <CapacityMeter committed={CAPACITY.committed} available={CAPACITY.available} />
        </header>

        {/* canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1340px]">
            {view === "notes" && <NotesView />}
            {view === "journal" && <JournalView />}
            {view === "cockpit" && <CaseCockpit />}
            {view === "evidence" && <EvidenceInbox />}
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
    </div>
  );
}

// ─── shared page header ───

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

// ─── 1. Case Cockpit ───

const STAGES = ["establish_reality", "define_outcomes", "develop_logic", "choose_and_bet", "design_execution", "validate", "realize_value", "review"];
const ARTIFACT_STATUS: Record<string, string> = { ERD: "Accepted", ORD: "Reviewed", SLD: "Drafted", EDS: "—", VSD: "—", VRD: "—" };

function CaseCockpit() {
  const stageIdx = STAGES.indexOf(MOCK_CASE.phase);
  return (
    <div className="flex flex-col gap-5">
      <PageHead kicker="CASE · 01J..CASE" title={MOCK_CASE.title} sub={`Owner: ${MOCK_CASE.owner} · Arena: ${MOCK_CASE.arena}`} />

      {/* lifecycle — discrete stages, NOT a progress bar */}
      <Panel title="Lifecycle">
        <div className="flex items-center gap-1">
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
        {/* artifacts */}
        <Panel title="Artifacts">
          <div className="flex flex-col gap-2">
            {Object.entries(ARTIFACT_STATUS).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k}</span>
                {v === "—" ? <span className="text-faint">—</span> : <MaturityChip maturity={v} />}
              </div>
            ))}
          </div>
        </Panel>

        {/* evidence debt */}
        <Panel title="Evidence Debt">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-normal tabular text-gate-bad" style={{ fontFamily: "var(--font-display)" }}>1</span>
              <span className="text-sm text-muted-foreground">drafted, not accepted</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-normal tabular text-gate-warn" style={{ fontFamily: "var(--font-display)" }}>0</span>
              <span className="text-sm text-muted-foreground">claims lack proof</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-normal tabular text-gate-warn" style={{ fontFamily: "var(--font-display)" }}>1</span>
              <span className="text-sm text-muted-foreground">bets lack kill criteria</span>
            </div>
          </div>
        </Panel>

        {/* capacity */}
        <Panel title="Strategy Capacity">
          <div className="flex flex-col gap-2">
            <CapacityMeter committed={CAPACITY.committed} available={CAPACITY.available} />
            <p className="text-xs text-muted-foreground">
              {CAPACITY.committed} of {CAPACITY.available} pomos committed this cycle.
            </p>
            <p className="text-xs text-gate-ok">
              ✓ Capacity is feasible.
            </p>
          </div>
        </Panel>
      </div>

      {/* next best action */}
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="py-4">
          <SectionLabel>Next Best Action</SectionLabel>
          <p className="mt-1 text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Your bet <strong>"Win founder-market on speed"</strong> is drafted but blocked.
            Fill the 6 INV-BET requirements (assumptions, kill criteria, owner) to unlock approval.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 2. Evidence Inbox ───

function EvidenceInbox() {
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  return (
    <div>
      <PageHead kicker="REALITY" title="Evidence Inbox" sub="Triage draft evidence. The gap between Drafted and Accepted is the work." />
      <div className="flex flex-col gap-2">
        {MOCK_EVIDENCE.map((e) => (
          <Card key={e.id} className={e.status === "Drafted" ? "border-dashed border-gate-warn/40" : ""}>
            <CardContent className="flex items-start gap-3 py-3">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ProofLevelBadge level={e.proof_level} />
                  <EvidenceStateBadge state={e.status} />
                  {e.source_chunk && <Badge variant="outline" className="text-[10px] font-mono">{e.source_chunk.slice(0, 12)}</Badge>}
                </div>
                <p className="text-sm">{e.text}</p>
              </div>
              {e.status === "Drafted" && (
                <Button size="sm" variant="outline" onClick={() => setGate((g) => ({ ...g, [e.id]: { status: "approved" } }))}>
                  Accept
                </Button>
              )}
              <GateStatusBadge gate={gate[e.id] ?? null} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Bet Board ───

const BET_REQS: [keyof Bet_, string][] = [
  ["linked_choice", "linked choice"],
  ["assumptions", "assumptions"],
  ["counterevidence_reviewed", "counterevidence reviewed"],
  ["success_metric", "success metric"],
  ["kill_criteria", "kill criteria"],
  ["owner", "owner"],
];

function BetBoard() {
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const cols: { id: string; label: string }[] = [
    { id: "draft", label: "Draft" }, { id: "blocked", label: "Blocked" },
    { id: "approved", label: "Approved" }, { id: "killed", label: "Killed" },
  ];
  return (
    <div>
      <PageHead kicker="STRATEGY" title="Bet Board" sub="Every bet must pass the INV-BET gate before approval. A blocked bet looks blocked." />
      <div className="grid grid-cols-4 gap-4">
        {cols.map((col) => (
          <div key={col.id} className="flex flex-col gap-2">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-ink">{col.label}</div>
            {MOCK_BETS.filter((b) => b.status === col.id).map((b) => (
              <Card key={b.id} className={col.id === "blocked" ? "border-gate-bad/40" : col.id === "approved" ? "border-gate-ok/30" : ""}>
                <CardContent className="flex flex-col gap-2 py-3">
                  <p className="text-sm font-medium">{b.thesis}</p>
                  <div className="flex flex-col gap-1">
                    {BET_REQS.map(([key, label]) => {
                      const val = b[key];
                      const filled = Array.isArray(val) ? val.length > 0 : val !== null && val !== false && val !== "";
                      return (
                        <div key={label} className="flex items-center gap-1.5 text-[11px]">
                          <span className={filled ? "text-gate-ok" : "text-gate-bad"}>{filled ? "✓" : "✕"}</span>
                          <span className={filled ? "text-muted-foreground" : "text-gate-bad"}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {b.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => {
                      const blocked = BET_REQS.every(([k]) => {
                        const v = b[k]; return Array.isArray(v) ? v.length > 0 : v !== null && v !== false && v !== "";
                      });
                      setGate((g) => ({ ...g, [b.id]: blocked ? { status: "approved" } : { status: "blocked", failed_gates: ["missing assumptions", "missing kill criteria", "missing owner"] } }));
                    }}>
                      Approve [INV-BET]
                    </Button>
                  )}
                  <GateStatusBadge gate={gate[b.id] ?? null} />
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Trace Explorer ───

function TraceExplorer() {
  return (
    <div>
      <PageHead kicker="STRATEGY" title="Trace Explorer" sub="Source → evidence → claim → bet → work → timebox → review → value. Counterevidence stays visible." />
      <Panel title="Spine Trace (source → value)">
        <div className="flex flex-col gap-1 font-mono text-xs">
          {[
            { id: "01J..SC1", type: "source_chunk", label: "⌕ interview #4", edge: "supports" },
            { id: "01J..EV1", type: "evidence_item", label: "Speed is primary criterion", edge: "supports" },
            { id: "01J..CL1", type: "strategic_claim", label: "Speed = defensible advantage", edge: "derives_from" },
            { id: "01J..B2", type: "strategy_bet", label: "Win founder-market on speed", edge: "requires" },
            { id: "01J..W1", type: "work_package", label: "Ship 1-day onboarding", edge: "scheduled_by" },
            { id: "01J..T1", type: "timebox", label: "2026-07-01 13:00–14:00", edge: "reviewed_by" },
            { id: "01J..V1", type: "value_claim", label: "2 of 5 prospects converted", edge: "validates" },
          ].map((n, i, arr) => (
            <div key={n.id}>
              <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary">
                <NodeTypeBadge type={n.type} />
                <span className="text-foreground">{n.label}</span>
                <span className="ml-auto text-faint font-mono">{n.id}</span>
              </div>
              {i < arr.length - 1 && <div className="pl-4 text-faint">↑ {n.edge}</div>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Counterevidence (INV-CONTRA)">
        <div className="flex items-center gap-2 text-sm">
          <ContradictionBadge />
          <span className="text-muted-foreground">Competitor Y claims feature parity at lower cost (status: Contested)</span>
        </div>
      </Panel>
    </div>
  );
}

// ─── 5. Work Planner ───

function WorkPlanner() {
  return (
    <div>
      <PageHead kicker="EXECUTION" title="Work Package / Timebox Planner" sub="No timebox = not committed (INV-TIME). A wish, not work." />
      <div className="flex flex-col gap-3">
        {MOCK_WORK.map((w) => (
          <Card key={w.id}>
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <NodeTypeBadge type="work_package" />
                <Badge variant={w.status === "Committed" ? "gate-ok" : "gate-warn"}>{w.status}</Badge>
                <span className="text-sm font-medium">{w.objective}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>inputs: ✓</span><span>outputs: ✓</span><span>tools: ✓</span><span>technique: ✓</span>
                <PomoCostBadge pomos={2} attention="execution_build" />
                {w.status === "Committed" ? (
                  <Badge variant="gate-ok" className="text-[10px]">▣ timebox committed</Badge>
                ) : (
                  <Badge variant="gate-warn" className="border-dashed text-[10px]">◇ no timebox — it's a wish</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Execution Runbook ───

function ExecutionRunbook() {
  const active = MOCK_TIMEBOXES.find((t) => t.status === "Committed");
  return (
    <div>
      <PageHead kicker="EXECUTION" title="Execution Runbook" sub="Low-decision mode. Capture ideas, don't mutate strategy mid-execution (INV-EXEC)." />
      {active ? (
        <div className="grid grid-cols-2 gap-4">
          <Panel title="Inputs"><ul className="text-sm text-muted-foreground"><li>✓ Evidence: speed is primary criterion</li><li>✓ Bet: win founder-market on speed</li></ul></Panel>
          <Panel title="Expected Output"><p className="text-sm">Draft 1-day onboarding flow</p></Panel>
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
      ) : (
        <p className="text-muted-foreground">No active timeboxes.</p>
      )}
    </div>
  );
}

// ─── 7. Daynote Ledger ───

function DaynoteLedger() {
  const lines = [
    "10:54 created 01J..CASE (user)",
    "10:54 created 01J..EV1 (user)",
    "10:54 accepted 01J..EV1 (user)",
    "10:54 accepted 01J..B2 (user)",
    "10:54 scheduled 01J..T1 (user)",
    "10:54 verified 01J..T2 (user)",
  ];
  return (
    <div>
      <PageHead kicker="LEARNING" title="Daynote Ledger" sub="Your calendar is evidence. Let's read it honestly." />
      <Panel>
        <pre className="font-mono text-xs leading-relaxed text-muted-foreground">{lines.join("\n")}</pre>
      </Panel>
    </div>
  );
}

// ─── 8. VRD / Value ───

function VrdView() {
  return (
    <div>
      <PageHead kicker="LEARNING" title="VRD / Value Realization" sub="Weak claims surface as DEBT, never smoothed. INV-VALUE." />
      <div className="flex flex-col gap-2">
        {MOCK_VALUE.map((v) => {
          const hasProof = v.evidence_links.length > 0;
          return (
            <Card key={v.id} className={hasProof ? "border-gate-ok/30" : "border-gate-bad/40"}>
              <CardContent className="flex items-start gap-3 py-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ProofLevelBadge level={v.proof_level} />
                    <Badge variant="outline">{v.status}</Badge>
                  </div>
                  <p className="text-sm">{v.statement}</p>
                  {!hasProof && <p className="text-xs text-gate-bad">PROOF DEBT: no evidence links (INV-VALUE)</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── 9. Agent Draft Inbox ───

function AgentDraftInbox() {
  return (
    <div>
      <PageHead kicker="GOVERNANCE" title="Agent Draft Inbox" sub="INV-HUMAN: agent output is draft-only until a human approves." />
      <div className="flex flex-col gap-2">
        {MOCK_AGENTS.map((a) => (
          <Card key={a.id} className="border-l-4 border-l-gate-warn">
            <CardContent className="flex items-start gap-3 py-3">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="gate-warn">{a.agent}</Badge>
                  <Badge variant="outline">{a.status}</Badge>
                </div>
                <p className="text-sm">{a.summary}</p>
                <p className="text-[11px] text-muted-ink">No auto-accept; reviewer required.</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="outline">Accept (Sam)</Button>
                <Button size="sm" variant="ghost">Reject</Button>
                <Button size="sm" variant="ghost">Request changes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 10. Notes View (the foundation layer) ───

interface NoteItem {
  id: string;
  title: string;
  body: string;
}

function NotesView() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [backlinks, setBacklinks] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [completion, setCompletion] = useState<CompletionState>({ type: null, startPos: 0, partial: "" });
  const [placements, setPlacements] = useState(0);

  const loadNotes = async () => {
    try {
      const ids = await api.nodesByType("note");
      const items = await Promise.all(ids.slice(0, 50).map((id) => api.getNode(id)));
      setNotes(items.map((n) => ({
        id: String(n.id),
        title: String((n as Record<string, unknown>).title ?? n.id),
        body: String(n.body ?? ""),
      })));
    } catch { /* server not running */ }
    setLoading(false);
  };

  useEffect(() => { loadNotes(); }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.getBacklinks(selectedId).then(setBacklinks).catch(() => setBacklinks([]));
    api.getPlacements(selectedId).then((p) => setPlacements(p.length)).catch(() => setPlacements(0));
  }, [selectedId]);

  const selected = notes.find((n) => n.id === selectedId);

  // Phase 2: tag collection + filtered/sorted list
  const allTags = collectTags(notes);
  const noteTitles = notes.map((n) => n.title).filter((t) => t && t !== "Untitled note");
  const filtered = notes
    .filter((n) => !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.body.toLowerCase().includes(query.toLowerCase()))
    .filter((n) => !activeTag || new RegExp(`#${activeTag}\\b`).test(n.body))
    .sort((a, b) => sortMode === "alpha" ? a.title.localeCompare(b.title) : 0);

  // Phase 2: autocomplete
  const handleEditChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditBody(text);
    const cursorPos = e.target.selectionStart ?? text.length;
    setCompletion(detectCompletion(text, cursorPos));
  };

  const handleCompletion = (value: string) => {
    if (!completion.type) return;
    const insert = completion.type === "wikilink" ? `${value}]]` : value;
    const newBody = editBody.slice(0, completion.startPos) + insert + editBody.slice(completion.startPos + completion.partial.length);
    setEditBody(newBody);
    setCompletion({ type: null, startPos: 0, partial: "" });
  };

  const handlePromote = async (targetType: string) => {
    if (!selectedId) return;
    try {
      const result = await api.promoteNote(selectedId, targetType);
      // The promoted node is now a new typed node; show a brief notification.
      alert(`Promoted to ${targetType}: ${String(result.id).slice(0, 14)}`);
    } catch { /* server not running */ }
  };

  const createNote = async () => {
    try {
      const n = await api.createNote("Untitled note");
      const item = { id: String(n.id), title: "Untitled note", body: "" };
      setNotes((prev) => [item, ...prev]);
      setSelectedId(item.id);
      setEditBody("");
    } catch { /* server not running */ }
  };

  const saveNote = async () => {
    if (!selectedId) return;
    try {
      await api.updateNote(selectedId, editBody);
      setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, body: editBody } : n)));
    } catch { /* server not running */ }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch { /* server not running */ }
  };

  return (
    <div>
      <PageHead kicker="NOTES" title="All Notes" sub="Capture, write, outline, link, clone, search." />
      <div className="flex gap-4" style={{ height: "calc(100vh - 180px)" }}>
        {/* note list */}
        <div className="flex w-[300px] shrink-0 flex-col gap-2 overflow-y-auto">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 rounded-md border bg-surface-1 px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <SortControl value={sortMode} onChange={setSortMode} />
            <Button size="sm" onClick={createNote}>+ New</Button>
          </div>
          {allTags.length > 0 && <TagsBar tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />}
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Create one or start the backend.</p>}
          {filtered.map((n) => {
            const tags = Array.from(n.body.matchAll(/#([\w-]+)/g)).map((m) => m[1]);
            const wikilinks = Array.from(n.body.matchAll(/\[\[([^\]]+)\]\]/g)).map((m) => m[1]);
            return (
              <Card key={n.id} className={cn("cursor-pointer transition-colors", selectedId === n.id ? "border-primary" : "hover:border-border-strong")}>
                <CardContent className="py-3" onClick={() => { setSelectedId(n.id); setEditBody(n.body); }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{n.title || "Untitled"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="text-faint hover:text-destructive text-xs">✕</button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.body.slice(0, 100) || "Empty note"}</p>
                  {(tags.length > 0 || wikilinks.length > 0) && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[9px]">#{t}</Badge>)}
                      {wikilinks.slice(0, 2).map((w) => <Badge key={w} variant="outline" className="text-[9px] text-primary">[[{w}]]</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* editor + backlinks */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>{selected.title || "Untitled"}</span>
                <div className="flex items-center gap-2">
                  <CloneIndicator count={placements} />
                  <Badge variant="outline" className="font-mono text-[9px]">{selected.id.slice(0, 14)}</Badge>
                  <PromoteMenu onPromote={handlePromote} />
                  <Button size="sm" variant="outline" onClick={saveNote}>Save</Button>
                </div>
              </div>
              <div className="relative flex-1">
                <textarea
                  value={editBody}
                  onChange={handleEditChange}
                  onBlur={saveNote}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setCompletion({ type: null, startPos: 0, partial: "" });
                  }}
                  placeholder="Write in markdown. Use [[Title]] for wikilinks, #tag for tags, ((ULID)) for block refs."
                  className="h-full w-full resize-none rounded-lg border bg-surface-1 p-4 font-mono text-sm leading-relaxed outline-none focus:border-primary"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                {completion.type && (
                  <AutocompleteDropdown
                    state={completion}
                    noteTitles={noteTitles}
                    allTags={allTags.map((t) => t.name)}
                    onSelect={handleCompletion}
                  />
                )}
              </div>
              <Card>
                <CardContent className="py-3">
                  <SectionLabel>Backlinks ({backlinks.length})</SectionLabel>
                  {backlinks.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">No notes link here yet.</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-1">
                      {backlinks.map((bl) => (
                        <button key={bl} onClick={() => { setSelectedId(bl); const n = notes.find((x) => x.id === bl); if (n) setEditBody(n.body); }} className="rounded-md px-2 py-1 text-left text-xs text-primary hover:bg-secondary">
                          → {bl.slice(0, 20)}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Select a note or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 11. Journal View (TASK-N25 — day-based activity log) ───

function JournalView() {
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDay = async (d: string) => {
    setLoading(true);
    try {
      const result = await api.daynote(d);
      setContent(result.content || "");
    } catch {
      setContent("");
    }
    setLoading(false);
  };

  useEffect(() => { loadDay(date); }, [date]);

  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  // Parse daynote lines into structured entries
  const entries = content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.match(/^- (\d{2}:\d{2}:\d{2}) (\w+) (\S+) \((\w+)\)$/);
      if (match) {
        return { time: match[1], action: match[2], nodeId: match[3], source: match[4] };
      }
      return { time: "", action: "", nodeId: "", source: "", raw: line };
    });

  return (
    <div>
      <PageHead kicker="JOURNAL" title="Activity Journal" sub="Your calendar is evidence. Read it honestly." />
      <div className="mb-4 flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => shiftDay(-1)}>← Prev</Button>
        <span className="font-mono text-sm text-muted-foreground">{date}</span>
        <Button size="sm" variant="ghost" onClick={() => shiftDay(1)}>Next →</Button>
        {date !== today.toISOString().slice(0, 10) && (
          <Button size="sm" variant="ghost" onClick={() => setDate(today.toISOString().slice(0, 10))}>Today</Button>
        )}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : entries.length === 0 ? (
        <Card><CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No activity recorded for {date}.</p>
        </CardContent></Card>
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-secondary">
              <span className="font-mono text-xs text-faint">{e.time || "—"}</span>
              <Badge variant={
                e.action === "created" ? "gate-ok" :
                e.action === "accepted" ? "gate-info" :
                e.action === "verified" ? "accent" :
                e.action === "modified" ? "gate-warn" : "outline"
              } className="capitalize">{e.action || "event"}</Badge>
              {e.nodeId && (
                <button
                  onClick={() => { /* navigate to note if in notes view */ }}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {e.nodeId.slice(0, 18)}
                </button>
              )}
              {e.source && <span className="text-[10px] text-faint">({e.source})</span>}
              {e.raw && <span className="text-xs text-muted-foreground">{e.raw}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
