from typing import Literal

from pydantic import BaseModel, Field, model_validator

CriterionKind = Literal["benefit", "cost", "target"]


class Criterion(BaseModel):
    name: str = Field(min_length=1)
    kind: CriterionKind
    A: float
    B: float
    C: float
    D: float

    @model_validator(mode="after")
    def check_order(self):
        if not (self.A <= self.C <= self.D <= self.B):
            raise ValueError(f"Critério '{self.name}': é necessário A ≤ C ≤ D ≤ B")
        return self


class DecisionInput(BaseModel):
    alternatives: list[str] = Field(min_length=2)
    criteria: list[Criterion] = Field(min_length=2)
    weights: list[float]
    X: list[list[float]]

    @model_validator(mode="after")
    def check_dimensions(self):
        m, n = len(self.alternatives), len(self.criteria)
        if len(self.weights) != n:
            raise ValueError("weights deve ter o mesmo tamanho de criteria")
        if abs(sum(self.weights) - 1.0) > 1e-6:
            raise ValueError("weights deve somar 1 (tol 1e-6)")
        if any(w < 0 for w in self.weights):
            raise ValueError("weights não podem ser negativos")
        if len(self.X) != m or any(len(row) != n for row in self.X):
            raise ValueError(f"X deve ser {m}x{n}")
        for i, row in enumerate(self.X):
            for j, x in enumerate(row):
                A, B = self.criteria[j].A, self.criteria[j].B
                if not (A <= x <= B):
                    raise ValueError(
                        f"X[{i}][{j}]={x} fora do domínio "
                        f"[{A}, {B}] do critério '{self.criteria[j].name}'"
                    )
        return self


class RankingEntry(BaseModel):
    alternative: str
    rank: int
    R: float
    I_plus: float
    I_minus: float


class DecisionResult(BaseModel):
    ranking: list[RankingEntry]
    Y: list[list[float]]
    Y_pond: list[list[float]]


class CaseSummary(BaseModel):
    id: str
    title: str
    description: str
    source: str


class CaseDetail(CaseSummary):
    input: DecisionInput


class SensitivityRequest(BaseModel):
    base: DecisionInput
    criterion_index: int
    points: int = Field(default=11, ge=3, le=51)


class SensitivityPoint(BaseModel):
    weight: float
    ranking: list[RankingEntry]


class SensitivityResult(BaseModel):
    criterion_index: int
    points: list[SensitivityPoint]
