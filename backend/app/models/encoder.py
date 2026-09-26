"""Shared Lightweight CNN + Transformer Encoder for Marine Debris and Microplastic Analysis.
Combines depthwise separable convolutions for efficient local spatial feature extraction
with lightweight Vision Transformer blocks for long-range global context modeling.
"""

import math
import torch
import torch.nn as nn
from typing import List, Tuple, Optional


class ConvBNAct(nn.Module):
    """Standard Convolution + BatchNorm + Activation block."""
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int = 3,
        stride: int = 1,
        padding: Optional[int] = None,
        groups: int = 1,
        act: bool = True
    ):
        super().__init__()
        if padding is None:
            padding = (kernel_size - 1) // 2
        self.conv = nn.Conv2d(
            in_channels,
            out_channels,
            kernel_size=kernel_size,
            stride=stride,
            padding=padding,
            groups=groups,
            bias=False
        )
        self.bn = nn.BatchNorm2d(out_channels)
        self.act = nn.SiLU(inplace=True) if act else nn.Identity()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.act(self.bn(self.conv(x)))


class DepthwiseSeparableConv(nn.Module):
    """Depthwise Separable Convolution with inverted residual expansion."""
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        stride: int = 1,
        expand_ratio: float = 2.0
    ):
        super().__init__()
        self.stride = stride
        self.use_residual = stride == 1 and in_channels == out_channels
        hidden_dim = int(round(in_channels * expand_ratio))

        layers: List[nn.Module] = []
        if expand_ratio != 1.0:
            layers.append(ConvBNAct(in_channels, hidden_dim, kernel_size=1))
        
        # Depthwise
        layers.append(ConvBNAct(hidden_dim, hidden_dim, kernel_size=3, stride=stride, groups=hidden_dim))
        # Pointwise
        layers.append(ConvBNAct(hidden_dim, out_channels, kernel_size=1, act=False))

        self.block = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.use_residual:
            return x + self.block(x)
        return self.block(x)


class LightweightMultiHeadAttention(nn.Module):
    """Multi-Head Self-Attention with reduced heads and attention hook support."""
    def __init__(self, embed_dim: int, num_heads: int = 4, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        assert self.head_dim * num_heads == embed_dim, "embed_dim must be divisible by num_heads"
        self.scale = self.head_dim ** -0.5

        self.qkv = nn.Linear(embed_dim, embed_dim * 3, bias=True)
        self.proj = nn.Linear(embed_dim, embed_dim)
        self.attn_drop = nn.Dropout(dropout)
        self.proj_drop = nn.Dropout(dropout)
        
        # Stores last attention weights for Explainable AI (XAI)
        self.last_attn_weights: Optional[torch.Tensor] = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]

        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        self.last_attn_weights = attn.detach()
        attn = self.attn_drop(attn)

        out = (attn @ v).transpose(1, 2).reshape(B, N, C)
        out = self.proj(out)
        out = self.proj_drop(out)
        return out


class TransformerBlock(nn.Module):
    """Transformer Encoder Block with Pre-LayerNorm and MLP."""
    def __init__(self, embed_dim: int, num_heads: int = 4, mlp_ratio: float = 2.0, dropout: float = 0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = LightweightMultiHeadAttention(embed_dim, num_heads=num_heads, dropout=dropout)
        self.norm2 = nn.LayerNorm(embed_dim)
        hidden_dim = int(embed_dim * mlp_ratio)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, embed_dim),
            nn.Dropout(dropout)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x


