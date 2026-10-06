// Generated documents — "living views over linked nodes" (framework §4368).
// Each document is a DECLARATIVE QUERY over typed nodes. Not static files:
// regenerated from the graph every time.
//
// The page head is owned by DocBrowser (DESIGN.md §15: one h1 per view), so this
// file renders sections only. Entries are rows inside one Surface, never cards.

import { useTypedNodes } from "../hooks/useTypedNodes";
import { fmString, fmList, fmFilled, nodeExcerpt, type GraphNode } from "../lib/node";
import { EvidenceStateBadge, ProofLevelBadge, NodeTypeChip } from "../atoms";
import { facetHref } from "./FacetPage";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface, Unset } from "../components/ui/surface";
import { LoadingBlock, EmptyBlock } from "../components/ui/async";

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
  /** Show proof_level / status chips if present on the node. */
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
  return (
    <div className="flex flex-col gap-5">
      {spec.sections.map((s) => (
        <DocSection key={s.label} spec={s} caseId={caseId} />
      ))}
    </div>
  );
}

function DocSection({ spec, caseId }: { spec: DocSectionSpec; caseId?: string | null }) {
  const { nodes, loading, error, reload } = useTypedNodes(spec.nodeType);
  const filtered = nodes.filter((n) => {
    if (spec.filter && !spec.filter(n)) return false;
    if (caseId && spec.caseField && fmString(n, spec.caseField) !== caseId) return false;
    return true;
  });

  if (loading) return <LoadingBlock label={spec.label.toLowerCase()} rows={2} />;
  if (error) {
    return (
      <EmptyBlock
        noun={spec.label.toLowerCase()}
        hint="The server did not respond. This section is unread, not empty. Start the local server and reload."
        action={
          <button
            onClick={reload}
            className="t-body text-primary underline-offset-4 hover:underline"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyBlock
        noun={spec.label.toLowerCase()}
        hint={
          spec.emptyHint
            ? `To fill this in: ${spec.emptyHint}.`
            : undefined
        }
      />
    );
  }

  return (
    <section>
      <RegionTitle count={filtered.length} className="mb-2">
        {spec.label}
      </RegionTitle>
      <Surface className="min-w-0">
        {filtered.map((n) => (
          <DocRow key={n.id} node={n} spec={spec} />
        ))}
      </Surface>
    </section>
  );
}

function DocRow({ node, spec }: { node: GraphNode; spec: DocSectionSpec }) {
  const showBadges = spec.badges ?? true;
  const proof = fmString(node, "proof_level");
  const status = fmString(node, "status");
  const excerpt = nodeExcerpt(node, 200);

  return (
    <Row>
      <RowGrid>
        <NodeTypeChip type={node.type} to={facetHref("type", node.type)} />
        <RowBody>
          <span className="t-body break-any text-foreground">
            {excerpt === "—" ? (
              <Unset label={`${node.type} has no text yet`} />
            ) : (
              excerpt
            )}
          </span>
          {spec.fields && spec.fields.length > 0 && (
            <span className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-0.5">
              {spec.fields.map((f) => (
                <FieldRow key={f.key} node={node} field={f} />
              ))}
            </span>
          )}
        </RowBody>

        {showBadges && (proof || status) && (
          <RowActions>
            {proof && <ProofLevelBadge level={proof} />}
            {status && <EvidenceStateBadge state={status} />}
          </RowActions>
        )}
      </RowGrid>
    </Row>
  );
}

/** A ULID is infrastructure identity, so it is styled as one: short, labelled,
 *  and carrying the full value in its tooltip rather than filling the column. */
const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

function FieldRow({ node, field }: { node: GraphNode; field: FieldSpec }) {
  const list = fmList(node, field.key);
  if (list.length > 0) {
    return (
      <span className="t-datum text-muted-foreground">
        <span className="text-faint">{field.label}</span> {list.length}
      </span>
    );
  }
  if (!fmFilled(node, field.key)) {
    return (
      <span className="t-datum">
        <span className="text-faint">{field.label}</span>{" "}
        <Unset label={`${field.label} not set`} />
      </span>
    );
  }
  const val = fmString(node, field.key);
  if (ULID.test(val)) {
    return (
      <span className="t-datum inline-flex items-center gap-1 text-muted-foreground" title={`${val} (node id)`}>
        <span className="text-faint">{field.label}</span>
        <span className="break-any text-muted-ink">{val.slice(0, 8)}</span>
      </span>
    );
  }
  return (
    <span className="t-datum text-muted-foreground" title={val}>
      <span className="text-faint">{field.label}</span>{" "}
      <span className="break-any">{val.length > 28 ? `${val.slice(0, 26)}…` : val}</span>
    </span>
  );
}
