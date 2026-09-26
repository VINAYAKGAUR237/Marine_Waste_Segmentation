"""Dataset loader and sample dataset generator for Marine Debris and Microplastic analysis."""

import os
import cv2
import numpy as np
import torch
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from typing import Dict, Any, Tuple, Optional, List

from ..augmentation.augmentation import get_training_augmentation, get_validation_augmentation
from backend.app.config import DEBRIS_CLASSES, MICROPLASTIC_CLASSES


class MarineMultiTaskDataset(Dataset):
    """Multi-task PyTorch dataset for marine debris segmentation & microplastic classification/segmentation."""
    def __init__(
        self,
        image_paths: List[str],
        debris_mask_paths: Optional[List[str]] = None,
        microplastic_labels: Optional[List[int]] = None,
        microplastic_mask_paths: Optional[List[str]] = None,
        transform=None,
        task: str = "all"
    ):
        self.image_paths = image_paths
        self.debris_mask_paths = debris_mask_paths or []
        self.microplastic_labels = microplastic_labels or []
        self.microplastic_mask_paths = microplastic_mask_paths or []
        self.transform = transform
        self.task = task

    def __len__(self) -> int:
        return len(self.image_paths)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        img_path = self.image_paths[idx]
        image = cv2.imread(img_path)
        if image is None:
            raise FileNotFoundError(f"Failed to read image at: {img_path}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Load debris mask if available
        debris_mask = None
        if idx < len(self.debris_mask_paths) and os.path.exists(self.debris_mask_paths[idx]):
            raw_mask = cv2.imread(self.debris_mask_paths[idx], cv2.IMREAD_GRAYSCALE)
            if raw_mask is not None:
                debris_mask = raw_mask

        # If mask is None, default to blank background
        if debris_mask is None:
            debris_mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.int64)

        # Microplastic label
        micro_label = 0
        if idx < len(self.microplastic_labels):
            micro_label = self.microplastic_labels[idx]

        # Apply Albumentations transform
        if self.transform:
            augmented = self.transform(image=image, mask=debris_mask)
            image_tensor = augmented["image"]
            mask_tensor = torch.as_tensor(augmented["mask"], dtype=torch.long)
        else:
            image_tensor = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
            mask_tensor = torch.from_numpy(debris_mask).long()

        return {
            "image": image_tensor,
            "debris_mask": mask_tensor,
            "microplastic_label": torch.tensor(micro_label, dtype=torch.long),
            "image_path": img_path
        }


