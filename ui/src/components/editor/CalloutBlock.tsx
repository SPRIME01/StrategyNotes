// TASK-E12 — Callout block. Styled containers for tip/warn/info callouts.
// ponytail ceiling: rendered as a presentational component (no CodeMirror yet).
// When CodeMirror lands (TASK-N19/N20), this becomes a line decoration/widget
// that transforms `> [!tip] ...` syntax in the live editor.

import type { ReactNode } from "react";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export type CalloutVariant = "tip" | "warn" | "info";

const VARIANTS: Record<
  CalloutVariant,
  { icon: typeof Lightbulb; label: string; box: string; iconCls: string }
> = {
  tip: { icon: Lightbulb, label: "Tip", box: "border-gate-info/40 bg-gate-info-bg", iconCls: "text-gate-info" },
  warn: { icon: AlertTriangle, label: "Warning", box: "border-gate-warn/40 bg-gate-warn-bg", iconCls: "text-gate-warn" },
  info: { icon: Info, label: "Info", box: "border-border-strong bg-surface-2", iconCls: "text-muted-ink" },
};

export function CalloutBlock({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <div className={cn("my-2 flex gap-3 rounded-lg border p-3", v.box)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", v.iconCls)} />
      <div className="min-w-0 flex-1 text-sm">
        <div className="mb-0.5 font-medium text-foreground">{title ?? v.label}</div>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

// Parse `> [!tip] Title` callout syntax from a markdown line into a variant.
// Returns null if the line is not a callout fence.
export function parseCallout(line: string): { variant: CalloutVariant; title?: string } | null {
  const m = line.match(/^>\s*\[!(tip|warn|info)\]\s*(.*)$/i);
  if (!m) return null;
  const variant = m[1].toLowerCase() as CalloutVariant;
  const title = m[2].trim() || undefined;
  return { variant, title };
}
