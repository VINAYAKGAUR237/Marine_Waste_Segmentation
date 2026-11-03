"""Main FastAPI Application Entrypoint for Marine Pollution AI."""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.app.routes import prediction, preprocessing, health
from backend.app.config import BASE_DIR

app = FastAPI(
    title="Lightweight Multi-Task Vision Transformer API",
    description=(
        "Production AI API for underwater marine debris and microplastic segmentation and classification. "
        "Built on a shared CNN + Vision Transformer backbone for low-resource AUV/ROV edge deployment."
    ),
    version="2.0.0"
)

# CORS Middleware configuration - restricted strictly to Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler: Formats friendly errors without raw stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An internal error occurred during processing.",
            "detail": str(exc),
            "endpoint": str(request.url.path)
        }
    )

# Mount Static Directories for evaluation plots and samples
eval_dir = BASE_DIR / "ml" / "evaluation"
if eval_dir.exists():
    app.mount("/static/evaluation", StaticFiles(directory=str(eval_dir)), name="evaluation_static")

sample_dir = BASE_DIR / "data"
if sample_dir.exists():
    app.mount("/static/data", StaticFiles(directory=str(sample_dir)), name="data_static")

# Mount API Routers
app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(preprocessing.router)


@app.get("/")
def root():
    return {
        "project": "Lightweight Multi-Task Vision Transformer for Marine Debris & Microplastics",
        "documentation": "/docs",
        "health": "/health",
        "model_info": "/model-info",
        "status": "operational"
    }
