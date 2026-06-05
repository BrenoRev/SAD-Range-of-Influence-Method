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
    # Dentro da faixa ideal [C, D]: desempenho perfeito.
    if C <= x <= D:
        return 1.0
    # Abaixo do ideal: penaliza pela distância até a borda mais próxima da
    # faixa, escalada pela folga até o piso do domínio |A - C|.
    if A <= x < C:
        return 1.0 - min(abs(x - C), abs(x - D)) / abs(A - C)
    # Acima do ideal: simétrico ao caso anterior, escalado pela folga até o
    # teto do domínio |B - D|.
    if D < x <= B:
        return 1.0 - min(abs(x - C), abs(x - D)) / abs(B - D)
    raise ValueError(f"x={x} fora de t={t}")


def _conferir_parametros(t, s, w, n):
    # Os três vetores de parâmetros (domínios, intervalos ideais e pesos) têm
    # de ter um elemento por critério; os pesos formam uma distribuição (somam
    # 1, não-negativos); e cada critério respeita A ≤ C ≤ D ≤ B.
    assert len(t) == n and len(s) == n and len(w) == n
    assert abs(w.sum() - 1.0) < 1e-9
    assert (w >= 0).all()
    for j in range(n):
        A, B = t[j]
        C, D = s[j]
        assert A <= C <= D <= B


def _normalizar(X, t, s):
    # Aplica f_rim célula a célula, transformando cada avaliação na sua
    # proximidade [0, 1] ao intervalo ideal do respectivo critério.
    m, n = X.shape
    Y = np.zeros((m, n))
    for i in range(m):
        for j in range(n):
            Y[i, j] = f_rim(X[i, j], t[j], s[j])
    return Y


def _distancias(Y_pond, w):
    # Distâncias euclidianas de cada alternativa aos dois pontos de referência.
    # Após normalizar, o máximo de cada coluna é 1, então o ideal ponderado é o
    # próprio vetor de pesos w; o anti-ideal é a origem (vetor 0).
    I_plus = np.sqrt(((Y_pond - w) ** 2).sum(axis=1))
    I_minus = np.sqrt((Y_pond**2).sum(axis=1))
    return I_plus, I_minus


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

    _conferir_parametros(t, s, w, n)

    Y = _normalizar(X, t, s)
    Y_pond = Y * w
    I_plus, I_minus = _distancias(Y_pond, w)

    # R alto = perto do ideal e longe do anti-ideal; maior é melhor.
    R = I_minus / (I_plus + I_minus)

    return R, I_plus, I_minus, Y, Y_pond
