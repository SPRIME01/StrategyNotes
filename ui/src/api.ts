// Thin fetch client for the StrategyNotes HTTP API. The backend owns gates;
// the UI only renders their results (SPEC sec 3.4 - UI never decides approval).

const BASE = import.meta.env.DEV
  ? "" // dev: vite proxy forwards /api to the server
  : "http://127.0.0.1:8787";

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
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
  createClaim: (statement: string, proofLevel: string, supports: string[]) =>
    call<WithId>("POST", "/api/claims", { statement, proof_level: proofLevel, supports }),
  draftBet: (caseId: string, thesis: string) =>
    call<WithId>("POST", "/api/bets", { case: caseId, thesis }),
  approveBet: (id: string) => call<GateResult>("POST", `/api/bets/${id}/approve`),
  createWorkPackage: (caseId: string, linkedBet: string, objective: string) =>
    call<WithId>("POST", "/api/work-packages", { case: caseId, linked_bet: linkedBet, objective }),
  commitWorkPackage: (id: string) => call<GateResult>("POST", `/api/work-packages/${id}/commit`),
  scheduleTimebox: (workPackage: string, pomos: number, expectedOutput: string) =>
    call<WithId>("POST", "/api/timeboxes", {
      work_package: workPackage,
      pomos,
      start: "2026-07-01T13:00:00Z",
      end: "2026-07-01T14:00:00Z",
      expected_output: expectedOutput,
    }),
  reviewTimebox: (id: string, actualPomos: number, evidenceLinks: string[], nextAction: string) =>
    call<{ gate: GateResult }>("POST", `/api/timeboxes/${id}/review`, {
      actual_pomos: actualPomos,
      completion: "partial",
      evidence_links: evidenceLinks,
      next_action: nextAction,
    }),
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
};
