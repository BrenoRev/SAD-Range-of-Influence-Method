import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type StartFromScratchCtaProps = {
  onStart: () => void;
};

export function StartFromScratchCta({ onStart }: StartFromScratchCtaProps) {
  return (
    <Card className="mt-8 p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <h2 className="text-[20px] font-semibold leading-snug text-ink">
            Iniciar uma nova decisão
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Percorra quatro etapas — opções, critérios, pesos, valores — e obtenha uma
            classificação defensável com análise de sensibilidade ao final.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={onStart}>
            Nova decisão
            <ArrowRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
