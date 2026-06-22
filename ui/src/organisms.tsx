// Phase E UI organisms (SPEC sec 11). Each is a composition of the existing
// HTTP API - no new backend rules invented here. The backend owns gates; these
// only render results. Ponytail: one co-located file for the 8 organisms +
// shared helpers; a later sub-slice can split them per the atomic library.

import { useEffect, useState, type ReactNode } from "react";
import { api, type GateResult } from "./api";

// ---- shared ----

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): [T | null, string | null, () => void] {
  const [v, setV] = useState<T | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    fn().then((x) => alive && setV(x)).catch((e) => alive && setErr(String(e)));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [v, err, () => setTick((t) => t + 1)];
}

function GatePill({ r }: { r: GateResult | null }) {
  if (!r) return null;
  const ok = r.status === "approved";
  return (
    <span style={{ color: ok ? "#080" : "#c00", fontWeight: 600, fontSize: 12 }}>
      {ok ? "APPROVED" : `BLOCKED: ${r.failed_gates?.join("; ")}`}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p style={{ opacity: 0.5 }}>{label}</p>;
}

function Err({ msg }: { msg: string }) {
  return <div style={{ color: "#c00" }}>error: {msg} (is the server running?)</div>;
}

// ---- 1. Case Cockpit ----

export function CaseCockpit() {
  const [ids, err, refresh] = useAsync(() => api.nodesByType("strategy_case"), []);
  const [cases, setCases] = useState<Awaited<ReturnType<typeof api.getNode>>[]>([]);
  useEffect(() => {
    if (!ids) return;
    Promise.all(ids.map((id) => api.getNode(id))).then(setCases).catch(() => {});
  }, [ids]);
  if (err) return <Err msg={err} />;
  if (!ids) return <Empty label="loading..." />;
  if (ids.length === 0)
    return (
      <Panel title="Case Cockpit">
        <CaseCreator onCreated={refresh} />
        <Empty label="no cases yet" />
      </Panel>
    );
  return (
    <Panel title="Case Cockpit">
      <CaseCreator onCreated={refresh} />
      {cases.map((c) => (
        <div key={c.id} style={{ padding: 8, borderLeft: "3px solid #4a90d9", marginBottom: 8 }}>
          <strong>{String((c as Record<string, unknown>).title ?? c.id)}</strong>{" "}
          <span style={{ opacity: 0.7 }}>phase: {String((c as Record<string, unknown>).phase ?? "?")}</span>
          {((c as Record<string, unknown>).owner as string) && (
            <span style={{ opacity: 0.7 }}> · owner: {String((c as Record<string, unknown>).owner)}</span>
          )}
        </div>
      ))}
    </Panel>
  );
}

function CaseCreator({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); if (!title.trim()) return; setBusy(true);
        await api.createCase(title); setTitle(""); setBusy(false); onCreated(); }}
      style={{ marginBottom: 12 }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="new case title" />
      <button type="submit" disabled={busy}>{busy ? "..." : "+ case"}</button>
    </form>
  );
}

// ---- 2. Evidence Inbox ----

export function EvidenceInbox() {
  const [ids, err, refresh] = useAsync(() => api.nodesByType("evidence_item"), []);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [gate, setGate] = useState<Record<string, GateResult | null>>({});
  useEffect(() => {
    if (!ids) return;
    Promise.all(ids.map((id) => api.getNode(id))).then((ns) => setItems(ns as never[])).catch(() => {});
  }, [ids]);
  if (err) return <Err msg={err} />;
  return (
    <Panel title="Evidence Inbox">
      {items.length === 0 ? <Empty label="no evidence drafted" /> : items.map((it) => {
        const id = String(it.id);
        return (
          <div key={id} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>{String(it.proof_level)}</span>{" "}
            <span style={{ opacity: 0.7 }}>[{String(it.status)}]</span>
            <div>{String(it.text)}</div>
            <button onClick={async () => { const r = await api.acceptEvidence(id); setGate((g) => ({ ...g, [id]: r })); refresh(); }}>
              accept [INV-EVID]
            </button>{" "}
            <GatePill r={gate[id] ?? null} />
          </div>
        );
      })}
    </Panel>
  );
}

// ---- 3. Trace Explorer ----

export function TraceExplorer() {
  const [start, setStart] = useState("");
  const [reach, setReach] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Panel title="Trace Explorer">
      <form onSubmit={async (e) => { e.preventDefault(); try { const t = await api.trace(start); setReach(t.reachable); setErr(null); } catch (x) { setErr(String(x)); } }}>
        <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="source node id" />
        <button type="submit">trace</button>
      </form>
      {err && <Err msg={err} />}
      {reach && (
        <div>
          <strong>{reach.length}</strong> nodes reachable from {start}:
          <ul>{reach.map((r) => <li key={r}><code>{r}</code></li>)}</ul>
        </div>
      )}
    </Panel>
  );
}

// ---- 4. Bet Board ----

