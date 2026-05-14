import numpy as np
import pytest

from app.rim.algorithm import f_rim, rim


def test_notebook_example():
    X = np.array(
        [
            [4.5, 85, 1.3, 8],
            [6.0, 92, 1.6, 10],
            [5.0, 78, 2.1, 6],
            [5.5, 88, 1.7, 9],
        ]
    )
    t = [(4.0, 7.0), (70, 100), (1.0, 2.5), (5, 12)]
    s = [(4.0, 4.0), (100, 100), (1.4, 1.8), (12, 12)]
    w = np.array([0.20, 0.35, 0.20, 0.25])

    R, I_plus, I_minus, Y, Y_pond = rim(X, t, s, w)

    expected_Y = np.array(
        [
            [0.8333, 0.5000, 0.7500, 0.4286],
            [0.3333, 0.7333, 1.0000, 0.7143],
            [0.6667, 0.2667, 0.5714, 0.1429],
            [0.5000, 0.6000, 1.0000, 0.5714],
        ]
    )
    expected_R = np.array([0.5653, 0.6797, 0.3650, 0.6254])

    np.testing.assert_allclose(Y, expected_Y, atol=1e-4)
    np.testing.assert_allclose(R, expected_R, atol=1e-4)


@pytest.mark.parametrize(
    "x,t,s,expected",
    [
        (1.6, (1.0, 2.5), (1.4, 1.8), 1.0),
        (1.3, (1.0, 2.5), (1.4, 1.8), 0.7500),
        (2.1, (1.0, 2.5), (1.4, 1.8), 0.5714),
        (6.0, (4.0, 7.0), (4.0, 4.0), 0.3333),
    ],
)
def test_f_rim_pointwise(x, t, s, expected):
    assert abs(f_rim(x, t, s) - expected) < 1e-4
