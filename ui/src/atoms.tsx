// StrategyNotes domain atoms — the product's own vocabulary, rendered.
//
// DESIGN.md §6. These encode meaning, never decoration:
//   · a status is never color alone
//   · node types read as domain nouns in sentence case with a stable hue
//   · a blocked state is ALWAYS paired with what resolves it
//   · an unset value is an em dash, never a zero

import * as React from "react";
import { AlertTriangle, Ban, Check, X } from "lucide-react";
import { Badge, StatusDot } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Callout } from "./components/ui/surface";
import { cn } from "./lib/utils";
import type { GateResult } from "./api";

// ─── Node type ───────────────────────────────────────────────────────────────
// Five families. Every declared type maps to one, so the same node reads the
// same colour in the list, the trace, and the editor. No type falls through
// to "unknown" — that was how `experiment` and `metric` lost their identity.

export type NodeKind = "reality" | "strategy" | "execution" | "value" | "governance" | "plain";

const KIND_CLASS: Record<NodeKind, string> = {
  reality: "text-kind-reality border-kind-reality/30 bg-kind-reality/10",
  strategy: "text-kind-strategy border-kind-strategy/30 bg-kind-strategy/10",
  execution: "text-kind-execution border-kind-execution/30 bg-kind-execution/10",
  value: "text-kind-value border-kind-value/30 bg-kind-value/10",
  governance: "text-kind-governance border-kind-governance/30 bg-kind-governance/10",
  plain: "text-kind-plain border-kind-plain/30 bg-kind-plain/10",
};

const NODE_KIND: Record<string, NodeKind> = {
  note: "plain", journal: "plain", open_question: "plain",
  source: "reality", source_chunk: "reality", evidence_item: "reality",
  counterevidence: "reality", metric: "reality",
  strategy_case: "strategy", case_charter: "strategy", choice_cascade: "strategy",
  strategic_claim: "strategy", assumption: "strategy", option: "strategy",
  strategy_bet: "strategy", risk: "strategy", decision_record: "strategy",
  ord: "strategy", sld: "strategy",
  work_package: "execution", experiment: "execution", timebox: "execution",
  timebox_review: "execution",
  erd: "reality", vsd: "reality", eds: "execution",
  value_claim: "value", vrd: "value",
  agent_run: "governance",
};

/** "work_package" → "work package". Domain nouns, not database columns. */
export function nodeTypeLabel(type: string): string {
  return (type || "unknown").replace(/_/g, " ");
}

