import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { HelpButton } from "@/shared/components/ui/HelpButton";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { useToast } from "@/shared/components/ui/Toast";
import { Wordmark } from "@/shared/components/ui/Wordmark";
import { cn } from "@/shared/lib/utils";
import { useEffect, type ReactNode } from "react";
import { useWizard } from "../context";
import { TourButton } from "../tour/TourButton";
import { SavedIndicator } from "./SavedIndicator";
import { Stepper } from "./Stepper";

const STEPS = [
  { i: 1, name: "Alternativas" },
  { i: 2, name: "Critérios" },
  { i: 3, name: "Pesos", optional: true },
  { i: 4, name: "Resultado" },
];

type WizardLayoutProps = {
  step: number;
  canContinue: boolean;
  blockingReason?: string;
  onNext: () => void;
  children: ReactNode;
};

export function WizardLayout({
  step,
  canContinue,
  blockingReason,
  onNext,
  children,
}: WizardLayoutProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { maxReached, saved, setMaxReached, revealErrors, clearErrors } = useWizard();

  useEffect(() => {
    clearErrors();
  }, [step, clearErrors]);

  const onJump = (i: number) => {
    if (i <= maxReached) navigate(`/wizard/${i}`);
  };

  const onBack = () => {
    if (step === 1) {
      navigate("/");
      return;
    }
    navigate(`/wizard/${step - 1}`);
  };

  const onContinue = () => {
    if (canContinue) {
      setMaxReached(step + 1);
      onNext();
      return;
    }
    if (blockingReason) toast(blockingReason, "danger");
    revealErrors();
  };

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-0 z-30 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80"
            aria-label="Ir para o início"
          >
            <Wordmark />
          </button>
          <div className="flex items-center gap-2">
            <SavedIndicator saved={saved} />
            <span className="mx-1 h-4 w-px bg-line" aria-hidden />
            <TourButton />
            <HelpButton />
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 pb-5 pt-1">
          <Stepper steps={STEPS} current={step} maxReached={maxReached} onJump={onJump} />
        </div>
      </header>

      <main className="flex-1">
        <div
          className={cn(
            "mx-auto grid w-full gap-8 px-6 py-10",
            step === 1 ? "max-w-3xl" : "max-w-6xl",
          )}
        >
          {children}
        </div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={14} strokeWidth={1.5} /> {step === 1 ? "Voltar ao início" : "Voltar"}
          </Button>
          <div className="flex min-w-0 items-center gap-3">
            {step < 4 && !canContinue && blockingReason ? (
              <span className="hidden max-w-xs items-center gap-1.5 truncate text-[12px] text-danger sm:inline-flex">
                <AlertCircle size={13} strokeWidth={1.5} /> {blockingReason}
              </span>
            ) : null}
            {step < 4 ? (
              <Tooltip
                content={
                  canContinue
                    ? "Avançar para a próxima etapa"
                    : blockingReason || "Conclua esta etapa para continuar"
                }
              >
                <span>
                  <Button onClick={onContinue} aria-disabled={!canContinue}>
                    Continuar <ArrowRight size={14} strokeWidth={1.5} />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/")}>
                Recomeçar
              </Button>
            )}
          </div>
        </div>
        {step < 4 && !canContinue && blockingReason ? (
          <div className="mx-auto -mt-1 flex max-w-3xl items-center gap-1.5 px-6 pb-3 text-[12px] text-danger sm:hidden">
            <AlertCircle size={13} strokeWidth={1.5} /> {blockingReason}
          </div>
        ) : null}
      </footer>
    </div>
  );
}
