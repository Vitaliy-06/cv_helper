from fastapi import APIRouter
from schemas.analysis import (
    AnalyseRequest,
    AnalyseResponse,
)
from services.ai_service import analyse_cv

router = APIRouter(prefix="/api")

@router.post( "/analyse", response_model=AnalyseResponse)
async def analyse(request: AnalyseRequest):
    return await analyse_cv(
        job_description=request.job_description,
        cv=request.cv,
    )