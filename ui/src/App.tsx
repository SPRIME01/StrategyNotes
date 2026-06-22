import { useState } from "react";
import {
  AgentDraftInbox, BetBoard, CaseCockpit, DaynoteLedger, EvidenceInbox,
  ExecutionRunbook, TraceExplorer, VrdView, WorkPlanner,
} from "./organisms";

// Phase E shell: tabs over the 8 required organisms + Agent Draft Inbox.
// Backend owns gates; the UI renders results. No new backend rules here.

type Tab =
  | "cockpit" | "evidence" | "trace" | "bets" | "planner"
  | "runbook" | "daynote" | "vrd" | "agent";

const TABS: { id: Tab; label: string }[] = [
  { id: "cockpit", label: "Case Cockpit" },
  { id: "evidence", label: "Evidence Inbox" },
  { id: "trace", label: "Trace Explorer" },
  { id: "bets", label: "Bet Board" },
  { id: "planner", label: "Work / Timebox Planner" },
  { id: "runbook", label: "Execution Runbook" },
  { id: "daynote", label: "Daynote Ledger" },
  { id: "vrd", label: "VRD / Value" },
  { id: "agent", label: "Agent Drafts" },
];

export function App() {
  const [tab, setTab] = useState<Tab>("cockpit");
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>StrategyNotes</h1>
      <p style={{ opacity: 0.7 }}>
        Local-first, markdown-native strategic knowledge and execution system.
      </p>
      <p><em>The note is the atom. Strategy is the grammar. Time is the cost. Evidence is the proof.</em></p>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "6px 12px", cursor: "pointer",
              background: tab === t.id ? "#4a90d9" : "#eee",
              color: tab === t.id ? "#fff" : "#333",
              border: "1px solid #ccc", borderRadius: 4,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "cockpit" && <CaseCockpit />}
      {tab === "evidence" && <EvidenceInbox />}
      {tab === "trace" && <TraceExplorer />}
      {tab === "bets" && <BetBoard />}
      {tab === "planner" && <WorkPlanner />}
      {tab === "runbook" && <ExecutionRunbook />}
      {tab === "daynote" && <DaynoteLedger />}
      {tab === "vrd" && <VrdView />}
      {tab === "agent" && <AgentDraftInbox />}
    </main>
  );
}
