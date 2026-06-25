// The five generated strategy documents, as declarative specs over the graph.
// Each maps to framework §4368: ERD=evidence, ORD=outcome requirements,
// SLD=claims+assumptions, EDS=work packages, VSD=experiments+metrics.
// Field names mirror the core domain structs (core/src/strategy.rs, execution.rs).

import type { DocSpec } from "./GeneratedDoc";

export const DOC_SPECS: DocSpec[] = [
  {
    id: "erd",
    title: "Evidence Reality Dossier",
    kicker: "REALITY",
    intro: "A living view over accepted evidence. Regenerated from the graph — not a static file. Drafted items are excluded until they pass the acceptance gate.",
    sections: [
      {
        label: "Accepted Evidence",
        nodeType: "evidence_item",
        fields: [{ key: "source_chunk", label: "source" }],
        filter: (n) => fmStr(n, "status").toLowerCase() === "accepted",
        emptyHint: "accept evidence in the Evidence Inbox",
      },
    ],
  },
  {
    id: "ord",
    title: "Outcome Requirements Document",
    kicker: "OUTCOMES",
    intro: "What must become true. Each requirement carries its acceptance criteria.",
    sections: [
      {
        label: "Outcome Requirements",
        nodeType: "ord",
        fields: [{ key: "acceptance_criteria", label: "criteria" }, { key: "case", label: "case" }],
        emptyHint: "create outcome_requirement nodes (type: ord)",
      },
    ],
  },
  {
    id: "sld",
    title: "Strategic Logic Document",
    kicker: "STRATEGY",
    intro: "Why the strategy has its shape: claims, their proof, and the assumptions they rest on.",
    sections: [
      {
        label: "Strategic Claims",
        nodeType: "strategic_claim",
        fields: [{ key: "supports", label: "supports" }, { key: "contradicts", label: "contradicts" }],
        emptyHint: "draft strategic claims",
      },
      {
        label: "Assumptions",
        nodeType: "assumption",
        fields: [{ key: "status", label: "status" }],
        emptyHint: "record assumptions linked to claims",
      },
    ],
  },
  {
    id: "eds",
    title: "Execution Design Specification",
    kicker: "EXECUTION",
    intro: "Work packages, their linked bets, and status. Capacity is the price of execution.",
    sections: [
      {
        label: "Work Packages",
        nodeType: "work_package",
        fields: [{ key: "status", label: "status" }, { key: "linked_bet", label: "bet" }, { key: "inputs", label: "inputs" }],
        emptyHint: "create work packages from approved bets",
      },
    ],
  },
  {
    id: "vsd",
    title: "Validation Strategy Document",
    kicker: "VALIDATION",
    intro: "How the strategy is tested: experiments, metrics, and the kill criteria that would change our mind.",
    sections: [
      {
        label: "Experiments",
        nodeType: "experiment",
        fields: [],
        emptyHint: "define experiments against bets",
      },
      {
        label: "Metrics",
        nodeType: "metric",
        fields: [],
        emptyHint: "define metrics for outcomes",
      },
    ],
  },
];

// local helper to avoid importing fmString into this spec file (keep specs pure data)
function fmStr(n: { frontmatter: Record<string, unknown> }, key: string): string {
  const v = n.frontmatter?.[key];
  if (typeof v === "string") return v;
  return "";
}
