// TASK GU-14 — Proof Burden panel (SPEC §11.4). Replaces the static "Core
// Concepts" section. For the active node it answers, from typed edges:
//   What supports this? What contradicts? What is assumed? What would change
//   our mind? What remains unverified?
// Read-only over the node's frontmatter edges; the EdgeLinker creates edges.

import { useMemo } from "react";
import { nodeEdges, nodeTitle, type GraphNode } from "../../lib/node";
import { useNode } from "../../hooks/useTypedNodes";
import { EDGE_TYPES } from "../../api";
import { EdgeLinker } from "./EdgeLinker";

const QUESTION_BY_EDGE: Record<string, string> = {
  supports: "What supports this?",
  contradicts: "What contradicts this?",
  assumes: "What is assumed?",
  derives_from: "Where does this derive from?",
  tests: "How is this tested?",
  requires: "What does this require?",
  validates: "What validates this?",
  weakens: "What weakens this?",
  supersedes: "What does this supersede?",
};

export function ProofBurdenPanel({
  node,
  onLinked,
}: {
  node: GraphNode | null;
  onLinked?: () => void;
}) {
  const edges = node ? nodeEdges(node) : [];
  const byType = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of edges) {
      if (e.status === "retracted" || e.status === "superseded") continue;
      const arr = m.get(e.edge_type) ?? [];
      arr.push(e.to);
      m.set(e.edge_type, arr);
    }
    return m;
  }, [edges]);

  if (!node) return <p className="text-xs text-muted-foreground">No note selected.</p>;

  // The five canonical questions, derived from which edge types are present.
  const presentTypes = Array.from(byType.keys());
  const hasContradiction = byType.has("contradicts");

  return (
    <div className="flex flex-col gap-2">
      {QUESTION_BY_EDGE && (
        <div className="flex flex-col gap-1.5">
          {Object.entries(QUESTION_BY_EDGE).map(([et, q]) => {
            const targets = byType.get(et) ?? [];
            const asked = presentTypes.includes(et);
            return (
              <div key={et} className="rounded-md px-2 py-1 hover:bg-surface-2">
                <div className="flex items-center justify-between">
                  <span className={"text-xs font-medium " + (targets.length ? "text-foreground" : asked ? "text-gate-bad" : "text-muted-ink")}>
                    {q}
                  </span>
                  <span className="text-[10px] font-mono text-faint">{targets.length || (asked ? "0" : "—")}</span>
                </div>
                {targets.length > 0 && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {targets.slice(0, 4).map((tid) => <EdgeTarget key={tid} id={tid} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasContradiction && (
        <p className="text-[11px] text-gate-bad">
          ⚑ Counterevidence present — contradiction must not be silently discarded (INV-CONTRA).
        </p>
      )}
      {presentTypes.length === 0 && (
        <p className="text-[11px] text-muted-ink">
          No typed edges yet. Link this note to evidence or claims below to answer the burden of proof.
        </p>
      )}

      <EdgeLinker fromId={node.id} onLinked={onLinked} />
    </div>
  );
}

function EdgeTarget({ id }: { id: string }) {
  const { node } = useNode(id);
  return (
    <span className="font-mono text-[10px] text-primary">
      {node ? nodeTitle(node) : id.slice(0, 18)}
    </span>
  );
}

export { EDGE_TYPES };
