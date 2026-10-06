import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Minimal hash router — DESIGN.md §7: "Nav items are real routes with
 * aria-current. A view is linkable and Back works."
 * ponytail: hash + popstate instead of a router dependency. Eleven views do not
 * earn react-router.
 */
export function useHashRoute<T extends string>(fallback: T): [T, (v: T) => void] {
  const read = React.useCallback((): T => {
    const h = window.location.hash.replace(/^#\/?/, "");
    return (h || fallback) as T;
  }, [fallback]);

  const [route, setRoute] = React.useState<T>(read);

  React.useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [read]);

  const navigate = React.useCallback((v: T) => {
    if (window.location.hash.replace(/^#\/?/, "") === v) return;
    window.location.hash = v;
  }, []);

  return [route, navigate];
}

/** The one page head in the product. Exactly one h1 per view. DESIGN.md §15. */
export function PageHead({
  kicker,
  title,
  sub,
  action,
  className,
}: {
  kicker?: string;
  title: string;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end gap-x-4 gap-y-3", className)}>
      <div className="min-w-0 flex-1">
        {kicker && <div className="t-label mb-1.5 text-muted-ink">{kicker}</div>}
        <h1 className="t-display break-any">{title}</h1>
        {sub && <p className="t-body mt-1.5 max-w-[70ch] text-muted-foreground">{sub}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
