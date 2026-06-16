import numpy as np
import pytest

from app.rim.algorithm import f_rim, rim


def test_article_replication_example():
    # Exemplo numérico do artigo (Cables et al. 2016): seleção de motorista,
    # 5 candidatos x 6 critérios. Números da implementação de referência
    # MCDM::RIM. Ranking publicado: A2 > A5 > A1 > A4 > A3.
    X = np.array(
        [
            [30, 0, 2, 3, 3, 2],
            [40, 9, 1, 3, 2, 2],
            [25, 0, 3, 1, 3, 2],
            [27, 0, 5, 3, 3, 1],
            [45, 15, 2, 2, 3, 4],
        ]
    )
    t = [(23, 60), (0, 15), (0, 10), (1, 3), (1, 3), (1, 5)]
    s = [(30, 35), (10, 15), (0, 0), (3, 3), (3, 3), (4, 5)]
    w = np.array([0.2262, 0.2143, 0.1786, 0.1429, 0.119, 0.119])

    R, I_plus, I_minus, Y, Y_pond = rim(X, t, s, w)

    expected_Y = np.array(
        [
            [1.0000, 0.0000, 0.8000, 1.0000, 1.0000, 0.3333],
            [0.8000, 0.9000, 0.9000, 1.0000, 0.5000, 0.3333],
            [0.2857, 0.0000, 0.7000, 0.0000, 1.0000, 0.3333],
            [0.5714, 0.0000, 0.5000, 1.0000, 1.0000, 0.0000],
            [0.6000, 1.0000, 0.8000, 0.5000, 1.0000, 1.0000],
        ]
    )
    expected_R = np.array([0.5866, 0.7558, 0.3716, 0.4666, 0.7401])

    np.testing.assert_allclose(Y, expected_Y, atol=1e-4)
    np.testing.assert_allclose(R, expected_R, atol=1e-4)

    # ranking por R decrescente
    assert [int(i) for i in np.argsort(-R)] == [1, 4, 0, 3, 2]


@pytest.mark.parametrize(
    "x,t,s,expected",
    [
        (15, (0, 15), (10, 15), 1.0),  # dentro do ideal [C, D]
        (9, (0, 15), (10, 15), 0.9000),  # abaixo do ideal
        (40, (23, 60), (30, 35), 0.8000),  # acima do ideal
        (25, (23, 60), (30, 35), 0.2857),  # abaixo, escala |A - C|
        (2, (0, 10), (0, 0), 0.8000),  # critério a minimizar (C = D = 0)
    ],
)
def test_f_rim_pointwise(x, t, s, expected):
    assert abs(f_rim(x, t, s) - expected) < 1e-4
