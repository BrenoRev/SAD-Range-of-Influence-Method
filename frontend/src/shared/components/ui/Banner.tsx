import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "info" | "accent" | "warn" | "danger";

type BannerProps = {
  tone?: Tone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const toneClasses: Record<Tone, string> = {
  info: "border-line bg-white",
  accent: "border-accent/20 bg-accent-soft",
  warn: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const iconToneClasses: Record<Tone, string> = {
  info: "text-muted",
  accent: "text-accent",
  warn: "text-amber-600",
  danger: "text-danger",
};

export function Banner({ tone = "info", icon, title, children, action, className }: BannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        toneClasses[tone],
        className,
      )}
    >
      {icon ? <span className={cn("mt-0.5 shrink-0", iconToneClasses[tone])}>{icon}</span> : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="text-[13px] font-medium text-ink">{title}</div> : null}
        {children ? (
          <div
            className={cn(
              "text-[12.5px] leading-snug",
              title ? "mt-0.5 text-muted" : "text-ink",
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
