import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, GripVertical, Info, Plus, Trash2 } from "lucide-react";
import { Banner } from "@/shared/components/ui/Banner";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useWizard } from "../context";
import { step1Valid } from "../defaults";
import { StepHeader } from "../components/StepHeader";
import { WizardLayout } from "../components/WizardLayout";

function findDuplicateIndexes(alternatives: string[]): Set<number> {
  const trimmed = alternatives.map((a) => a.trim().toLowerCase());
  const dups = new Set<number>();
  trimmed.forEach((v, i) => {
    if (!v) return;
    for (let j = 0; j < i; j++) {
      if (trimmed[j] === v) {
        dups.add(i);
        dups.add(j);
      }
    }
  });
  return dups;
}

export function Step1Alternatives() {
  const navigate = useNavigate();
  const { alternatives, setAlternatives, errorTick } = useWizard();
  const validation = step1Valid(alternatives);
  const dupIndexes = findDuplicateIndexes(alternatives);
  const namedCount = alternatives.filter((a) => a.trim()).length;
  const showErrors = errorTick > 0;

  useEffect(() => {
    if (errorTick === 0) return;
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  }, [errorTick]);

  const update = (i: number, v: string) => {
    const next = alternatives.slice();
    next[i] = v;
    setAlternatives(next);
  };

  const add = () => setAlternatives([...alternatives, ""]);

  const remove = (i: number) => {
    if (alternatives.length <= 1) return;
    setAlternatives(alternatives.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= alternatives.length) return;
    const next = alternatives.slice();
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) return;
    next[i] = b;
    next[j] = a;
    setAlternatives(next);
  };

  return (
    <WizardLayout
      step={1}
      canContinue={validation.ok}
      blockingReason={validation.reason}
      onNext={() => navigate("/wizard/2")}
    >
      <div>
        <StepHeader
          title="Entre quais opções você está escolhendo?"
          subtitle="Liste pelo menos 2 alternativas. Você poderá renomear ou remover qualquer uma depois."
        />

        <Banner
          tone="info"
          icon={<Info size={16} strokeWidth={1.5} />}
          title="Dica"
          className="mb-6"
        >
          Use nomes curtos e específicos (ex.: <span className="text-ink">“Dell XPS 13”</span> em
          vez de <span className="text-ink">“opção 1”</span>). Eles aparecerão na classificação
          final.
        </Banner>

        <ol className="space-y-2">
          {alternatives.map((name, i) => {
            const isDup = dupIndexes.has(i);
            const isEmpty = showErrors && !name.trim();
            const invalid = isDup || isEmpty;
            return (
              <li key={i}>
                <div className="group flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Mover para cima"
                      className="grid h-3 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path
                          d="M1 5l3-3 3 3"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === alternatives.length - 1}
                      aria-label="Mover para baixo"
                      className="grid h-3 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path
                          d="M1 1l3 3 3-3"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <GripVertical
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-muted/60"
                    aria-hidden
                  />
                  <div className="flex-1" data-tour={`alt-${i}`}>
                    <Input
                      value={name}
                      placeholder={`Nome da opção ${i + 1}`}
                      onChange={(e) => update(i, e.target.value)}
                      invalid={invalid}
                    />
                  </div>
                  <Button
                    variant="ghost-muted"
                    size="icon"
                    onClick={() => remove(i)}
                    disabled={alternatives.length <= 1}
                    aria-label="Remover"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </Button>
                </div>
                {invalid ? (
                  <div className="ml-12 mt-1 flex items-center gap-1.5 text-[12px] text-danger">
                    <AlertCircle size={12} strokeWidth={1.5} />{" "}
                    {isDup
                      ? "Os nomes devem ser únicos."
                      : "Informe um nome para esta alternativa."}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-3" data-tour="alts-add">
          <Button variant="ghost" onClick={add}>
            <Plus size={14} strokeWidth={1.5} /> Adicionar alternativa
          </Button>
        </div>

        <div className="mt-10 flex items-center gap-2 text-[12px] text-muted">
          <span className="font-mono">{namedCount}</span>
          <span>
            {namedCount === 1 ? "opção nomeada" : "opções nomeadas"}
            {namedCount < 2 ? (
              <span className="ml-1 text-danger">— mínimo de 2 para continuar</span>
            ) : null}
          </span>
        </div>
      </div>
    </WizardLayout>
  );
}
