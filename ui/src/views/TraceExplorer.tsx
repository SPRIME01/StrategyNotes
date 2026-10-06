// Trace Explorer — layout family C (Explorer): a spine and an inspector.
//
// The old inspector was a 340px-tall card holding one sentence, and every trace
// line ended in a raw ULID. Both are gone: the inspector shows frontmatter in a
// Well, and lines resolve to human titles.

import { useEffect, useMemo, useState } from "react";
import { GitBranch, MousePointerClick } from "lucide-react";
import { useTypedNodes, useNode as useSingleNode } from "../hooks/useTypedNodes";
import { useNodeRefs } from "../hooks/useNodeTitle";
import { api } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Field, Select } from "../components/ui/field";
import { AsyncState, LoadingBlock } from "../components/ui/async";
import { Callout, RegionTitle, Row, RowGrid, Surface, Well } from "../components/ui/surface";
import { ContradictionBadge, NodeTypeChip } from "../atoms";
import { facetHref, nodeHref } from "./FacetPage";
import { fmList, nodeExcerpt, nodeTitle } from "../lib/node";

export function TraceExplorer() {
  const { nodes: roots, loading, error, reload } = useTypedNodes("strategy_bet");
  const claims = useTypedNodes("strategic_claim");
  const [rootId, setRootId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const [tracing, setTracing] = useState(false);
  const [traceError, setTraceError] = useState<unknown>(null);

  const id = rootId ?? roots[0]?.id ?? null;

  useEffect(() => {
    if (!id) {
      setTrace([]);
      return;
    }
    let alive = true;
    setTracing(true);
    setTraceError(null);
    api
      .trace(id)
      .then((t) => {
        if (alive) setTrace(t.reachable);
      })
      .catch((e) => {
        if (alive) {
          setTrace([]);
          setTraceError(e);
        }
      })
      .finally(() => {
        if (alive) setTracing(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const refs = useNodeRefs(trace);
  const contradictions = useMemo(
    () => claims.nodes.filter((c) => fmList(c, "contradicts").length > 0),
    [claims.nodes],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="strategy"
        title="Trace Explorer"
        sub="Walk the typed edges from any root to everything downstream, so you can see how a decision came to be made. Counterevidence stays visible."
      />

      <AsyncState
        label="trace roots"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={roots.length === 0}
        noun="traceable roots"
        emptyHint="A trace needs somewhere to start. A strategy bet is the usual root, since it has the longest downstream chain."
      >
        <Surface className="px-3 py-2.5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Root" htmlFor="trace-root" className="w-[min(400px,100%)]">
              <Select
                id="trace-root"
                value={id ?? ""}
                onChange={(e) => {
                  setRootId(e.target.value);
                  setSelectedId(null);
                }}
              >
                {roots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {nodeTitle(r)}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="t-body pb-1.5 text-muted-ink">
              {tracing
                ? "Walking edges…"
                : `${trace.length} node${trace.length === 1 ? "" : "s"} reachable`}
            </p>
          </div>
        </Surface>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Surface className="flex min-w-0 flex-col">
            <div className="border-b px-3 py-2">
              <RegionTitle count={trace.length}>Reachable from root</RegionTitle>
            </div>
            {tracing ? (
              <div className="p-3">
                <LoadingBlock label="reachable nodes" rows={5} />
              </div>
            ) : traceError ? (
              <Callout tone="bad" className="m-3 px-3 py-2.5">
                <p className="text-[13px] text-gate-bad">
                  The server did not walk this trace. The spine below is empty, not empty of truth.
                </p>
              </Callout>
            ) : trace.length === 0 ? (
              <p className="t-body px-3 py-6 text-muted-foreground">
                Nothing reachable from this root. It has no outgoing typed edges yet, which usually
                means the work it funds has not been packaged.
              </p>
            ) : (
              <div className="scroll-region max-h-[520px]">
                {trace.map((tid) => (
                  <TraceLine
                    key={tid}
                    id={tid}
                    title={refs.get(tid)?.title}
                    type={refs.get(tid)?.type}
                    selected={tid === selectedId}
                    onSelect={() => setSelectedId(tid === selectedId ? null : tid)}
                  />
                ))}
              </div>
            )}
          </Surface>

          <Inspector id={selectedId} />
        </div>

        <Surface className="flex min-w-0 flex-col">
          <div className="border-b px-3 py-2">
            <RegionTitle count={contradictions.length}>Counterevidence</RegionTitle>
          </div>
          {contradictions.length === 0 ? (
            <p className="t-body flex items-center gap-2 px-3 py-4 text-muted-foreground">
              <ContradictionBadge />
              No claim currently declares a contradiction. When one does, it surfaces here and is
              never discarded.
            </p>
          ) : (
            <div>
              {contradictions.map((c) => (
                <Row key={c.id}>
                  <RowGrid>
                    <ContradictionBadge />
                    <span className="t-row min-w-0 flex-1 break-any">{nodeTitle(c)}</span>
                    <span className="t-datum shrink-0 text-gate-bad">
                      {fmList(c, "contradicts").length} claim
                      {fmList(c, "contradicts").length === 1 ? "" : "s"}
                    </span>
                  </RowGrid>
                </Row>
              ))}
            </div>
          )}
        </Surface>
      </AsyncState>
    </div>
  );
}

function TraceLine({
  id,
  title,
  type,
  selected,
  onSelect,
}: {
  id: string;
  title?: string | null;
  type?: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <Row
      interactive
      selected={selected}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <RowGrid>
        <NodeTypeChip type={type ?? "note"} to={facetHref("type", type ?? "note")} />
        <span className="t-body min-w-0 flex-1 truncate">
          {title ?? <span className="text-faint">{id.slice(0, 12)}</span>}
        </span>
        {selected && (
          <MousePointerClick className="size-3 shrink-0 text-primary" aria-hidden="true" />
        )}
      </RowGrid>
    </Row>
  );
}

function Inspector({ id }: { id: string | null }) {
  const { node, loading } = useSingleNode(id);
  return (
    <Surface className="flex min-w-0 flex-col">
      <div className="border-b px-3 py-2">
        <RegionTitle>Inspector</RegionTitle>
      </div>
      {!id ? (
        <div className="flex flex-1 flex-col items-start gap-2 px-3 py-6">
          <GitBranch className="size-4 text-faint" aria-hidden="true" />
          <p className="t-body text-muted-foreground">
            Select a node on the spine to inspect it.
          </p>
          <p className="t-body text-muted-ink">
            Frontmatter is shown exactly as it is stored in markdown, because markdown is the
            source of truth and SQLite is only an index.
          </p>
        </div>
      ) : loading ? (
        <div className="p-3">
          <LoadingBlock label="this node" rows={3} />
        </div>
      ) : node ? (
        <div className="flex flex-col gap-2.5 px-3 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <NodeTypeChip type={node.type} to={facetHref("type", node.type)} />
          </div>
          <a href={nodeHref(node.id)} className="t-row block break-any hover:underline">{nodeTitle(node)}</a>
          <p className="t-body text-muted-foreground">{nodeExcerpt(node, 260)}</p>
          <div>
            <div className="t-label mb-1 text-muted-ink">Frontmatter</div>
            <Well className="max-h-[240px]">
              <pre className="m-0 break-any">
                {JSON.stringify(node.frontmatter, null, 2)}
              </pre>
            </Well>
          </div>
        </div>
      ) : (
        <p className="t-body px-3 py-6 text-gate-bad">
          This node could not be read. Its id may reference something the index has not indexed.
        </p>
      )}
    </Surface>
  );
}

