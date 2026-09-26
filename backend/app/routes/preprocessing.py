"""FastAPI routing for the underwater image preprocessing pipeline and interactive playground."""

import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from typing import Dict, Any, Optional

from backend.app.preprocessing.underwater_preprocessor import underwater_preprocessor
from backend.app.utils.image_utils import bytes_to_cv2, cv2_to_base64
from backend.app.routes.prediction import validate_image_file

router = APIRouter(prefix="", tags=["Underwater Preprocessing"])


def compute_rgb_histogram(bgr_img: np.ndarray) -> Dict[str, list]:
    """Computes normalized 16-bin color channel histograms for UI visualization."""
    histograms = {}
    channels = [("blue", 0), ("green", 1), ("red", 2)]
    for name, c_idx in channels:
        hist = cv2.calcHist([bgr_img], [c_idx], None, [16], [0, 256])
        hist_norm = cv2.normalize(hist, None, alpha=0, beta=100, norm_type=cv2.NORM_MINMAX)
        histograms[name] = [round(float(v), 1) for v in hist_norm.flatten()]
    return histograms


@router.post("/preprocess")
async def preprocess(
    file: UploadFile = File(...),
    clip_limit: Optional[float] = Form(2.5),
    denoise_strength: Optional[float] = Form(10.0),
    red_gain: Optional[float] = Form(1.25)
) -> Dict[str, Any]:
    """Runs the 6-stage optical preprocessing pipeline and returns Before vs After visuals and channel metrics."""
    content = await file.read()
    validate_image_file(file, content)

    try:
        raw_bgr = bytes_to_cv2(content)
        res = underwater_preprocessor.preprocess_image(
            image=raw_bgr,
            clip_limit=clip_limit,
            denoise_strength=denoise_strength,
            red_gain=red_gain
        )

        before_hist = compute_rgb_histogram(res["original_resized"])
        after_hist = compute_rgb_histogram(res["enhanced_image"])

        return {
            "success": True,
            "pipeline_stages": [
                "1. Resolution Standardization (256x256)",
                "2. Edge-Preserving Bilateral Denoising",
                "3. Gray-World Chromatic White Balance",
                "4. Long-Wavelength Red Attenuation Restoration",
                "5. CIELAB Contrast Limited Adaptive Histogram Equalization (CLAHE)",
                "6. Standardized Neural Network Normalization"
            ],
            "parameters_applied": {
                "clahe_clip_limit": clip_limit,
                "denoise_strength": denoise_strength,
                "red_attenuation_gain": red_gain
            },
            "metrics": {
                "before": res["raw_metrics"],
                "after": res["enhanced_metrics"],
                "contrast_improvement": res["contrast_improvement"],
                "red_recovery": res["red_recovery"]
            },
            "histograms": {
                "before": before_hist,
                "after": after_hist
            },
            "images": {
                "before": cv2_to_base64(res["original_resized"]),
                "after": cv2_to_base64(res["enhanced_image"])
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preprocessing error: {str(e)}"
        )
