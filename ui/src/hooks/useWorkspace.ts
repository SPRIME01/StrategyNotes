// Workspace-level derived state — the single source of truth.
//
// Before this existed, the app bar computed capacity one way and the Case
// Cockpit computed it another, so the same screen showed `6/24p` in the header
// and `0/24p` in the body. Two answers to one question on one viewport is a lie
// (PRODUCT.md: "not uncertain about its own state"). One computation, one number.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTypedNodes } from "./useTypedNodes";
import { fmString, fmBool, nodeTitle } from "../lib/node";

// ponytail: per-cycle budget. Implementation-defined; documented as such.
export const POMOS_AVAILABLE = 24;

export interface Workspace {
  cases: { id: string; title: string }[];
  caseId: string | null;
  setCaseId: (id: string | null) => void;
  /** The one capacity number. Every surface reads this. */
  committedPomos: number;
  capacityAvailable: number;
  online: boolean;
  retry: () => void;
}

export function useWorkspace(): Workspace {
  const cases = useTypedNodes("strategy_case");
  const timeboxes = useTypedNodes("timebox");
  const work = useTypedNodes("work_package");

  const [caseId, setCaseId] = useState<string | null>(null);

  const committedPomos = useMemo(() => {
    const fromTimeboxes = timeboxes.nodes.reduce(
      (s, t) => s + (Number(fmString(t, "pomos")) || 0),
      0,
    );
    const fromCommittedWork = work.nodes.reduce((s, w) => {
      const committed =
        fmBool(w, "committed") || fmString(w, "status").toLowerCase() === "committed";
      return committed ? s + (Number(fmString(w, "pomos")) || 0) : s;
    }, 0);
    // A committed work package funds a timebox; counting both double-counts the
    // same block. Take the larger reading rather than the sum.
    return Math.max(fromTimeboxes, fromCommittedWork);
  }, [timeboxes.nodes, work.nodes]);

  const loading = cases.loading || timeboxes.loading || work.loading;
  const failed = cases.error || timeboxes.error || work.error;
  const online = !failed && !loading;

  const caseList = useMemo(
    () => cases.nodes.map((c) => ({ id: c.id, title: nodeTitle(c) })),
    [cases.nodes],
  );

  // Selected case falls back to the first case (the workspace default).
  const effectiveCaseId = useMemo(() => {
    if (caseId && caseList.some((c) => c.id === caseId)) return caseId;
    return caseList[0]?.id ?? null;
  }, [caseId, caseList]);

  const retry = useCallback(() => {
    cases.reload();
    timeboxes.reload();
    work.reload();
  }, [cases, timeboxes, work]);

  return {
    cases: caseList,
    caseId: effectiveCaseId,
    setCaseId,
    committedPomos,
    capacityAvailable: POMOS_AVAILABLE,
    online,
    retry,
  };
}

/** True once the first load has settled, so the shell can show "offline" honestly. */
export function useSettled(loading: boolean) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!loading) setSettled(true);
  }, [loading]);
  return settled;
}
