from fastapi import APIRouter, HTTPException

from app.rim import cases
from app.rim.schemas import (
    CaseDetail,
    CaseSummary,
    DecisionInput,
    DecisionResult,
    HealthResponse,
    SensitivityRequest,
    SensitivityResult,
)
from app.rim.solver import sensitivity, solve

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    # Healthcheck tipado sob /api, espelhando o /health cru de infra do main.py.
    # Mesmo corpo {"status": "ok"}, mas aqui validado pelo response_model.
    return HealthResponse(status="ok")


@router.post("/rim/solve", response_model=DecisionResult)
def post_solve(inp: DecisionInput) -> DecisionResult:
    return solve(inp)


@router.post("/rim/sensitivity", response_model=SensitivityResult)
def post_sensitivity(req: SensitivityRequest) -> SensitivityResult:
    return sensitivity(req)


@router.get("/cases", response_model=list[CaseSummary])
def get_cases() -> list[CaseSummary]:
    return cases.list_cases()


@router.get("/cases/{case_id}", response_model=CaseDetail)
def get_case(case_id: str) -> CaseDetail:
    try:
        return cases.get_case(case_id)
    except KeyError:
        # cases.get_case sinaliza caso inexistente com KeyError; aqui ele vira
        # a resposta HTTP apropriada (404 Not Found).
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' não encontrado")
