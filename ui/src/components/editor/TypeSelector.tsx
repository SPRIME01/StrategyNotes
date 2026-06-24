// TASK GU-12 — Type selector. Shows the node's current type and lets the user
// promote a note into a typed strategy node (evidence_item, strategy_bet, …).
// Uses the existing /api/notes/:id/promote (creates a typed copy; gated fields
// like status/proof_level still flow through their own endpoints). The new
// typed node then appears in the matching generated screen — that is how the
// editor feeds the rest of the app (one graph, many lenses).

import { useState } from "react";
import { api, NODE_TYPES } from "../../api";

const PROMOTABLE = NODE_TYPES.filter((t) => t !== "note" && t !== "journal");

export function TypeSelector({
  id,
  currentType,
  onPromoted,
}: {
  id: string;
  currentType: string;
  onPromoted?: (newId: string, type: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const promote = async (type: string) => {
    setBusy(true); setErr(null);
    try {
      const n = await api.promoteNote(id, type);
      onPromoted?.(String(n.id), type);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "promote failed");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Badge type={currentType} />
      {currentType === "note" && (
        <select
          value=""
          disabled={busy}
          onChange={(e) => { if (e.target.value) promote(e.target.value); e.target.value = ""; }}
          className="rounded-md border bg-surface-1 px-1.5 py-0.5 text-[11px] text-muted-foreground outline-none disabled:opacity-40"
          title="Promote this note to a typed strategy node"
        >
          <option value="" disabled>→ promote to…</option>
          {PROMOTABLE.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      {busy && <span className="text-[10px] text-muted-ink">promoting…</span>}
      {err && <span className="text-[10px] text-gate-bad">{err}</span>}
    </div>
  );
}

function Badge({ type }: { type: string }) {
  return (
    <span className="rounded-full border border-border-strong bg-surface-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-ink">
      {type}
    </span>
  );
}
