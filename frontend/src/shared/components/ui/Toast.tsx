import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Check, Info, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Tone = "info" | "ok" | "danger";
type ToastItem = { id: string; msg: string; tone: Tone };
type ToastPush = (msg: string, tone?: Tone) => void;

const ToastCtx = createContext<ToastPush | null>(null);

const iconToneClasses: Record<Tone, string> = {
  ok: "text-ok",
  danger: "text-danger",
  info: "text-accent",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback<ToastPush>((msg, tone = "info") => {
    const id = Math.random().toString(36).slice(2);
    setItems((arr) => [...arr, { id, msg, tone }]);
    setTimeout(() => {
      setItems((arr) => arr.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  const dismiss = (id: string) => setItems((arr) => arr.filter((t) => t.id !== id));

  const value = useMemo(() => push, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-white p-3 shadow-card"
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full",
                iconToneClasses[t.tone],
              )}
            >
              {t.tone === "ok" ? (
                <Check size={14} strokeWidth={1.5} />
              ) : (
                <Info size={14} strokeWidth={1.5} />
              )}
            </span>
            <div className="flex-1 text-[13px] text-ink">{t.msg}</div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fechar"
              className="text-muted hover:text-ink"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastPush {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
