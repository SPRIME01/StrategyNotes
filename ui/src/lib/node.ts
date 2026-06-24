// Graph node field accessors — the ONE place that knows how to read a node.
//
// Contract (verified against backend core/src/format.rs::typed_to_node):
//   getNode(id) → { id, type, frontmatter: {…all typed fields…}, body }
// Typed nodes store every field in `frontmatter` (body empty). Plain notes
// store `title` in frontmatter and content in `body`. Typed edges live in
// frontmatter edge arrays (OQ-001 Option A).
//
// All accessors are defensive: missing/unknown keys yield safe fallbacks so
// the UI never crashes on a partially-authored or forward-compatible node
// (INV-PORT: unknown-key preservation; OKF: tolerate unknown fields).

export interface GraphNode {
  id: string;
  type: string;
  frontmatter: Record<string, unknown>;
  body?: string;
}

/** Read a frontmatter scalar (string/number/bool) coerced to string. */
export function fmString(node: GraphNode, key: string, fallback = ""): string {
  const v = node.frontmatter?.[key];
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

/** Read a frontmatter value as-is (typed by caller). */
export function fm<T = unknown>(node: GraphNode, key: string): T | undefined {
  return node.frontmatter?.[key] as T | undefined;
}

/** Read a frontmatter array of strings (edge lists, evidence_links, …). */
export function fmList(node: GraphNode, key: string): string[] {
  const v = node.frontmatter?.[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x : String(x)));
}

/** Read a boolean frontmatter flag. */
export function fmBool(node: GraphNode, key: string): boolean {
  const v = node.frontmatter?.[key];
  return v === true || v === "true";
}

/** Human title: frontmatter.title → first body line → id prefix. */
export function nodeTitle(node: GraphNode): string {
  const t = fmString(node, "title");
  if (t) return t;
  const bodyLine = (node.body ?? "").split("\n").find((l) => l.trim());
  if (bodyLine) return bodyLine.replace(/^#+\s*/, "").trim();
  return node.id.slice(0, 18);
}

/** Short text/excerpt for list cards: frontmatter.text/statement/thesis → body. */
export function nodeExcerpt(node: GraphNode, n = 120): string {
  const text =
    fmString(node, "text") ||
    fmString(node, "statement") ||
    fmString(node, "thesis") ||
    fmString(node, "objective") ||
    fmString(node, "summary") ||
    (node.body ?? "");
  return text.length > n ? text.slice(0, n) + "…" : text;
}

/** Excerpt for a backlink/preview, trimmed to one line. */
export function nodeSnippet(node: GraphNode, n = 60): string {
  return nodeExcerpt(node, n).split("\n")[0];
}

/** True if a frontmatter field is "filled" (non-empty scalar or non-empty array). */
export function fmFilled(node: GraphNode, key: string): boolean {
  const v = node.frontmatter?.[key];
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return v === true || (v != null && v !== false);
}

/** Outgoing typed edges stored in frontmatter (`edges: [{to, edge_type, status}]`). */
export interface NodeEdge {
  to: string;
  edge_type: string;
  status?: string;
}

export function nodeEdges(node: GraphNode): NodeEdge[] {
  const v = node.frontmatter?.["edges"];
  if (!Array.isArray(v)) return [];
  return v
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((e) => ({
      to: typeof e.to === "string" ? e.to : String(e.to ?? ""),
      edge_type: typeof e.edge_type === "string" ? e.edge_type : String(e.edge_type ?? ""),
      status: typeof e.status === "string" ? e.status : undefined,
    }))
    .filter((e) => e.to && e.edge_type);
}
