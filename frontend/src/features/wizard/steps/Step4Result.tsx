import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Trophy } from "lucide-react";
import { Banner } from "@/shared/components/ui/Banner";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/Toast";
import { exportCSV, exportPDF } from "@/shared/lib/export";
import type { components } from "@/shared/types/api";
import { useSolve } from "../api/useSolve";
import { useWizard } from "../context";
import { normalizeWeights, step1Valid, step2Valid } from "../defaults";
import { MatrixInput } from "../components/MatrixInput";
import { RankingChart } from "../components/RankingChart";
import { RankingPodium } from "../components/RankingPodium";
import { RankingTable } from "../components/RankingTable";
import { SensitivityPanel } from "../components/SensitivityPanel";
import { StepHeader } from "../components/StepHeader";
import { WizardLayout } from "../components/WizardLayout";

type DecisionInput = components["schemas"]["DecisionInput"];

function isFiniteRow(row: number[]): boolean {
  return row.every((v) => Number.isFinite(v));
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function Step4Result() {
  const navigate = useNavigate();
  const toast = useToast();
  const { alternatives, criteria, weights, X, hasComputed, setHasComputed, setCell, setWeights } =
    useWizard();
  const { data: result, error, solve } = useSolve();

  const [recalcSpin, setRecalcSpin] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const normalizedWeights = useMemo(() => normalizeWeights(weights), [weights]);

  const xIsValid = useMemo(() => {
    if (X.length !== alternatives.length) return false;
    return X.every(
      (row, i) =>
        isFiniteRow(row) &&
        row.length === criteria.length &&
        row.every((v, j) => {
          const c = criteria[j];
          if (!c) return false;
          void i;
          return inRange(v, c.A, c.B);
        }),
    );
  }, [X, alternatives.length, criteria]);

  const buildInput = useCallback((): DecisionInput | null => {
    if (!xIsValid) return null;
    return {
      alternatives,
      criteria,
      weights: normalizedWeights,
      X,
    };
  }, [alternatives, criteria, normalizedWeights, X, xIsValid]);

  const triggerSolve = useCallback(
    (immediate = false) => {
      const input = buildInput();
      if (!input) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const delay = immediate ? 0 : 300;
      setRecalcSpin(true);
      debounceRef.current = setTimeout(async () => {
        await solve(input, controller.signal);
        setRecalcSpin(false);
      }, delay);
    },
    [buildInput, solve],
  );

  useEffect(() => {
    if (hasComputed && xIsValid) {
      triggerSolve(true);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasComputed) return;
    triggerSolve();
  }, [normalizedWeights, hasComputed, triggerSolve]);

  const onCompute = () => {
    const altCheck = step1Valid(alternatives);
    if (!altCheck.ok) {
      toast(altCheck.reason ?? "Alternativas inválidas.", "danger");
      navigate("/wizard/1");
      return;
    }
    const critCheck = step2Valid(criteria);
    if (!critCheck.ok) {
      toast(critCheck.reason ?? "Critérios inválidos.", "danger");
      navigate("/wizard/2");
      return;
    }
    if (!xIsValid) {
      toast("Preencha todos os valores dentro das faixas para calcular.", "danger");
      return;
    }
    setHasComputed(true);
    triggerSolve(true);
    toast("Classificação calculada", "ok");
  };

  const onChangeSensitivityWeight = (i: number, raw: number) => {
    const next = weights.slice();
    next[i] = raw;
    setWeights(next);
  };

  const onExportCSV = () => {
    const input = buildInput();
    if (!input || !result) {
      toast("Sem resultado para exportar.", "danger");
      return;
    }
    exportCSV(input, result);
    toast("Arquivo rim-classificacao.csv exportado", "ok");
  };

  const onExportPDF = () => {
    const input = buildInput();
    if (!input || !result) {
      toast("Sem resultado para exportar.", "danger");
      return;
    }
    exportPDF(input, result);
    toast("Arquivo rim-resultado.pdf exportado", "ok");
  };

  if (!hasComputed) {
    return (
      <WizardLayout step={4} canContinue onNext={() => navigate("/")}>
        <div>
          <StepHeader
            title="Informe os valores"
            subtitle="Preencha o valor de cada alternativa em cada critério. Em seguida, calcule a classificação."
          />
          <MatrixInput
            alternatives={alternatives}
            criteria={criteria}
            X={X}
            onCell={setCell}
            onCompute={onCompute}
          />
        </div>
      </WizardLayout>
    );
  }

  const winner = result?.ranking[0];

  return (
    <WizardLayout step={4} canContinue onNext={() => navigate("/")}>
      <ResultSection
        winnerName={winner?.alternative}
        winnerR={winner?.R}
        error={error}
        onExportCSV={onExportCSV}
        onExportPDF={onExportPDF}
        result={result}
        alternatives={alternatives}
        criteria={criteria}
        weights={weights}
        recalcSpin={recalcSpin}
        baseInput={{
          alternatives,
          criteria,
          weights: normalizedWeights,
          X,
        }}
        onChangeSensitivityWeight={onChangeSensitivityWeight}
      />
    </WizardLayout>
  );
}

type ResultSectionProps = {
  winnerName?: string;
  winnerR?: number;
  error: Error | null;
  result: ReturnType<typeof useSolve>["data"];
  alternatives: string[];
  criteria: ReturnType<typeof useWizard>["criteria"];
  weights: number[];
  recalcSpin: boolean;
  baseInput: DecisionInput;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onChangeSensitivityWeight: (i: number, raw: number) => void;
};

function ResultSection({
  winnerName,
  winnerR,
  error,
  result,
  alternatives,
  criteria,
  weights,
  recalcSpin,
  baseInput,
  onExportCSV,
  onExportPDF,
  onChangeSensitivityWeight,
}: ResultSectionProps) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
            Classificação
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            Com base nos critérios e pesos que você definiu.
          </p>
        </div>
        <div className="flex items-center gap-2" data-tour="result-export">
          <Button variant="outline" size="sm" onClick={onExportCSV} disabled={!result}>
            <Download size={14} strokeWidth={1.5} /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF} disabled={!result}>
            <Download size={14} strokeWidth={1.5} /> Exportar PDF
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <Banner tone="danger" title="Erro ao calcular">
            {error.message}
          </Banner>
        </div>
      ) : null}

      {winnerName !== undefined && winnerR !== undefined ? (
        <div className="mt-6" data-tour="result-winner">
          <Banner
            tone="info"
            icon={<Trophy size={16} strokeWidth={1.5} className="text-ok" />}
            className="border-ok/20"
          >
            <span className="text-ink">
              <span className="font-medium">{winnerName}</span> lidera com R&nbsp;=&nbsp;
              <span className="font-mono">{winnerR.toFixed(4)}</span>.
            </span>{" "}
            Ajuste os pesos no painel <span className="font-medium text-ink">Sensibilidade</span>{" "}
            para testar como o ranking reage.
          </Banner>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-6" data-tour="result-podium">
            <RankingPodium ranking={result.ranking} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <div data-tour="result-table">
                <RankingTable
                  ranking={result.ranking}
                  criteria={criteria}
                  Y={result.Y}
                  alternatives={alternatives}
                />
              </div>
              <div data-tour="result-chart">
                <RankingChart ranking={result.ranking} />
              </div>
            </div>
            <div data-tour="result-sensitivity">
              <SensitivityPanel
                criteria={criteria}
                weights={weights}
                ranking={result.ranking}
                alternatives={alternatives}
                baseInput={baseInput}
                recalcSpin={recalcSpin}
                onChangeWeight={onChangeSensitivityWeight}
              />
            </div>
          </div>
        </>
      ) : !error ? (
        <div className="mt-10 text-[13px] text-muted">Calculando classificação…</div>
      ) : null}
    </div>
  );
}
