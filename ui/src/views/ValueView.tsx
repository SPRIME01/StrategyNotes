// VRD / Value Realization — layout family A.
//
// A value claim without proof level and evidence links is debt, not value. The
// row leads with the claim, then shows the proof state, then the action.

import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useTypedNodes } from "../hooks/useTypedNodes";
import { api, type GateResult } from "../api";
import { PageHead } from "../components/layout/PageHead";
import { Button } from "../components/ui/button";
import { AsyncState } from "../components/ui/async";
import { RegionTitle, Row, RowActions, RowBody, RowGrid, Surface, Unset } from "../components/ui/surface";
import { useToast } from "../components/ui/toast";
import { GateResult as GateVerdict, NodeTypeChip, ProofLevelBadge, StatusChip } from "../atoms";
import { facetHref, facetHrefOr, nodeHref } from "./FacetPage";
import { fmList, fmString, nodeExcerpt } from "../lib/node";
import { cn } from "../lib/utils";

export function ValueView() {
  const { nodes, loading, error, reload } = useTypedNodes("value_claim");
  const [gate, setGate] = useState<Record<string, GateResult>>({});
  const { notify } = useToast();

  const validate = async (id: string) => {
    try {
      const r = await api.validateValue(id);
      setGate((g) => ({ ...g, [id]: r }));
      notify(
        r.status === "approved" ? "Value claim validated." : "This claim is not provable yet.",
        r.status === "approved" ? "ok" : "bad",
      );
      reload();
    } catch {
      setGate((g) => ({ ...g, [id]: { status: "blocked", failed_gates: ["unreachable"] } }));
      notify("The server did not respond. Nothing was validated.", "bad");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        kicker="learning"
        title="Value Realization"
        sub="What actually happened, with a proof level and evidence behind it. Weak claims surface as debt here; they are never smoothed over."
      />

      <AsyncState
        label="value claims"
        loading={loading}
        error={error}
        onRetry={reload}
        empty={nodes.length === 0}
        noun="value claims"
        emptyHint="A value claim closes the loop: it asserts that a bet produced something measurable, and links the evidence that proves it."
      >
        <Surface>
          <div className="border-b px-3 py-2">
            <RegionTitle count={nodes.length}>Claims</RegionTitle>
          </div>
          <div>
            {nodes.map((v) => {
              const links = fmList(v, "evidence_links");
              const hasProof = links.length > 0;
              const proofLevel = fmString(v, "proof_level");
              const validated = fmString(v, "status").toLowerCase() === "validated";
              return (
                <Row key={v.id}>
                  <RowGrid>
                    <RowBody>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <NodeTypeChip type={v.type} to={facetHref("type", v.type)} />
                        {proofLevel ? (
                          <ProofLevelBadge level={proofLevel} />
                        ) : (
                          <Unset label="no proof level set" />
                        )}
                        <StatusChip status={fmString(v, "status", "drafted")} to={facetHrefOr("status", fmString(v, "status"))} />
                      </div>
                      <a href={nodeHref(v.id)} className="t-row mt-1 block break-any hover:underline">
                        {nodeExcerpt(v, 220)}
                      </a>
                      <p
                        className={cn(
                          "t-body mt-0.5",
                          hasProof ? "text-muted-ink" : "text-gate-bad",
                        )}
                      >
                        {hasProof ? (
                          <>
                            {links.length} evidence link{links.length === 1 ? "" : "s"}
                          </>
                        ) : (
                          "Proof debt: no evidence links. This claim cannot be validated."
                        )}
                      </p>
                    </RowBody>

                    <RowActions className="flex-col items-end gap-1.5">
                      {validated ? (
                        <span className="t-datum inline-flex items-center gap-1 text-gate-ok">
                          <Check className="size-3" aria-hidden="true" />
                          validated
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant={hasProof && proofLevel ? "default" : "outline"}
                          onClick={() => validate(v.id)}
                          title="Run the value claim gate"
                        >
                          <ShieldCheck className="size-3.5" aria-hidden="true" />
                          Validate
                        </Button>
                      )}
                      <GateVerdict gate={gate[v.id] ?? null} />
                    </RowActions>
                  </RowGrid>
                </Row>
              );
            })}
          </div>
        </Surface>
      </AsyncState>
    </div>
  );
}
