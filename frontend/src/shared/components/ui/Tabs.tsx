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
  return (
    <div className={cn("inline-flex rounded-lg border border-line bg-page p-1", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
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
