import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

// AsyncState — DESIGN.md §6, §15. The ONLY legal way to render an async region.
//   loading → a static, content-shaped skeleton. No shimmer (decoration).
//   empty   → names what will appear here AND how to make the first one.
//   error   → operator-visible, categorized. A dead backend must never look empty.
// All three are announced politely and hold their height so nothing jumps on swap.

export function LoadingBlock({
  label,
  rows = 3,
  className,
}: {
  label: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex flex-col gap-2", className)}
    >
      <span className="sr-only">{`Loading ${label}`}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="h-9 rounded-md bg-surface-2"
          style={{ opacity: 1 - i * 0.18 }}
        />
      ))}
    </div>
  );
}

export function EmptyBlock({
  noun,
  hint,
  action,
  className,
}: {
  noun: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-dashed px-4 py-8",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Inbox className="size-4 text-faint" aria-hidden="true" />
        <span className="t-row text-muted-foreground">No {noun} yet</span>
      </div>
      {hint && <p className="t-body max-w-[60ch] text-muted-ink">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorBlock({
  noun,
  message,
  onRetry,
  className,
}: {
  noun: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-gate-bad/35 bg-gate-bad-bg/50 px-4 py-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-gate-bad" aria-hidden="true" />
        <span className="t-row text-foreground">Could not load {noun}</span>
      </div>
      <p className="t-body max-w-[60ch] text-muted-foreground">
        {message ? `${message}. ` : "The local server did not respond. "}
        This is not the same as there being none. Start the backend, then retry.
      </p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * The one place async branching lives. Keeps every view from re-deriving the
 * loading / empty / error trio, which is why they used to disagree.
 */
export function AsyncState({
  label,
  loading,
  error,
  empty,
  noun,
  emptyHint,
  emptyAction,
  onRetry,
  children,
}: {
  label: string;
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  noun?: string;
  emptyHint?: React.ReactNode;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  children?: React.ReactNode;
}) {
  if (loading) return <LoadingBlock label={label} />;
  if (error) {
    return (
      <ErrorBlock
        noun={noun ?? "this view"}
        message={error instanceof Error ? error.message : String(error)}
        onRetry={onRetry}
      />
    );
  }
  if (empty && noun) {
    return <EmptyBlock noun={noun} hint={emptyHint} action={emptyAction} />;
  }
  return <>{children}</>;
}
