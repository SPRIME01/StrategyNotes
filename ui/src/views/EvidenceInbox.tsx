// Evidence Inbox — layout family A (Ledger): filter bar → one Surface of Rows.
//
// A review queue, not a card stack. The row carries a leading name, a middle
// metadata cluster, and a trailing action. Accepting is a gate; the verdict
// renders inline and is announced.

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { FilterPill } from "../components/ui/field";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface, Unset } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import {
  EvidenceStateBadge, GateResult as GateVerdict, NodeTypeChip,
  ProofLevelBadge, RefusalNote,
} from "../atoms";
import { facetHref, facetHrefOr, nodeHref } from "./FacetPage";
import { fmString, nodeExcerpt, nodeTitle } from "../lib/node";
import { cn } from "../lib/utils";
import { useNodeTitle } from "../hooks/useNodeTitle";

export function EvidenceInbox() {
  const { nodes, loading, error, reload } = useTypedNodes("evidence_item");
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"triage" | "all">("triage");
  const { notify } = useToast();

  const drafted = nodes.filter((n) => fmString(n, "status").toLowerCase() === "drafted");
  const shown = filter === "triage" ? drafted : nodes;

  const accept = async (id: string, title: string) => {
    setBusy(id);
    try {
      const r = await api.acceptEvidence(id);
      setGate((g) => ({ ...g, [id]: r }));
      notify(
        r.status === "approved" ? `Accepted "${title}"` : `"${title}" is still blocked`,
        r.status === "approved" ? "ok" : "bad",
      );
      reload();
    } catch (e) {
      setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } }));
      notify("The server did not respond. Nothing was accepted.", "bad");
    }
    setBusy(null);
  };

  const reject = async (id: string, title: string) => {
    try {
      await api.rejectEvidence(id);
      notify(`Rejected "${title}". The record stays, so the claim can still be traced back to it.`, "info");
      reload();
    } catch {
      notify("The server did not respond. Nothing was rejected.", "bad");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="reality"
        title="Evidence Inbox"
        sub="Triage what reality has told you. The gap between drafted and accepted is the work."
      />

      <AsyncState
        label="evidence items"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={nodes.length === 0}
        noun="evidence"
        emptyHint="Evidence is an observation promoted from a source chunk. Create a source, extract an item from it, and it lands here for triage."
      >
        <Surface>
          <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
            <RegionTitle className="mr-auto">Queue</RegionTitle>
            <FilterPill active={filter === "triage"} onClick={() => setFilter("triage")} count={drafted.length}>
              Needs triage
            </FilterPill>
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")} count={nodes.length}>
              All
            </FilterPill>
          </div>

          <div>
            {shown.length === 0 ? (
              <p className="t-body px-3 py-6 text-muted-foreground">
                Nothing waiting. Every item here has a verdict.
              </p>
            ) : (
              shown.map((e) => {
                const isDraft = fmString(e, "status").toLowerCase() === "drafted";
                const title = nodeTitle(e);
                return (
                  <Row key={e.id} className={cn(isDraft && "bg-gate-warn/[0.03]")}>
                    <RowGrid>
                      <RowBody>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <NodeTypeChip type={e.type} to={facetHref("type", e.type)} />
                          <ProofLevelBadge level={fmString(e, "proof_level", "")} />
                          <EvidenceStateBadge
                            state={fmString(e, "status", "unspecified")}
                            to={facetHrefOr("status", fmString(e, "status"))}
                          />
                          {fmString(e, "source_chunk") ? (
                            <SourceRef id={fmString(e, "source_chunk")} />
                          ) : (
                            <Unset label="no source attached" />
                          )}
                        </div>
                        <a href={nodeHref(e.id)} className="t-body mt-1 line-clamp-2 text-muted-foreground hover:underline">
                          {nodeExcerpt(e, 220)}
                        </a>
                        {!isDraft && (
                          <p className="t-row mt-1 truncate text-foreground">{title}</p>
                        )}
                      </RowBody>

                      <RowActions className="flex-col items-end gap-1.5">
                        {isDraft ? (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => accept(e.id, title)}
                              disabled={busy === e.id}
                              title="Run the evidence acceptance gate"
                            >
                              <Check className="size-3.5" aria-hidden="true" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => reject(e.id, title)}
                            >
                              <X className="size-3.5" aria-hidden="true" />
                              Reject
                            </Button>
                          </div>
                        ) : null}
                        <GateVerdict gate={gate[e.id] ?? null} />
                      </RowActions>
                    </RowGrid>
                  </Row>
                );
              })
            )}
          </div>
        </Surface>
        <RefusalNote>
          Nothing here can be accepted without a source or an explicit manual basis. That is the
          gate, not a suggestion.
        </RefusalNote>
      </AsyncState>
    </div>
  );
}

/** A source chunk reference. Resolves to a title; falls back to a short id, never a raw ULID wall. */
function SourceRef({ id }: { id: string }) {
  const title = useNodeTitle(id);
  return (
    <span
      className="t-datum inline-flex min-w-0 items-center gap-1 text-faint"
      title={title ? `${title} · ${id}` : `Untitled source chunk · ${id}`}
    >
      <span aria-hidden="true">src</span>
      <span className="truncate">{title ?? `untitled · ${id.slice(0, 8)}`}</span>
    </span>
  );
}
