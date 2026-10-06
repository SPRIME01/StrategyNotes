// FacetPage — a derived list: everything carrying one status, type, or tag.
//
// PRD-005 / PRD-001: clicking a status opens a page of everything with that
// status; clicking a tag does the same. This is the wiki behaviour the operator
// asked for, and it is DERIVED, never stored: read `GET /api/nodes`, filter,
// render. It has no create, edit or delete affordance at all, so it cannot
// violate INV-DUR (markdown stays the only source of truth) or INV-EDGE —
// everything it shows already exists in frontmatter or the body.

import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Row, RowBody, RowGrid, Surface } from "../components/ui/surface";
import { NodeTypeChip, StatusChip } from "../atoms";
import { fmString, nodeExcerpt, nodeTitle, tagsOf, type GraphNode } from "../lib/node";

export type FacetDim = "status" | "type" | "tag";

const DIM_NOUN: Record<FacetDim, string> = {
  status: "status",
  type: "type",
  tag: "tag",
};

/** The facet a node belongs to for `dim`, or null if it has none. */
export function facetValue(node: GraphNode, dim: FacetDim): string | null {
  if (dim === "type") return node.type;
  if (dim === "status") {
    const s = fmString(node, "status");
    return s || null;
  }
  return tagsOf(node)[0] ?? null;
}

export function matchesFacet(node: GraphNode, dim: FacetDim, value: string): boolean {
  if (dim === "type") return node.type === value;
  if (dim === "status") return fmString(node, "status") === value;
  return tagsOf(node).includes(value);
}

export function facetHref(dim: FacetDim, value: string): string {
  // encodeURIComponent so a tag with a `/` or a space cannot break the route.
  return `#facet/${dim}/${encodeURIComponent(value)}`;
}

/** Same, but for a value that may be absent. Views routinely render a chip with
 *  a *default* status ("draft", "intent") when the node has none — linking that
 *  would open a facet page listing nothing but the default. Return undefined so
 *  the chip stays plain text instead of promising a page it cannot deliver. */
export function facetHrefOr(dim: FacetDim, value: string | null | undefined): string | undefined {
  return value ? facetHref(dim, value) : undefined;
}

export function nodeHref(id: string): string {
  return `#node/${id}`;
}

/** `approved · status` / `Strategy Bet · type` / `speed · tag`. */
function headline(dim: FacetDim, value: string): string {
  return `${value} · ${DIM_NOUN[dim]}`;
}

export function FacetPage({ dim, value }: { dim: FacetDim; value: string }) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNodes(await api.allNodes());
    } catch (e) {
      setNodes([]);
      setError(e instanceof Error ? e.message : "unreachable");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const matched = nodes.filter((n) => matchesFacet(n, dim, value));

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="graph"
        title={headline(dim, value)}
        sub={
          matched.length === 1
            ? "1 thing carries this."
            : `${matched.length} things carry this. Derived from the vault — nothing here is a copy.`
        }
      />

      <AsyncState
        label={headline(dim, value)}
        loading={loading}
        error={error}
        onRetry={load}
        empty={matched.length === 0}
        noun={matched.length === 1 ? DIM_NOUN[dim] : `${DIM_NOUN[dim]}s`}
        emptyHint={
          dim === "tag"
            ? "Nothing in the vault carries this tag yet. Tags are inline `#hashtags` written in a node's body — there is no tag field to fill in."
            : `No node in the vault carries this ${DIM_NOUN[dim]}.`
        }
      >
        <Surface>
          <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
            <RegionTitle>{headline(dim, value)}</RegionTitle>
          </div>
          <div>
            {matched.map((n) => (
              <Row key={n.id}>
                <RowGrid>
                  <RowBody>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Cross-facet: from a status list you can step to the type
                          list and back. That is the wiki behaviour — no breadcrumbs
                          needed when every label is itself a link. */}
                      <NodeTypeChip type={n.type} to={facetHref("type", n.type)} />
                      <StatusChip
                        status={fmString(n, "status", "—")}
                        to={facetHrefOr("status", fmString(n, "status"))}
                      />
                    </div>
                    <a
                      href={nodeHref(n.id)}
                      className="t-row mt-1 block break-any hover:underline"
                    >
                      {nodeTitle(n)}
                    </a>
                    <p className="t-body mt-0.5 line-clamp-2 break-any text-[12px] text-muted-ink">
                      {nodeExcerpt(n, 160)}
                    </p>
                  </RowBody>
                </RowGrid>
              </Row>
            ))}
          </div>
        </Surface>
      </AsyncState>
    </div>
  );
}
