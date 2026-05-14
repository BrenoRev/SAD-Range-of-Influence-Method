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

function RowExpansion({ criteria, yRow }: { criteria: Criterion[]; yRow: number[] }) {
  return (
    <tr className="border-t border-line bg-page">
      <td colSpan={6} className="px-4 py-3">
        <div className="mb-2 text-[12px] text-muted">
          Valores Y normalizados (0 = pior, 1 = ideal)
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {criteria.map((c, j) => {
            const v = yRow[j] ?? 0;
            return (
              <div key={j} className="flex items-center gap-3">
                <div className="w-28 truncate text-[12px] text-muted">{c.name}</div>
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
      </td>
    </tr>
  );
}

export function RankingTable({ ranking, criteria, Y, alternatives }: RankingTableProps) {
  const [openAlt, setOpenAlt] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] font-semibold text-ink">
        <span>Todas as alternativas</span>
        <span className="text-[12px] font-normal text-muted">
          Clique em uma linha para ver os valores normalizados
        </span>
      </div>
      <table className="w-full text-[13px]">
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
            const altIdx = alternatives.indexOf(entry.alternative);
            const yRow = altIdx >= 0 ? (Y[altIdx] ?? []) : [];
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
                        entry.rank === 1
                          ? "bg-ok-soft text-ok"
                          : "border border-line text-muted",
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-ink">{entry.alternative}</td>
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
                {open ? <RowExpansion criteria={criteria} yRow={yRow} /> : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
