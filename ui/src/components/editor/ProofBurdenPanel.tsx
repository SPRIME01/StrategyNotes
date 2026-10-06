// Proof Burden — SPEC §11.4. For the active node, answers from its typed edges:
//   What supports this? What contradicts? What is assumed? What would change our
//   mind? What remains unverified?
//
// The previous version rendered nine questions, eight of them as a permanent
// unanswered "—", and put the only way to answer them in a separate widget below
// two selects and nine chips. That is the compliance-auditor failure this product
// is not allowed to have (PRODUCT.md: "a red flag is only legitimate when paired
// with a one-click path to satisfy it"). So the link affordance is now INLINE,
// on the question itself.

import { useState } from "react";
import { Link2, Loader2, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { nodeEdges, type GraphNode } from "../../lib/node";
import { useAllStrategyNodes, useNode } from "../../hooks/useTypedNodes";
import { useNodeTitle } from "../../hooks/useNodeTitle";
import { api } from "../../api";
import { Callout, RegionTitle } from "../ui/surface";
import { Field, Select } from "../ui/field";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { cn } from "../../lib/utils";

/** Canonical proof questions, each mapped to the edge type that answers it. */
const QUESTIONS: { edge: string; q: string; why: string }[] = [
  { edge: "supports", q: "What supports this?", why: "Evidence carrying this claim" },
  { edge: "contradicts", q: "What contradicts this?", why: "Counterevidence, kept visible" },
  { edge: "assumes", q: "What is assumed?", why: "Load-bearing assumptions" },
  { edge: "derives_from", q: "Where does this derive from?", why: "The upstream reasoning" },
  { edge: "tests", q: "How is this tested?", why: "The experiment or check" },
  { edge: "requires", q: "What does this require?", why: "Dependencies" },
  { edge: "validates", q: "What validates this?", why: "The proof that closes it" },
  { edge: "weakens", q: "What weakens this?", why: "Known failure modes" },
  { edge: "supersedes", q: "What does this supersede?", why: "What it replaces" },
];

export function ProofBurdenPanel({
  node,
  onLinked,
}: {
  node: GraphNode | null;
  onLinked?: () => void;
}) {
  const byType = useMemo(() => {
    const m = new Map<string, string[]>();
    if (!node) return m;
    for (const e of nodeEdges(node)) {
      if (e.status === "retracted" || e.status === "superseded") continue;
      const arr = m.get(e.edge_type) ?? [];
      arr.push(e.to);
      m.set(e.edge_type, arr);
    }
    return m;
  }, [node]);

  if (!node) {
    return (
      <p className="t-body text-muted-foreground">
        Select a note to see what supports it, what contradicts it, and what is still assumed.
      </p>
    );
  }

  const answered = QUESTIONS.filter((q) => (byType.get(q.edge)?.length ?? 0) > 0);
  const unanswered = QUESTIONS.filter((q) => (byType.get(q.edge)?.length ?? 0) === 0);
  const hasContradiction = (byType.get("contradicts")?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <RegionTitle count={answered.length}>
          Burden of proof
        </RegionTitle>
        <p className="t-body mt-0.5 text-[12px] text-muted-ink">
          {answered.length} of {QUESTIONS.length} answered.
          {unanswered.length > 0 &&
            " Unanswered questions are not debts on their own; they are where your reasoning is exposed."}
        </p>
      </div>

      {hasContradiction && (
        <Callout tone="warn" className="flex items-start gap-2 px-2.5 py-2">
          <TriangleAlert className="mt-px size-3.5 shrink-0 text-gate-warn" aria-hidden="true" />
          <p className="text-[12px] text-gate-warn">
            Counterevidence is attached. It stays visible and is never discarded silently.
          </p>
        </Callout>
      )}

      <ul className="flex flex-col">
        {QUESTIONS.map((q) => {
          const targets = byType.get(q.edge) ?? [];
          return (
            <ProofQuestion
              key={q.edge}
              fromId={node.id}
              edge={q.edge}
              question={q.q}
              why={q.why}
              targets={targets}
              onLinked={onLinked}
            />
          );
        })}
      </ul>
    </div>
  );
}

function ProofQuestion({
  fromId,
  edge,
  question,
  why,
  targets,
  onLinked,
}: {
  fromId: string;
  edge: string;
  question: string;
  why: string;
  targets: string[];
  onLinked?: () => void;
}) {
  const [linking, setLinking] = useState(false);
  const { notify } = useToast();

  return (
    <li className="border-b border-border/60 py-1.5 last:border-b-0">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "t-body min-w-0 flex-1",
            targets.length ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {question}
        </span>
        <span className="t-datum shrink-0 text-faint">
          {targets.length || <span aria-label="none linked">—</span>}
        </span>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Link a node that answers: ${question}`}
          title={`${why} (creates a "${edge.replace(/_/g, " ")}" edge)`}
          onClick={() => setLinking((v) => !v)}
        >
          <Link2 className="size-3.5" />
        </Button>
      </div>

      {targets.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1">
          {targets.map((tid) => (
            <EdgeTarget key={tid} id={tid} />
          ))}
        </ul>
      )}

      {linking && (
        <LinkRow
          fromId={fromId}
          edge={edge}
          onDone={() => {
            setLinking(false);
            onLinked?.();
          }}
          onNotify={notify}
        />
      )}
    </li>
  );
}

function LinkRow({
  fromId,
  edge,
  onDone,
  onNotify,
}: {
  fromId: string;
  edge: string;
  onDone: () => void;
  onNotify: (m: string, t?: "info" | "ok" | "bad") => void;
}) {
  const { nodes } = useAllStrategyNodes();
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);

  const candidates = nodes.filter((n) => n.id !== fromId).slice(0, 80);

  const link = async () => {
    if (!to) return;
    setBusy(true);
    try {
      await api.linkNode(fromId, to, edge);
      onNotify(`Linked a "${edge.replace(/_/g, " ")}" edge.`, "ok");
      setTo("");
      onDone();
    } catch (e) {
      onNotify(
        e instanceof Error ? `Could not link: ${e.message}` : "Could not link.",
        "bad",
      );
    }
    setBusy(false);
  };

  return (
    <div className="mt-1.5 flex items-end gap-1.5">
      <Field label="" htmlFor={`link-${edge}-${fromId}`} className="min-w-0 flex-1">
        <Select
          id={`link-${edge}-${fromId}`}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-7 text-xs"
        >
          <option value="">choose a node…</option>
          {candidates.map((n) => (
            <option key={n.id} value={n.id}>
              [{n.type.replace(/_/g, " ")}] {titleOf(n)}
            </option>
          ))}
        </Select>
      </Field>
      <Button size="sm" onClick={link} disabled={!to || busy}>
        {busy ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : "Link"}
      </Button>
    </div>
  );
}

function titleOf(n: GraphNode) {
  const t = n.frontmatter?.title;
  return typeof t === "string" && t ? t : (n.body ?? "").split("\n")[0]?.replace(/^#+\s*/, "") || n.id.slice(0, 10);
}

function EdgeTarget({ id }: { id: string }) {
  const title = useNodeTitle(id);
  const { node } = useNode(id);
  return (
    <li>
      <span
        className="t-datum inline-flex max-w-full items-center gap-1 rounded-sm border border-kind-strategy/30 bg-kind-strategy/10 px-1.5 py-0.5 text-kind-strategy"
        title={`${node ? node.type : "node"}${title ? "" : " · untitled"} · ${id}`}
      >
        <span className="truncate">{title ?? `untitled ${node ? node.type.replace(/_/g, " ") : "node"}`}</span>
      </span>
    </li>
  );
}
