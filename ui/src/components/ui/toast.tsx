import * as React from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

// Toast — DESIGN.md §10: feedback is non-blocking. Replaces every alert().
// Announced politely. Dismissible. Never used for a destructive confirmation.

type ToastTone = "info" | "ok" | "bad";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const ToastCtx = React.createContext<{
  notify: (message: string, tone?: ToastTone) => void;
}>({ notify: () => {} });

export function useToast() {
  return React.useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const seq = React.useRef(0);

  const notify = React.useCallback((message: string, tone: ToastTone = "info") => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = t.tone === "ok" ? Check : t.tone === "bad" ? AlertTriangle : Info;
          return (
            <div
              key={t.id}
              className={cn(
                "t-toast-in pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2 shadow-lg",
                t.tone === "ok" && "border-gate-ok/35 bg-surface-2",
                t.tone === "bad" && "border-gate-bad/40 bg-surface-2",
                t.tone === "info" && "border-border-strong bg-surface-2",
              )}
            >
              <Icon
                className={cn(
                  "mt-px size-3.5 shrink-0",
                  t.tone === "ok" && "text-gate-ok",
                  t.tone === "bad" && "text-gate-bad",
                  t.tone === "info" && "text-muted-ink",
                )}
                aria-hidden="true"
              />
              <span className="t-body flex-1 text-foreground break-any">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="t-fast -m-1 shrink-0 rounded p-1 text-faint hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
