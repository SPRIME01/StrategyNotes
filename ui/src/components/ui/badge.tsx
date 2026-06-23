import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium font-mono whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-muted-foreground",
        "gate-ok": "border-transparent text-gate-ok bg-gate-ok-bg",
        "gate-bad": "border-transparent text-gate-bad bg-gate-bad-bg",
        "gate-warn": "border-transparent text-gate-warn bg-gate-warn-bg",
        "gate-info": "border-transparent text-gate-info bg-gate-info-bg",
        accent: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
