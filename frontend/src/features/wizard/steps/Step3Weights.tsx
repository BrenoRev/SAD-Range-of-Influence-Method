import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { useWizard } from "../context";
import { step3Valid } from "../defaults";
import { StepHeader } from "../components/StepHeader";
import { WeightSlider } from "../components/WeightSlider";
import { WeightsStackBar } from "../components/WeightsStackBar";
import { WizardLayout } from "../components/WizardLayout";

export function Step3Weights() {
  const navigate = useNavigate();
  const { criteria, weights, setWeights } = useWizard();
  const validation = step3Valid(weights);

  const sum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  const normalizedPct = (i: number): number => {
    if (sum <= 0) return 0;
    return (Math.max(0, weights[i] ?? 0) / sum) * 100;
  };

  const setOne = (i: number, v: number) => {
    const next = weights.slice();
    next[i] = v;
    setWeights(next);
  };

  const resetEqual = () => setWeights(criteria.map(() => 50));

  const normalizedPcts = criteria.map((_, i) => normalizedPct(i));

  return (
    <WizardLayout
      step={3}
      canContinue={validation.ok}
      blockingReason={validation.reason}
      onNext={() => navigate("/wizard/4")}
    >
      <div>
        <StepHeader
          title="Quanto cada critério importa?"
          subtitle="Arraste os controles para definir a importância relativa. Os valores serão normalizados para somar 100%."
          right={
            <Button variant="ghost" onClick={resetEqual} data-tour="weights-equal">
              <RotateCcw size={14} strokeWidth={1.5} /> Pesos iguais
            </Button>
          }
        />

        <Card className="p-5" data-tour="weights-sliders">
          <div className="space-y-5">
            {criteria.map((c, i) => (
              <WeightSlider
                key={i}
                criterion={c}
                rawWeight={weights[i] ?? 0}
                normalizedPct={normalizedPct(i)}
                onChange={(v) => setOne(i, v)}
              />
            ))}
          </div>
        </Card>

        <div className="mt-4 text-[12px] text-muted">
          Soma dos pesos brutos:&nbsp;
          <span className="font-mono text-ink">{sum.toFixed(0)}</span> · Normalizada para 100%.
        </div>

        <div data-tour="weights-bar">
          <WeightsStackBar criteria={criteria} normalizedPcts={normalizedPcts} />
        </div>
      </div>
    </WizardLayout>
  );
}
