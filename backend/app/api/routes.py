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
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' não encontrado")
