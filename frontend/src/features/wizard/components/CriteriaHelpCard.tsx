import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";

export function CriteriaHelpCard() {
  return (
    <Card className="p-5">
      <div className="text-[13px] font-semibold text-ink">Três tipos de critério</div>
      <ul className="mt-3 grid grid-cols-1 gap-4 text-[12.5px] leading-snug text-muted sm:grid-cols-3">
        <li>
          <div className="flex items-center gap-1.5 text-ink">
            <TrendingUp size={14} strokeWidth={1.5} className="text-accent" />
            <span className="font-medium">Benefício</span>
          </div>
          <div className="mt-0.5">Maior é melhor. RAM, salário, pontualidade.</div>
        </li>
        <li>
          <div className="flex items-center gap-1.5 text-ink">
            <TrendingDown size={14} strokeWidth={1.5} className="text-accent" />
            <span className="font-medium">Custo</span>
          </div>
          <div className="mt-0.5">Menor é melhor. Preço, prazo, peso.</div>
        </li>
        <li>
          <div className="flex items-center gap-1.5 text-ink">
            <Target size={14} strokeWidth={1.5} className="text-accent" />
            <span className="font-medium">Alvo</span>
          </div>
          <div className="mt-0.5">
            Uma faixa específica é melhor. Temperatura 20–22 °C, tela 13–14&quot;.
          </div>
        </li>
      </ul>
      <hr className="my-4 border-line" />
      <p className="text-[12.5px] leading-snug text-muted">
        O <span className="font-medium text-ink">ideal</span> é o intervalo entre C e D. Valores
        dentro dele recebem nota 1. Valores mais distantes recebem nota menor, normalizada pela
        pior distância possível.
      </p>
    </Card>
  );
}
