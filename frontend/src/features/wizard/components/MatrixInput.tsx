import { AlertCircle, ArrowRight, Check, Info } from "lucide-react";
import { Banner } from "@/shared/components/ui/Banner";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { NumberField } from "@/shared/components/ui/NumberField";
import type { Criterion } from "../schemas";

type MatrixInputProps = {
  alternatives: string[];
  criteria: Criterion[];
  X: number[][];
  onCell: (i: number, j: number, value: number) => void;
  onCompute: () => void;
};

function cellInvalid(value: number, A: number, B: number): boolean {
  if (!Number.isFinite(value)) return false;
  return value < A || value > B;
}

export function MatrixInput({ alternatives, criteria, X, onCell, onCompute }: MatrixInputProps) {
  const total = alternatives.length * criteria.length;
  let filled = 0;
  let outOfRange = false;
  X.forEach((row) =>
    row.forEach((v, j) => {
      if (Number.isFinite(v)) {
        filled += 1;
        const c = criteria[j];
        if (c && cellInvalid(v, c.A, c.B)) outOfRange = true;
      }
    }),
  );
  const ready = filled === total && !outOfRange;

  const cellNum = (i: number, j: number): number => {
    const row = X[i];
    const v = row ? row[j] : undefined;
    return v !== undefined && Number.isFinite(v) ? v : Number.NaN;
  };

  return (
    <div>
      <Banner
        tone={ready ? "accent" : outOfRange ? "danger" : "info"}
        icon={ready ? <Check size={16} strokeWidth={1.5} /> : <Info size={16} strokeWidth={1.5} />}
        className="mb-5"
      >
        {ready ? (
          "Todos os valores estão preenchidos e dentro das faixas. Você pode calcular a classificação."
        ) : outOfRange ? (
          "Há valores fora da faixa [A, B] do critério. Corrija para calcular."
        ) : (
          <>
            Preenchidos <span className="font-mono text-ink">{filled}</span> de{" "}
            <span className="font-mono text-ink">{total}</span> valores. As faixas{" "}
            <span className="font-mono">[A — B]</span> aparecem em cada coluna como referência.
          </>
        )}
      </Banner>

      <div data-tour="matrix-table">
        <Card className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="sticky left-0 z-10 min-w-[120px] bg-white px-3 py-2 font-medium">
                  Alternativa
                </th>
                {criteria.map((c, j) => (
                  <th key={j} className="min-w-[110px] px-3 py-2 font-medium">
                    <div className="truncate text-ink" title={c.name}>
                      {c.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted">
                      [{c.A} — {c.B}]
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-ink">
                    <div className="max-w-[160px] truncate" title={alt}>
                      {alt}
                    </div>
                  </td>
                  {criteria.map((c, j) => {
                    const v = cellNum(i, j);
                    const invalid = cellInvalid(v, c.A, c.B);
                    return (
                      <td key={j} className="px-3 py-2 align-top">
                        <NumberField
                          value={v}
                          onChange={(val) => onCell(i, j, val)}
                          className="font-mono text-[13px]"
                          placeholder="—"
                          invalid={invalid}
                          aria-label={`Valor de ${alt} em ${c.name}`}
                        />
                        {invalid ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-danger">
                            <AlertCircle size={11} strokeWidth={1.5} /> Fora de [{c.A} — {c.B}]
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3 sm:hidden">
          {alternatives.map((alt, i) => (
            <Card key={i} className="p-4">
              <div className="mb-3 truncate text-[14px] font-semibold text-ink" title={alt}>
                {alt}
              </div>
              <div className="space-y-3">
                {criteria.map((c, j) => {
                  const v = cellNum(i, j);
                  const invalid = cellInvalid(v, c.A, c.B);
                  return (
                    <div key={j} className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] text-ink" title={c.name}>
                          {c.name}
                        </div>
                        <div className="font-mono text-[11px] text-muted">
                          [{c.A} — {c.B}]
                        </div>
                      </div>
                      <div className="w-32 shrink-0">
                        <NumberField
                          value={v}
                          onChange={(val) => onCell(i, j, val)}
                          className="font-mono text-[13px]"
                          placeholder="—"
                          invalid={invalid}
                          aria-label={`Valor de ${alt} em ${c.name}`}
                        />
                        {invalid ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-danger">
                            <AlertCircle size={11} strokeWidth={1.5} /> Fora da faixa
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {!ready && !outOfRange ? (
          <span className="text-[12px] text-muted">
            Faltam <span className="font-mono text-ink">{total - filled}</span> valor(es).
          </span>
        ) : null}
        <Button onClick={onCompute} disabled={!ready} data-tour="matrix-compute">
          Calcular classificação <ArrowRight size={14} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
