import pytest
from pydantic import ValidationError

from app.rim.schemas import Criterion, DecisionInput


def _valid_criteria() -> list[Criterion]:
    return [
        Criterion(name="Preço", kind="cost", A=4.0, B=7.0, C=4.0, D=4.0),
        Criterion(name="Peso", kind="target", A=1.0, B=2.5, C=1.4, D=1.8),
    ]


def test_criterion_order_invalid_A_greater_than_C():
    with pytest.raises(ValidationError):
        Criterion(name="X", kind="target", A=5.0, B=10.0, C=4.0, D=8.0)


def test_criterion_order_invalid_D_greater_than_B():
    with pytest.raises(ValidationError):
        Criterion(name="X", kind="target", A=1.0, B=5.0, C=2.0, D=6.0)


def test_criterion_order_invalid_C_greater_than_D():
    with pytest.raises(ValidationError):
        Criterion(name="X", kind="target", A=1.0, B=10.0, C=8.0, D=5.0)


def test_weights_sum_not_one_fails():
    with pytest.raises(ValidationError):
        DecisionInput(
            alternatives=["A1", "A2"],
            criteria=_valid_criteria(),
            weights=[0.5, 0.4],  # soma 0.9
            X=[[5.0, 1.5], [6.0, 1.7]],
        )


def test_weights_wrong_length_fails():
    with pytest.raises(ValidationError):
        DecisionInput(
            alternatives=["A1", "A2"],
            criteria=_valid_criteria(),
            weights=[0.3, 0.3, 0.4],  # 3 pesos, 2 critérios
            X=[[5.0, 1.5], [6.0, 1.7]],
        )


def test_weights_negative_fails():
    with pytest.raises(ValidationError):
        DecisionInput(
            alternatives=["A1", "A2"],
            criteria=_valid_criteria(),
            weights=[1.2, -0.2],
            X=[[5.0, 1.5], [6.0, 1.7]],
        )


def test_X_outside_domain_fails():
    with pytest.raises(ValidationError):
        DecisionInput(
            alternatives=["A1", "A2"],
            criteria=_valid_criteria(),
            weights=[0.5, 0.5],
            X=[[5.0, 1.5], [9.0, 1.7]],  # 9.0 fora de [4, 7]
        )


def test_X_wrong_shape_fails():
    with pytest.raises(ValidationError):
        DecisionInput(
            alternatives=["A1", "A2"],
            criteria=_valid_criteria(),
            weights=[0.5, 0.5],
            X=[[5.0, 1.5, 1.0], [6.0, 1.7, 1.0]],  # 3 colunas, 2 critérios
        )


def test_valid_input_passes():
    inp = DecisionInput(
        alternatives=["A1", "A2"],
        criteria=_valid_criteria(),
        weights=[0.5, 0.5],
        X=[[5.0, 1.5], [6.0, 1.7]],
    )
    assert len(inp.alternatives) == 2
    assert len(inp.criteria) == 2
