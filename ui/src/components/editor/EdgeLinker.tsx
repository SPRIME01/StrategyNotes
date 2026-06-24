// TASK GU-13 / GU-15 — Create a typed edge (or citation) from the active node
// to a target. Citations are just `supports`/`created_from` edges to a source.
// Uses the gate-safe POST /api/node/:id/edge (structural edges only; gated
// state like acceptance still needs its own endpoint).

import { useState } from "react";
import { api, EDGE_TYPES } from "../../api";
import { useTypedNodes } from "../../hooks/useTypedNodes";
import { nodeTitle } from "../../lib/node";

const COMMON = ["supports", "contradicts", "derives_from", "assumes", "requires", "validates", "created_from"];

export function EdgeLinker({ fromId, onLinked }: { fromId: string; onLinked?: () => void }) {
  const { nodes } = useTypedNodes("note");
  const [to, setTo] = useState("");
  const [edgeType, setEdgeType] = useState<string>("supports");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const link = async () => {
    if (!to) return;
    setBusy(true); setErr(null);
    try {
      await api.linkNode(fromId, to, edgeType);
      onLinked?.();
      setTo("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "link failed");
    }
    setBusy(false);
  };

  return (
    <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-faint">Link (typed edge)</div>
      <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded border bg-surface-2 px-2 py-1 text-xs">
        <option value="">target note…</option>
        {nodes.filter((n) => n.id !== fromId).slice(0, 50).map((n) => (
          <option key={n.id} value={n.id}>{nodeTitle(n)}</option>
        ))}
      </select>
      <div className="flex gap-1">
        <select value={edgeType} onChange={(e) => setEdgeType(e.target.value)} className="flex-1 rounded border bg-surface-2 px-2 py-1 text-xs">
          {EDGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={link}
          disabled={!to || busy}
          className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-foreground disabled:opacity-40"
        >
          {busy ? "…" : "+ link"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {COMMON.map((t) => (
          <button key={t} onClick={() => setEdgeType(t)} className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-foreground">
            {t}
          </button>
        ))}
      </div>
      {err && <p className="text-[10px] text-gate-bad">{err}</p>}
    </div>
  );
}
