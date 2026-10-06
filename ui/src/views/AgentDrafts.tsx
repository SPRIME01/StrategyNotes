// Agent Draft Inbox — layout family A. The quarantine.
//
// INV-HUMAN: agents draft, humans approve. So the reviewer is a required field on
// the accept action, not an afterthought, and both accept and reject report
// honestly instead of swallowing the error.

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { Field, Input } from "../components/ui/field";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface, Unset } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import { ConfirmButton, GateResult as GateVerdict, NodeTypeChip, RefusalNote, StatusChip } from "../atoms";
import { facetHref, facetHrefOr, nodeHref } from "./FacetPage";
import { fmString, nodeExcerpt } from "../lib/node";

export function AgentDrafts() {
  const { nodes, loading, error, reload } = useTypedNodes("agent_run");
  const [reviewer, setReviewer] = useState("");
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const { notify } = useToast();

  const accept = async (id: string) => {
    if (!reviewer.trim()) {
      notify("Name yourself as the reviewer. A human signs off, every time.", "bad");
      return;
    }
    setBusy(id);
    try {
      const r = await api.acceptAgentRun(id, reviewer.trim());
      setGate((g) => ({ ...g, [id]: r }));
      notify(
        r.status === "approved" ? "Draft accepted into the graph." : "Acceptance was blocked.",
        r.status === "approved" ? "ok" : "bad",
      );
      reload();
    } catch {
      setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } }));
      notify("The server did not respond. The draft is untouched.", "bad");
    }
    setBusy(null);
  };

  const reject = async (id: string) => {
    try {
      await api.rejectAgentRun(id);
      notify("Draft rejected. It stays on the record.", "info");
      reload();
    } catch {
      notify("The server did not respond. The draft is untouched.", "bad");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="governance"
        title="Agent Drafts"
        sub="Agents may draft, critique, and suggest. Nothing an agent writes reaches an accepted artifact until a named human approves it."
      />

      <Surface className="w-fit px-3 py-2.5">
        <Field
          label="Reviewer"
          hint="Recorded on every approval. An unnamed approval is not an approval."
          htmlFor="agent-reviewer"
          className="w-[240px]"
        >
          <Input
            id="agent-reviewer"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="Your name"
          />
        </Field>
      </Surface>

      <AsyncState
        label="agent drafts"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={nodes.length === 0}
        noun="agent drafts"
        emptyHint="When an agent runs over your vault, its output lands here in quarantine rather than in your strategy."
      >
        <Surface>
          <div className="border-b px-3 py-2">
            <RegionTitle count={nodes.length}>Quarantine</RegionTitle>
          </div>
          <div>
            {nodes.map((a) => (
              <Row key={a.id}>
                <RowGrid>
                  <RowBody>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <NodeTypeChip type={a.type} to={facetHref("type", a.type)} />
                      <StatusChip status={fmString(a, "status", "drafted")} to={facetHrefOr("status", fmString(a, "status"))} />
                      <span className="t-datum text-muted-ink">
                        {fmString(a, "agent") || <Unset label="agent not recorded" />}
                      </span>
                    </div>
                    <a href={nodeHref(a.id)} className="t-body mt-1 block break-any text-muted-foreground hover:underline">
                      {nodeExcerpt(a, 280)}
                    </a>
                  </RowBody>

                  <RowActions>
                    <Button
                      size="sm"
                      onClick={() => accept(a.id)}
                      disabled={busy === a.id}
                      title={
                        reviewer.trim()
                          ? `Accept and attribute to ${reviewer.trim()}`
                          : "Name a reviewer first"
                      }
                    >
                      Accept
                    </Button>
                    <ConfirmButton label="Reject it" onConfirm={() => reject(a.id)}>
                      Reject
                    </ConfirmButton>
                    <GateVerdict gate={gate[a.id] ?? null} />
                  </RowActions>
                </RowGrid>
              </Row>
            ))}
          </div>
        </Surface>

        <RefusalNote>
          There is no bulk accept and no auto-accept. If a draft is wrong, reject it; the rejection
          is itself part of the record.
        </RefusalNote>

        <p className="t-body flex items-start gap-1.5 text-muted-ink">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Agent output is a proposal about your strategy, never a change to it.
          </span>
        </p>
      </AsyncState>
    </div>
  );
}
