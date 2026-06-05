from typing import Literal

from pydantic import BaseModel, Field, model_validator

CriterionKind = Literal["benefit", "cost", "target"]


class HealthResponse(BaseModel):
    status: Literal["ok"]


class Criterion(BaseModel):
    name: str = Field(min_length=1)
    kind: CriterionKind
    A: float
    B: float
    C: float
    D: float

    @model_validator(mode="after")
    def check_order(self):
        # A ≤ C ≤ D ≤ B garante que o intervalo ideal [C, D] (a faixa-alvo do
        # decisor) está contido no domínio [A, B] do critério. Sem essa ordem o
        # método não tem como medir distância à faixa ideal.
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
        # A ordem das checagens importa: só validamos o domínio de cada X[i][j]
        # depois de confirmar que a matriz tem o formato m×n. Caso contrário,
        # indexar self.criteria[j] com uma linha mais larga que n estouraria um
        # IndexError (HTTP 500) em vez do 422 que o usuário deve receber.
        n = len(self.criteria)
        m = len(self.alternatives)
        self._validar_tamanho_dos_pesos(n)
        self._validar_pesos_como_distribuicao()
        self._validar_formato_da_matriz(m, n)
        self._validar_X_no_dominio()
        return self

    def _validar_tamanho_dos_pesos(self, n: int) -> None:
        # Um peso por critério: a cardinalidade tem de bater antes de qualquer
        # operação posicional entre pesos e critérios.
        if len(self.weights) != n:
            raise ValueError("weights deve ter o mesmo tamanho de criteria")

    def _validar_pesos_como_distribuicao(self) -> None:
        # Os pesos formam uma distribuição: somam 1 e são não-negativos.
        # Conferimos a soma antes do sinal para reproduzir a ordem original dos
        # if. Não normalizamos aqui de propósito — um vetor de pesos malformado
        # é erro de entrada (422), não algo que o servidor deva "consertar"
        # silenciosamente.
        if abs(sum(self.weights) - 1.0) > 1e-6:
            raise ValueError("weights deve somar 1 (tol 1e-6)")
        if any(w < 0 for w in self.weights):
            raise ValueError("weights não podem ser negativos")

    def _validar_formato_da_matriz(self, m: int, n: int) -> None:
        # X é a matriz de decisão m×n (alternativas nas linhas, critérios nas
        # colunas). Precisa ter exatamente essas dimensões.
        if len(self.X) != m or any(len(row) != n for row in self.X):
            raise ValueError(f"X deve ser {m}x{n}")

    def _validar_X_no_dominio(self) -> None:
        # Cada avaliação X[i][j] tem de cair no domínio [A, B] do seu critério.
        # Esse domínio é fixado a priori pelo decisor (não derivado da amostra),
        # o que é justamente a fonte da imunidade do RIM ao rank reversal.
        for i, row in enumerate(self.X):
            for j, x in enumerate(row):
                A, B = self.criteria[j].A, self.criteria[j].B
                if not (A <= x <= B):
                    raise ValueError(
                        f"X[{i}][{j}]={x} fora do domínio "
                        f"[{A}, {B}] do critério '{self.criteria[j].name}'"
                    )


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
