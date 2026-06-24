// OKF (Open Knowledge Format v0.1) bundle export. Builds a conformant bundle
// from graph nodes: one concept block per node (frontmatter `type` + body),
// a synthesized `index.md`, and a `log.md` from daynote content. The result is
// cat-able / git-clone-able — the durability story made real.
//
// Conformance (OKF §9): every concept has frontmatter with a non-empty `type`.
// Unknown frontmatter keys (including SN's `edges` typed-edge extension) are
// preserved — forward-compatible. Clones (`places` edges) are the one place SN
// exceeds OKF and are documented below.

import type { GraphNode } from "./node";
import { fmString, nodeTitle, nodeEdges } from "./node";

/** Render a single node as an OKF concept document (frontmatter + body). */
export function nodeToConcept(node: GraphNode): string {
  const fm = yamlFrontmatter(node);
  const body = (node.body ?? "").trim();
  return body ? `---\n${fm}---\n\n${body}\n` : `---\n${fm}---\n`;
}

/** Build the full bundle text (concepts + index + log) as a single document. */
export function exportOkfBundle(nodes: GraphNode[], daynoteContent = "", caseTitle = "StrategyNotes case"): string {
  const concepts = nodes.map(nodeToConcept);
  const index = synthesizeIndex(nodes, caseTitle);
  const log = daynoteContent.trim() ? `# Directory Update Log\n\n${daynoteContent.trim()}\n` : "";
  const parts = [
    "# OKF bundle — exported from StrategyNotes",
    `# okf_version: "0.1"  ·  ${nodes.length} concept(s)`,
    "# StrategyNotes extension: typed edges live in frontmatter `edges: [{to, edge_type}]`;",
    "# clones are `places` edges (equal placements). OKF consumers ignore these; SN reconstructs the typed graph.",
    "",
    index,
    ...concepts,
  ];
  if (log) parts.push("", log);
  return parts.join("\n");
}

/** Synthesize an OKF index.md (§6) — progressive-disclosure listing by type. */
export function synthesizeIndex(nodes: GraphNode[], caseTitle: string): string {
  const byType = new Map<string, GraphNode[]>();
  for (const n of nodes) {
    const arr = byType.get(n.type) ?? [];
    arr.push(n);
    byType.set(n.type, arr);
  }
  const lines = [`# ${caseTitle}`, "", `_${nodes.length} concepts, grouped by type._`, ""];
  for (const [type, group] of byType) {
    lines.push(`## ${type} (${group.length})`);
    for (const n of group) {
      const desc = fmString(n, "description") || fmString(n, "text") || (n.body ?? "").slice(0, 60);
      lines.push(`- ${nodeTitle(n)} — ${desc}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// Frontmatter: `type` (required) first, then known keys, then all others
// (unknown-key preservation — INV-PORT / OKF §4.1).
function yamlFrontmatter(node: GraphNode): string {
  const lines: string[] = [`type: ${node.type}`];
  const known = ["title", "description", "resource", "timestamp", "phase", "owner", "arena",
    "status", "proof_level", "text", "statement", "thesis", "objective", "summary",
    "source_chunk", "linked_choice", "success_metric", "kill_criteria", "counterevidence_reviewed",
    "assumptions", "supports", "contradicts", "evidence_links", "linked_bet", "work_package",
    "expected_output", "pomos", "agent", "reviewer"];
  const seen = new Set<string>(["type"]);
  for (const k of known) {
    if (k in node.frontmatter) { lines.push(`${k}: ${yamlVal(node.frontmatter[k])}`); seen.add(k); }
  }
  for (const [k, v] of Object.entries(node.frontmatter)) {
    if (!seen.has(k)) lines.push(`${k}: ${yamlVal(v)}`);
  }
  // edges are serialized as the OKF-compatible `edges` array (SN extension).
  const edges = nodeEdges(node);
  if (edges.length) {
    lines.push("edges:");
    for (const e of edges) lines.push(`  - { to: ${e.to}, edge_type: ${e.edge_type}${e.status ? `, status: ${e.status}` : ""} }`);
  }
  return lines.join("\n") + "\n";
}

function yamlVal(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(String(x))).join(", ")}]`;
  if (typeof v === "string") return /[:#\n{}[\]&*?|>']/.test(v) ? JSON.stringify(v) : v;
  if (v === null || v === undefined) return '""';
  return String(v);
}
