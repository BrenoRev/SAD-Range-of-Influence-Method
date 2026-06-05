import type { ReactNode } from "react";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TourRoute = "/wizard/1" | "/wizard/2" | "/wizard/3" | "/wizard/4";

export type TourStep = {
  id: string;
  route: TourRoute;
  requires?: "computed" | "uncomputed";
  target: string | null;
  title: string;
  body: ReactNode;
  placement: TourPlacement;
};

const mono = (s: string) => <span className="font-mono text-ink">{s}</span>;

const INTRO: TourStep = {
  id: "intro",
  route: "/wizard/1",
  target: null,
  title: "Guia rápido do RIM",
  body: (
    <>
      Vou apontar cada campo, na ordem do fluxo, e focar os inputs para você preencher. Siga no seu
      ritmo — use <span className="text-ink">Próximo</span> e{" "}
      <span className="text-ink">Voltar</span>, ou <span className="text-ink">Pular</span> /{" "}
      {mono("Esc")} para sair quando quiser.
    </>
  ),
  placement: "center",
};

function altStep(i: number): TourStep {
  return {
    id: `s1-alt-${i}`,
    route: "/wizard/1",
    target: `alt-${i}`,
    title: `Opção ${i + 1}`,
    body:
      i === 0 ? (
        <>
          Digite aqui o nome da 1ª opção que você quer comparar. Use nomes curtos e específicos —
          eles aparecem na classificação final.
        </>
      ) : (
        <>
          Agora o nome da {i + 1}ª opção. São necessárias pelo menos 2 para continuar; você pode
          adicionar mais no próximo passo.
        </>
      ),
    placement: "right",
  };
}

const S1_ADD: TourStep = {
  id: "s1-add",
  route: "/wizard/1",
  target: "alts-add",
  title: "Adicionar opção",
  body: <>Quer comparar mais opções? Inclua quantas quiser. Dá para reordenar e remover depois.</>,
  placement: "top",
};

