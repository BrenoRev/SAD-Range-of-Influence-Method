import numpy as np

from .algorithm import rim
from .schemas import (
    DecisionInput,
    DecisionResult,
    RankingEntry,
    SensitivityPoint,
    SensitivityRequest,
    SensitivityResult,
)


def _montar_dominios(
    inp: DecisionInput,
) -> tuple[list[tuple[float, float]], list[tuple[float, float]]]:
    # Separa o que o RIM trata como dois conjuntos distintos de parâmetros:
    # t = (A, B) é o domínio do critério e s = (C, D) é o intervalo ideal.
    t = [(c.A, c.B) for c in inp.criteria]
    s = [(c.C, c.D) for c in inp.criteria]
    return t, s


def _ordenar_por_R_desc(R: np.ndarray) -> np.ndarray:
    # Ordena os índices das alternativas por R decrescente. R alto significa
    # estar perto do ideal e longe do anti-ideal, logo a melhor alternativa é a
    # de maior R — daí o sinal negativo no argsort (que ordena crescente).
    return np.argsort(-R)


def _montar_ranking(
    inp: DecisionInput,
    order: np.ndarray,
    R: np.ndarray,
    I_plus: np.ndarray,
    I_minus: np.ndarray,
) -> list[RankingEntry]:
    # Percorre os índices já ordenados e atribui posições 1-based. Os float(...)
    # convertem os escalares numpy para float nativo, exigido pelo schema.
    return [
        RankingEntry(
            alternative=inp.alternatives[idx],
            rank=pos + 1,
            R=float(R[idx]),
            I_plus=float(I_plus[idx]),
            I_minus=float(I_minus[idx]),
        )
        for pos, idx in enumerate(order)
    ]


def solve(inp: DecisionInput) -> DecisionResult:
    X = np.array(inp.X, dtype=float)
    t, s = _montar_dominios(inp)
    w = np.array(inp.weights, dtype=float)
    R, I_plus, I_minus, Y, Y_pond = rim(X, t, s, w)

    order = _ordenar_por_R_desc(R)
    ranking = _montar_ranking(inp, order, R, I_plus, I_minus)
    return DecisionResult(
        ranking=ranking,
        Y=Y.tolist(),
        Y_pond=Y_pond.tolist(),
    )


def _pesos_redistribuidos(base_w: np.ndarray, j: int, wj: float) -> np.ndarray:
    # Fixa o peso do critério j em wj e redistribui o restante (1 - wj) entre os
    # demais, mantendo a soma dos pesos igual a 1 ao longo de toda a varredura.
    n = len(base_w)
    others_sum = base_w.sum() - base_w[j]
    if others_sum > 0:
        # Caso geral: reescala os outros pesos proporcionalmente ao que já
        # tinham, preservando suas proporções relativas.
        scale = (1 - wj) / others_sum
        new_w = base_w * scale
        new_w[j] = wj
    else:
        # others_sum == 0 significa que todo o peso já estava concentrado em j;
        # não há proporção a preservar e reescalar dividiria por zero. Então
        # distribui (1 - wj) igualmente entre os n-1 critérios restantes.
        new_w = np.zeros(n)
        new_w[j] = wj
        if n > 1:
            new_w[np.arange(n) != j] = (1 - wj) / (n - 1)
    return new_w


def sensitivity(req: SensitivityRequest) -> SensitivityResult:
    n = len(req.base.criteria)
    j = req.criterion_index
    assert 0 <= j < n
    base_w = np.array(req.base.weights, dtype=float)

    points = []
    for k in range(req.points):
        wj = k / (req.points - 1)  # varre o peso de j de 0 a 1 em passos iguais
        new_w = _pesos_redistribuidos(base_w, j, wj)
        # model_copy não revalida: é o que permite reaproveitar o input base com
        # os novos pesos sem disparar a validação Pydantic a cada ponto.
        inp = req.base.model_copy(update={"weights": new_w.tolist()})
        res = solve(inp)
        points.append(SensitivityPoint(weight=float(wj), ranking=res.ranking))
    return SensitivityResult(criterion_index=j, points=points)
