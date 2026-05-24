import { useState } from "react";
import { HelpCircle, Lightbulb, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Banner } from "./Banner";
import type { ReactNode } from "react";

type HelpButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "ghost-muted" | "outline";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

export function HelpButton({
  variant = "ghost",
  size = "sm",
  label = "Ajuda",
  className,
}: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Abrir ajuda"
      >
        <HelpCircle size={14} strokeWidth={1.5} /> {label}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Como usar o RIM"
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted">
              <span className="font-mono text-ink">CIN0192</span> · Sistemas de Apoio à Decisão ·
              Método: Cables, Lamata e Verdegay (2016).
            </span>
            <Button onClick={() => setOpen(false)}>Entendi</Button>
          </div>
        }
      >
        <HelpContent />
      </Dialog>
    </>
  );
}

function HelpContent() {
  return (
    <div className="space-y-6 text-[13.5px] leading-relaxed text-ink">
      <section>
        <h3 className="text-[14px] font-semibold text-ink">O que é o RIM?</h3>
        <p className="mt-1.5 text-muted">
          O <span className="font-medium text-ink">Reference Ideal Method</span> classifica
          alternativas comparando-as com um{" "}
          <span className="font-medium text-ink">intervalo ideal</span> que você define para cada
          critério. Cada opção recebe um score <span className="font-mono">R</span> entre 0 e 1
          (quanto mais próximo de 1, melhor) e suas distâncias ao ideal (
          <span className="font-mono">I⁺</span>) e ao anti-ideal (
          <span className="font-mono">I⁻</span>).
        </p>
      </section>

      <section>
        <h3 className="text-[14px] font-semibold text-ink">As quatro etapas</h3>
        <ol className="mt-2 space-y-3">
          <StepItem n="1" title="Liste as alternativas">
            As opções entre as quais você está decidindo. Mínimo de 2, com nomes únicos.
          </StepItem>
          <StepItem n="2" title="Defina os critérios">
            Para cada critério escolha o <span className="font-medium">Tipo</span> (Benefício, Custo
            ou Alvo), informe a faixa realista <span className="font-mono">[A, B]</span> e o
            intervalo ideal <span className="font-mono">[C, D]</span>. Sempre respeite{" "}
            <span className="font-mono">A ≤ C ≤ D ≤ B</span>.
          </StepItem>
          <StepItem n="3" title="Atribua pesos">
            Use os controles deslizantes para indicar a importância relativa. Os valores são
            normalizados automaticamente para somar 100%.
          </StepItem>
          <StepItem n="4" title="Veja o resultado">
            Preencha a matriz de valores (uma célula por alternativa × critério) e clique em{" "}
            <span className="font-medium">Calcular classificação</span>. Você verá o pódio dos 3
            primeiros, a tabela completa, o gráfico de R e o painel de Sensibilidade.
          </StepItem>
        </ol>
      </section>

      <section>
        <h3 className="text-[14px] font-semibold text-ink">Os três tipos de critério</h3>
        <ul className="mt-2 space-y-2">
          <Bullet
            icon={<TrendingUp size={14} strokeWidth={1.5} className="text-accent" />}
            term="Benefício"
          >
            Maior é melhor (ex.: salário, RAM, taxa de pontualidade). O ideal fica no topo da faixa,
            então <span className="font-mono">C = D = B</span>.
          </Bullet>
          <Bullet
            icon={<TrendingDown size={14} strokeWidth={1.5} className="text-accent" />}
            term="Custo"
          >
            Menor é melhor (ex.: preço, prazo de entrega, peso). O ideal fica na base da faixa,
            então <span className="font-mono">C = D = A</span>.
          </Bullet>
          <Bullet
            icon={<Target size={14} strokeWidth={1.5} className="text-accent" />}
            term="Alvo"
          >
            Existe uma faixa específica que é melhor (ex.: temperatura entre 20 e 22 °C). Defina{" "}
            <span className="font-mono">C</span> e <span className="font-mono">D</span> dentro de{" "}
            <span className="font-mono">[A, B]</span>.
          </Bullet>
        </ul>
      </section>

      <section>
        <h3 className="text-[14px] font-semibold text-ink">Como o score R é calculado</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted">
          <li>
            Cada valor é normalizado em <span className="font-mono">Y ∈ [0, 1]</span> pela distância
            até o intervalo ideal.
          </li>
          <li>
            Aplicam-se os pesos: <span className="font-mono">Y′ = w · Y</span>.
          </li>
          <li>
            Distância ao ideal positivo <span className="font-mono">I⁺</span> e ao anti-ideal{" "}
            <span className="font-mono">I⁻</span> são calculadas por norma euclidiana.
          </li>
          <li>
            <span className="font-mono">R = I⁻ / (I⁺ + I⁻)</span>. A alternativa com o maior{" "}
            <span className="font-mono">R</span> vence.
          </li>
        </ol>
      </section>

      <section>
        <Banner
          tone="accent"
          icon={<Lightbulb size={16} strokeWidth={1.5} />}
          title="Dica"
        >
          Sem certeza dos números? Comece por um dos{" "}
          <span className="font-medium text-ink">casos de exemplo</span> na tela inicial — você verá
          todas as etapas preenchidas e poderá ajustar para o seu cenário real.
        </Banner>
      </section>
    </div>
  );
}

function StepItem({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-[12px] font-medium text-accent">
        {n}
      </span>
      <div>
        <div className="text-[13.5px] font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-[12.5px] leading-snug text-muted">{children}</div>
      </div>
    </li>
  );
}

function Bullet({ icon, term, children }: { icon: ReactNode; term: string; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="text-[12.5px] leading-snug text-muted">
        <span className="font-medium text-ink">{term}.</span> {children}
      </div>
    </li>
  );
}
