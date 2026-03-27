from fastapi import APIRouter
from app.api.cv import cv_store
from app.api.job import job_store
from app.services.analysis_service import analyze_cv_job

router = APIRouter()

@router.post("/")
def analyze(cv_id: int, job_id: int):
    cv = next((c for c in cv_store if c["id"] == cv_id), None)
    job = next((j for j in job_store if j["id"] == job_id), None)

    if not cv or not job:
        return {"error": "CV or Job not found"}

    return analyze_cv_job(cv["text"], job["text"])