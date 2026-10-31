"""Production Training Script for Marine Waste & Underwater Debris Segmentation
Trains Lightweight Multi-Task Vision Transformer on:
1. TrashCan 1.0 (mexwell/trashcan-1-0) - 7,212 instances with polygon segmentations
2. Underwater Trash Detection (karanwxlia/underwater-trash-detection) - 9,500+ images with box annotations
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

import cv2
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, ConcatDataset
import albumentations as A
from albumentations.pytorch import ToTensorV2

from backend.app.config import (
    model_config,
    CHECKPOINT_DIR,
    DEBRIS_CLASSES
)
from backend.app.models.lightweight_vit import LightweightMultiTaskViT

# Mapping TrashCan 1.0 instance classes -> Unified 7-class taxonomy
# 0: background, 1: bottle, 2: plastic_bag, 3: wrapper, 4: fishing_net, 5: rope, 6: other_debris
TRASHCAN_CLASS_MAP = {
    "rov": 0,
    "plant": 0,
    "animal_fish": 0,
    "animal_starfish": 0,
    "animal_shells": 0,
    "animal_crab": 0,
    "animal_eel": 0,
    "animal_etc": 0,
    "trash_branch": 0,
    "trash_bottle": 1,
    "trash_bag": 2,
    "trash_snack_wrapper": 3,
    "trash_cup": 3,
    "trash_container": 3,
    "trash_net": 4,
    "trash_rope": 5,
    "trash_clothing": 6,
    "trash_pipe": 6,
    "trash_can": 6,
    "trash_unknown_instance": 6,
    "trash_wreckage": 6,
    "trash_tarp": 6,
}

# Mapping Underwater Trash Detection (UTD) classes -> Unified 7-class taxonomy
UTD_CLASS_MAP = {
    "trash": 6,
    "Trash": 6,
    "Bio": 0,
    "Rov": 0,
}


def get_transforms(image_size: int = 256, is_train: bool = True):
    if is_train:
        return A.Compose([
            A.Resize(image_size, image_size),
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.4),
            A.ShiftScaleRotate(shift_limit=0.06, scale_limit=0.1, rotate_limit=15, p=0.4),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])
    else:
        return A.Compose([
            A.Resize(image_size, image_size),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])


class TrashCanCOCODataset(Dataset):
    """Loads TrashCan 1.0 dataset with exact polygon segmentation masks."""
    def __init__(self, root_dir: str, split: str = "train", transform=None, max_samples: Optional[int] = None):
        self.root_dir = Path(root_dir)
        self.img_dir = self.root_dir / split
        self.transform = transform
        
        json_file = self.root_dir / f"instances_{split}_trashcan.json"
        if not json_file.exists():
            raise FileNotFoundError(f"Annotation file not found: {json_file}")
            
        with open(json_file, "r") as f:
            coco_data = json.load(f)
            
        cat_id_to_target = {}
        for cat in coco_data["categories"]:
            name = cat["name"]
            cat_id_to_target[cat["id"]] = TRASHCAN_CLASS_MAP.get(name, 6)
            
        self.images = coco_data["images"]
        if max_samples and max_samples < len(self.images):
            self.images = self.images[:max_samples]
            
        self.annotations = {}
        for ann in coco_data["annotations"]:
            img_id = ann["image_id"]
            if img_id not in self.annotations:
                self.annotations[img_id] = []
            target_class = cat_id_to_target.get(ann["category_id"], 0)
            self.annotations[img_id].append((ann.get("segmentation", []), target_class))

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        img_info = self.images[idx]
        img_path = self.img_dir / img_info["file_name"]
        
        image = cv2.imread(str(img_path))
        if image is None:
            image = np.zeros((256, 256, 3), dtype=np.uint8)
        else:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
        h, w = image.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        
        anns = self.annotations.get(img_info["id"], [])
        for seg_list, cls_id in anns:
            if cls_id == 0:
                continue
            for seg in seg_list:
                if len(seg) >= 6:
                    poly = np.array(seg, dtype=np.int32).reshape(-1, 1, 2)
                    cv2.fillPoly(mask, [poly], color=int(cls_id))
                    
        if self.transform:
            augmented = self.transform(image=image, mask=mask)
            image_tensor = augmented["image"]
            mask_tensor = augmented["mask"].long()
        else:
            image_tensor = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
            mask_tensor = torch.from_numpy(mask).long()
            
        return image_tensor, mask_tensor


class UTDCOCODataset(Dataset):
    """Loads Underwater Trash Detection (UTD) dataset with bbox annotations converted to region masks."""
    def __init__(self, root_dir: str, split: str = "train", transform=None, max_samples: Optional[int] = None):
        self.root_dir = Path(root_dir)
        self.split_dir = self.root_dir / split
        self.transform = transform
        
        json_file = self.split_dir / "_annotations.coco.json"
        if not json_file.exists():
            raise FileNotFoundError(f"Annotation file not found: {json_file}")
            
        with open(json_file, "r") as f:
            coco_data = json.load(f)
            
        cat_id_to_target = {}
        for cat in coco_data["categories"]:
            name = cat["name"]
            cat_id_to_target[cat["id"]] = UTD_CLASS_MAP.get(name, 6)
            
        self.images = coco_data["images"]
        if max_samples and max_samples < len(self.images):
            self.images = self.images[:max_samples]
            
        self.annotations = {}
        for ann in coco_data["annotations"]:
            img_id = ann["image_id"]
            if img_id not in self.annotations:
                self.annotations[img_id] = []
            target_class = cat_id_to_target.get(ann["category_id"], 0)
            self.annotations[img_id].append((ann.get("bbox", []), target_class))

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        img_info = self.images[idx]
        img_path = self.split_dir / img_info["file_name"]
        
        image = cv2.imread(str(img_path))
        if image is None:
            image = np.zeros((256, 256, 3), dtype=np.uint8)
        else:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
        h, w = image.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        
        anns = self.annotations.get(img_info["id"], [])
        for bbox, cls_id in anns:
            if cls_id == 0 or len(bbox) < 4:
                continue
            x, y, bw, bh = [int(v) for v in bbox]
            cv2.rectangle(mask, (x, y), (x + bw, y + bh), color=int(cls_id), thickness=-1)
            
        if self.transform:
            augmented = self.transform(image=image, mask=mask)
            image_tensor = augmented["image"]
            mask_tensor = augmented["mask"].long()
        else:
            image_tensor = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
            mask_tensor = torch.from_numpy(mask).long()
            
        return image_tensor, mask_tensor


class CombinedSegmentationLoss(nn.Module):
    """Combines Cross Entropy with multi-class Dice loss, with class weighting to penalize background dominance."""
    def __init__(self, num_classes: int = 7, ce_weight: float = 0.5, dice_weight: float = 0.5):
        super().__init__()
        self.num_classes = num_classes
        self.ce_weight = ce_weight
        self.dice_weight = dice_weight
        
        # Give higher weight to debris classes (1..6) and lower to background (0)
        weights = torch.tensor([0.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.0], dtype=torch.float)
        self.register_buffer("weights", weights)
        self.ce_loss = nn.CrossEntropyLoss(weight=self.weights)

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        # Cross entropy loss
        loss_ce = self.ce_loss(logits, targets)
        
        # Multi-class Dice loss
        probs = torch.softmax(logits, dim=1)
        targets_one_hot = torch.zeros_like(probs).scatter_(1, targets.unsqueeze(1), 1.0)
        
        smooth = 1e-5
        intersection = torch.sum(probs * targets_one_hot, dim=(2, 3))
        union = torch.sum(probs + targets_one_hot, dim=(2, 3))
        dice = (2.0 * intersection + smooth) / (union + smooth)
        loss_dice = 1.0 - torch.mean(dice[:, 1:])  # exclude background from dice optimization
        
        return self.ce_weight * loss_ce + self.dice_weight * loss_dice


def compute_metrics(logits: torch.Tensor, targets: torch.Tensor, num_classes: int = 7) -> Dict[str, float]:
    """Computes mean IoU, debris-only IoU, and per-class IoU."""
    preds = torch.argmax(logits, dim=1).cpu().numpy()
    targs = targets.cpu().numpy()
    
    ious = []
    debris_ious = []
    
    for cls in range(num_classes):
        pred_c = (preds == cls)
        targ_c = (targs == cls)
        intersection = np.logical_and(pred_c, targ_c).sum()
        union = np.logical_or(pred_c, targ_c).sum()
        
        if union == 0:
            iou = 1.0  # correctly predicted empty class
        else:
            iou = intersection / union
            
        ious.append(iou)
        if cls > 0:
            debris_ious.append(iou)
            
    return {
        "mIoU": float(np.mean(ious)),
        "debris_mIoU": float(np.mean(debris_ious)),
        "pixel_acc": float((preds == targs).mean())
    }


def main():
    parser = argparse.ArgumentParser(description="Train Marine Debris Multi-Task ViT on TrashCan 1.0 and UTD")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_train_samples", type=int, default=None, help="Cap training samples (optional)")
    parser.add_argument("--max_val_samples", type=int, default=None, help="Cap validation samples (optional)")
    parser.add_argument("--num_workers", type=int, default=0, help="DataLoader worker count")
    parser.add_argument("--resume", action="store_true", help="Resume from existing best_multitask_vit.pt checkpoint")
    args = parser.parse_args()

    # Paths
    trashcan_root = "/Users/anilkumar/.cache/kagglehub/datasets/mexwell/trashcan-1-0/versions/1/dataset/instance_version"
    utd_root = "/Users/anilkumar/.cache/kagglehub/datasets/karanwxlia/underwater-trash-detection/versions/1/utd2.v8i.coco"

    print("=" * 80)
    print("  LIGHTWEIGHT MULTI-TASK VISION TRANSFORMER: PRODUCTION TRAINING PIPELINE")
    print("  Datasets: 1) TrashCan 1.0 (Instance Polygons)  2) Underwater Trash Detection (UTD)")
    print("=" * 80)

    # Device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Using Apple Silicon GPU Acceleration (MPS)")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print("Using NVIDIA CUDA GPU Acceleration")
    else:
        device = torch.device("cpu")
        print("Using CPU")

    # Build datasets
    train_tf = get_transforms(image_size=model_config.image_size, is_train=True)
    val_tf = get_transforms(image_size=model_config.image_size, is_train=False)

    print("\nLoading datasets...")
    tc_train = TrashCanCOCODataset(trashcan_root, split="train", transform=train_tf, max_samples=args.max_train_samples)
    tc_val = TrashCanCOCODataset(trashcan_root, split="val", transform=val_tf, max_samples=args.max_val_samples)
    print(f" -> TrashCan 1.0: {len(tc_train)} train, {len(tc_val)} val")

    utd_train = UTDCOCODataset(utd_root, split="train", transform=train_tf, max_samples=args.max_train_samples)
    utd_val = UTDCOCODataset(utd_root, split="valid", transform=val_tf, max_samples=args.max_val_samples)
    print(f" -> Underwater Trash Detection (UTD): {len(utd_train)} train, {len(utd_val)} val")

    train_dataset = ConcatDataset([tc_train, utd_train])
    val_dataset = ConcatDataset([tc_val, utd_val])
    print(f" -> TOTAL Combined: {len(train_dataset)} training images, {len(val_dataset)} validation images")

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=True if device.type == "cuda" else False,
        drop_last=True
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=True if device.type == "cuda" else False
    )

    # Model
    print(f"\nInstantiating LightweightMultiTaskViT (Backbone: CNN + MiT-B0 ViT, Classes: {model_config.num_debris_classes})...")
    model = LightweightMultiTaskViT(model_config).to(device)
    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Model trainable parameters: {param_count:,} ({param_count/1e6:.2f}M)")

    checkpoint_path = CHECKPOINT_DIR / "best_multitask_vit.pt"
    latest_path = CHECKPOINT_DIR / "latest.pt"
    best_debris_miou = 0.0
    history = []

    if args.resume:
        resume_target = latest_path if latest_path.exists() else checkpoint_path
        if resume_target.exists():
            print(f"Loading checkpoint weights from: {resume_target}")
            ckpt = torch.load(resume_target, map_location=device)
            if "model_state_dict" in ckpt:
                model.load_state_dict(ckpt["model_state_dict"])
                print(f"Resumed model weights successfully from {resume_target.name}")
            else:
                model.load_state_dict(ckpt)

    # Loss & Optimizer
    criterion = CombinedSegmentationLoss(num_classes=model_config.num_debris_classes).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    # Training loop
    print("\nStarting Training Execution:")
    print("-" * 80)

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        model.train()
        train_loss = 0.0
        num_batches = len(train_loader)

        for step, (images, masks) in enumerate(train_loader):
            images = images.to(device)
            masks = masks.to(device)

            optimizer.zero_grad()
            outputs = model(images, task="debris")
            logits = outputs["debris_logits"]

            loss = criterion(logits, masks)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item()

            if (step + 1) % 25 == 0 or (step + 1) == num_batches:
                curr_loss = train_loss / (step + 1)
                lr = optimizer.param_groups[0]["lr"]
                print(f" Epoch [{epoch:02d}/{args.epochs:02d}] Batch [{step+1:04d}/{num_batches:04d}] - Loss: {curr_loss:.4f} - LR: {lr:.6f}")

        train_loss /= max(num_batches, 1)
        scheduler.step()

        # Validation
        model.eval()
        val_loss = 0.0
        val_mious = []
        val_debris_mious = []
        val_accs = []

        with torch.no_grad():
            for images, masks in val_loader:
                images = images.to(device)
                masks = masks.to(device)

                outputs = model(images, task="debris")
                logits = outputs["debris_logits"]
                loss = criterion(logits, masks)
                val_loss += loss.item()

                metrics = compute_metrics(logits, masks, num_classes=model_config.num_debris_classes)
                val_mious.append(metrics["mIoU"])
                val_debris_mious.append(metrics["debris_mIoU"])
                val_accs.append(metrics["pixel_acc"])

        val_loss /= max(len(val_loader), 1)
        avg_miou = float(np.mean(val_mious))
        avg_debris_miou = float(np.mean(val_debris_mious))
        avg_acc = float(np.mean(val_accs))
        elapsed = time.time() - t0

        print(f"\n>>> Epoch {epoch:02d}/{args.epochs:02d} Summary [{elapsed:.1f}s]:")
        print(f"    Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        print(f"    Validation mIoU: {avg_miou*100:.2f}% | Debris mIoU: {avg_debris_miou*100:.2f}% | Pixel Acc: {avg_acc*100:.2f}%")

        epoch_record = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_loss": round(val_loss, 4),
            "val_miou": round(avg_miou, 4),
            "val_debris_miou": round(avg_debris_miou, 4),
            "val_acc": round(avg_acc, 4),
            "time_sec": round(elapsed, 1)
        }
        history.append(epoch_record)

        # Save Best Checkpoint
        if avg_debris_miou > best_debris_miou:
            best_debris_miou = avg_debris_miou
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "debris_miou": best_debris_miou,
                "config": model_config.model_dump(),
                "taxonomy": DEBRIS_CLASSES
            }, str(checkpoint_path))
            print(f"    * New best model saved to: {checkpoint_path} (Debris mIoU: {best_debris_miou*100:.2f}%)")

        print("-" * 80)

    # Save latest checkpoint & history
    latest_path = CHECKPOINT_DIR / "latest.pt"
    torch.save({"epoch": args.epochs, "model_state_dict": model.state_dict(), "history": history}, str(latest_path))

    history_path = CHECKPOINT_DIR / "training_history.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    print("\n" + "=" * 80)
    print(f"  TRAINING COMPLETE! Best Debris mIoU: {best_debris_miou*100:.2f}%")
    print(f"  Model weights saved to: {checkpoint_path}")
    print(f"  Training history saved to: {history_path}")
    print("=" * 80)


if __name__ == "__main__":
    main()
