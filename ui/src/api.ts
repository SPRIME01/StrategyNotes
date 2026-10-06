// Thin fetch client for the StrategyNotes HTTP API. The backend owns gates;
// the UI only renders their results (SPEC sec 3.4 - UI never decides approval).

import type { GraphNode } from "./lib/node";

const BASE = import.meta.env.DEV
  ? "" // dev: vite proxy forwards /api to the server
  : "http://127.0.0.1:8787";

// Every request is bounded. Without this, a hung backend (a socket that accepts
// but never answers) leaves every view parked on its loading skeleton forever,
// which reads as "there is no data" rather than "the server is stuck" — exactly
// the uncertainty PRODUCT.md forbids.
const REQUEST_TIMEOUT_MS = 8000;

class RequestTimeout extends Error {
  constructor(ms: number) {
    super(`the local server did not respond within ${Math.round(ms / 1000)}s`);
    this.name = "RequestTimeout";
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw new RequestTimeout(REQUEST_TIMEOUT_MS);
    throw new Error("the local server could not be reached");
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface GateResult {
  status: "approved" | "blocked";
  failed_gates?: string[];
}

export interface WithId {
  id: string;
  [k: string]: unknown;
}

// Typed edges (core/src/node.rs EdgeType, snake_case) and the strategy node
// types a note can be promoted to. Kept client-side for the editor's type
// selector + edge picker; the server validates each.
export const EDGE_TYPES = [
  "supports", "contradicts", "derives_from", "assumes", "tests", "implements",
  "blocks", "resolves", "requires", "validates", "weakens", "supersedes",
  "claims_value_for", "scheduled_by", "reviewed_by", "created_from", "compares_with",
] as const;

export const NODE_TYPES = [
  "note", "journal", "source", "source_chunk", "evidence_item", "strategy_case",
  "strategic_claim", "assumption", "counterevidence", "option", "choice_cascade",
  "strategy_bet", "experiment", "metric", "work_package", "timebox", "value_claim",
  "open_question", "risk", "decision_record",
] as const;

export const api = {
  createCase: (title: string) =>
    call<WithId>("POST", "/api/cases", { title }),
  addSource: (title: string) =>
    call<WithId>("POST", "/api/sources", { title }),
  addSourceChunk: (source: string, locator: string, text: string) =>
    call<WithId>("POST", "/api/source-chunks", { source, locator, text }),
  extractEvidence: (
    sourceChunk: string,
    text: string,
    proofLevel: string,
    kind: string
  ) => call<WithId>("POST", "/api/evidence", { source_chunk: sourceChunk, text, proof_level: proofLevel, kind }),
  acceptEvidence: (id: string) => call<GateResult>("POST", `/api/evidence/${id}/accept`),
  rejectEvidence: (id: string) => call<WithId>("POST", `/api/evidence/${id}/reject`),
  createClaim: (statement: string, proofLevel: string, supports: string[]) =>
    call<WithId>("POST", "/api/claims", { statement, proof_level: proofLevel, supports }),
  draftBet: (caseId: string, thesis: string) =>
    call<WithId>("POST", "/api/bets", { case: caseId, thesis }),
  approveBet: (id: string) => call<GateResult>("POST", `/api/bets/${id}/approve`),
  killBet: (id: string) => call<WithId>("POST", `/api/bets/${id}/kill`),
  createWorkPackage: (caseId: string, linkedBet: string, objective: string) =>
    call<WithId>("POST", "/api/work-packages", { case: caseId, linked_bet: linkedBet, objective }),
  commitWorkPackage: (id: string) => call<GateResult>("POST", `/api/work-packages/${id}/commit`),
  scheduleTimebox: (
    workPackage: string,
    pomos: number,
    expectedOutput: string,
    start?: string,
    end?: string,
  ) => {
    const s = start ?? new Date().toISOString();
    const e = end ?? new Date(Date.now() + Math.max(1, pomos) * 25 * 60 * 1000).toISOString();
    return call<WithId>("POST", "/api/timeboxes", {
      work_package: workPackage,
      pomos,
      start: s,
      end: e,
      expected_output: expectedOutput,
    });
  },
  reviewTimebox: (
    id: string,
    actualPomos: number,
    evidenceLinks: string[],
    nextAction: string,
    completion: string = "full",
  ) =>
    call<{ gate: GateResult }>("POST", `/api/timeboxes/${id}/review`, {
      actual_pomos: actualPomos,
      completion,
      evidence_links: evidenceLinks,
      next_action: nextAction,
    }),
  /** SPEC sec 10.3. OQ-002 Option B: the ICS file IS the calendar integration —
   *  no provider is contacted, so there is nothing here that can fail into
   *  INV-CAL. Returns the whole commitment set as one VCALENDAR. */
  exportIcs: () => call<{ ics: string }>("POST", "/api/calendar/ics/export"),
  claimValue: (
    caseId: string,
    statement: string,
    proofLevel: string,
    evidenceLinks: string[],
    linkedOutcome: string
  ) =>
    call<WithId>("POST", "/api/value-claims", {
      case: caseId,
      statement,
      proof_level: proofLevel,
      evidence_links: evidenceLinks,
      linked_outcome: linkedOutcome,
    }),
  validateValue: (id: string) => call<GateResult>("POST", `/api/value-claims/${id}/validate`),
  trace: (id: string) => call<{ reachable: string[] }>("GET", `/api/trace/${id}`),
  search: (q: string) => call<{ id: string; ty: string; excerpt: string }[]>("GET", `/api/search?q=${encodeURIComponent(q)}`),
  getNode: (id: string) => call<WithId & { body?: string }>("GET", `/api/node/${id}`),
  nodesByType: (ty: string) => call<string[]>("GET", `/api/nodes/${ty}`),
  /** Every node in the vault, one round trip. Powers the derived pages:
   *  "everything with this status / tag / type". Read-only projection of
   *  markdown (INV-DUR) — never a second source of truth. */
  allNodes: () => call<GraphNode[]>("GET", "/api/nodes"),
  createAgentRun: (agent: string, summary: string) =>
    call<WithId>("POST", "/api/agent-runs", { agent, summary }),
  acceptAgentRun: (id: string, reviewer: string) =>
    call<GateResult>("POST", `/api/agent-runs/${id}/accept`, { reviewer }),
  rejectAgentRun: (id: string) => call<WithId>("POST", `/api/agent-runs/${id}/reject`),
  daynote: (date: string) => call<{ content: string }>("GET", `/api/daynote/${date}`),
  // Notes CRUD
  createNote: (title: string, body?: string) =>
    call<WithId & { body?: string }>("POST", "/api/notes", { title, body: body ?? "" }),
  updateNote: (id: string, body: string, title?: string) =>
    call<WithId & { body?: string }>("PUT", `/api/notes/${id}`, { body, title }),
  deleteNote: (id: string) =>
    call<{ deleted: string }>("DELETE", `/api/notes/${id}`),
  getBacklinks: (id: string) =>
    call<string[]>("GET", `/api/notes/${id}/backlinks`),
  cloneNote: (id: string, parentId: string) =>
    call<{ cloned: boolean }>("POST", `/api/notes/${id}/clone`, { parent_id: parentId }),
  getPlacements: (id: string) =>
    call<string[]>("GET", `/api/notes/${id}/placements`),
  promoteNote: (id: string, targetType: string) =>
    call<WithId>("POST", `/api/notes/${id}/promote`, { target_type: targetType }),
  /** Add a typed edge `from(id) --edge_type--> to`. Gate-safe (structural only). */
  linkNode: (id: string, to: string, edgeType: string) =>
    call<{ linked: boolean; edge: string; to: string }>("POST", `/api/node/${id}/edge`, { to, edge_type: edgeType }),
  /** Gate-safe in-place concept-doc edit. `status` is ignored (gate-owned). */
  patchNode: (id: string, patch: { type?: string; body?: string; frontmatter?: Record<string, unknown> }) =>
    call<WithId>("PATCH", `/api/node/${id}`, patch),
  /** Create a typed node from OKF frontmatter (YAML, parsed server-side) + body.
   *  Gate-safe: type/status stripped from frontmatter; unknown types → note. */
  createNode: (node: { type?: string; frontmatter_yaml?: string; body?: string }) =>
    call<WithId>("POST", "/api/node", node),
  /** Typed edges of a node (parsed from frontmatter by the server's get_node). */
  edgeTypes: () => EDGE_TYPES,
};
