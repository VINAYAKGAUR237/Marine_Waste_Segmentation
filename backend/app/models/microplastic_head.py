"""Microplastic Analysis Head for Microscopy Images.
Supports two configurable operational modes:
- MODE A: Microplastic Classification (5 classes: fibre, fragment, film, foam, sphere)
- MODE B: Microplastic Particle Segmentation & morphology quantification
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Dict, Any, Optional


class MicroplasticHead(nn.Module):
    """Dual-mode Microplastic Head (Classification & Particle Segmentation)."""
    def __init__(
        self,
        in_channels: int = 144,  # feat4 channels
        num_classes: int = 5,
        mode: str = "classification",
        dropout: float = 0.2
    ):
        super().__init__()
        self.num_classes = num_classes
        self.mode = mode.lower()

        # MODE A: Classification Head
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.cls_head = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(dropout),
            nn.Linear(in_channels, 96),
            nn.SiLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(96, num_classes)
        )

        # MODE B: Particle Segmentation Head (compact decoder)
        self.seg_conv1 = nn.Sequential(
            nn.Conv2d(in_channels, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.SiLU(inplace=True)
        )
        self.seg_conv2 = nn.Sequential(
            nn.Conv2d(64, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.SiLU(inplace=True)
        )
        self.seg_classifier = nn.Conv2d(32, num_classes, kernel_size=1)

    def forward(
        self,
        feat4: torch.Tensor,
        target_size: Optional[Tuple[int, int]] = None
    ) -> Dict[str, torch.Tensor]:
        outputs: Dict[str, torch.Tensor] = {}

        # Mode A: Classification logits
        cls_logits = self.cls_head(self.pool(feat4))
        outputs["classification"] = cls_logits

        # Mode B: Particle segmentation logits
        if target_size is not None:
            x_up1 = F.interpolate(feat4, scale_factor=2.0, mode="bilinear", align_corners=False)
            x_feat1 = self.seg_conv1(x_up1)
            x_up2 = F.interpolate(x_feat1, size=target_size, mode="bilinear", align_corners=False)
            x_feat2 = self.seg_conv2(x_up2)
            seg_logits = self.seg_classifier(x_feat2)
            outputs["segmentation"] = seg_logits

        return outputs
