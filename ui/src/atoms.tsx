// StrategyNotes domain atoms — encode the product's semantic vocabulary.
// Gate results, proof levels, node types, evidence states, pomo costs.
// All use the shadcn Badge with semantic color variants.

import { Badge } from "./components/ui/badge";
import { cn } from "./lib/utils";
import type { GateResult } from "./api";

// ---- GateStatusBadge ----

export function GateStatusBadge({ gate }: { gate: GateResult | null }) {
  if (!gate) return null;
  if (gate.status === "approved")
    return (
      <Badge variant="gate-ok">
        <span className="w-[7px] h-[7px] rounded-full bg-current" style={{ boxShadow: "0 0 0 2px color-mix(in oklch, currentColor 22%, transparent)" }} />
        approved
      </Badge>
    );
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="gate-bad">
        <span className="w-[7px] h-[7px] rounded-full bg-current" style={{ boxShadow: "0 0 0 2px color-mix(in oklch, currentColor 22%, transparent)" }} />
        blocked
      </Badge>
      {gate.failed_gates?.map((f) => (
        <Badge key={f} variant="gate-bad" className="opacity-70">
          {f}
        </Badge>
      ))}
    </div>
  );
}

// ---- ProofLevelBadge ----

const PROOF_COLOR: Record<string, "gate-ok" | "gate-info" | "gate-warn" | "gate-bad"> = {
  observed: "gate-ok",
  supported: "gate-ok",
  validated: "gate-ok",
  inferred: "gate-info",
  hypothesized: "gate-warn",
  speculative: "gate-warn",
  contested: "gate-bad",
  rejected: "gate-bad",
};

export function ProofLevelBadge({ level }: { level: string }) {
  const v = PROOF_COLOR[level?.toLowerCase()] ?? "outline";
  return (
    <Badge variant={v} className="capitalize">
      <span className="inline-block w-[6px] h-[6px] rounded-full bg-current opacity-60" />
      {level}
    </Badge>
  );
}

// ---- NodeTypeBadge ----

const TYPE_VARIANT: Record<string, "gate-ok" | "accent" | "gate-warn" | "gate-info"> = {
  strategy_case: "accent",
  case_charter: "accent",
  erd: "gate-ok",
  evidence_item: "gate-ok",
  source: "gate-ok",
  source_chunk: "gate-ok",
  ord: "accent",
  sld: "accent",
  strategic_claim: "accent",
  strategy_bet: "accent",
  choice_cascade: "accent",
  eds: "gate-warn",
  work_package: "gate-warn",
  timebox: "gate-warn",
  vsd: "gate-warn",
  vrd: "gate-ok",
  value_claim: "gate-ok",
  decision_record: "gate-info",
  agent_run: "gate-warn",
};

export function NodeTypeBadge({ type }: { type: string }) {
  const v = TYPE_VARIANT[type] ?? "outline";
  return (
    <Badge variant={v} className="uppercase tracking-wider">
      {type}
    </Badge>
  );
}

// ---- EvidenceStateBadge ----

export function EvidenceStateBadge({ state }: { state: string }) {
  const s = state?.toLowerCase();
  if (s === "accepted") return <Badge variant="gate-ok" className="rounded-full">{state}</Badge>;
  if (s === "rejected" || s === "superseded") return <Badge variant="gate-bad" className="rounded-full">{state}</Badge>;
  if (s === "drafted") return <Badge variant="gate-warn" className="rounded-full border-dashed border-border-strong">{state}</Badge>;
  return <Badge variant="gate-info" className="rounded-full">{state}</Badge>;
}

// ---- PomoCostBadge ----

export function PomoCostBadge({ pomos, attention }: { pomos: number; attention?: string }) {
  return (
    <Badge variant="outline" className="font-mono tabular">
      {pomos}p{attention ? ` · ${attention.replace(/_/g, " ")}` : ""}
    </Badge>
  );
}

// ---- MaturityChip ----

export function MaturityChip({ maturity }: { maturity: string }) {
  const m = maturity?.toLowerCase();
  if (m === "accepted" || m === "validated" || m === "claimed")
    return <Badge variant="gate-ok" className="uppercase">{maturity}</Badge>;
  if (m === "superseded") return <Badge variant="gate-bad" className="uppercase">{maturity}</Badge>;
  if (m === "drafted") return <Badge variant="gate-warn" className="uppercase border-dashed border-border-strong">{maturity}</Badge>;
  if (m === "reviewed") return <Badge variant="gate-warn" className="uppercase border-border-strong bg-surface-2">{maturity}</Badge>;
  return <Badge variant="gate-warn" className="uppercase">{maturity}</Badge>;
}

// ---- ContradictionBadge ----

export function ContradictionBadge() {
  return (
    <Badge variant="gate-bad" className="text-[10px]">
      ⚑ contradicts
    </Badge>
  );
}

// ---- SectionLabel ----

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-ink">
      {children}
    </span>
  );
}

// ---- CapacityMeter ----
// The ONLY horizontal fill in the UI — labeled as PRICE, never as progress.

export function CapacityMeter({ committed, available }: { committed: number; available: number }) {
  const pct = available > 0 ? Math.min(100, (committed / available) * 100) : 100;
  const over = committed > available;
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-24 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", over ? "bg-gate-bad" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("font-mono text-xs tabular", over ? "text-gate-bad" : "text-muted-ink")}>
        {committed}/{available}p
      </span>
    </div>
  );
}
