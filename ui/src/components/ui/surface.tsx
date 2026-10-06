import * as React from "react";
import { cn } from "../../lib/utils";

// Surface hierarchy — DESIGN.md §5.
// Five containers, five distinct jobs. Picking the wrong one is a bug.
//   Surface — neutral grouped content (the default)
//   Well    — raw text: code, frontmatter, logs
//   Callout — carries a gate or status meaning
//   Rail    — vertical grouping inside a narrow column (board columns)
//   Row     — one item in a list. The workhorse.
// A list is a set of Rows inside one Surface. Never a stack of cards.

type Tone = 1 | 2 | 3;

const surfaceTone: Record<Tone, string> = {
  1: "bg-surface-1 border border-border",
  2: "bg-surface-2 border border-transparent",
  3: "bg-surface-3 border border-transparent",
};

/** Neutral grouped content. */
export function Surface({
  className,
  tone = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn("rounded-lg", surfaceTone[tone], className)} {...props} />;
}

/** Raw text well: code, frontmatter, log output. Monospace, scrolls, never clips. */
export function Well({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "scroll-region rounded-md bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Carries a gate or status meaning. Full border + a tint — never a side stripe.
 * A Callout must always be paired with the reason, and (when blocked) with the
 * action that resolves it.
 */
export function Callout({
  tone = "info",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "ok" | "bad" | "warn";
}) {
  const map = {
    info: "border-gate-info/30 bg-gate-info-bg/60",
    ok: "border-gate-ok/30 bg-gate-ok-bg/60",
    bad: "border-gate-bad/35 bg-gate-bad-bg/60",
    warn: "border-gate-warn/35 bg-gate-warn-bg/60",
  } as const;
  return <div className={cn("rounded-md border", map[tone], className)} {...props} />;
}

/** Vertical grouping inside a narrow column. Board columns and side panels. */
export function Rail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-col gap-1.5", className)} {...props} />;
}

/** A section title inside a view. Renders h2 — one level under the view's h1. */
export function RegionTitle({
  children,
  count,
  action,
  className,
  as = "h2",
}: {
  children: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  const Tag = as;
  return (
    <div className={cn("flex min-h-7 items-center gap-2", className)}>
      <Tag className="t-label text-muted-ink">{children}</Tag>
      {count !== undefined && (
        <span className="t-datum text-faint" aria-label={`${count} total`}>
          {count}
        </span>
      )}
      {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
    </div>
  );
}

/**
 * One item in a list. Hairline-separated rows inside a Surface, never bordered
 * cards. Interactive rows get an explicit selected state and a hover tone.
 */
export function Row({
  className,
  selected,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "t-fast relative min-w-0 border-b border-border/70 px-3 py-2.5 last:border-b-0",
        interactive && "cursor-pointer hover:bg-surface-2",
        selected && "bg-surface-2 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

/** Row split into a fixed leading cluster, a fluid metadata cluster, a trailing action cluster. */
export function RowGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", className)}
      {...props}
    />
  );
}

/**
 * The fluid cluster inside a RowGrid.
 *
 * `min-w-[13rem]` is load-bearing: it is what makes a ledger row wrap its action
 * cluster onto a second line on a narrow viewport instead of crushing the name
 * column into one word per line. Measured, not guessed.
 */
export function RowBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-[13rem] flex-1", className)} {...props} />;
}

/** The trailing action cluster. Never shrinks; wraps internally if it must. */
export function RowActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex shrink-0 flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * An unset value. DESIGN.md §3 / §10: missing is never zero.
 * Renders an em dash with an accessible label so it is never read as a number.
 */
export function Unset({
  label = "not set",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("t-datum text-faint", className)} aria-label={label} title={label}>
      —
    </span>
  );
}

/** A labelled metadata datum: label above, value below. Used in ledger row clusters. */
export function Datum({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="t-label text-faint">{label}</span>
      <span className="t-datum text-muted-foreground break-any">{children}</span>
    </span>
  );
}