def create_sample_dataset(output_dir: str, num_samples: int = 24) -> None:
    """Generates synthetic demonstrable underwater marine debris and microscopy microplastic images.
    Provides immediate local functionality for training, verification, and testing without requiring manual downloads.
    """
    out_path = Path(output_dir)
    debris_dir = out_path / "marine_debris"
    micro_dir = out_path / "microplastics"

    for split in ("train", "val", "test"):
        (debris_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (debris_dir / "masks" / split).mkdir(parents=True, exist_ok=True)
        (micro_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (micro_dir / "masks" / split).mkdir(parents=True, exist_ok=True)

    np.random.seed(42)

    for i in range(num_samples):
        split = "train" if i < int(num_samples * 0.7) else ("val" if i < int(num_samples * 0.85) else "test")
        
        # 1. Marine Debris Sample (Underwater ambient scene with plastic debris object)
        h, w = 256, 256
        underwater_bg = np.zeros((h, w, 3), dtype=np.uint8)
        # Deep blue-green gradient
        for y in range(h):
            underwater_bg[y, :, 0] = int(140 + 40 * (y / h))  # Blue
            underwater_bg[y, :, 1] = int(120 + 30 * (y / h))  # Green
            underwater_bg[y, :, 2] = int(30 + 15 * (y / h))   # Attenuated Red

        mask = np.zeros((h, w), dtype=np.uint8)
        # Place random debris objects (bottle, bag, wrapper, net, rope)
        class_id = (i % 6) + 1  # 1 to 6
        cx, cy = np.random.randint(60, 190), np.random.randint(60, 190)
        
        if class_id == 1:  # Bottle
            cv2.rectangle(underwater_bg, (cx - 20, cy - 45), (cx + 20, cy + 45), (200, 220, 240), -1)
            cv2.rectangle(mask, (cx - 20, cy - 45), (cx + 20, cy + 45), class_id, -1)
        elif class_id == 2:  # Plastic bag
            pts = np.array([[cx - 35, cy - 25], [cx + 30, cy - 30], [cx + 40, cy + 35], [cx - 25, cy + 40]], np.int32)
            cv2.fillPoly(underwater_bg, [pts], (210, 210, 210))
            cv2.fillPoly(mask, [pts], class_id)
        elif class_id == 3:  # Wrapper
            pts = np.array([[cx - 30, cy - 15], [cx + 25, cy - 20], [cx + 35, cy + 20], [cx - 20, cy + 25]], np.int32)
            cv2.fillPoly(underwater_bg, [pts], (180, 200, 160))
            cv2.fillPoly(mask, [pts], class_id)
        elif class_id == 4:  # Fishing net
            cv2.ellipse(underwater_bg, (cx, cy), (45, 30), 30, 0, 360, (190, 100, 70), -1)
            cv2.ellipse(mask, (cx, cy), (45, 30), 30, 0, 360, class_id, -1)
        elif class_id == 5:  # Rope
            pts = np.array([[cx - 50, cy - 40], [cx - 10, cy], [cx + 20, cy - 20], [cx + 50, cy + 30]], np.int32)
            cv2.polylines(underwater_bg, [pts], isClosed=False, color=(100, 240, 180), thickness=8)
            cv2.polylines(mask, [pts], isClosed=False, color=class_id, thickness=8)
        else:  # Other debris
            cv2.circle(underwater_bg, (cx, cy), 30, (180, 150, 220), -1)
            cv2.circle(mask, (cx, cy), 30, class_id, -1)

        # Save marine debris
        deb_img_file = debris_dir / "images" / split / f"debris_{i:04d}.jpg"
        deb_msk_file = debris_dir / "masks" / split / f"debris_{i:04d}.png"
        cv2.imwrite(str(deb_img_file), underwater_bg)
        cv2.imwrite(str(deb_msk_file), mask)

        # 2. Microplastic Microscopy Sample
        micro_bg = np.ones((h, w, 3), dtype=np.uint8) * 235  # Bright microscope field
        micro_mask = np.zeros((h, w), dtype=np.uint8)
        micro_class = i % 5  # 0 to 4: fibre, fragment, film, foam, sphere
        mcx, mcy = np.random.randint(80, 170), np.random.randint(80, 170)

        if micro_class == 0:  # Fibre (thin curved thread)
            curve = np.array([[mcx - 40, mcy - 30], [mcx - 10, mcy], [mcx + 20, mcy - 10], [mcx + 45, mcy + 35]], np.int32)
            cv2.polylines(micro_bg, [curve], isClosed=False, color=(220, 40, 40), thickness=3)
            cv2.polylines(micro_mask, [curve], isClosed=False, color=micro_class + 1, thickness=3)
        elif micro_class == 1:  # Fragment (irregular polygon)
            frag_pts = np.array([[mcx - 20, mcy - 15], [mcx + 15, mcy - 25], [mcx + 25, mcy + 10], [mcx - 10, mcy + 20]], np.int32)
            cv2.fillPoly(micro_bg, [frag_pts], (40, 100, 220))
            cv2.fillPoly(micro_mask, [frag_pts], micro_class + 1)
        elif micro_class == 2:  # Film (thin translucent sheet)
            film_pts = np.array([[mcx - 25, mcy - 20], [mcx + 30, mcy - 15], [mcx + 20, mcy + 25], [mcx - 30, mcy + 15]], np.int32)
            cv2.fillPoly(micro_bg, [film_pts], (230, 160, 20))
            cv2.fillPoly(micro_mask, [film_pts], micro_class + 1)
        elif micro_class == 3:  # Foam (cellular porous cluster)
            for dx, dy in [(-10, -10), (10, -5), (-5, 12), (12, 10)]:
                cv2.circle(micro_bg, (mcx + dx, mcy + dy), 12, (20, 180, 80), -1)
                cv2.circle(micro_mask, (mcx + dx, mcy + dy), 12, micro_class + 1, -1)
        else:  # Sphere (microbead)
            cv2.circle(micro_bg, (mcx, mcy), 18, (180, 40, 220), -1)
            cv2.circle(micro_mask, (mcx, mcy), 18, micro_class + 1, -1)

        # Save microplastic sample
        mic_img_file = micro_dir / "images" / split / f"micro_{i:04d}.jpg"
        mic_msk_file = micro_dir / "masks" / split / f"micro_{i:04d}.png"
        cv2.imwrite(str(mic_img_file), micro_bg)
        cv2.imwrite(str(mic_msk_file), micro_mask)

    print(f"Sample dataset initialized with {num_samples} samples across train/val/test splits.")


def get_dataloaders(
    data_dir: str,
    batch_size: int = 8,
    image_size: int = 256
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """Builds Train, Validation, and Test PyTorch DataLoaders."""
    p = Path(data_dir) / "marine_debris"
    train_imgs = sorted([str(f) for f in (p / "images" / "train").glob("*.jpg")])
    train_msks = sorted([str(f) for f in (p / "masks" / "train").glob("*.png")])

    val_imgs = sorted([str(f) for f in (p / "images" / "val").glob("*.jpg")])
    val_msks = sorted([str(f) for f in (p / "masks" / "val").glob("*.png")])

    test_imgs = sorted([str(f) for f in (p / "images" / "test").glob("*.jpg")])
    test_msks = sorted([str(f) for f in (p / "masks" / "test").glob("*.png")])

    train_ds = MarineMultiTaskDataset(
        image_paths=train_imgs,
        debris_mask_paths=train_msks,
        microplastic_labels=[i % 5 for i in range(len(train_imgs))],
        transform=get_training_augmentation(image_size)
    )
    val_ds = MarineMultiTaskDataset(
        image_paths=val_imgs,
        debris_mask_paths=val_msks,
        microplastic_labels=[i % 5 for i in range(len(val_imgs))],
        transform=get_validation_augmentation(image_size)
    )
    test_ds = MarineMultiTaskDataset(
        image_paths=test_imgs,
        debris_mask_paths=test_msks,
        microplastic_labels=[i % 5 for i in range(len(test_imgs))],
        transform=get_validation_augmentation(image_size)
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, drop_last=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, drop_last=False)

    return train_loader, val_loader, test_loader
