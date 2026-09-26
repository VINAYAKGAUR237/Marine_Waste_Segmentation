"""Multi-Task Training Pipeline for Marine Debris and Microplastic Analysis.
Trains the unified Lightweight Multi-Task Vision Transformer using AdamW and multi-task loss.
"""

import os
import sys
import time
import argparse
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

import torch
from torch.utils.data import DataLoader

from backend.app.config import model_config, training_config, CHECKPOINT_DIR
from backend.app.models.lightweight_vit import LightweightMultiTaskViT
from ml.datasets.dataset import get_dataloaders, create_sample_dataset
from ml.training.losses import MultiTaskLoss


def train_one_epoch(
    model: torch.nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    loss_fn: MultiTaskLoss,
    device: str
) -> dict:
    model.train()
    total_loss = 0.0
    debris_loss = 0.0
    micro_loss = 0.0
    num_batches = len(loader)

    for batch in loader:
        images = batch["image"].to(device)
        debris_masks = batch["debris_mask"].to(device)
        micro_labels = batch["microplastic_label"].to(device)

        optimizer.zero_grad()
        preds = model(images, task="all")

        targets = {
            "debris_mask": debris_masks,
            "microplastic_label": micro_labels
        }

        losses = loss_fn(preds, targets)
        loss = losses["total_loss"]
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()
        debris_loss += losses.get("debris_total", torch.tensor(0.0)).item()
        micro_loss += losses.get("microplastic_cls", torch.tensor(0.0)).item()

    return {
        "total_loss": total_loss / max(num_batches, 1),
        "debris_loss": debris_loss / max(num_batches, 1),
        "micro_loss": micro_loss / max(num_batches, 1)
    }


def validate(
    model: torch.nn.Module,
    loader: DataLoader,
    loss_fn: MultiTaskLoss,
    device: str
) -> dict:
    model.eval()
    total_loss = 0.0
    debris_loss = 0.0
    micro_loss = 0.0
    correct_micro = 0
    total_micro = 0
    num_batches = len(loader)

    with torch.no_grad():
        for batch in loader:
            images = batch["image"].to(device)
            debris_masks = batch["debris_mask"].to(device)
            micro_labels = batch["microplastic_label"].to(device)

            preds = model(images, task="all")
            targets = {
                "debris_mask": debris_masks,
                "microplastic_label": micro_labels
            }

            losses = loss_fn(preds, targets)
            total_loss += losses["total_loss"].item()
            debris_loss += losses.get("debris_total", torch.tensor(0.0)).item()
            micro_loss += losses.get("microplastic_cls", torch.tensor(0.0)).item()

            if "microplastic_cls" in preds:
                predicted_cls = preds["microplastic_cls"].argmax(dim=1)
                correct_micro += (predicted_cls == micro_labels).sum().item()
                total_micro += micro_labels.size(0)

    micro_acc = (correct_micro / total_micro) if total_micro > 0 else 0.0
    return {
        "val_total_loss": total_loss / max(num_batches, 1),
        "val_debris_loss": debris_loss / max(num_batches, 1),
        "val_micro_loss": micro_loss / max(num_batches, 1),
        "val_micro_accuracy": micro_acc
    }


def train_pipeline(
    epochs: int = 10,
    batch_size: int = 8,
    lr: float = 0.0001,
    weight_decay: float = 0.01,
    lambda_debris: float = 1.0,
    lambda_microplastic: float = 0.5,
    save_dir: str = str(CHECKPOINT_DIR)
):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting Multi-Task Training on device: {device}")

    # Ensure dataset exists
    data_path = BASE_DIR / "data"
    if not (data_path / "marine_debris" / "images" / "train").exists():
        print("Data directory empty, generating sample dataset...")
        create_sample_dataset(str(data_path), num_samples=32)

    train_loader, val_loader, _ = get_dataloaders(
        data_dir=str(data_path),
        batch_size=batch_size,
        image_size=model_config.image_size
    )

    model = LightweightMultiTaskViT(model_config).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    loss_fn = MultiTaskLoss(lambda_debris=lambda_debris, lambda_microplastic=lambda_microplastic)

    best_val_loss = float("inf")
    history = []
    os.makedirs(save_dir, exist_ok=True)
    best_ckpt_path = os.path.join(save_dir, "best_multitask_vit.pt")

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        train_metrics = train_one_epoch(model, train_loader, optimizer, loss_fn, device)
        val_metrics = validate(model, val_loader, loss_fn, device)
        scheduler.step()
        epoch_time = time.time() - t0

        row = {
            "epoch": epoch,
            **train_metrics,
            **val_metrics,
            "lr": optimizer.param_groups[0]["lr"],
            "time_sec": round(epoch_time, 2)
        }
        history.append(row)

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {train_metrics['total_loss']:.4f} (Debris: {train_metrics['debris_loss']:.4f}, Micro: {train_metrics['micro_loss']:.4f}) | "
            f"Val Loss: {val_metrics['val_total_loss']:.4f} | "
            f"Micro Acc: {val_metrics['val_micro_accuracy']*100:.1f}% | "
            f"Time: {epoch_time:.1f}s"
        )

        if val_metrics["val_total_loss"] < best_val_loss:
            best_val_loss = val_metrics["val_total_loss"]
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": best_val_loss,
                "config": model_config.model_dump()
            }, best_ckpt_path)
            print(f" -> Best checkpoint saved to: {best_ckpt_path}")

    # Also save latest checkpoint
    latest_ckpt_path = os.path.join(save_dir, "latest.pt")
    torch.save({
        "epoch": epochs,
        "model_state_dict": model.state_dict(),
        "history": history
    }, latest_ckpt_path)
    print(f"Training completed successfully. Artifacts saved in {save_dir}")
    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-Task Training Script")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.0001, help="Learning rate")
    parser.add_argument("--weight_decay", type=float, default=0.01, help="Weight decay")
    parser.add_argument("--lambda_debris", type=float, default=1.0, help="Debris loss weight")
    parser.add_argument("--lambda_microplastic", type=float, default=0.5, help="Microplastic loss weight")
    args = parser.parse_args()

    train_pipeline(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        weight_decay=args.weight_decay,
        lambda_debris=args.lambda_debris,
        lambda_microplastic=args.lambda_microplastic
    )
