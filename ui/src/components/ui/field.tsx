import * as React from "react";
import { cn } from "../../lib/utils";

// Field primitives — every control gets a REAL associated label.
// DESIGN.md §15: no label without htmlFor, no input without an id.
// A placeholder is never a label.

const controlClass =
  "w-full rounded-md border border-border-strong bg-surface-2 px-2.5 py-1.5 text-sm text-foreground " +
  "placeholder:text-faint focus-visible:border-primary " +
  "disabled:opacity-45 disabled:cursor-not-allowed t-fast";

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="t-label text-muted-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlClass, className)} {...props} />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(controlClass, "cursor-pointer pr-6", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlClass, "resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

/** Inline filter control: no visible box, used in a filter bar above a list. */
export function FilterPill({
  active,
  children,
  count,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "t-fast inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn("t-datum", active ? "opacity-80" : "text-faint")}>{count}</span>
      )}
    </button>
  );
}
