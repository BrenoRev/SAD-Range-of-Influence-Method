import { type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/utils";

export type TabItem = {
  value: string;
  label: string;
};

type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  items: TabItem[];
  className?: string;
};

export function Tabs({ value, onChange, items, className }: TabsProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const target = items[(idx + dir + items.length) % items.length];
    if (target) onChange(target.value);
  };

  return (
    <div role="tablist" className={cn("inline-flex rounded-lg border border-line bg-page p-1", className)}>
      {items.map((it, idx) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(it.value)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={cn(
              "h-7 rounded-md px-3 text-[13px] transition-colors",
              active
                ? "border border-line bg-white text-ink shadow-card"
                : "text-muted hover:text-ink",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
