import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "muted" | "accent" | "ok";

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneClasses: Record<Tone, string> = {
  muted: "bg-page text-muted border-line",
  accent: "bg-accent-soft text-accent border-accent/15",
  ok: "bg-ok-soft text-ok border-ok/20",
};

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-full border px-2 text-[11px] font-medium uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