class MobileViTBlock(nn.Module):
    """Hybrid CNN + Transformer Block (MobileViT-style).
    Extracts local spatial features with depthwise convs, folds features into tokens,
    applies multi-head self-attention, and fuses representations back to spatial grids.
    """
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        embed_dim: int,
        transformer_depth: int = 4,
        num_heads: int = 4,
        mlp_ratio: float = 2.0,
        dropout: float = 0.1
    ):
        super().__init__()
        # Local CNN representations
        self.local_rep = nn.Sequential(
            ConvBNAct(in_channels, in_channels, kernel_size=3),
            ConvBNAct(in_channels, embed_dim, kernel_size=1)
        )

        # Global Transformer representations
        self.transformer_blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads=num_heads, mlp_ratio=mlp_ratio, dropout=dropout)
            for _ in range(transformer_depth)
        ])
        self.norm = nn.LayerNorm(embed_dim)

        # Fusion projection
        self.proj_back = ConvBNAct(embed_dim, in_channels, kernel_size=1)
        self.fusion = ConvBNAct(in_channels * 2, out_channels, kernel_size=3)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        # Local features
        local_feat = self.local_rep(x)  # B, embed_dim, H, W
        B, C, H, W = local_feat.shape

        # Patch tokenization: flatten spatial dimensions into sequence
        tokens = local_feat.flatten(2).permute(0, 2, 1)  # B, H*W, embed_dim

        # Transformer blocks
        for blk in self.transformer_blocks:
            tokens = blk(tokens)
        tokens = self.norm(tokens)

        # Reshape tokens back to spatial feature map
        global_feat = tokens.permute(0, 2, 1).view(B, C, H, W)
        global_feat = self.proj_back(global_feat)

        # Multi-scale fusion
        fused = torch.cat([res, global_feat], dim=1)
        return self.fusion(fused)


class LightweightSharedEncoder(nn.Module):
    """Shared Lightweight CNN + Transformer Encoder.
    Outputs multi-scale hierarchical feature maps:
      - feat1: resolution H/2, channels stem_channels
      - feat2: resolution H/4, channels stage1_channels
      - feat3: resolution H/8, channels stage2_channels
      - feat4: resolution H/16, channels stage3_channels (with Transformer global attention)
    """
    def __init__(
        self,
        in_channels: int = 3,
        stem_channels: int = 32,
        stage1_channels: int = 48,
        stage2_channels: int = 80,
        stage3_channels: int = 144,
        embed_dim: int = 144,
        transformer_depth: int = 4,
        num_heads: int = 4,
        mlp_ratio: float = 2.0,
        dropout: float = 0.1
    ):
        super().__init__()
        # Stem: H -> H/2
        self.stem = ConvBNAct(in_channels, stem_channels, kernel_size=3, stride=2)

        # Stage 1: H/2 -> H/4
        self.stage1 = nn.Sequential(
            DepthwiseSeparableConv(stem_channels, stage1_channels, stride=2, expand_ratio=2.0),
            DepthwiseSeparableConv(stage1_channels, stage1_channels, stride=1, expand_ratio=2.0)
        )

        # Stage 2: H/4 -> H/8
        self.stage2 = nn.Sequential(
            DepthwiseSeparableConv(stage1_channels, stage2_channels, stride=2, expand_ratio=2.0),
            DepthwiseSeparableConv(stage2_channels, stage2_channels, stride=1, expand_ratio=2.0)
        )

        # Stage 3: H/8 -> H/16 with MobileViT Hybrid CNN-Transformer Block
        self.downsample_stage3 = DepthwiseSeparableConv(stage2_channels, stage3_channels, stride=2, expand_ratio=2.0)
        self.stage3 = MobileViTBlock(
            in_channels=stage3_channels,
            out_channels=stage3_channels,
            embed_dim=embed_dim,
            transformer_depth=transformer_depth,
            num_heads=num_heads,
            mlp_ratio=mlp_ratio,
            dropout=dropout
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        feat1 = self.stem(x)                  # H/2,  C=stem_channels
        feat2 = self.stage1(feat1)             # H/4,  C=stage1_channels
        feat3 = self.stage2(feat2)             # H/8,  C=stage2_channels
        down = self.downsample_stage3(feat3)   # H/16, C=stage3_channels
        feat4 = self.stage3(down)              # H/16, C=stage3_channels
        return feat1, feat2, feat3, feat4

    def get_attention_maps(self) -> List[torch.Tensor]:
        """Returns the attention maps from all transformer blocks."""
        maps = []
        for blk in self.stage3.transformer_blocks:
            if blk.attn.last_attn_weights is not None:
                maps.append(blk.attn.last_attn_weights)
        return maps
