import { ArrowRight, Check, Info } from "lucide-react";
import { Banner } from "@/shared/components/ui/Banner";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import type { Criterion } from "../schemas";

type MatrixInputProps = {
  alternatives: string[];
  criteria: Criterion[];
  X: number[][];
  onCell: (i: number, j: number, value: number) => void;
  onCompute: () => void;
};

function parseCellValue(raw: string): number {
  if (raw.trim() === "") return Number.NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Number.NaN;
}

function cellInvalid(value: number, A: number, B: number): boolean {
  if (!Number.isFinite(value)) return false;
  return value < A || value > B;
}

export function MatrixInput({ alternatives, criteria, X, onCell, onCompute }: MatrixInputProps) {
  const total = alternatives.length * criteria.length;
  let filled = 0;
  let outOfRange = false;
  X.forEach((row, i) =>
    row.forEach((v, j) => {
      if (Number.isFinite(v)) {
        filled += 1;
        const c = criteria[j];
        if (c && cellInvalid(v, c.A, c.B)) outOfRange = true;
      }
      void i;
    }),
  );
  const ready = filled === total && !outOfRange;

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

      <Card className="overflow-x-auto" data-tour="matrix-table">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="px-3 py-2 font-medium">Alternativa</th>
              {criteria.map((c, j) => (
                <th key={j} className="px-3 py-2 font-medium">
                  <div className="text-ink">{c.name}</div>
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
                <td className="px-3 py-2 font-medium text-ink">{alt}</td>
                {criteria.map((c, j) => {
                  const row = X[i];
                  const cellValue = row ? row[j] : Number.NaN;
                  const display =
                    cellValue !== undefined && Number.isFinite(cellValue) ? String(cellValue) : "";
                  const invalid = cellValue !== undefined && cellInvalid(cellValue, c.A, c.B);
                  return (
                    <td key={j} className="px-3 py-2">
                      <Input
                        type="number"
                        value={display}
                        onChange={(e) => onCell(i, j, parseCellValue(e.target.value))}
                        className="font-mono text-[13px]"
                        placeholder="—"
                        invalid={invalid}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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
