// Generated documents — "living views over linked nodes" (framework §4368).
// Each document is a DECLARATIVE QUERY over typed nodes, rendered as a dossier.
// Not static files: regenerated from the graph every time. This is the OKF
// index.md / Obsidian-Dataview model, strategy-native.
//
// A doc = sections; a section = a node type + the frontmatter fields to surface,
// optional filter, empty hint. Honest empty states everywhere (RISK-001).

import { useTypedNodes } from "../hooks/useTypedNodes";
import { fmString, fmList, fmFilled, nodeExcerpt, type GraphNode } from "../lib/node";
import { ProofLevelBadge, EvidenceStateBadge } from "../atoms";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

export interface FieldSpec {
  key: string;
  label: string;
}

export interface DocSectionSpec {
  label: string;
  nodeType: string;
  fields?: FieldSpec[];
  filter?: (n: GraphNode) => boolean;
  /** Frontmatter key holding the owning case id; when set + a caseId is active,
   *  the section is scoped to that case. */
  caseField?: string;
  emptyHint?: string;
  /** Show proof_level / status badges if present on the node. */
  badges?: boolean;
}

export interface DocSpec {
  id: string;
  title: string;
  kicker: string;
  intro: string;
  sections: DocSectionSpec[];
}

export function GeneratedDoc({ spec, caseId }: { spec: DocSpec; caseId?: string | null }) {
  const scoped = caseId ? `${spec.title} · scoped to selected case where the type carries a \`case\` field` : spec.intro;
  return (
    <div>
      <div className="mb-5">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-muted-ink">
          {spec.kicker} · GENERATED
        </div>
        <h1 className="text-2xl font-normal tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{spec.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{scoped}</p>
      </div>
      <div className="flex flex-col gap-5">
        {spec.sections.map((s) => <DocSection key={s.label} spec={s} caseId={caseId} />)}
      </div>
    </div>
  );
}

function DocSection({ spec, caseId }: { spec: DocSectionSpec; caseId?: string | null }) {
  const { nodes, loading } = useTypedNodes(spec.nodeType);
  const filtered = nodes.filter((n) => {
    if (spec.filter && !spec.filter(n)) return false;
    // Case-scoping: only where the section declares a caseField.
    if (caseId && spec.caseField && fmString(n, spec.caseField) !== caseId) return false;
    return true;
  });

  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-ink">{spec.label}</h2>
        <span className="font-mono text-[11px] text-faint">{filtered.length}</span>
      </div>
      {loading ? (
        <p className="text-sm text-muted-ink">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {spec.label.toLowerCase()} yet{spec.emptyHint ? ` — ${spec.emptyHint}` : ""}.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => <DocCard key={n.id} node={n} spec={spec} />)}
        </div>
      )}
    </section>
  );
}

function DocCard({ node, spec }: { node: GraphNode; spec: DocSectionSpec }) {
  const showBadges = spec.badges ?? true;
  const proof = fmString(node, "proof_level");
  const status = fmString(node, "status");
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{nodeExcerpt(node, 160) || "—"}</p>
            {spec.fields && spec.fields.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-ink">
                {spec.fields.map((f) => <FieldRow key={f.key} node={node} field={f} />)}
              </div>
            )}
          </div>
          {showBadges && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              {proof && <ProofLevelBadge level={proof} />}
              {status && <EvidenceStateBadge state={status} />}
              <Badge variant="outline" className="font-mono text-[9px]">{node.type}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldRow({ node, field }: { node: GraphNode; field: FieldSpec }) {
  const list = fmList(node, field.key);
  if (list.length > 0) return <span><span className="text-faint">{field.label}:</span> {list.length}</span>;
  const val = fmString(node, field.key);
  if (!val || !fmFilled(node, field.key)) return <span><span className="text-faint">{field.label}:</span> <span className="text-faint">—</span></span>;
  return <span><span className="text-faint">{field.label}:</span> <span className="font-mono">{val.length > 18 ? val.slice(0, 16) + "…" : val}</span></span>;
}
