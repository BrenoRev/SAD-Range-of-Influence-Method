from .schemas import CaseDetail, CaseSummary, Criterion, DecisionInput

# Casos pré-carregados. Onde um critério tem faixa-alvo (C, D no interior do
# domínio, em vez de colado num extremo) é justamente onde o RIM supera o
# TOPSIS, que só sabe lidar com benefício/custo puros.

CASE_NOTEBOOK = CaseDetail(
    id="notebook",
    title="Seleção de notebook",
    description=(
        "Escolha entre 4 notebooks considerando preço, desempenho, peso e "
        "autonomia. Os critérios 'peso' e 'autonomia' têm faixa-alvo "
        "(intermediário ideal), o que demonstra a principal vantagem do RIM "
        "sobre o TOPSIS."
    ),
    source="Exemplo didático",
    input=DecisionInput(
        alternatives=["A1", "A2", "A3", "A4"],
        criteria=[
            Criterion(name="Preço (R$ mil)", kind="cost", A=4.0, B=7.0, C=4.0, D=4.0),
            Criterion(name="Desempenho (pts)", kind="benefit", A=70, B=100, C=100, D=100),
            Criterion(name="Peso (kg)", kind="target", A=1.0, B=2.5, C=1.4, D=1.8),
            Criterion(name="Autonomia (h)", kind="benefit", A=5, B=12, C=12, D=12),
        ],
        weights=[0.20, 0.35, 0.20, 0.25],
        X=[
            [4.5, 85, 1.3, 8],
            [6.0, 92, 1.6, 10],
            [5.0, 78, 2.1, 6],
            [5.5, 88, 1.7, 9],
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
    "notebook": CASE_NOTEBOOK,
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
