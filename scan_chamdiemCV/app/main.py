from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import cv, job, analyze, rank

app = FastAPI(title="CV Screening AI - BGE Fixed")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv.router, prefix="/api/cv", tags=["CV"])
app.include_router(job.router, prefix="/api/job", tags=["Job"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(rank.router, prefix="/api/rank", tags=["Rank"])

@app.get("/")
def root():
    return {"message": "CV AI System Running (BGE FIXED) 🚀"}