const STEPS_FROM_2: TourStep[] = [
  {
    id: "s2-table",
    route: "/wizard/2",
    target: "crit-table",
    title: "2 · Critérios",
    body: (
      <>
        Cada linha é um critério que pesa na decisão. Para cada um, defina o tipo, a faixa realista
        de valores e o intervalo ideal.
      </>
    ),
    placement: "top",
  },
  {
    id: "s2-type",
    route: "/wizard/2",
    target: "crit-type",
    title: "Tipo do critério",
    body: (
      <>
        <span className="text-ink">Benefício</span>: maior é melhor.{" "}
        <span className="text-ink">Custo</span>: menor é melhor.{" "}
        <span className="text-ink">Alvo</span>: uma faixa intermediária é a ideal.
      </>
    ),
    placement: "bottom",
  },
  {
    id: "s2-ab",
    route: "/wizard/2",
    target: "crit-A",
    title: "Faixa realista (A, B)",
    body: (
      <>
        {mono("A")} = mínimo realista e {mono("B")} = máximo realista. É o domínio do critério,
        definido por você — não inferido dos dados. É o que dá ao RIM a ausência de inversão de
        ranking.
      </>
    ),
    placement: "bottom",
  },
  {
    id: "s2-cd",
    route: "/wizard/2",
    target: "crit-C",
    title: "Intervalo ideal (C, D)",
    body: (
      <>
        Valores em {mono("[C, D]")} recebem nota 1,0. Benefício → {mono("C = D = B")}; Custo →{" "}
        {mono("C = D = A")}; Alvo → a faixa desejada. Sempre {mono("A ≤ C ≤ D ≤ B")}.
      </>
    ),
    placement: "bottom",
  },
  {
    id: "s2-add",
    route: "/wizard/2",
    target: "crit-add",
    title: "Mais critérios",
    body: <>Adicione todos os critérios que importam para a decisão.</>,
    placement: "top",
  },
  {
    id: "s2-help",
    route: "/wizard/2",
    target: "crit-help",
    title: "Em dúvida no tipo?",
    body: <>Este cartão resume os três tipos com exemplos. Use-o como referência ao preencher.</>,
    placement: "top",
  },
  {
    id: "s3-sliders",
    route: "/wizard/3",
    target: "weights-sliders",
    title: "3 · Pesos",
    body: (
      <>
        Arraste cada controle para definir a importância relativa do critério. Os pesos são
        normalizados para somar 100% no cálculo.
      </>
    ),
    placement: "top",
  },
  {
    id: "s3-equal",
    route: "/wizard/3",
    target: "weights-equal",
    title: "Pesos iguais",
    body: <>Sem preferência inicial? Comece com todos iguais e ajuste depois.</>,
    placement: "bottom",
  },
  {
    id: "s3-bar",
    route: "/wizard/3",
    target: "weights-bar",
    title: "Proporção",
    body: <>Mostra como o total de 100% se divide entre os critérios após a normalização.</>,
    placement: "top",
  },
  {
    id: "s4-matrix",
    route: "/wizard/4",
    requires: "uncomputed",
    target: "matrix-table",
    title: "4 · Valores",
    body: (
      <>
        Preencha o valor de cada alternativa em cada critério, dentro da faixa {mono("[A — B]")}{" "}
        indicada em cada coluna.
      </>
    ),
    placement: "top",
  },
  {
    id: "s4-compute",
    route: "/wizard/4",
    requires: "uncomputed",
    target: "matrix-compute",
    title: "Calcular",
    body: (
      <>
        Com tudo preenchido, clique em <span className="text-ink">Calcular classificação</span> para
        ver o resultado.
      </>
    ),
    placement: "top",
  },
  {
    id: "s4-winner",
    route: "/wizard/4",
    requires: "computed",
    target: "result-winner",
    title: "Resultado",
    body: (
      <>
        A alternativa líder e seu score {mono("R")}. {mono("R = I⁻ / (I⁺ + I⁻)")} — quanto mais
        perto de 1, melhor.
      </>
    ),
    placement: "bottom",
  },
  {
    id: "s4-podium",
    route: "/wizard/4",
    requires: "computed",
    target: "result-podium",
    title: "Pódio",
    body: (
      <>
        Os três primeiros colocados. {mono("I⁺")} é a distância ao ideal (menor é melhor) e{" "}
        {mono("I⁻")} a distância ao anti-ideal (maior é melhor).
      </>
    ),
    placement: "bottom",
  },
  {
    id: "s4-table",
    route: "/wizard/4",
    requires: "computed",
    target: "result-table",
    title: "Tabela completa",
    body: (
      <>
        Todas as alternativas ordenadas por {mono("R")}. Clique em uma linha para ver os valores{" "}
        {mono("Y")} normalizados (0 = pior, 1 = ideal) por critério.
      </>
    ),
    placement: "top",
  },
  {
    id: "s4-chart",
    route: "/wizard/4",
    requires: "computed",
    target: "result-chart",
    title: "Score R",
    body: <>Comparação visual dos scores. A barra do 1º lugar fica destacada em verde.</>,
    placement: "top",
  },
  {
    id: "s4-sensitivity",
    route: "/wizard/4",
    requires: "computed",
    target: "result-sensitivity",
    title: "Sensibilidade",
    body: (
      <>
        Ajuste qualquer peso e veja o ranking recalcular ao vivo. A aba{" "}
        <span className="text-ink">E se?</span> varre um peso de 0 a 100% para testar a robustez da
        liderança.
      </>
    ),
    placement: "left",
  },
  {
    id: "s4-export",
    route: "/wizard/4",
    requires: "computed",
    target: "result-export",
    title: "Exportar",
    body: <>Baixe o resultado em CSV ou PDF para registrar ou compartilhar a decisão.</>,
    placement: "bottom",
  },
  {
    id: "outro",
    route: "/wizard/4",
    target: null,
    title: "Pronto",
    body: (
      <>
        Essa é a jornada completa do RIM. Reabra o guia pelo botão{" "}
        <span className="text-ink">Guia</span> no topo sempre que precisar.
      </>
    ),
    placement: "center",
  },
];

export function buildTourSteps(altCount: number): TourStep[] {
  const alts: TourStep[] = [];
  for (let i = 0; i < Math.max(1, altCount); i++) alts.push(altStep(i));
  return [INTRO, ...alts, S1_ADD, ...STEPS_FROM_2];
}
