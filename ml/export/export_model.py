"""Model Export Module: Exports to ONNX and performs dynamic INT8 quantization."""

import os
import sys
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

import torch
from backend.app.config import model_config, CHECKPOINT_DIR
from backend.app.models.lightweight_vit import LightweightMultiTaskViT, create_model


class ModelWrapperForONNX(torch.nn.Module):
    """Wrapper that returns a tuple of outputs suitable for ONNX graph tracing."""
    def __init__(self, model: LightweightMultiTaskViT):
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor):
        out = self.model(x, task="all")
        return out["debris_logits"], out["microplastic_cls"]


def export_to_onnx(
    checkpoint_path: str,
    output_path: str,
    quantize: bool = False
) -> dict:
    device = "cpu"
    print(f"Loading PyTorch model for ONNX export...")
    model = create_model(checkpoint_path=checkpoint_path if os.path.exists(checkpoint_path) else None, device=device)
    model.eval()

    dummy_input = torch.randn(1, 3, model_config.image_size, model_config.image_size, device=device)
    wrapped_model = ModelWrapperForONNX(model)
    wrapped_model.eval()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    print(f"Exporting to ONNX at: {output_path}")

    # Standard TorchScript trace exporter
    torch.onnx.export(
        wrapped_model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["input_image"],
        output_names=["debris_segmentation_logits", "microplastic_classification_logits"],
        dynamic_axes={
            "input_image": {0: "batch_size"},
            "debris_segmentation_logits": {0: "batch_size"},
            "microplastic_classification_logits": {0: "batch_size"}
        },
        dynamo=False
    )

    original_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"ONNX Model exported successfully! Size: {original_size_mb:.2f} MB")

    quantized_size_mb = None
    quantized_path = None

    if quantize:
        try:
            from onnxruntime.quantization import quantize_dynamic, QuantType
            quantized_path = output_path.replace(".onnx", "_int8.onnx")
            quantize_dynamic(
                model_input=output_path,
                model_output=quantized_path,
                weight_type=QuantType.QInt8
            )
            if os.path.exists(quantized_path):
                quantized_size_mb = os.path.getsize(quantized_path) / (1024 * 1024)
                print(f"INT8 Quantized Model exported to: {quantized_path}! Size: {quantized_size_mb:.2f} MB")
                compression_pct = ((original_size_mb - quantized_size_mb) / original_size_mb) * 100
                print(f"Compression achieved: {compression_pct:.1f}%")
        except Exception as e:
            print(f"INT8 Quantization note: {e}")

    return {
        "format": "onnx",
        "onnx_path": output_path,
        "original_size_mb": round(original_size_mb, 2),
        "quantized_size_mb": round(quantized_size_mb, 2) if quantized_size_mb else None,
        "quantized_path": quantized_path
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Model Export Script")
    parser.add_argument("--format", type=str, default="onnx", choices=["onnx", "pt"], help="Export format")
    parser.add_argument("--checkpoint", type=str, default=str(CHECKPOINT_DIR / "best_multitask_vit.pt"))
    parser.add_argument("--output", type=str, default=str(CHECKPOINT_DIR / "multitask_vit.onnx"))
    parser.add_argument("--quantize", action="store_true", default=True, help="Perform INT8 dynamic quantization")
    args = parser.parse_args()

    if args.format == "onnx":
        export_to_onnx(args.checkpoint, args.output, quantize=args.quantize)
