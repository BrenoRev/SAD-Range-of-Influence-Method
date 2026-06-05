import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type StepDef = { i: number; name: string; optional?: boolean };

type StepperProps = {
  steps: StepDef[];
  current: number;
  maxReached: number;
  onJump: (step: number) => void;
};

export function Stepper({ steps, current, maxReached, onJump }: StepperProps) {
  return (
    <ol className="flex items-start justify-between gap-3 sm:gap-6">
      {steps.map((s, idx) => {
        const status = s.i < current ? "done" : s.i === current ? "current" : "future";
        const reachable = s.i <= maxReached;
        return (
          <li key={s.i} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn("h-px flex-1 bg-line", idx === 0 ? "invisible" : "")}
                aria-hidden
              />
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(s.i)}
                aria-label={`Etapa ${s.i}: ${s.name}`}
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-medium transition-colors",
                  status === "done" && "bg-accent text-white",
                  status === "current" && "border border-accent bg-white text-accent",
                  status === "future" && "border border-line bg-white text-muted",
                  reachable && status !== "current" ? "cursor-pointer hover:border-accent" : "",
                  !reachable ? "cursor-not-allowed" : "",
                )}
              >
                {status === "done" ? <Check size={12} strokeWidth={1.5} /> : s.i}
              </button>
              <div
                className={cn("h-px flex-1 bg-line", idx === steps.length - 1 ? "invisible" : "")}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "mt-2 truncate text-[12px]",
                status === "current" ? "font-medium text-ink" : "text-muted",
              )}
            >
              {s.name}
            </span>
            {s.optional ? (
              <span className="mt-1 rounded-full border border-line bg-white px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted">
                Opcional
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
