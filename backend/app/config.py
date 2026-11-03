"""Configuration module for Lightweight Multi-Task Vision Transformer for Marine Debris and Microplastic Segmentation."""

import os
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, List, Tuple

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
ML_DIR = BASE_DIR / "ml"
DATA_DIR = BASE_DIR / "data"
CHECKPOINT_DIR = ML_DIR / "checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

class ModelConfig(BaseModel):
    """Configuration for the Lightweight Multi-Task Vision Transformer."""
    image_size: int = 256
    in_channels: int = 3
    
    # CNN Stem & Inverted Residual stages
    stem_channels: int = 32
    stage1_channels: int = 48
    stage2_channels: int = 80
    stage3_channels: int = 144
    
    # Transformer Encoder specifications
    embed_dim: int = 144
    depth: int = 4
    num_heads: int = 4
    mlp_ratio: float = 2.0
    dropout: float = 0.1
    attention_dropout: float = 0.1
    
    # Marine Debris Head (Segmentation)
    num_debris_classes: int = 7
    debris_decoder_channels: List[int] = [96, 64, 32, 16]
    
    # Microplastic Head (Classification or Segmentation)
    num_microplastic_classes: int = 5
    microplastic_mode: str = "classification"  # "classification" or "segmentation"
    microplastic_decoder_channels: List[int] = [64, 32, 16]


class PreprocessingConfig(BaseModel):
    """Configuration for the Underwater Image Preprocessing Pipeline."""
    target_size: Tuple[int, int] = (256, 256)
    denoise_strength: float = 10.0
    clahe_clip_limit: float = 2.5
    clahe_tile_grid_size: Tuple[int, int] = (8, 8)
    color_correction_red_gain: float = 1.25
    color_correction_blue_gain: float = 0.95
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225)


class TrainingConfig(BaseModel):
    """Configuration for Multi-Task Training."""
    learning_rate: float = 0.0001
    weight_decay: float = 0.01
    batch_size: int = 8
    epochs: int = 50
    lambda_debris: float = 1.0
    lambda_microplastic: float = 0.5
    dice_weight: float = 0.6
    ce_weight: float = 0.4
    early_stopping_patience: int = 10


# Class Definitions & Visual Palettes
DEBRIS_CLASSES: Dict[int, str] = {
    0: "background",
    1: "bottle",
    2: "plastic_bag",
    3: "wrapper",
    4: "fishing_net",
    5: "rope",
    6: "other_debris"
}

DEBRIS_COLORS: Dict[str, Tuple[int, int, int]] = {
    "background": (0, 0, 0),
    "bottle": (0, 229, 255),       # Cyan
    "plastic_bag": (255, 64, 129),   # Pink / Magenta
    "wrapper": (255, 234, 0),       # Bright Yellow
    "fishing_net": (255, 87, 34),   # Orange Red
    "rope": (105, 240, 174),        # Mint Green
    "other_debris": (179, 136, 255) # Light Purple
}

MICROPLASTIC_CLASSES: Dict[int, str] = {
    0: "fibre",
    1: "fragment",
    2: "film",
    3: "foam",
    4: "sphere"
}

MICROPLASTIC_COLORS: Dict[str, Tuple[int, int, int]] = {
    "fibre": (255, 82, 82),       # Coral Red
    "fragment": (68, 138, 255),   # Royal Blue
    "film": (255, 171, 0),        # Amber
    "foam": (0, 230, 118),        # Emerald Green
    "sphere": (224, 64, 251)      # Neon Violet
}

# Runtime Environment settings
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
DEMO_MODE_DEFAULT = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
CHECKPOINT_PATH = os.getenv(
    "CHECKPOINT_PATH",
    str(CHECKPOINT_DIR / "best_multitask_vit.pt")
)
YOLO_CHECKPOINT_PATH = os.getenv(
    "YOLO_CHECKPOINT_PATH",
    str(CHECKPOINT_DIR / "trashcan_yolov8n_seg.onnx")
)
ONNX_EXPORT_PATH = str(CHECKPOINT_DIR / "multitask_vit.onnx")

# Instantiated default configs
model_config = ModelConfig()
preprocessing_config = PreprocessingConfig()
training_config = TrainingConfig()
