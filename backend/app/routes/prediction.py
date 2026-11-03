"""FastAPI routing for prediction, analysis, batch inference, and model explainability."""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from typing import List, Optional, Dict, Any
import numpy as np

from backend.app.inference.engine import inference_engine
from backend.app.utils.image_utils import bytes_to_cv2
from backend.app.config import MAX_UPLOAD_SIZE_MB

router = APIRouter(prefix="", tags=["Prediction & Analysis"])


def validate_image_file(file: UploadFile, content: bytes) -> None:
    max_bytes = 50 * 1024 * 1024  # 50MB
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty (0 bytes)."
        )
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds maximum limit of 50MB."
        )


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    task: str = Form("debris"),
    enhance: bool = Form(False),
    clip_limit: Optional[float] = Form(None),
    denoise_strength: Optional[float] = Form(None)
) -> Dict[str, Any]:
    """Single image prediction endpoint returning segmentation masks, detected objects, and overlay."""
    content = await file.read()
    validate_image_file(file, content)

    try:
        image_bgr = bytes_to_cv2(content)
        result = inference_engine.run_inference(
            image_bgr=image_bgr,
            task=task,
            enhance=enhance,
            clip_limit=clip_limit,
            denoise_strength=denoise_strength
        )
        return {
            "task": "debris",
            "is_demo": result["is_demo"],
            "mode_label": result["mode_label"],
            "predictions": result["marine_debris"]["detected_objects"],
            "segmentation_mask": result["visualizations"]["mask"],
            "overlay": result["visualizations"]["overlay"],
            "preprocessed": result["visualizations"]["preprocessed"],
            "enhanced": result["visualizations"].get("enhanced", result["visualizations"]["preprocessed"]),
            "original": result["visualizations"]["original"],
            "coverage_percentage": result["coverage_percentage"],
            "processing_time": result["processing_time_ms"],
            "microplastic": result.get("microplastic")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(e)}"
        )


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    enhance: bool = Form(False)
) -> Dict[str, Any]:
    """Comprehensive multi-task analysis endpoint returning all telemetry, morphology, and visuals."""
    content = await file.read()
    validate_image_file(file, content)

    try:
        image_bgr = bytes_to_cv2(content)
        return inference_engine.run_inference(image_bgr=image_bgr, task="all", enhance=enhance)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error: {str(e)}"
        )


@router.post("/batch-predict")
async def batch_predict(
    files: List[UploadFile] = File(...),
    enhance: bool = Form(False)
) -> Dict[str, Any]:
    """Processes multiple uploaded images in batch."""
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch limit is 10 images at a time."
        )

    results = []
    for file in files:
        content = await file.read()
        try:
            validate_image_file(file, content)
            image_bgr = bytes_to_cv2(content)
            res = inference_engine.run_inference(image_bgr=image_bgr, task="all", enhance=enhance)
            results.append({
                "filename": file.filename,
                "status": "success",
                "coverage_percentage": res["coverage_percentage"],
                "microplastic_class": res["microplastic"]["top_class"],
                "microplastic_confidence": res["microplastic"]["confidence"],
                "debris_objects_count": len(res["marine_debris"]["detected_objects"]),
                "processing_time_ms": res["processing_time_ms"],
                "overlay": res["visualizations"]["overlay"]
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })

    return {
        "total_processed": len(results),
        "results": results
    }


@router.post("/explain")
async def explain(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """Explainable AI (XAI) endpoint returning Model Attention Heatmaps."""
    content = await file.read()
    validate_image_file(file, content)

    try:
        image_bgr = bytes_to_cv2(content)
        res = inference_engine.run_inference(image_bgr=image_bgr, task="all", enhance=True)
        return {
            "title": "Model Attention Visualization",
            "explanation": (
                "Attention maps visualize which spatial features the Vision Transformer's "
                "multi-head self-attention mechanism weighted most heavily when identifying debris or particles."
            ),
            "attention_heatmap": res["visualizations"]["attention_heatmap"],
            "attention_overlay": res["visualizations"]["attention_overlay"],
            "is_demo": res["is_demo"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
