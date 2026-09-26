"""Unified Lightweight Multi-Task Vision Transformer for Marine Debris and Microplastic Segmentation.
Combines a shared CNN + Transformer encoder with two specialized task heads:
1. Marine Debris Segmentation Head (Compact U-Net decoder)
2. Microplastic Analysis Head (Classification and/or Particle Segmentation)
"""

import os
import torch
import torch.nn as nn
from typing import Dict, Any, Tuple, Optional, List

from .encoder import LightweightSharedEncoder
from .marine_debris_head import MarineDebrisSegmentationHead
from .microplastic_head import MicroplasticHead
from ..config import ModelConfig, model_config


class LightweightMultiTaskViT(nn.Module):
    """Multi-Task Vision Transformer with shared CNN+ViT backbone and dual task heads."""
    def __init__(self, cfg: Optional[ModelConfig] = None):
        super().__init__()
        self.cfg = cfg or model_config

        # 1. Shared Lightweight CNN + ViT Encoder
        self.encoder = LightweightSharedEncoder(
            in_channels=self.cfg.in_channels,
            stem_channels=self.cfg.stem_channels,
            stage1_channels=self.cfg.stage1_channels,
            stage2_channels=self.cfg.stage2_channels,
            stage3_channels=self.cfg.stage3_channels,
            embed_dim=self.cfg.embed_dim,
            transformer_depth=self.cfg.depth,
            num_heads=self.cfg.num_heads,
            mlp_ratio=self.cfg.mlp_ratio,
            dropout=self.cfg.dropout
        )

        # 2. Task Head A: Marine Debris Segmentation (Compact U-Net decoder)
        self.debris_head = MarineDebrisSegmentationHead(
            stem_channels=self.cfg.stem_channels,
            stage1_channels=self.cfg.stage1_channels,
            stage2_channels=self.cfg.stage2_channels,
            stage3_channels=self.cfg.stage3_channels,
            num_classes=self.cfg.num_debris_classes,
            decoder_channels=tuple(self.cfg.debris_decoder_channels)
        )

        # 3. Task Head B: Microplastic Analysis Head
        self.microplastic_head = MicroplasticHead(
            in_channels=self.cfg.stage3_channels,
            num_classes=self.cfg.num_microplastic_classes,
            mode=self.cfg.microplastic_mode,
            dropout=self.cfg.dropout
        )

    def forward(
        self,
        x: torch.Tensor,
        task: str = "all"
    ) -> Dict[str, torch.Tensor]:
        """Forward pass supporting selective or full multi-task inference.
        Args:
            x: Input image tensor of shape (B, 3, H, W)
            task: "all", "debris", or "microplastic"
        Returns:
            Dictionary containing task predictions:
              - "debris_logits": (B, num_debris_classes, H, W)
              - "microplastic_cls": (B, num_microplastic_classes)
              - "microplastic_seg": (B, num_microplastic_classes, H, W) (optional)
        """
        B, C, H, W = x.shape
        target_size = (H, W)

        # Shared multi-scale feature extraction
        features = self.encoder(x)  # (feat1, feat2, feat3, feat4)
        feat4 = features[3]

        outputs: Dict[str, torch.Tensor] = {}

        if task in ("all", "debris"):
            outputs["debris_logits"] = self.debris_head(features, target_size)

        if task in ("all", "microplastic"):
            micro_outputs = self.microplastic_head(
                feat4,
                target_size=target_size if self.cfg.microplastic_mode == "segmentation" else None
            )
            outputs["microplastic_cls"] = micro_outputs["classification"]
            if "segmentation" in micro_outputs:
                outputs["microplastic_seg"] = micro_outputs["segmentation"]

        return outputs

    def get_attention_maps(self) -> List[torch.Tensor]:
        """Returns attention weights from transformer blocks for Explainable AI (XAI)."""
        return self.encoder.get_attention_maps()

    def get_param_count(self) -> int:
        """Returns total number of trainable parameters."""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def get_model_size_mb(self) -> float:
        """Calculates model parameter size in megabytes."""
        param_bytes = sum(p.numel() * p.element_size() for p in self.parameters())
        buffer_bytes = sum(b.numel() * b.element_size() for b in self.buffers())
        return (param_bytes + buffer_bytes) / (1024 * 1024)


def create_model(checkpoint_path: Optional[str] = None, device: str = "cpu") -> LightweightMultiTaskViT:
    """Factory function to build and optionally load trained weights."""
    model = LightweightMultiTaskViT()
    if checkpoint_path and os.path.exists(checkpoint_path):
        state = torch.load(checkpoint_path, map_location=device)
        if "model_state_dict" in state:
            model.load_state_dict(state["model_state_dict"])
        else:
            model.load_state_dict(state)
        print(f"Loaded checkpoint from: {checkpoint_path}")
    model.to(device)
    model.eval()
    return model
