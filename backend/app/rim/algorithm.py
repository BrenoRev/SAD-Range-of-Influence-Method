import numpy as np


def f_rim(x, t, s):
    """
    Função de normalização do RIM.
    t = (A, B): domínio
    s = (C, D): intervalo ideal
    Retorna f(x) ∈ [0, 1].
    """
    A, B = t
    C, D = s
    if C <= x <= D:
        return 1.0
    if A <= x < C:
        return 1.0 - min(abs(x - C), abs(x - D)) / abs(A - C)
    if D < x <= B:
        return 1.0 - min(abs(x - C), abs(x - D)) / abs(B - D)
    raise ValueError(f"x={x} fora de t={t}")


def rim(X, t, s, w):
    """
    RIM completo.
    X: matriz (m, n) - alternativas x critérios
    t: lista de n tuplas (A, B)
    s: lista de n tuplas (C, D)
    w: array de n pesos (somando 1)
    Retorna: (R, I_plus, I_minus, Y, Y_pond)
    """
    X = np.asarray(X, dtype=float)
    w = np.asarray(w, dtype=float)
    m, n = X.shape

    # validações
    assert len(t) == n and len(s) == n and len(w) == n
    assert abs(w.sum() - 1.0) < 1e-9
    assert (w >= 0).all()
    for j in range(n):
        A, B = t[j]; C, D = s[j]
        assert A <= C <= D <= B

    # Y
    Y = np.zeros((m, n))
    for i in range(m):
        for j in range(n):
            Y[i, j] = f_rim(X[i, j], t[j], s[j])

    # Y'
    Y_pond = Y * w

    # distâncias
    I_plus  = np.sqrt(((Y_pond - w) ** 2).sum(axis=1))
    I_minus = np.sqrt((Y_pond ** 2).sum(axis=1))

    # R
    R = I_minus / (I_plus + I_minus)

    return R, I_plus, I_minus, Y, Y_pond
