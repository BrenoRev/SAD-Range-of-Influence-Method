import { Trophy } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import type { components } from "@/shared/types/api";

type RankingEntry = components["schemas"]["RankingEntry"];

type RankingPodiumProps = {
  ranking: RankingEntry[];
};

function PodiumCard({ entry }: { entry: RankingEntry }) {
  const isFirst = entry.rank === 1;
  const rankLabel = entry.rank === 1 ? "1º" : entry.rank === 2 ? "2º" : "3º";

  return (
    <Card
      className={cn(
        "relative flex min-w-0 flex-col gap-3 p-5 transition-colors",
        isFirst ? "border-l-4 border-l-ok pl-5" : "",
      )}
    >
      <div className="flex items-center justify-between">
        {isFirst ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ok">
            <Trophy size={14} strokeWidth={1.5} /> 1º lugar
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="inline-grid h-6 w-6 place-items-center rounded-full border border-line font-mono text-[12px] text-muted">
              {entry.rank}
            </span>
            <span className="text-[12px] text-muted">{rankLabel} lugar</span>
          </span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">R</span>
      </div>
      <div
        className="truncate text-[15px] font-semibold leading-snug text-ink"
        title={entry.alternative}
      >
        {entry.alternative}
      </div>
      <div
        className={cn(
          "font-mono leading-none tabular-nums",
          isFirst ? "text-[32px] font-semibold text-ink" : "text-[24px] font-medium text-ink",
        )}
      >
        {entry.R.toFixed(4)}
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px] text-muted">
        <div>
          <div className="text-[10px] uppercase tracking-wider">I⁺</div>
          <div className="font-mono tabular-nums text-ink">{entry.I_plus.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider">I⁻</div>
          <div className="font-mono tabular-nums text-ink">{entry.I_minus.toFixed(4)}</div>
        </div>
      </div>
    </Card>
  );
}

export function RankingPodium({ ranking }: RankingPodiumProps) {
  const top3 = ranking.slice(0, 3);
  // 3+ colocados em pódio (2º, 1º, 3º); com 2 ou 1, ordem normal e sem coluna vazia.
  const order = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);
  const cols =
    top3.length >= 3 ? "sm:grid-cols-3" : top3.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <div className={cn("grid grid-cols-1 gap-4", cols)}>
      {order.map((slotIdx) => {
        const entry = top3[slotIdx];
        if (!entry) return null;
        return <PodiumCard key={entry.alternative} entry={entry} />;
      })}
    </div>
  );
}
