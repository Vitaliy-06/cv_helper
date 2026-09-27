from fastapi import APIRouter, Request, HTTPException
from openrouter.errors.toomanyrequestsresponse_error import TooManyRequestsResponseError
from limiter import limiter

from schemas.analysis import (
    AnalyseRequest,
    AnalyseResponse,
)
from services.cv_analysis import analyse_cv

router = APIRouter(prefix="/api")

@router.post("/analyse", response_model=AnalyseResponse)
@limiter.limit("5/minute", error_message="The AI service is currently busy. Please try again later.")
async def analyse(request: Request, data: AnalyseRequest):
    try:
        analysis : AnalyseResponse = await analyse_cv(
                job_description=data.job_description,
                cv=data.cv,
            )
        return analysis
    except  TooManyRequestsResponseError as e:
        print(f"Too many requests: {e}")
        raise HTTPException(
            status_code=429,
            detail="The AI service is currently busy. Please try again later."
        )
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected Error. Failed to analyse CV."
        )
    
