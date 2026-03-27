from fastapi import APIRouter
from app.api.cv import cv_store
from app.api.job import job_store

from app.services.embedding_service import embed_job, embed_cv
from app.services.retrieve_service import retrieve_top_k
from app.services.analysis_service import analyze_cv_job

router = APIRouter()


@router.get("/")
def rank_cv(job_id: int, top_k: int = 5):
    # ===== 1. GET JOB =====
    job = next((j for j in job_store if j["id"] == job_id), None)

    if not job:
        return {"error": "Job not found"}

    job_text = job["text"]

    # ===== 2. EMBED JOB =====
    job_emb = embed_job(job_text)

    # ===== 3. PREPARE CV LIST =====
    cv_list = []

    for cv in cv_store:
        cv_emb = embed_cv(cv["text"])

        cv_list.append({
            "id": cv["id"],
            "text": cv["text"],
            "embedding": cv_emb
        })

    # ===== 4. RETRIEVE TOP K =====
    top_candidates = retrieve_top_k(job_emb, cv_list, k=top_k * 2)

    # ===== 5. ANALYZE + SCORE =====
    results = []

    for cv in top_candidates:
        analysis = analyze_cv_job(cv["text"], job_text)

        results.append({
            "cv_id": cv["id"],
            "score": analysis["final_score"],
            "explanation": analysis["explanation"]
        })

    # ===== 6. SORT =====
    results.sort(key=lambda x: x["score"], reverse=True)

    # ===== 7. RETURN TOP K =====
    return results[:top_k]