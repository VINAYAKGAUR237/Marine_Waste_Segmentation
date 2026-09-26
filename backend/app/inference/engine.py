"""Inference Engine for Marine Debris and Microplastic Multi-Task Model.
Strictly separates actual model inference from demonstrable offline Demo Mode.
"""

import os
import time
import torch
import torch.nn.functional as F
import numpy as np
import cv2
from typing import Dict, Any, Optional, Tuple, List

from backend.app.config import (
    model_config,
    CHECKPOINT_PATH,
    DEMO_MODE_DEFAULT,
    DEBRIS_CLASSES,
    DEBRIS_COLORS,
    MICROPLASTIC_CLASSES,
    MICROPLASTIC_COLORS
)
from backend.app.models.lightweight_vit import LightweightMultiTaskViT, create_model
from backend.app.preprocessing.underwater_preprocessor import underwater_preprocessor
from backend.app.utils.image_utils import (
    cv2_to_base64,
    create_mask_overlay,
    calculate_coverage_percentage,
    analyze_microplastic_particles,
    generate_attention_heatmap
)


class MultiTaskInferenceEngine:
    """Manages model lifecycle, execution, and clear separation between actual and demo inference."""
    def __init__(self):
        self.device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[LightweightMultiTaskViT] = None
        self.demo_mode: bool = DEMO_MODE_DEFAULT
        self.load_model()

    def load_model(self) -> None:
        """Loads trained checkpoint if available, or initializes genuine PyTorch weights."""
        try:
            if os.path.exists(CHECKPOINT_PATH):
                self.model = create_model(checkpoint_path=CHECKPOINT_PATH, device=self.device)
                self.demo_mode = False
                print(f"Loaded trained model checkpoint from: {CHECKPOINT_PATH} on {self.device}")
            else:
                self.model = create_model(checkpoint_path=None, device=self.device)
                self.demo_mode = True
                print("No checkpoint found; model initialized with demo mode fallback enabled.")
        except Exception as e:
            print(f"Error loading model weights: {e}. Defaulting to demo mode.")
            self.demo_mode = True

    def toggle_demo_mode(self, enabled: bool) -> bool:
        self.demo_mode = enabled
        return self.demo_mode

    def run_inference(
        self,
        image_bgr: np.ndarray,
        task: str = "all",
        enhance: bool = True,
        clip_limit: Optional[float] = None,
        denoise_strength: Optional[float] = None
    ) -> Dict[str, Any]:
        """Performs full end-to-end inference including preprocessing, forward pass, and rendering."""
        t_start = time.perf_counter()

        # 1. Optical Preprocessing
        if enhance:
            preproc_res = underwater_preprocessor.preprocess_image(
                image_bgr,
                clip_limit=clip_limit,
                denoise_strength=denoise_strength
            )
            input_tensor = preproc_res["tensor"].unsqueeze(0).to(self.device)
            display_enhanced = preproc_res["enhanced_image"]
            orig_resized = preproc_res["original_resized"]
            raw_metrics = preproc_res["raw_metrics"]
            enhanced_metrics = preproc_res["enhanced_metrics"]
        else:
            orig_resized = underwater_preprocessor.resize_image(image_bgr)
            input_tensor = underwater_preprocessor.normalize_image(orig_resized).unsqueeze(0).to(self.device)
            display_enhanced = orig_resized
            raw_metrics = underwater_preprocessor.compute_image_metrics(orig_resized)
            enhanced_metrics = raw_metrics

        # Check Demo Mode flag
        is_demo = self.demo_mode

        if not is_demo and self.model is not None:
            # ACTUAL MODEL INFERENCE
            self.model.eval()
            with torch.no_grad():
                preds = self.model(input_tensor, task="all")

            # Extract Debris Segmentation Mask
            debris_logits = preds["debris_logits"]  # (1, 7, H, W)
            debris_probs = F.softmax(debris_logits, dim=1)
            debris_mask = debris_logits.argmax(dim=1).squeeze(0).cpu().numpy().astype(np.uint8)

            # Extract Microplastic Predictions
            micro_cls_logits = preds["microplastic_cls"]  # (1, 5)
            micro_probs = F.softmax(micro_cls_logits, dim=1).squeeze(0).cpu().numpy()
            top_micro_class_id = int(np.argmax(micro_probs))
            top_micro_class_name = MICROPLASTIC_CLASSES.get(top_micro_class_id, "unknown")
            top_micro_confidence = round(float(micro_probs[top_micro_class_id]), 4)

            # Transformer Attention Map for Explainability
            attention_maps = self.model.get_attention_maps()
            if attention_maps:
                # Average attention across heads in the deepest block
                last_map = attention_maps[-1].squeeze(0).mean(dim=0).cpu().numpy()
                spatial_dim = int(np.sqrt(last_map.shape[0]))
                spatial_att = last_map.mean(axis=0).reshape(spatial_dim, spatial_dim)
            else:
                spatial_att = np.ones((16, 16), dtype=np.float32)

        else:
            # DEMO / MOCK MODE (Clearly labeled as DEMO / SAMPLE OUTPUT)
            h, w = orig_resized.shape[:2]
            debris_mask = np.zeros((h, w), dtype=np.uint8)
            # Create demonstrable synthetic regions for sample viewing
            cx, cy = w // 2, h // 2
            cv2.ellipse(debris_mask, (cx, cy), (50, 30), 20, 0, 360, 1, -1)  # Bottle
            cv2.rectangle(debris_mask, (cx - 70, cy + 30), (cx - 20, cy + 70), 2, -1)  # Plastic bag

            top_micro_class_id = 0  # Fibre
            top_micro_class_name = "fibre"
            top_micro_confidence = 0.895
            micro_probs = np.array([0.895, 0.045, 0.025, 0.020, 0.015], dtype=np.float32)
            spatial_att = np.random.uniform(0.2, 0.9, (16, 16)).astype(np.float32)

        # 3. Post-Processing & Visualizations
        colored_mask, overlay, detected_objects = create_mask_overlay(
            orig_resized,
            debris_mask,
            alpha=0.55
        )
        coverage_pct = calculate_coverage_percentage(debris_mask)

        # Microplastic particle statistics
        micro_stats = analyze_microplastic_particles(debris_mask)

        # Explainable AI Heatmap
        att_heatmap, att_overlay = generate_attention_heatmap(
            spatial_att,
            target_size=(orig_resized.shape[1], orig_resized.shape[0]),
            original_bgr=orig_resized
        )

        elapsed_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

        # Construct response payload
        microplastic_distribution = [
            {"class_name": MICROPLASTIC_CLASSES[cid], "confidence": round(float(micro_probs[cid]), 4)}
            for cid in range(len(MICROPLASTIC_CLASSES))
        ]

        return {
            "task": task,
            "is_demo": is_demo,
            "mode_label": "DEMO / SAMPLE OUTPUT" if is_demo else "ACTUAL TRAINED MODEL INFERENCE",
            "processing_time_ms": elapsed_ms,
            "coverage_percentage": coverage_pct,
            "marine_debris": {
                "detected_objects": detected_objects,
                "total_debris_categories": len(detected_objects),
                "coverage_percentage": coverage_pct
            },
            "microplastic": {
                "top_class": top_micro_class_name,
                "confidence": top_micro_confidence,
                "distribution": microplastic_distribution,
                "morphology": micro_stats
            },
            "preprocessing": {
                "enhanced": enhance,
                "raw_metrics": raw_metrics,
                "enhanced_metrics": enhanced_metrics
            },
            "visualizations": {
                "original": cv2_to_base64(orig_resized),
                "preprocessed": cv2_to_base64(display_enhanced),
                "mask": cv2_to_base64(colored_mask),
                "overlay": cv2_to_base64(overlay),
                "attention_heatmap": cv2_to_base64(att_heatmap),
                "attention_overlay": cv2_to_base64(att_overlay)
            }
        }


# Global inference engine instance
inference_engine = MultiTaskInferenceEngine()
