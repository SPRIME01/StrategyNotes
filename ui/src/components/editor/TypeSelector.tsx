// TASK GU-12 — Type selector. Re-tags the node's type IN PLACE via the
// gate-safe PATCH /api/node/:id (no new node, no copy). The node then appears
// in the matching generated screen — that is how the editor feeds the rest of
// the app (one graph, many lenses). `status` is never touched here (gate-owned).

import { useState } from "react";
import { api, NODE_TYPES } from "../../api";

const PROMOTABLE = NODE_TYPES.filter((t) => t !== "journal");

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

  const retype = async (type: string) => {
    setBusy(true); setErr(null);
    try {
      await api.patchNode(id, { type });
      onPromoted?.(id, type); // same id, new type
    } catch (e) {
      setErr(e instanceof Error ? e.message : "re-type failed");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Badge type={currentType} />
      <select
        value=""
        disabled={busy}
        onChange={(e) => { if (e.target.value) retype(e.target.value); e.target.value = ""; }}
        className="rounded-md border bg-surface-1 px-1.5 py-0.5 text-[11px] text-muted-foreground outline-none disabled:opacity-40"
        title="Set this node's type (drives which screen it appears in)"
      >
        <option value="" disabled>→ set type…</option>
        {PROMOTABLE.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      {busy && <span className="text-[10px] text-muted-ink">saving…</span>}
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
