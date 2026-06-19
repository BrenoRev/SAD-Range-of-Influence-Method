import { Slider } from "@/shared/components/ui/Slider";
import type { Criterion } from "../schemas";

type WeightSliderProps = {
  criterion: Criterion;
  rawWeight: number;
  normalizedPct: number;
  onChange: (raw: number) => void;
};

function labelType(kind: Criterion["kind"]): string {
  if (kind === "benefit") return "Benefício (maior é melhor)";
  if (kind === "cost") return "Custo (menor é melhor)";
  return "Alvo (faixa específica)";
}

export function WeightSlider({ criterion, rawWeight, normalizedPct, onChange }: WeightSliderProps) {
  const safeValue = Math.max(0, Math.min(100, Number.isFinite(rawWeight) ? rawWeight : 0));
  const name = criterion.name || "Critério sem nome";

  // minmax(0,1fr) garante que a coluna do nome encolha de fato (truncate ativa).
  // Mobile: nome | %  na 1ª linha e o slider ocupando as 2 colunas na 2ª linha.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:grid-cols-[220px_minmax(0,1fr)_104px]">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold text-ink" title={name}>
          {name}
        </div>
        <div className="truncate text-[12px] text-muted">{labelType(criterion.kind)}</div>
      </div>

      <div className="text-right font-mono tabular-nums leading-tight sm:order-3">
        <div className="text-[14px] font-semibold text-ink">{normalizedPct.toFixed(1)}%</div>
        <div className="text-[11px] text-muted">bruto {safeValue.toFixed(0)}</div>
      </div>

      <div className="col-span-2 sm:order-2 sm:col-span-1">
        <Slider
          value={safeValue}
          onChange={onChange}
          ariaLabel={`Peso para ${name}`}
          ariaValueText={`${normalizedPct.toFixed(1)} por cento normalizado`}
        />
      </div>
    </div>
  );
}
