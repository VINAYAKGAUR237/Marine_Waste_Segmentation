"""Loss Functions for Multi-Task Learning.
Implements:
1. Dice Loss (for class-imbalanced debris segmentation)
2. Cross Entropy Loss
3. Combined Segmentation Loss (Dice + CrossEntropy)
4. Multi-Task Unified Loss:
   L_total = lambda_1 * L_debris + lambda_2 * L_microplastic
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple, Optional


class DiceLoss(nn.Module):
    """Multi-class Dice Loss for segmentation masks."""
    def __init__(self, smooth: float = 1e-6, ignore_index: Optional[int] = None):
        super().__init__()
        self.smooth = smooth
        self.ignore_index = ignore_index

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            logits: (B, num_classes, H, W) raw unnormalized logits
            targets: (B, H, W) ground truth integer class labels
        """
        num_classes = logits.shape[1]
        probs = F.softmax(logits, dim=1)  # (B, C, H, W)

        # One-hot encode targets: (B, H, W) -> (B, C, H, W)
        targets_one_hot = F.one_hot(targets.clamp(0, num_classes - 1), num_classes=num_classes)
        targets_one_hot = targets_one_hot.permute(0, 3, 1, 2).float()

        dims = (0, 2, 3)
        intersection = torch.sum(probs * targets_one_hot, dims)
        cardinality = torch.sum(probs + targets_one_hot, dims)

        dice_score = (2.0 * intersection + self.smooth) / (cardinality + self.smooth)

        # Optionally skip background or ignore index
        if self.ignore_index is not None and 0 <= self.ignore_index < num_classes:
            dice_score = torch.cat([dice_score[:self.ignore_index], dice_score[self.ignore_index + 1:]])

        dice_loss = 1.0 - torch.mean(dice_score)
        return dice_loss


class CombinedSegmentationLoss(nn.Module):
    """Weighted sum of Dice Loss and Cross Entropy Loss for segmentation."""
    def __init__(self, dice_weight: float = 0.6, ce_weight: float = 0.4):
        super().__init__()
        self.dice_weight = dice_weight
        self.ce_weight = ce_weight
        self.dice_fn = DiceLoss()
        self.ce_fn = nn.CrossEntropyLoss()

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        dice_l = self.dice_fn(logits, targets)
        ce_l = self.ce_fn(logits, targets)
        total_seg = (self.dice_weight * dice_l) + (self.ce_weight * ce_l)
        return total_seg, dice_l, ce_l


class MultiTaskLoss(nn.Module):
    """Composite Multi-Task Loss balancing Marine Debris and Microplastic tasks."""
    def __init__(
        self,
        lambda_debris: float = 1.0,
        lambda_microplastic: float = 0.5,
        dice_weight: float = 0.6,
        ce_weight: float = 0.4
    ):
        super().__init__()
        self.lambda_debris = lambda_debris
        self.lambda_microplastic = lambda_microplastic
        self.seg_loss_fn = CombinedSegmentationLoss(dice_weight=dice_weight, ce_weight=ce_weight)
        self.micro_cls_fn = nn.CrossEntropyLoss()
        self.micro_seg_fn = CombinedSegmentationLoss(dice_weight=dice_weight, ce_weight=ce_weight)

    def forward(
        self,
        predictions: Dict[str, torch.Tensor],
        targets: Dict[str, torch.Tensor]
    ) -> Dict[str, torch.Tensor]:
        """
        Args:
            predictions:
                - 'debris_logits': (B, num_debris_classes, H, W)
                - 'microplastic_cls': (B, num_microplastic_classes)
                - 'microplastic_seg': (B, num_micro_classes, H, W) [optional]
            targets:
                - 'debris_mask': (B, H, W)
                - 'microplastic_label': (B,) [optional]
                - 'microplastic_mask': (B, H, W) [optional]
        """
        loss_dict: Dict[str, torch.Tensor] = {}
        total_loss = torch.tensor(0.0, device=next(iter(predictions.values())).device)

        # 1. Marine Debris Segmentation Loss
        if "debris_logits" in predictions and "debris_mask" in targets:
            seg_total, dice_l, ce_l = self.seg_loss_fn(
                predictions["debris_logits"],
                targets["debris_mask"]
            )
            loss_dict["debris_total"] = seg_total
            loss_dict["debris_dice"] = dice_l
            loss_dict["debris_ce"] = ce_l
            total_loss = total_loss + self.lambda_debris * seg_total

        # 2. Microplastic Classification Loss
        if "microplastic_cls" in predictions and "microplastic_label" in targets:
            cls_l = self.micro_cls_fn(
                predictions["microplastic_cls"],
                targets["microplastic_label"]
            )
            loss_dict["microplastic_cls"] = cls_l
            total_loss = total_loss + self.lambda_microplastic * cls_l

        # 3. Microplastic Segmentation Loss (if present)
        if "microplastic_seg" in predictions and "microplastic_mask" in targets:
            micro_seg, m_dice, m_ce = self.micro_seg_fn(
                predictions["microplastic_seg"],
                targets["microplastic_mask"]
            )
            loss_dict["microplastic_seg"] = micro_seg
            total_loss = total_loss + self.lambda_microplastic * micro_seg

        loss_dict["total_loss"] = total_loss
        return loss_dict
