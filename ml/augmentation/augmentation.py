"""Data Augmentation Pipeline using Albumentations.
Features custom underwater optical degradations (turbidity, haze, backscatter)
along with spatial and color photometric transformations.
"""

import cv2
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2
from typing import Optional, Dict, Any, Tuple


class UnderwaterTurbidity(A.ImageOnlyTransform):
    """Simulates underwater particulate backscatter and turbidity haze."""
    def __init__(
        self,
        haze_intensity: float = 0.3,
        blue_green_bias: float = 0.2,
        always_apply: bool = False,
        p: float = 0.5
    ):
        super().__init__(always_apply=always_apply, p=p)
        self.haze_intensity = haze_intensity
        self.blue_green_bias = blue_green_bias

    def apply(self, img: np.ndarray, **params) -> np.ndarray:
        h, w, c = img.shape
        # Create subtle low-frequency turbidity mask
        turbidity_overlay = np.zeros_like(img, dtype=np.float32)
        turbidity_overlay[:, :, 0] = 180  # Blue
        turbidity_overlay[:, :, 1] = 200  # Green
        turbidity_overlay[:, :, 2] = 50   # Low Red

        # Perlin / Gaussian smooth scatter
        blur_kernel = 51
        turbidity_overlay = cv2.GaussianBlur(turbidity_overlay, (blur_kernel, blur_kernel), 0)

        # Blend image with turbidity veil
        alpha = np.random.uniform(0.1, self.haze_intensity)
        blended = (1.0 - alpha) * img.astype(np.float32) + alpha * turbidity_overlay
        return np.clip(blended, 0, 255).astype(np.uint8)


def get_training_augmentation(image_size: int = 256) -> A.Compose:
    """Returns training augmentation pipeline with underwater domain transforms."""
    return A.Compose([
        A.Resize(image_size, image_size),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.RandomRotate90(p=0.5),
        A.ShiftScaleRotate(
            shift_limit=0.0625,
            scale_limit=0.1,
            rotate_limit=45,
            interpolation=cv2.INTER_LINEAR,
            border_mode=cv2.BORDER_REFLECT_101,
            p=0.5
        ),
        A.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2,
            hue=0.1,
            p=0.5
        ),
        A.GaussianBlur(blur_limit=(3, 7), p=0.3),
        A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
        UnderwaterTurbidity(haze_intensity=0.35, p=0.4),
        A.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        ),
        ToTensorV2()
    ], is_check_shapes=False)


def get_validation_augmentation(image_size: int = 256) -> A.Compose:
    """Returns validation/test deterministic transformation pipeline."""
    return A.Compose([
        A.Resize(image_size, image_size),
        A.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        ),
        ToTensorV2()
    ], is_check_shapes=False)
