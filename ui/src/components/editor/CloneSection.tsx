// Clone / placements (PRD-006, INV-CLONE). A clone is an equal-placement
// `Places` edge: a node appears in N parents; edits propagate; cycles are
// rejected by core. This section lists a node's placements and lets the user
// clone it into another note. Backend endpoints already exist (clone/placements).

import { useEffect, useState } from "react";
import { api } from "../../api";
import { useTypedNodes } from "../../hooks/useTypedNodes";
import { fmString, nodeTitle } from "../../lib/node";
import { Copy, Check } from "lucide-react";

export function CloneSection({
  id,
  onCloned,
}: {
  id: string | null;
  onCloned?: () => void;
}) {
  const { nodes } = useTypedNodes("note");
  const [placements, setPlacements] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setPlacements([]); return; }
    api.getPlacements(id).then(setPlacements).catch(() => setPlacements([]));
  }, [id]);

  const clone = async () => {
    if (!id || !target) return;
    setBusy(true); setErr(null);
    try {
      await api.cloneNote(id, target);
      const p = await api.getPlacements(id).catch(() => []);
      setPlacements(p);
      setTarget("");
      onCloned?.();
    } catch (e) {
      // Most likely INV-CLONE: a cycle (cloning into a descendant).
      setErr(e instanceof Error ? e.message : "clone rejected (cycle?)");
    }
    setBusy(false);
  };

  if (!id) return <p className="text-xs text-muted-foreground">No note selected.</p>;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-mono uppercase tracking-wider text-faint">
        Placements {placements.length > 0 && <span className="opacity-60">({placements.length})</span>}
      </div>
      {placements.length === 0 ? (
        <p className="text-[11px] text-muted-ink">Appears in 1 place (its origin).</p>
      ) : (
        placements.map((pid) => <PlacementRow key={pid} id={pid} />)
      )}
      <div className="mt-1 flex flex-wrap gap-1">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="flex-1 rounded border bg-surface-2 px-2 py-1 text-xs"
        >
          <option value="">clone into…</option>
          {nodes.filter((n) => n.id !== id).slice(0, 50).map((n) => (
            <option key={n.id} value={n.id}>{fmString(n, "title") || nodeTitle(n)}</option>
          ))}
        </select>
        <button
          onClick={clone}
          disabled={!target || busy}
          className="flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-1 text-xs disabled:opacity-40"
          title="Equal-placement clone (INV-CLONE: cycles rejected)"
        >
          {busy ? <Check className="size-3" /> : <Copy className="size-3" />}
          clone
        </button>
      </div>
      {err && <p className="text-[10px] text-gate-bad">{err}</p>}
    </div>
  );
}

function PlacementRow({ id }: { id: string }) {
  const { nodes } = useTypedNodes("note");
  const found = nodes.find((n) => n.id === id);
  return (
    <div className="font-mono text-[10px] text-primary">
      {found ? fmString(found, "title") || nodeTitle(found) : id.slice(0, 18)}
    </div>
  );
}
