// Clone / placements (PRD-006, INV-CLONE). A clone is an equal-placement
// `Places` edge: a node appears in N parents; edits propagate; cycles are
// rejected by core. This section lists a node's placements and lets the user
// clone it into another note. Backend endpoints already exist (clone/placements).

import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAllStrategyNodes } from "../../hooks/useTypedNodes";
import { fmString, nodeTitle } from "../../lib/node";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Select } from "../ui/field";

export function CloneSection({
  id,
  onCloned,
}: {
  id: string | null;
  onCloned?: () => void;
}) {
  const { nodes } = useAllStrategyNodes();
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
      setErr(
        e instanceof Error
          ? e.message
          : "Refused: a node cannot be placed inside its own descendant.",
      );
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
      <div className="mt-1 flex items-center gap-1">
        <Select
          aria-label="Place this node into another note"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-7 min-w-0 flex-1 text-xs"
        >
          <option value="">clone into…</option>
          {nodes.filter((n) => n.id !== id).slice(0, 100).map((n) => (
            <option key={n.id} value={n.id}>
              [{n.type.replace(/_/g, " ")}] {fmString(n, "title") || nodeTitle(n)}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          onClick={clone}
          disabled={!target || busy}
          title="Add this node as an equal placement inside another note. Cycles are rejected."
        >
          {busy ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
          Clone
        </Button>
      </div>
      {err && <p className="text-[10px] text-gate-bad">{err}</p>}
    </div>
  );
}

function PlacementRow({ id }: { id: string }) {
  const { nodes } = useAllStrategyNodes();
  const found = nodes.find((n) => n.id === id);
  const title = found ? fmString(found, "title") || nodeTitle(found) : null;
  return (
    <div className="t-datum truncate text-primary" title={title ?? `Untitled placement · ${id}`}>
      {title ?? (found ? `Untitled ${found.type.replace(/_/g, " ")}` : `unresolved · ${id.slice(0, 8)}`)}
    </div>
  );
}
