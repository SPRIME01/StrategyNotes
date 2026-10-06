import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Badge — DESIGN.md §6. Variants encode MEANING only. Never decoration.
// Mono 10px tabular: a badge is a datum (a proof level, a status, a count).
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-1.5 py-[3px] font-mono text-[10px] font-medium leading-none break-any t-fast",
  {
    variants: {
      variant: {
        neutral: "border-border-strong bg-surface-2 text-muted-foreground",
        accent: "border-transparent bg-primary text-primary-foreground",
        "gate-ok": "border-transparent bg-gate-ok-bg text-gate-ok",
        "gate-bad": "border-transparent bg-gate-bad-bg text-gate-bad",
        "gate-warn": "border-transparent bg-gate-warn-bg text-gate-warn",
        "gate-info": "border-transparent bg-gate-info-bg text-gate-info",
        outline: "border-border-strong bg-transparent text-muted-foreground",
      },
      dashed: {
        true: "border-dashed",
        false: "border-solid",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, dashed, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, dashed }), className)} {...props} />;
}

/** A status dot in the current text color. Paired with a text label — never alone. */
export function StatusDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-[6px] shrink-0 rounded-full bg-current", className)}
    />
  );
}

export { Badge, badgeVariants };