export function NodeTypeChip({
  type,
  className,
  to,
}: {
  type: string;
  className?: string;
  /** When set, the chip becomes a real anchor to a derived facet page
   *  (PRD-005). Omitted, it stays the plain span every existing call site
   *  already renders — this is purely additive. */
  to?: string;
}) {
  const kind = NODE_KIND[type] ?? "plain";
  const cls = cn(
    "inline-flex shrink-0 items-center rounded-sm border px-1.5 py-[3px] font-mono text-[10px] font-medium leading-none",
    KIND_CLASS[kind],
    className,
  );
  const label = nodeTypeLabel(type);
  if (!to) return <span className={cls}>{label}</span>;
  return (
    <a
      href={to}
      className={cn(cls, "t-fast hover:opacity-75")}
      // A chip inside a row that is itself clickable must not fire both.
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────
// One case convention (Title), one colour mapping, used by every view.
// DESIGN.md §3: the status words are Drafted/Reviewed/Accepted/Validated/
// Claimed/Superseded. Never Complete / Done / Finished.

export type StatusTone = "ok" | "warn" | "info" | "muted" | "bad";

const STATUS_TONE: Record<string, StatusTone> = {
  drafted: "warn", intent: "warn", draft: "warn",
  reviewed: "info", committed: "info", in_progress: "info",
  accepted: "ok", approved: "ok", validated: "ok", claimed: "ok", complete: "ok",
  superseded: "muted", killed: "muted", rejected: "bad", cancelled: "muted",
  blocked: "bad", done: "muted", finished: "muted",
};

const TONE_CLASS: Record<StatusTone, string> = {
  ok: "text-gate-ok bg-gate-ok-bg border-transparent",
  warn: "text-gate-warn bg-gate-warn-bg border-transparent",
  info: "text-gate-info bg-gate-info-bg border-transparent",
  bad: "text-gate-bad bg-gate-bad-bg border-transparent",
  muted: "text-faint bg-surface-2 border-border-strong",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TONE[(status || "").toLowerCase()] ?? "info";
}

/** Human label for a raw frontmatter status. */
export function statusLabel(status: string): string {
  const s = (status || "").replace(/_/g, " ").trim();
  if (!s) return "Unspecified";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function StatusChip({
  status,
  className,
  to,
}: {
  status: string;
  className?: string;
  /** When set, the status becomes a real anchor to everything carrying it
   *  (PRD-005: "clicking a status opens a page with all items of that status").
   *  Omitted, it stays the plain span every existing call site renders. */
  to?: string;
}) {
  const tone = statusTone(status);
  const dashed = /draft|intent/.test((status || "").toLowerCase());
  const cls = cn(
    "inline-flex shrink-0 items-center gap-1 rounded-sm border border-dashed-0 px-1.5 py-[3px] font-mono text-[10px] font-medium leading-none",
    dashed && "border-dashed",
    TONE_CLASS[tone],
    className,
  );
  const label = statusLabel(status);
  if (!to) return <span className={cls}>{label}</span>;
  return (
    <a
      href={to}
      className={cn(cls, "t-fast hover:opacity-75")}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
}

/** Maturity as the product means it: gates + debt, never percent-complete. */
export function MaturityChip({ maturity }: { maturity: string }) {
  return <StatusChip status={maturity} />;
}

// ─── Proof level ─────────────────────────────────────────────────────────────

const PROOF_TONE: Record<string, StatusTone> = {
  observed: "ok", supported: "ok", validated: "ok",
  inferred: "info",
  hypothesized: "warn", speculative: "warn",
  contested: "bad", rejected: "bad",
};

export function ProofLevelBadge({ level }: { level: string }) {
  const tone = PROOF_TONE[(level || "").toLowerCase()] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-1.5 py-[3px] font-mono text-[10px] font-medium leading-none capitalize",
        TONE_CLASS[tone],
      )}
    >
      <StatusDot className="opacity-70" />
      {level || "unstated"}
    </span>
  );
}

// ─── Evidence state ──────────────────────────────────────────────────────────

export function EvidenceStateBadge({ state, to }: { state: string; to?: string }) {
  return <StatusChip status={state} to={to} />;
}

// ─── Cost ────────────────────────────────────────────────────────────────────

export function PomoCostBadge({ pomos }: { pomos: number }) {
  // Missing cost is an em dash, never "0p". DESIGN.md §10.
  if (!pomos || pomos <= 0) {
    return (
      <span className="t-datum text-faint" aria-label="pomo cost not estimated" title="pomo cost not estimated">
        —p
      </span>
    );
  }
  return <span className="t-datum text-muted-foreground">{pomos}p</span>;
}

// ─── Contradiction ───────────────────────────────────────────────────────────

export function ContradictionBadge({ count }: { count?: number } = {}) {
  return (
    <Badge variant="gate-bad" className="shrink-0">
      <AlertTriangle className="size-2.5" aria-hidden="true" />
      contradicts{count !== undefined ? ` ${count}` : ""}
    </Badge>
  );
}

// ─── Gate result ─────────────────────────────────────────────────────────────
// DESIGN.md §10: the verdict appears inline where the action happened and is
// announced politely. Gate codes are translated into the user's language; the
// raw code stays available as a tooltip for the audit trail.

const GATE_PLAIN: Record<string, string> = {
  missing_linked_choice_cascade: "link it to a choice",
  missing_assumptions: "add assumptions",
  missing_counterevidence_reviewed: "confirm you reviewed counterevidence",
  missing_success_metric: "add a success metric",
  missing_kill_criteria: "add kill criteria",
  missing_owner: "name an owner",
  missing_source_chunk: "attach a source",
  missing_evidence_links: "link evidence",
  missing_proof_level: "set a proof level",
  missing_work_package: "attach a work package",
  missing_pomo_estimate: "estimate pomos",
  missing_timebox: "reserve a timebox",
  unreachable: "the server did not respond",
  validation_error: "the server rejected this",
};

/** Turn `missing_kill_criteria` into "add kill criteria". */
export function gateReason(code: string): string {
  if (GATE_PLAIN[code]) return GATE_PLAIN[code];
  return code.replace(/^missing_/, "").replace(/_/g, " ");
}

export function GateResult({
  gate,
  className,
}: {
  gate: GateResult | null | undefined;
  className?: string;
}) {
  if (!gate) return null;
  const failed = gate.failed_gates ?? [];
  const approved = gate.status === "approved";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-w-0 flex-col gap-1", className)}
    >
      <Badge variant={approved ? "gate-ok" : "gate-bad"} className="w-fit shrink-0">
        <StatusDot />
        {approved ? "approved" : "blocked"}
      </Badge>
      {!approved && failed.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5">
          {failed.map((f) => (
            <li key={f} className="flex items-center gap-1 text-[11px] text-gate-bad">
              <X className="size-2.5 shrink-0" aria-hidden="true" />
              <span title={f}>{gateReason(f)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Kept for call sites that only want the chip. */
export function GateStatusBadge({ gate }: { gate: GateResult | null }) {
  return <GateResult gate={gate} />;
}

// ─── Requirement list ────────────────────────────────────────────────────────
// The single component that renders "blocked, and here is how to fix it".
// Never hand-rolled per view. DESIGN.md §6.

export interface Requirement {
  key: string;
  label: string;
  filled: boolean;
}

export function RequirementList({
  requirements,
  /** The ONE control that clears every unmet requirement. A red flag without a
   *  path is a bug; six buttons that repeat the list is noise. */
  action,
  className,
}: {
  requirements: Requirement[];
  action?: React.ReactNode;
  className?: string;
}) {
  const unmet = requirements.filter((r) => !r.filled);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <ul className="flex flex-col gap-0.5">
        {requirements.map((r) => (
          <li
            key={r.key}
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              r.filled ? "text-muted-ink" : "text-gate-bad",
            )}
          >
            {r.filled ? (
              <Check className="size-3 shrink-0 text-gate-ok" aria-hidden="true" />
            ) : (
              <X className="size-3 shrink-0 text-gate-bad" aria-hidden="true" />
            )}
            <span className={r.filled ? "line-through decoration-faint/60" : undefined}>
              {r.label}
            </span>
            <span className="sr-only">{r.filled ? "met" : "not met"}</span>
          </li>
        ))}
      </ul>
      {unmet.length > 0 && (
        <Callout tone="warn" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-2">
          <p className="min-w-0 flex-1 text-[11px] text-gate-warn">
            {unmet.length} unmet. Not approvable yet.
          </p>
          {action}
        </Callout>
      )}
    </div>
  );
}

// ─── Capacity meter ──────────────────────────────────────────────────────────
// The ONLY horizontal fill in the product. Labelled as price, never progress.
// DESIGN.md §15: a real progressbar with an accessible name and values.

export function CapacityMeter({
  committed,
  available,
  className,
}: {
  committed: number;
  available: number;
  className?: string;
}) {
  const pct = available > 0 ? Math.min(100, (committed / available) * 100) : 100;
  const over = committed > available;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-label={`Strategy capacity committed: ${committed} of ${available} pomos`}
        aria-valuenow={committed}
        aria-valuemin={0}
        aria-valuemax={available}
        className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={cn("h-full rounded-full", over ? "bg-gate-bad" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("t-datum shrink-0", over ? "text-gate-bad" : "text-muted-ink")}>
        {committed}/{available}p
      </span>
    </div>
  );
}

// ─── Refusals ────────────────────────────────────────────────────────────────
// The app's teeth, said once, in the product's language.

export function RefusalNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-gate-warn">
      <Ban className="mt-px size-3 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** A destructive action that confirms before it fires, and stays visually quiet. */
export function ConfirmButton({
  onConfirm,
  children,
  label,
  className,
  size = "sm",
  ariaLabel,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  label: string;
  className?: string;
  /** Icon rows pass `icon-sm`; text actions keep the default `sm`. */
  size?: "sm" | "md" | "icon" | "icon-sm";
  /** Needed when `children` is an icon — the button must still announce itself.
   *  Keeps the visible confirm label short (row rails are narrow) without every
   *  row's control reading identically to a screen reader. */
  ariaLabel?: string;
}) {
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <Button
        size={size}
        variant="danger"
        className={className}
        aria-label={ariaLabel}
        onClick={() => setArmed(true)}
      >
        {children}
      </Button>
    );
  }
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        size="sm"
        variant="default"
        aria-label={ariaLabel ?? label}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {label}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setArmed(false)}>
        Keep
      </Button>
    </div>
  );
}
