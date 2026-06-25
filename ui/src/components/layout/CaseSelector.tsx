// Case selector — a workspace-wide filter. Picking a strategy_case scopes the
// case-aware views (Cockpit, generated docs) to that case via the `case`
// frontmatter field. "All cases" = no filter (workspace-wide).

import { useTypedNodes } from "../../hooks/useTypedNodes";
import { fmString, nodeTitle } from "../../lib/node";

export function CaseSelector({
  caseId,
  onChange,
}: {
  caseId: string | null;
  onChange: (id: string | null) => void;
}) {
  const { nodes, loading } = useTypedNodes("strategy_case");
  if (loading) return null;
  if (nodes.length === 0) return null; // no cases yet → hide the selector

  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="text-faint">case:</span>
      <select
        value={caseId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border bg-surface-1 px-2 py-1 text-xs text-muted-foreground outline-none focus:border-primary"
      >
        <option value="">All cases</option>
        {nodes.map((c) => (
          <option key={c.id} value={c.id}>{fmString(c, "title") || nodeTitle(c)}</option>
        ))}
      </select>
    </label>
  );
}
