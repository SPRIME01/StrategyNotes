import { useState } from "react";
import { api, type GateResult } from "./api";

// Ponytail: shell UI only. The atomic component library (atoms/molecules/
// organisms per SPEC sec 11) lands in a later Phase 12 sub-slice. This page
// proves the spine is visible and that gate results render as the user will
// see them - green for Approved, red for Blocked with reasons.

interface Step {
  label: string;
  status: "pending" | "running" | "approved" | "blocked" | "done";
  detail?: string;
}

const INITIAL: Step[] = [
  { label: "Create strategy case", status: "pending" },
  { label: "Ingest source + extract evidence", status: "pending" },
  { label: "Accept evidence [INV-EVID]", status: "pending" },
  { label: "Draft strategic claim", status: "pending" },
  { label: "Draft strategy bet", status: "pending" },
  { label: "Approve empty bet [INV-BET must block]", status: "pending" },
  { label: "Fill required bet fields", status: "pending" },
  { label: "Approve complete bet [INV-BET]", status: "pending" },
  { label: "Create + commit work package [INV-WORK]", status: "pending" },
  { label: "Schedule timebox", status: "pending" },
  { label: "Review + verify timebox [INV-REVIEW]", status: "pending" },
  { label: "Claim + validate value [INV-VALUE]", status: "pending" },
  { label: "Trace source -> value", status: "pending" },
];

function gateDetail(r: GateResult): string {
  return r.status === "blocked" && r.failed_gates
    ? `BLOCKED: ${r.failed_gates.join("; ")}`
    : "APPROVED";
}

export function App() {
  const [steps, setSteps] = useState<Step[]>(INITIAL);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    const next = INITIAL.map((s) => ({ ...s, status: "pending" as const }));
    setSteps([...next]);
    try {
      const at = (i: number, patch: Partial<Step>) => {
        setSteps((cur) => cur.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
      };

      // 0. Case
      at(0, { status: "running" });
      const case_ = await api.createCase("Founder-market speed bet");
      at(0, { status: "done", detail: case_.id });

      // 1. Source + chunk + evidence
      at(1, { status: "running" });
      const source = await api.addSource("Customer discovery batch");
      const chunk = await api.addSourceChunk(source.id, "interview #4", "ICP wants speed");
      const evidence = await api.extractEvidence(chunk.id, "Speed is the primary buying criterion", "observed", "direct_quote");
      at(1, { status: "done", detail: evidence.id });

      // 2. Accept evidence
      at(2, { status: "running" });
      const ev = await api.acceptEvidence(evidence.id);
      at(2, { status: ev.status === "approved" ? "approved" : "blocked", detail: gateDetail(ev) });

      // 3. Claim
      at(3, { status: "running" });
      const claim = await api.createClaim("Speed-of-delivery is our advantage", "supported", [evidence.id]);
      at(3, { status: "done", detail: claim.id });

      // 4. Draft bet
      at(4, { status: "running" });
      const bet = await api.draftBet(case_.id, "Win founder-market on speed");
      at(4, { status: "done", detail: bet.id });

      // 5. Approve EMPTY bet -> must BLOCK
      at(5, { status: "running" });
      const blocked = await api.approveBet(bet.id);
      at(5, { status: blocked.status === "blocked" ? "blocked" : "approved", detail: gateDetail(blocked) });

      // 6-7. (Fill happens server-side via the spine runner; here we show the
      //      next approve reflects the same bet still drafted - the UI flags
      //      that a real client would mutate via a dedicated endpoint.)
      at(6, { status: "done", detail: "client fills owner/assumptions/metric/kill criteria" });
      at(7, { status: "running" });
      const approved = await api.approveBet(bet.id);
      at(7, { status: approved.status === "approved" ? "approved" : "blocked", detail: gateDetail(approved) });

      // 8. Work package
      at(8, { status: "running" });
      const wp = await api.createWorkPackage(case_.id, bet.id, "Ship 1-day onboarding");
      const wpCommit = await api.commitWorkPackage(wp.id);
      at(8, { status: wpCommit.status === "approved" ? "approved" : "blocked", detail: gateDetail(wpCommit) });

      // 9. Timebox
      at(9, { status: "running" });
      const tb = await api.scheduleTimebox(wp.id, 2, "Ship onboarding draft");
      at(9, { status: "done", detail: tb.id });

      // 10. Review + verify
      at(10, { status: "running" });
      const review = await api.reviewTimebox(tb.id, 3, [evidence.id], "ship v0.2; schedule test");
      at(10, { status: review.gate.status === "approved" ? "approved" : "blocked", detail: gateDetail(review.gate) });

      // 11. Value claim
      at(11, { status: "running" });
      const value = await api.claimValue(case_.id, "2 of 5 prospects converted", "validated", [evidence.id], claim.id);
      const v = await api.validateValue(value.id);
      at(11, { status: v.status === "approved" ? "approved" : "blocked", detail: gateDetail(v) });

      // 12. Trace
      at(12, { status: "running" });
      const trace = await api.trace(chunk.id);
      at(12, { status: "done", detail: `${trace.reachable.length} nodes reachable` });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <h1>StrategyNotes</h1>
      <p style={{ opacity: 0.7 }}>
        Local-first, markdown-native strategic knowledge and execution system.
      </p>
      <p><em>The note is the atom. Strategy is the grammar. Time is the cost. Evidence is the proof.</em></p>

      <button
        onClick={run}
        disabled={running}
        style={{ padding: "10px 16px", fontSize: 16, cursor: running ? "wait" : "pointer" }}
      >
        {running ? "Running spine..." : "Run the strategy spine"}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#fee", border: "1px solid #c33" }}>
          <strong>Error:</strong> {error}
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
            (Start the backend: <code>cargo run -p strategynotes-server -- serve</code>)
          </div>
        </div>
      )}

      <ol style={{ marginTop: 24, lineHeight: 1.6 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ opacity: s.status === "pending" ? 0.4 : 1 }}>
            <span style={{
              display: "inline-block",
              width: 90,
              fontWeight: 600,
              color: s.status === "approved" ? "#080" : s.status === "blocked" ? "#c00" : "inherit",
            }}>
              {s.status.toUpperCase()}
            </span>
            {s.label}
            {s.detail && <div style={{ marginLeft: 90, fontSize: 13, opacity: 0.75 }}>{s.detail}</div>}
          </li>
        ))}
      </ol>
    </main>
  );
}