export function BetBoard() {
  const [ids, err, refresh] = useAsync(() => api.nodesByType("strategy_bet"), []);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [gate, setGate] = useState<Record<string, GateResult | null>>({});
  useEffect(() => {
    if (!ids) return;
    Promise.all(ids.map((id) => api.getNode(id))).then((ns) => setItems(ns as never[])).catch(() => {});
  }, [ids]);
  if (err) return <Err msg={err} />;
  return (
    <Panel title="Bet Board">
      {items.length === 0 ? <Empty label="no bets drafted" /> : items.map((it) => {
        const id = String(it.id);
        return (
          <div key={id} style={{ marginBottom: 8, padding: 8, background: it.status === "approved" ? "#efe" : "#fee" }}>
            <strong>{String(it.thesis)}</strong>{" "}
            <span style={{ opacity: 0.7 }}>[{String(it.status)}]</span>
            <div style={{ fontSize: 12 }}>
              assumptions: {Array.isArray(it.assumptions) ? it.assumptions.length : 0} · kill: {String(it.kill_criteria ?? "—")} · owner: {String(it.owner ?? "—")}
            </div>
            <button onClick={async () => { const r = await api.approveBet(id); setGate((g) => ({ ...g, [id]: r })); refresh(); }}>
              approve [INV-BET]
            </button>{" "}
            <GatePill r={gate[id] ?? null} />
          </div>
        );
      })}
    </Panel>
  );
}

// ---- 5. Work Package / Timebox Planner ----

export function WorkPlanner() {
  const [wps, we] = useAsync(() => api.nodesByType("work_package"), []);
  const [tbs, te] = useAsync(() => api.nodesByType("timebox"), []);
  if (we || te) return <Err msg={we || te || "?"} />;
  return (
    <Panel title="Work Package / Timebox Planner">
      <h3>Work packages ({wps?.length ?? 0})</h3>
      <ul>{(wps ?? []).map((id) => <li key={id}><code>{id}</code></li>)}</ul>
      <h3>Timeboxes ({tbs?.length ?? 0})</h3>
      <ul>{(tbs ?? []).map((id) => <li key={id}><code>{id}</code></li>)}</ul>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        INV-WORK: no commitment without inputs/outputs/tools/technique/exception/evidence.
        INV-TIME: no commitment without pomo estimate + scheduled slot.
      </p>
    </Panel>
  );
}

// ---- 6. Execution Runbook ----

export function ExecutionRunbook() {
  const [ids, err] = useAsync(() => api.nodesByType("timebox"), []);
  if (err) return <Err msg={err} />;
  return (
    <Panel title="Execution Runbook">
      <p style={{ fontSize: 13 }}>
        Execution mode is low-decision: runbook, inputs, method, expected output, capture bar.
        New ideas are captured, not applied as strategy mutations (INV-EXEC).
      </p>
      {(ids ?? []).length === 0 ? <Empty label="no active timeboxes" /> : (
        <ul>{(ids ?? []).map((id) => <li key={id}><code>{id}</code></li>)}</ul>
      )}
    </Panel>
  );
}

// ---- 7. Daynote Ledger ----

export function DaynoteLedger() {
  const today = new Date().toISOString().slice(0, 10);
  const [content, err] = useAsync(() => api.daynote(today), [today]);
  if (err) return <Err msg={err} />;
  return (
    <Panel title={`Daynote Ledger — ${today}`}>
      {!content || content.content === "" ? (
        <Empty label="no activity captured today" />
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13 }}>
          {content.content}
        </pre>
      )}
    </Panel>
  );
}

// ---- 8. VRD / Value Realization ----

export function VrdView() {
  const [ids, err] = useAsync(() => api.nodesByType("value_claim"), []);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    if (!ids) return;
    Promise.all(ids.map((id) => api.getNode(id))).then((ns) => setItems(ns as never[])).catch(() => {});
  }, [ids]);
  if (err) return <Err msg={err} />;
  return (
    <Panel title="VRD / Value Realization">
      {items.length === 0 ? <Empty label="no value claims" /> : items.map((it) => {
        const hasProof = Array.isArray(it.evidence_links) && it.evidence_links.length > 0;
        return (
          <div key={String(it.id)} style={{ marginBottom: 8, padding: 8, background: hasProof ? "#efe" : "#fee" }}>
            <strong>{String(it.statement)}</strong>{" "}
            <span style={{ opacity: 0.7 }}>[{String(it.proof_level)} · {String(it.status)}]</span>
            {!hasProof && <div style={{ color: "#c00", fontSize: 12 }}>PROOF DEBT: no evidence links (INV-VALUE)</div>}
          </div>
        );
      })}
    </Panel>
  );
}

// ---- Agent Draft Inbox (Phase C companion) ----

export function AgentDraftInbox() {
  const [ids, err, refresh] = useAsync(() => api.nodesByType("agent_run"), []);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [gate, setGate] = useState<Record<string, GateResult | null>>({});
  useEffect(() => {
    if (!ids) return;
    Promise.all(ids.map((id) => api.getNode(id))).then((ns) => setItems(ns as never[])).catch(() => {});
  }, [ids]);
  if (err) return <Err msg={err} />;
  return (
    <Panel title="Agent Draft Inbox (INV-HUMAN quarantine)">
      {items.length === 0 ? <Empty label="no agent drafts" /> : items.map((it) => {
        const id = String(it.id);
        return (
          <div key={id} style={{ marginBottom: 8, padding: 8, borderLeft: "3px solid #c70" }}>
            <strong>{String(it.agent)}</strong>{" "}
            <span style={{ opacity: 0.7 }}>[{String(it.status)}]</span>
            <div>{String(it.summary)}</div>
            <button onClick={async () => { const r = await api.acceptAgentRun(id, "Sam"); setGate((g) => ({ ...g, [id]: r })); refresh(); }}>
              accept (human: Sam)
            </button>{" "}
            <GatePill r={gate[id] ?? null} />
            <div style={{ fontSize: 11, opacity: 0.7 }}>no auto-accept; reviewer required</div>
          </div>
        );
      })}
    </Panel>
  );
}
