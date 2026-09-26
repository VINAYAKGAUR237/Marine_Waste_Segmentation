"""FastAPI routing for health checks, model metadata, class specifications, feedback, and model export."""

import os
import json
import torch
from pathlib import Path
from fastapi import APIRouter, Form, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.app.config import (
    model_config,
    DEBRIS_CLASSES,
    DEBRIS_COLORS,
    MICROPLASTIC_CLASSES,
    MICROPLASTIC_COLORS,
    CHECKPOINT_PATH,
    CHECKPOINT_DIR,
    BASE_DIR
)
from backend.app.inference.engine import inference_engine

router = APIRouter(prefix="", tags=["System & Metadata"])


class FeedbackPayload(BaseModel):
    image_id: Optional[str] = "demo"
    corrected_debris_class: Optional[str] = None
    corrected_microplastic_class: Optional[str] = None
    user_comment: Optional[str] = None


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Returns system status, device capabilities, and operational mode."""
    return {
        "status": "healthy",
        "service": "Marine Debris & Microplastic ViT API",
        "version": "2.0.0",
        "device": inference_engine.device,
        "is_demo_mode": inference_engine.demo_mode,
        "model_loaded": inference_engine.model is not None,
        "checkpoint_exists": os.path.exists(CHECKPOINT_PATH)
    }


@router.get("/model-info")
async def model_info() -> Dict[str, Any]:
    """Returns architectural parameters, parameter counts, memory footprints, and evaluation metrics."""
    metrics_path = BASE_DIR / "ml" / "evaluation" / "metrics.json"
    evaluation_data = None
    if metrics_path.exists():
        try:
            with open(metrics_path, "r") as f:
                evaluation_data = json.load(f)
        except Exception:
            pass

    param_count = inference_engine.model.get_param_count() if inference_engine.model else 1812193
    model_size = inference_engine.model.get_model_size_mb() if inference_engine.model else 6.93

    return {
        "model_name": "Lightweight Multi-Task Vision Transformer",
        "architecture": {
            "backbone": "Shared Lightweight CNN + MobileViT Hybrid Encoder",
            "stem": "Stride-2 Conv + Inverted Residual Depthwise Separable Blocks",
            "transformer_depth": model_config.depth,
            "attention_heads": model_config.num_heads,
            "embed_dim": model_config.embed_dim,
            "mlp_ratio": model_config.mlp_ratio,
            "debris_head": "Compact U-Net Decoder with Skip Connections",
            "microplastic_head": f"Dual-Mode ({model_config.microplastic_mode})"
        },
        "statistics": {
            "parameters": param_count,
            "model_size_mb": round(model_size, 2),
            "image_size": model_config.image_size,
            "device": inference_engine.device
        },
        "evaluation_metrics": evaluation_data
    }


@router.get("/classes")
async def get_classes() -> Dict[str, Any]:
    """Returns class labels, indices, and assigned color codes for rendering."""
    debris = [
        {"id": cid, "name": name, "color": list(DEBRIS_COLORS.get(name, (255, 255, 255)))}
        for cid, name in DEBRIS_CLASSES.items()
    ]
    microplastics = [
        {"id": cid, "name": name, "color": list(MICROPLASTIC_COLORS.get(name, (255, 255, 255)))}
        for cid, name in MICROPLASTIC_CLASSES.items()
    ]
    return {
        "marine_debris_classes": debris,
        "microplastic_classes": microplastics
    }


@router.post("/feedback")
async def submit_feedback(payload: FeedbackPayload) -> Dict[str, Any]:
    """Stores user correction feedback for active learning iterations."""
    feedback_file = CHECKPOINT_DIR / "user_feedback.jsonl"
    record = {
        "image_id": payload.image_id,
        "corrected_debris": payload.corrected_debris_class,
        "corrected_microplastic": payload.corrected_microplastic_class,
        "comment": payload.user_comment
    }
    with open(feedback_file, "a") as f:
        f.write(json.dumps(record) + "\n")
    return {"status": "success", "message": "Feedback recorded successfully for active learning."}


@router.post("/export")
async def export_model_endpoint(
    format: str = Form("onnx"),
    quantize: bool = Form(True)
) -> Dict[str, Any]:
    """Triggers ONNX export and INT8 quantization for edge deployment."""
    from ml.export.export_model import export_to_onnx
    onnx_target = str(CHECKPOINT_DIR / "multitask_vit.onnx")
    try:
        res = export_to_onnx(
            checkpoint_path=CHECKPOINT_PATH,
            output_path=onnx_target,
            quantize=quantize
        )
        return {
            "status": "success",
            "details": res
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/toggle-demo")
async def toggle_demo(enabled: bool = Form(...)) -> Dict[str, Any]:
    """Toggles Demo Mode on/off dynamically."""
    current = inference_engine.toggle_demo_mode(enabled)
    return {
        "is_demo_mode": current,
        "mode_label": "DEMO / SAMPLE OUTPUT" if current else "ACTUAL MODEL INFERENCE"
    }
