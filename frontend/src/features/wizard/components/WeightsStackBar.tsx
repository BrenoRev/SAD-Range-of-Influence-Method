import type { Criterion } from "../schemas";

type WeightsStackBarProps = {
  criteria: Criterion[];
  normalizedPcts: number[];
};

const palette = [
  { bg: "bg-accent", fg: "text-white" },
  { bg: "bg-accent/80", fg: "text-white" },
  { bg: "bg-accent/60", fg: "text-ink" },
  { bg: "bg-accent/40", fg: "text-ink" },
  { bg: "bg-accent/25", fg: "text-ink" },
  { bg: "bg-accent/15", fg: "text-ink" },
];

function shade(i: number) {
  return palette[i % palette.length] ?? palette[0]!;
}

export function WeightsStackBar({ criteria, normalizedPcts }: WeightsStackBarProps) {
  return (
    <div className="mt-8">
      <div className="mb-2 text-[12px] text-muted">Proporção</div>
      <div className="flex h-7 w-full overflow-hidden rounded-md border border-line">
        {criteria.map((c, i) => {
          const p = normalizedPcts[i] ?? 0;
          if (p <= 0) return null;
          const s = shade(i);
          return (
            <div
              key={i}
              className={`flex h-full items-center justify-center text-[11px] font-medium ${s.bg} ${s.fg}`}
              style={{ width: `${p}%` }}
              title={`${c.name} — ${p.toFixed(1)}%`}
            >
              {p >= 8 ? `${p.toFixed(0)}%` : ""}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted">
        {criteria.map((c, i) => {
          const s = shade(i);
          return (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-sm ${s.bg}`} aria-hidden />
              {c.name || `Critério ${i + 1}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}
