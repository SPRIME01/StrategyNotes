// NodePage — the wiki page for one node.
//
// PRD-001/002: every node is addressable (`#node/<ulid>`), and following a link
// lands you somewhere with context rather than a dead id. This page is READ
// ONLY: it renders the node, the references it makes, the nodes that reference
// it, and its inline tags. No writes — INV-DUR, INV-EDGE (both directions of
// every relationship are reconstructed from markdown frontmatter).

import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Row, RowBody, RowGrid, Surface, Well } from "../components/ui/surface";
import { NodeTypeChip, StatusChip } from "../atoms";
import { facetHref, nodeHref } from "./FacetPage";
import {
  fmString,
  nodeExcerpt,
  nodeRefs,
  nodeTitle,
  nodesReferencing,
  tagsOf,
  type GraphNode,
} from "../lib/node";

export function NodePage({ id }: { id: string }) {
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

  const node = nodes.find((n) => n.id === id) ?? null;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = (node ? nodeRefs(node) : []).map((r) => byId.get(r) ?? null);
  const incoming = node ? nodesReferencing(nodes, id) : [];
  const status = node ? fmString(node, "status") : "";

  const ReferenceRow = ({ n }: { n: GraphNode | null }) => {
    const rowStatus = n ? fmString(n, "status") : "";
    return (
      <Row>
        <RowGrid>
          <RowBody>
            <div className="flex flex-wrap items-center gap-1.5">
              {n ? <NodeTypeChip type={n.type} /> : <span className="t-datum text-faint">missing</span>}
              {n && rowStatus && <StatusChip status={rowStatus} to={facetHref("status", rowStatus)} />}
            </div>
            <a href={n ? nodeHref(n.id) : "#cockpit"} className="t-row mt-1 block break-any hover:underline">
              {n ? nodeTitle(n) : "This node is gone from the vault"}
            </a>
            {n && (
              <p className="t-body mt-0.5 line-clamp-1 break-any text-[12px] text-muted-ink">
                {nodeExcerpt(n, 140)}
              </p>
            )}
          </RowBody>
        </RowGrid>
      </Row>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="graph"
        title={node ? nodeTitle(node) : "Node"}
        sub={
          node
            ? `${node.type.replace(/_/g, " ")}${status ? ` · ${status}` : ""} · ${id}`
            : id
        }
      />

      <AsyncState
        label="this node"
        loading={loading}
        error={error}
        onRetry={load}
        empty={!node}
        noun="node"
        emptyHint="Nothing in the vault carries this id. It may have been deleted, or the link that brought you here was written by hand."
      >
        {node && (
          <div className="flex flex-col gap-4">
            <Surface>
              <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
                <NodeTypeChip type={node.type} />
                {status && <StatusChip status={status} to={facetHref("status", status)} />}
                {tagsOf(node).map((t) => (
                  <a
                    key={t}
                    href={facetHref("tag", t)}
                    className="t-datum rounded-sm border border-border px-1.5 py-[3px] text-muted-ink t-fast hover:border-primary hover:text-primary"
                  >
                    #{t}
                  </a>
                ))}
              </div>
              <Well className="px-3 py-3">
                <p className="t-body whitespace-pre-wrap break-any text-foreground">
                  {node.body?.trim() || "This node has no body yet."}
                </p>
              </Well>
            </Surface>

            <Surface>
              <div className="border-b px-3 py-2">
                <RegionTitle>Linked from</RegionTitle>
              </div>
              {incoming.length === 0 ? (
                <p className="t-body px-3 py-5 text-muted-ink">
                  Nothing points here yet. A node with no inbound links is an island — it can be
                  deleted without breaking anything.
                </p>
              ) : (
                incoming.map((n) => <ReferenceRow key={n.id} n={n} />)
              )}
            </Surface>

            <Surface>
              <div className="border-b px-3 py-2">
                <RegionTitle>Points to</RegionTitle>
              </div>
              {outgoing.length === 0 ? (
                <p className="t-body px-3 py-5 text-muted-ink">This node references nothing.</p>
              ) : (
                outgoing.map((n, i) => <ReferenceRow key={n?.id ?? `missing-${i}`} n={n} />)
              )}
            </Surface>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
