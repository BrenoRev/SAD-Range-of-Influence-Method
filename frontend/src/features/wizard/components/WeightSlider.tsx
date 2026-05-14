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
  return (
    <div className="grid grid-cols-[180px_1fr_96px] items-center gap-4 sm:grid-cols-[220px_1fr_104px]">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold text-ink">
          {criterion.name || "Critério sem nome"}
        </div>
        <div className="truncate text-[12px] text-muted">{labelType(criterion.kind)}</div>
      </div>
      <Slider
        value={safeValue}
        onChange={onChange}
        ariaLabel={`Peso para ${criterion.name}`}
        ariaValueText={`${normalizedPct.toFixed(1)} por cento normalizado`}
      />
      <div className="text-right font-mono tabular-nums leading-tight">
        <div className="text-[14px] font-semibold text-ink">{normalizedPct.toFixed(1)}%</div>
        <div className="text-[11px] text-muted">bruto {safeValue.toFixed(0)}</div>
      </div>
    </div>
  );
}
