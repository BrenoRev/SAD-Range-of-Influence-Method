from .schemas import CaseDetail, CaseSummary, Criterion, DecisionInput

# Casos pré-carregados. Onde um critério tem faixa-alvo (C, D no interior do
# domínio, em vez de colado num extremo) é justamente onde o RIM supera o
# TOPSIS, que só sabe lidar com benefício/custo puros.

# Réplica fiel do exemplo numérico do artigo original do RIM (seleção de 1 entre
# 5 candidatos a motorista, 6 critérios). Os números (X, weights, A/B/C/D) vêm da
# implementação de referência do paper (pacote R MCDM::RIM) — NÃO são inventados.
# Validado: ranking publicado A2 > A5 > A1 > A4 > A3 (ver tests/test_algorithm.py).
# Nomes de C1 e C3–C6 são provisórios (descrevem só o papel matemático do
# critério); apenas C2 ("Years of experience") consta do enunciado. Substituir
# pelos nomes exatos do artigo quando o PDF confirmar.
CASE_ARTICLE = CaseDetail(
    id="article-replication",
    title="Réplica do artigo (Cables et al. 2016)",
    description=(
        "Exemplo numérico do artigo original do RIM: seleção de 1 entre 5 "
        "candidatos a motorista em 6 critérios. Reproduz o ranking publicado e "
        "permite verificar a implementação contra os resultados do paper."
    ),
    source="Cables, Lamata & Verdegay (2016) — DOI 10.1016/j.ins.2015.12.011",
    input=DecisionInput(
        alternatives=["A1", "A2", "A3", "A4", "A5"],
        criteria=[
            Criterion(name="Critério 1 (faixa-alvo 30–35)", kind="target", A=23, B=60, C=30, D=35),
            Criterion(name="Anos de experiência", kind="target", A=0, B=15, C=10, D=15),
            Criterion(name="Critério 3 (minimizar)", kind="cost", A=0, B=10, C=0, D=0),
            Criterion(name="Critério 4 (benefício 1–3)", kind="benefit", A=1, B=3, C=3, D=3),
            Criterion(name="Critério 5 (benefício 1–3)", kind="benefit", A=1, B=3, C=3, D=3),
            Criterion(name="Critério 6 (faixa-alvo 4–5)", kind="target", A=1, B=5, C=4, D=5),
        ],
        weights=[0.2262, 0.2143, 0.1786, 0.1429, 0.119, 0.119],
        X=[
            [30, 0, 2, 3, 3, 2],
            [40, 9, 1, 3, 2, 2],
            [25, 0, 3, 1, 3, 2],
            [27, 0, 5, 3, 3, 1],
            [45, 15, 2, 2, 3, 4],
        ],
    ),
)


CASE_SUPPLIER = CaseDetail(
    id="supplier",
    title="Seleção de fornecedor",
    description=(
        "Avaliação de 5 fornecedores em 5 critérios mistos: custo, prazo, "
        "qualidade, capacidade e distância. O critério 'distância' tem "
        "faixa-alvo (nem muito perto, nem muito longe), o que ilustra o RIM."
    ),
    source="Inventado",
    input=DecisionInput(
        alternatives=[
            "Fornecedor A",
            "Fornecedor B",
            "Fornecedor C",
            "Fornecedor D",
            "Fornecedor E",
        ],
        criteria=[
            Criterion(name="Preço unitário (R$)", kind="cost", A=10.0, B=30.0, C=10.0, D=10.0),
            Criterion(name="Prazo de entrega (dias)", kind="cost", A=2.0, B=20.0, C=2.0, D=2.0),
            Criterion(name="Qualidade (0-10)", kind="benefit", A=5.0, B=10.0, C=10.0, D=10.0),
            Criterion(
                name="Capacidade mensal (mil un.)",
                kind="benefit",
                A=10.0,
                B=200.0,
                C=200.0,
                D=200.0,
            ),
            Criterion(name="Distância (km)", kind="target", A=20.0, B=500.0, C=50.0, D=200.0),
        ],
        weights=[0.30, 0.20, 0.25, 0.10, 0.15],
        X=[
            [12.5, 5, 8.5, 60, 120],
            [18.0, 3, 9.2, 150, 350],
            [11.0, 10, 7.0, 80, 40],
            [22.0, 4, 9.8, 180, 180],
            [15.0, 7, 8.0, 100, 250],
        ],
    ),
)


_CASES: dict[str, CaseDetail] = {
    "article-replication": CASE_ARTICLE,
    "supplier": CASE_SUPPLIER,
}


def _resumo(c: CaseDetail) -> CaseSummary:
    # Projeta um caso completo nos seus metadados. A listagem expõe só o resumo;
    # o DecisionInput inteiro só sai no endpoint de detalhe.
    return CaseSummary(id=c.id, title=c.title, description=c.description, source=c.source)


def list_cases() -> list[CaseSummary]:
    return [_resumo(c) for c in _CASES.values()]


def get_case(case_id: str) -> CaseDetail:
    # KeyError proposital: a rota o traduz em 404 para caso inexistente.
    return _CASES[case_id]
