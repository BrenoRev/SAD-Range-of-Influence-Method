import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { useWizard } from "../context";
import { blankCriterion, step2Valid } from "../defaults";
import { ColHead, CriterionRow } from "../components/CriterionRow";
import { CriteriaHelpCard } from "../components/CriteriaHelpCard";
import { StepHeader } from "../components/StepHeader";
import { WizardLayout } from "../components/WizardLayout";
import type { Criterion } from "../schemas";

export function Step2Criteria() {
  const navigate = useNavigate();
  const { criteria, setCriteria, errorTick } = useWizard();
  const validation = step2Valid(criteria);
  const showErrors = errorTick > 0;

  useEffect(() => {
    if (errorTick === 0) return;
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  }, [errorTick]);

  const update = (i: number, patch: Partial<Criterion>) => {
    const next = criteria.slice();
    const current = next[i];
    if (!current) return;
    next[i] = { ...current, ...patch };
    setCriteria(next);
  };

  const add = () => setCriteria([...criteria, blankCriterion()]);
  const remove = (i: number) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, idx) => idx !== i));
  };

  return (
    <WizardLayout
      step={2}
      canContinue={validation.ok}
      blockingReason={validation.reason}
      onNext={() => navigate("/wizard/3")}
    >
      <div>
        <StepHeader
          title="O que importa nesta decisão?"
          subtitle="Adicione os critérios que devem influenciar a classificação. Para cada um, defina a faixa realista de valores e como seria o ideal."
        />

        <div className="space-y-6">
          <div>
            <div
              className="overflow-x-auto rounded-xl border border-line bg-white"
              data-tour="crit-table"
            >
              <table className="w-full table-fixed text-[14px]">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="w-[24%] px-4 py-3 font-medium">Critério</th>
                    <th className="w-[16%] px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        Tipo
                        <Tooltip content="Benefício = maior é melhor. Custo = menor é melhor. Alvo = um valor específico (entre C e D) é o melhor.">
                          <Info size={12} strokeWidth={1.5} className="text-muted" />
                        </Tooltip>
                      </span>
                    </th>
                    <ColHead
                      title="Mín (A)"
                      hint="Menor valor que você pode encontrar de forma realista."
                    />
                    <ColHead
                      title="Máx (B)"
                      hint="Maior valor que você pode encontrar de forma realista."
                    />
                    <ColHead
                      title="Ideal de (C)"
                      hint='O melhor valor possível está entre C e D. Para "preço" (um custo), defina C = D = o mínimo.'
                    />
                    <ColHead
                      title="Ideal até (D)"
                      hint="Extremo superior do intervalo ideal. Para Benefício, C = D = Máx."
                    />
                    <th className="w-12" aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <CriterionRow
                      key={i}
                      index={i}
                      criterion={c}
                      canRemove={criteria.length > 1}
                      nameInvalid={showErrors && !c.name.trim()}
                      onUpdate={(patch) => update(i, patch)}
                      onRemove={() => remove(i)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3" data-tour="crit-add">
              <Button variant="ghost" onClick={add}>
                <Plus size={14} strokeWidth={1.5} /> Adicionar critério
              </Button>
            </div>
          </div>

          <div data-tour="crit-help">
            <CriteriaHelpCard />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
