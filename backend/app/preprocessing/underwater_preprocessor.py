"""Underwater Image Preprocessing Pipeline.
Implements the 6-stage physical and optical compensation pipeline:
1. Resize: Resolution standardization
2. Denoising: Edge-preserving noise reduction for water turbidity
3. White Balance: Gray-World chromatic constancy
4. Color Correction: Attenuation compensation for underwater red absorption
5. Contrast Enhancement: Contrast Limited Adaptive Histogram Equalization (CLAHE) in CIELAB
6. Normalization: Zero-mean, unit-variance tensor scaling for model input
"""

import cv2
import numpy as np
import torch
from typing import Dict, Any, Tuple, Optional
from ..config import PreprocessingConfig, preprocessing_config


class UnderwaterPreprocessor:
    """End-to-end underwater image optical restoration and enhancement pipeline."""
    def __init__(self, cfg: Optional[PreprocessingConfig] = None):
        self.cfg = cfg or preprocessing_config

    def resize_image(
        self,
        image: np.ndarray,
        target_size: Optional[Tuple[int, int]] = None
    ) -> np.ndarray:
        """Resizes the image to the standard model input resolution."""
        size = target_size or self.cfg.target_size
        return cv2.resize(image, size, interpolation=cv2.INTER_LINEAR)

    def denoise_image(
        self,
        image: np.ndarray,
        strength: Optional[float] = None
    ) -> np.ndarray:
        """Applies edge-preserving bilateral filtering to eliminate suspended particulate noise."""
        h = strength if strength is not None else self.cfg.denoise_strength
        # Bilateral filter maintains sharp object boundaries while smoothing water scattering
        d = 7
        sigma_color = float(h * 3.5)
        sigma_space = float(h * 1.5)
        return cv2.bilateralFilter(image, d=d, sigmaColor=sigma_color, sigmaSpace=sigma_space)

    def white_balance(self, image: np.ndarray) -> np.ndarray:
        """Applies Gray-World chromatic constancy to adjust for underwater blue/green ambient bias."""
        img_float = image.astype(np.float32)
        # Calculate mean across each color channel (BGR)
        b_mean = np.mean(img_float[:, :, 0])
        g_mean = np.mean(img_float[:, :, 1])
        r_mean = np.mean(img_float[:, :, 2])

        # Overall average gray intensity
        gray_mean = (b_mean + g_mean + r_mean) / 3.0 + 1e-6

        # Gain coefficients
        b_gain = gray_mean / (b_mean + 1e-6)
        g_gain = gray_mean / (g_mean + 1e-6)
        r_gain = gray_mean / (r_mean + 1e-6)

        img_float[:, :, 0] = np.clip(img_float[:, :, 0] * b_gain, 0, 255)
        img_float[:, :, 1] = np.clip(img_float[:, :, 1] * g_gain, 0, 255)
        img_float[:, :, 2] = np.clip(img_float[:, :, 2] * r_gain, 0, 255)

        return img_float.astype(np.uint8)

    def color_correction(
        self,
        image: np.ndarray,
        red_gain: Optional[float] = None,
        blue_gain: Optional[float] = None
    ) -> np.ndarray:
        """Compensates for the exponential absorption of long wavelengths (red light) in water."""
        r_gain = red_gain if red_gain is not None else self.cfg.color_correction_red_gain
        b_gain = blue_gain if blue_gain is not None else self.cfg.color_correction_blue_gain

        img_float = image.astype(np.float32)
        # Underwater red attenuation compensation
        img_float[:, :, 2] = np.clip(img_float[:, :, 2] * r_gain, 0, 255)
        img_float[:, :, 0] = np.clip(img_float[:, :, 0] * b_gain, 0, 255)

        return img_float.astype(np.uint8)

    def enhance_contrast(
        self,
        image: np.ndarray,
        clip_limit: Optional[float] = None,
        grid_size: Optional[Tuple[int, int]] = None
    ) -> np.ndarray:
        """Applies CLAHE on the L-channel in CIELAB color space to reveal obscured underwater debris."""
        clip = clip_limit if clip_limit is not None else self.cfg.clahe_clip_limit
        grid = grid_size if grid_size is not None else self.cfg.clahe_tile_grid_size

        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=grid)
        l_enhanced = clahe.apply(l)

        lab_merged = cv2.merge((l_enhanced, a, b))
        return cv2.cvtColor(lab_merged, cv2.COLOR_LAB2BGR)

    def normalize_image(
        self,
        image: np.ndarray
    ) -> torch.Tensor:
        """Normalizes an image array to a standardized PyTorch tensor of shape (3, H, W)."""
        # Convert BGR -> RGB
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        mean = np.array(self.cfg.mean, dtype=np.float32)
        std = np.array(self.cfg.std, dtype=np.float32)
        norm = (rgb - mean) / std
        # (H, W, C) -> (C, H, W)
        tensor = torch.from_numpy(norm).permute(2, 0, 1)
        return tensor

    def compute_image_metrics(self, bgr_image: np.ndarray) -> Dict[str, float]:
        """Calculates color distribution and contrast statistics for telemetry."""
        gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
        b, g, r = cv2.split(bgr_image)
        return {
            "mean_luminance": float(np.mean(gray)),
            "contrast_std": float(np.std(gray)),
            "mean_red": float(np.mean(r)),
            "mean_green": float(np.mean(g)),
            "mean_blue": float(np.mean(b)),
            "red_to_blue_ratio": float(np.mean(r) / (np.mean(b) + 1e-6))
        }

    def preprocess_image(
        self,
        image: np.ndarray,
        clip_limit: Optional[float] = None,
        denoise_strength: Optional[float] = None,
        red_gain: Optional[float] = None
    ) -> Dict[str, Any]:
        """Runs the entire sequential preprocessing pipeline and returns intermediate diagnostics."""
        raw_metrics = self.compute_image_metrics(image)

        # 1. Resize
        resized = self.resize_image(image)

        # 2. Denoising
        denoised = self.denoise_image(resized, strength=denoise_strength)

        # 3. White Balance
        white_balanced = self.white_balance(denoised)

        # 4. Color Correction (Red compensation)
        color_corrected = self.color_correction(white_balanced, red_gain=red_gain)

        # 5. Contrast Enhancement (CLAHE)
        enhanced = self.enhance_contrast(color_corrected, clip_limit=clip_limit)

        # 6. Tensor Normalization for neural network
        tensor = self.normalize_image(enhanced)

        enhanced_metrics = self.compute_image_metrics(enhanced)

        return {
            "original_resized": resized,
            "enhanced_image": enhanced,
            "tensor": tensor,
            "raw_metrics": raw_metrics,
            "enhanced_metrics": enhanced_metrics,
            "contrast_improvement": round(
                enhanced_metrics["contrast_std"] - raw_metrics["contrast_std"], 2
            ),
            "red_recovery": round(
                enhanced_metrics["red_to_blue_ratio"] - raw_metrics["red_to_blue_ratio"], 3
            )
        }


# Global preprocessor instance
underwater_preprocessor = UnderwaterPreprocessor()
