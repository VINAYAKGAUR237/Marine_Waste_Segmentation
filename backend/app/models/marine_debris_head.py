"""Marine Debris Segmentation Head.
Implements a compact, edge-optimized U-Net decoder with skip connections from
the shared lightweight CNN + Vision Transformer encoder.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, List


class DecoderBlock(nn.Module):
    """Lightweight U-Net Decoder Block with bilinear upsampling and depthwise convs."""
    def __init__(self, in_channels: int, skip_channels: int, out_channels: int):
        super().__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(in_channels + skip_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.SiLU(inplace=True)
        )
        self.conv2 = nn.Sequential(
            # Depthwise conv
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, groups=out_channels, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.SiLU(inplace=True),
            # Pointwise conv
            nn.Conv2d(out_channels, out_channels, kernel_size=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.SiLU(inplace=True)
        )

    def forward(self, x: torch.Tensor, skip: torch.Tensor) -> torch.Tensor:
        # Upsample x to match skip resolution
        x_up = F.interpolate(x, size=skip.shape[2:], mode="bilinear", align_corners=False)
        fused = torch.cat([x_up, skip], dim=1)
        out = self.conv1(fused)
        return self.conv2(out)


class MarineDebrisSegmentationHead(nn.Module):
    """Compact U-Net decoder for marine debris pixel-wise segmentation."""
    def __init__(
        self,
        stem_channels: int = 32,      # feat1 (H/2)
        stage1_channels: int = 48,    # feat2 (H/4)
        stage2_channels: int = 80,    # feat3 (H/8)
        stage3_channels: int = 144,   # feat4 (H/16)
        num_classes: int = 7,
        decoder_channels: Tuple[int, int, int, int] = (96, 64, 32, 16)
    ):
        super().__init__()
        c1, c2, c3, c4 = decoder_channels

        # Up 1: H/16 -> H/8 (fusing feat4 + feat3)
        self.block1 = DecoderBlock(stage3_channels, stage2_channels, c1)

        # Up 2: H/8 -> H/4 (fusing block1 + feat2)
        self.block2 = DecoderBlock(c1, stage1_channels, c2)

        # Up 3: H/4 -> H/2 (fusing block2 + feat1)
        self.block3 = DecoderBlock(c2, stem_channels, c3)

        # Up 4: H/2 -> H (final expansion to original resolution)
        self.final_up = nn.Sequential(
            nn.Conv2d(c3, c4, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(c4),
            nn.SiLU(inplace=True)
        )
        self.classifier = nn.Conv2d(c4, num_classes, kernel_size=1)

    def forward(
        self,
        features: Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor],
        target_size: Tuple[int, int]
    ) -> torch.Tensor:
        feat1, feat2, feat3, feat4 = features

        d1 = self.block1(feat4, feat3)  # H/8
        d2 = self.block2(d1, feat2)     # H/4
        d3 = self.block3(d2, feat1)     # H/2
        
        # Upsample to full resolution
        d_full = F.interpolate(d3, size=target_size, mode="bilinear", align_corners=False)
        out = self.final_up(d_full)
        logits = self.classifier(out)   # B, num_classes, H, W
        return logits
