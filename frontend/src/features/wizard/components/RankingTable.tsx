import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import type { components } from "@/shared/types/api";
import type { Criterion } from "../schemas";

type RankingEntry = components["schemas"]["RankingEntry"];

type RankingTableProps = {
  ranking: RankingEntry[];
  criteria: Criterion[];
  Y: number[][];
  alternatives: string[];
};

function YValues({ criteria, yRow }: { criteria: Criterion[]; yRow: number[] }) {
  return (
    <>
      <div className="mb-2 text-[12px] text-muted">Valores Y normalizados (0 = pior, 1 = ideal)</div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((c, j) => {
          const v = yRow[j] ?? 0;
          return (
            <div key={j} className="flex items-center gap-3">
              <div className="w-28 min-w-0 truncate text-[12px] text-muted" title={c.name}>
                {c.name}
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%` }}
                />
              </div>
              <div className="w-12 text-right font-mono text-[12px] tabular-nums text-ink">
                {v.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function RankingTable({ ranking, criteria, Y, alternatives }: RankingTableProps) {
  const [openAlt, setOpenAlt] = useState<string | null>(null);
  const yOf = (alt: string): number[] => {
    const idx = alternatives.indexOf(alt);
    return idx >= 0 ? (Y[idx] ?? []) : [];
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-3 border-b border-line px-4 py-3 text-[13px] font-semibold text-ink">
        <span>Todas as alternativas</span>
        <span className="text-[12px] font-normal text-muted">
          Clique em uma linha para ver os valores normalizados
        </span>
      </div>

      <table className="hidden w-full text-[13px] sm:table">
        <thead>
          <tr className="text-left text-muted">
            <th className="w-12 px-4 py-2 font-medium">#</th>
            <th className="px-4 py-2 font-medium">Alternativa</th>
            <th className="px-4 py-2 text-right font-medium">R</th>
            <th className="px-4 py-2 text-right font-medium">I⁺</th>
            <th className="px-4 py-2 text-right font-medium">I⁻</th>
            <th className="w-8" aria-label="Detalhes" />
          </tr>
        </thead>
        <tbody>
          {ranking.map((entry) => {
            const open = openAlt === entry.alternative;
            return (
              <Fragment key={entry.alternative}>
                <tr
                  onClick={() => setOpenAlt(open ? null : entry.alternative)}
                  className={cn(
                    "cursor-pointer border-t border-line transition-colors hover:bg-page",
                    open ? "bg-page" : "",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-grid h-6 w-6 place-items-center rounded-full font-mono text-[12px] font-medium",
                        entry.rank === 1 ? "bg-ok-soft text-ok" : "border border-line text-muted",
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-ink">
                    <div className="max-w-[280px] truncate" title={entry.alternative}>
                      {entry.alternative}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink">
                    {entry.R.toFixed(4)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted">
                    {entry.I_plus.toFixed(4)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted">
                    {entry.I_minus.toFixed(4)}
                  </td>
                  <td className="px-2 py-2.5 text-muted">
                    <ChevronRight
                      size={14}
                      strokeWidth={1.5}
                      className={cn("transition-transform", open ? "rotate-90" : "")}
                    />
                  </td>
                </tr>
                {open ? (
                  <tr className="border-t border-line bg-page">
                    <td colSpan={6} className="px-4 py-3">
                      <YValues criteria={criteria} yRow={yOf(entry.alternative)} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="divide-y divide-line sm:hidden">
        {ranking.map((entry) => {
          const open = openAlt === entry.alternative;
          return (
            <div key={entry.alternative}>
              <button
                type="button"
                onClick={() => setOpenAlt(open ? null : entry.alternative)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    "inline-grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[12px] font-medium",
                    entry.rank === 1 ? "bg-ok-soft text-ok" : "border border-line text-muted",
                  )}
                >
                  {entry.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink" title={entry.alternative}>
                    {entry.alternative}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted">
                    R {entry.R.toFixed(4)} · I⁺ {entry.I_plus.toFixed(4)} · I⁻{" "}
                    {entry.I_minus.toFixed(4)}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className={cn("shrink-0 text-muted transition-transform", open ? "rotate-90" : "")}
                />
              </button>
              {open ? (
                <div className="bg-page px-4 py-3">
                  <YValues criteria={criteria} yRow={yOf(entry.alternative)} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
