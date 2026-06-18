import numpy as np


def f_rim(x: float, t: tuple[float, float], s: tuple[float, float]) -> float:
    """
    Função de normalização do RIM.

    Parâmetros
    ----------
    x : float
        Valor avaliado para a alternativa no critério.
    t : (A, B)
        Domínio do critério. x deve pertencer a [A, B].
    s : (C, D)
        Intervalo ideal (faixa-alvo) do critério, com A ≤ C ≤ D ≤ B.

    Retorna
    -------
    float
        Grau de pertinência f(x) ∈ [0, 1].
        - 1.0 se x estiver dentro da faixa ideal [C, D].
        - Decresce linearmente à medida que x se afasta da faixa ideal,
          chegando a 0 nos extremos do domínio (A ou B).
    """
    A, B = t
    C, D = s

    # Dentro da faixa ideal [C, D]: desempenho perfeito.
    if C <= x <= D:
        return 1.0

    # Abaixo do ideal (A ≤ x < C): como x < C ≤ D, a borda mais próxima da
    # faixa ideal é sempre C, logo |x - C| < |x - D|. O min() original era
    # correto, mas redundante; substituímos pela expressão direta.
    elif A <= x < C:
        return 1.0 - (C - x) / (C - A)

    # Acima do ideal (D < x ≤ B): simetria com o caso anterior — a borda mais
    # próxima é D, e a folga até o teto do domínio é (B - D).
    elif D < x <= B:
        return 1.0 - (x - D) / (B - D)

    raise ValueError(f"x={x} fora do domínio t={t}")


def _conferir_parametros(
    t: list[tuple[float, float]],
    s: list[tuple[float, float]],
    w: np.ndarray,
    n: int,
) -> None:
    """
    Valida os parâmetros de entrada do RIM antes do cálculo.

    Levanta ValueError (em vez de AssertionError) para que a mensagem de erro
    seja informativa mesmo com a flag -O do interpretador ativada, que
    silencia todos os `assert` em produção.
    """
    if not (len(t) == len(s) == len(w) == n):
        raise ValueError(
            f"t, s e w devem ter {n} elementos (um por critério); "
            f"recebido: len(t)={len(t)}, len(s)={len(s)}, len(w)={len(w)}"
        )

    if abs(w.sum() - 1.0) >= 1e-9:
        raise ValueError(f"Pesos devem somar 1; soma atual = {w.sum():.10f}")

    if (w < 0).any():
        raise ValueError("Todos os pesos devem ser não-negativos")

    for j, ((A, B), (C, D)) in enumerate(zip(t, s)):
        if not (A <= C <= D <= B):
            raise ValueError(
                f"Critério {j}: é necessário A ≤ C ≤ D ≤ B; "
                f"recebido A={A}, C={C}, D={D}, B={B}"
            )


def _normalizar(
    X: np.ndarray,
    t: list[tuple[float, float]],
    s: list[tuple[float, float]],
) -> np.ndarray:
    """
    Aplica f_rim célula a célula, transformando cada avaliação X[i][j] na sua
    proximidade ∈ [0, 1] ao intervalo ideal do critério j.
    """
    m, n = X.shape
    Y = np.empty((m, n), dtype=float)
    for i in range(m):
        for j in range(n):
            Y[i, j] = f_rim(X[i, j], t[j], s[j])
    return Y


def _distancias(
    Y_pond: np.ndarray,
    w: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Distâncias euclidianas de cada alternativa aos dois pontos de referência.

    Y_pond já é Y * w (normalizado e ponderado), portanto:
    - O ideal ponderado é o próprio vetor de pesos w (cada critério no máximo
      normalizado vale w[j], logo Y_pond[i] == w quando a alternativa i é
      perfeita em todos os critérios).
    - O anti-ideal ponderado é a origem (vetor zero).

    ATENÇÃO: não inserir w como fator adicional dentro das raízes. Y_pond já
    carrega a ponderação; multiplicar por w novamente distorceria as distâncias
    e quebraria a invariância da escala do método.
    """
    I_plus  = np.sqrt(((Y_pond - w) ** 2).sum(axis=1))
    I_minus = np.sqrt((Y_pond ** 2).sum(axis=1))
    return I_plus, I_minus


def rim(
    X: np.ndarray,
    t: list[tuple[float, float]],
    s: list[tuple[float, float]],
    w: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Executa o método RIM completo.

    Parâmetros
    ----------
    X : array-like (m, n)
        Matriz de decisão — m alternativas × n critérios.
    t : list of (A, B)
        Domínios dos critérios.
    s : list of (C, D)
        Intervalos ideais dos critérios.
    w : array-like (n,)
        Vetor de pesos, não-negativo e somando 1.

    Retorna
    -------
    R        : (m,) índice de proximidade relativa — maior é melhor.
    I_plus   : (m,) distâncias ao ideal ponderado.
    I_minus  : (m,) distâncias ao anti-ideal.
    Y        : (m, n) matriz normalizada.
    Y_pond   : (m, n) matriz normalizada e ponderada (Y * w).

    Nota sobre R
    ------------
    R = I_minus / (I_plus + I_minus).

    O numerador é I_minus (distância ao anti-ideal), NÃO I_plus. Isso garante
    que R → 1 quando a alternativa está longe do pior (I_minus grande) e perto
    do melhor (I_plus → 0). Inverter o numerador produziria um ranking
    completamente invertido.
    """
    X = np.asarray(X, dtype=float)
    w = np.asarray(w, dtype=float)
    m, n = X.shape

    _conferir_parametros(t, s, w, n)

    Y = _normalizar(X, t, s)
    Y_pond = Y * w
    I_plus, I_minus = _distancias(Y_pond, w)

    # R alto = perto do ideal e longe do anti-ideal; maior é melhor.
    # Denominador protegido contra divisão por zero com np.maximum.
    R = I_minus / np.maximum(I_plus + I_minus, 1e-12)

    return R, I_plus, I_minus, Y, Y_pond