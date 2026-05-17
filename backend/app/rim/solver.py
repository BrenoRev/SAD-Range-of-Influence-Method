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


def solve(inp: DecisionInput) -> DecisionResult:
    X = np.array(inp.X, dtype=float)
    t = [(c.A, c.B) for c in inp.criteria]
    s = [(c.C, c.D) for c in inp.criteria]
    w = np.array(inp.weights, dtype=float)
    R, I_plus, I_minus, Y, Y_pond = rim(X, t, s, w)

    order = np.argsort(-R)
    ranking = [
        RankingEntry(
            alternative=inp.alternatives[idx],
            rank=pos + 1,
            R=float(R[idx]),
            I_plus=float(I_plus[idx]),
            I_minus=float(I_minus[idx]),
        )
        for pos, idx in enumerate(order)
    ]
    return DecisionResult(
        ranking=ranking,
        Y=Y.tolist(),
        Y_pond=Y_pond.tolist(),
    )


def sensitivity(req: SensitivityRequest) -> SensitivityResult:
    n = len(req.base.criteria)
    j = req.criterion_index
    assert 0 <= j < n
    base_w = np.array(req.base.weights, dtype=float)
    others_sum = base_w.sum() - base_w[j]

    points = []
    for k in range(req.points):
        wj = k / (req.points - 1)
        if others_sum > 0:
            scale = (1 - wj) / others_sum
            new_w = base_w * scale
            new_w[j] = wj
        else:
            new_w = np.zeros(n)
            new_w[j] = wj
            # distribui o resto igualmente se others_sum == 0
            if n > 1:
                new_w[np.arange(n) != j] = (1 - wj) / (n - 1)
        inp = req.base.model_copy(update={"weights": new_w.tolist()})
        res = solve(inp)
        points.append(SensitivityPoint(weight=float(wj), ranking=res.ranking))
    return SensitivityResult(criterion_index=j, points=points)
