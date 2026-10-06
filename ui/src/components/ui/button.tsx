import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Button voice — DESIGN.md §6, §13.
// default  → the one solid accent action per view
// outline → the other real actions, hairline
// ghost   → tertiary
// danger  → destructive, deliberately QUIET (never the solid prominent thing)
// States: default · hover · focus-visible (global ring) · active · disabled.
// Loading and error are expressed by the caller replacing the label, not by this layer.
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium t-fast disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-3",
        secondary: "bg-surface-3 text-secondary-foreground hover:bg-surface-4",
        ghost: "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Destructive is text-weight-only. If it shouts, it gets clicked by accident.
        danger: "text-destructive hover:bg-destructive-bg",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-9 px-4 text-sm",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
