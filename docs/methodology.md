# Research Methodology: Lightweight Multi-Task Vision Transformer

This document details the architectural, optical, and machine learning methodology implemented in the **Lightweight Multi-Task Vision Transformer for Marine Debris and Microplastic Segmentation** system.

---

## 1. Problem Formulation & Dual-Scale Marine Pollution

Marine plastic waste spans orders of magnitude in size:
1. **Macro Debris (1 cm to >1 m)**: Plastic bottles, bags, ghost fishing gear, ropes, and wrappers floating in pelagic zones or resting on benthic substrates.
2. **Microplastics (< 5 mm down to 1 µm)**: Secondary breakdown fragments, synthetic textile fibres, expanded polystyrene foams, films, and manufactured industrial spheres/microbeads.

Conventional remote sensing and autonomous underwater systems deploy distinct models for macro-waste (e.g. heavy YOLO or Mask R-CNN variants) and microscopy classification (e.g. ViT or ResNet). This introduces prohibitive memory and latency overheads for low-power Autonomous Underwater Vehicles (AUVs) and Remotely Operated Vehicles (ROVs).

This system formulates a **single unified multi-task architecture** with a shared lightweight hybrid CNN + Vision Transformer encoder and two specialized decoders.

---

## 2. Underwater Image Preprocessing Pipeline

Underwater imagery suffers from rapid wavelength absorption, backscatter turbidity, and low dynamic range. We implement a physical 6-stage restoration pipeline before feature extraction:

1. **Resolution Standardization**: Resize to standard $256 \times 256$ input format.
2. **Edge-Preserving Denoising**: Bilateral filtering with diameter $d=7$, color $\sigma=35.0$, and space $\sigma=15.0$ suppresses marine snow and suspended particulates without blurring object boundaries.
3. **Chromatic White Balance**: Gray-World assumption restores neutral spectral balance from deep blue/green bias:
   $$\bar{I}_{\text{gray}} = \frac{\bar{I}_R + \bar{I}_G + \bar{I}_B}{3}, \quad k_c = \frac{\bar{I}_{\text{gray}}}{\bar{I}_c}$$
4. **Red Attenuation Compensation**: Red light ($650-700\text{ nm}$) attenuates within $3-5\text{ m}$ of water column. A wavelength restoration factor ($1.25\times$) amplifies the diminished red spectral band.
5. **Contrast Limited Adaptive Histogram Equalization (CLAHE)**: Conducted on the Luminance ($L$) channel in CIELAB color space with clip limit $2.5$ and tile grid size $(8, 8)$ to reveal submerged debris hidden in low-contrast ambient shadows.
6. **Zero-Mean Tensor Normalization**: ImageNet standardized scaling for deep learning inputs.

---

## 3. Shared CNN + Transformer Hybrid Encoder

Drawing inspiration from MobileViT, the shared encoder blends inductive spatial biases of convolutions with global contextual modeling of Vision Transformers:

- **CNN Stem**: $3\times3$ convolution with stride 2 reducing resolution to $H/2$, capturing low-level spatial edges and gradients.
- **Inverted Residual Stages**: Depthwise separable convolutions expand channels to 48 ($H/4$) and 80 ($H/8$) with minimal parameter overhead:
  $$\text{FLOPs}_{\text{DW}} = H \cdot W \cdot C_{\text{in}} \cdot K^2 + H \cdot W \cdot C_{\text{in}} \cdot C_{\text{out}}$$
- **Lightweight Transformer Blocks**: Stage 3 ($H/16$, 144 channels) projects spatial patches into 1D token sequences. Multi-Head Self-Attention with 4 heads and embedding dimension 144 computes long-range inter-pixel affinities.
- **Hierarchical Skip Outputs**: Produces multi-scale feature maps at $H/2, H/4, H/8, H/16$ for decoder skip-connections.

---

## 4. Task-Specific Heads

### Head A: Marine Debris Compact U-Net Decoder
- Sequentially upsamples deep transformer representations ($H/16$) back to full image resolution ($H$).
- Fuses lower-level skip connections via bilinear interpolation and depthwise-separable convolution blocks.
- Outputs 7-channel pixel logits: `background`, `bottle`, `plastic_bag`, `wrapper`, `fishing_net`, `rope`, `other_debris`.

### Head B: Microplastic Analysis Head
- **MODE A (Classification)**: Global Average Pooling + LayerNorm + Linear classifier with Dropout, predicting class probabilities across `fibre`, `fragment`, `film`, `foam`, `sphere`.
- **MODE B (Particle Sizing & Counting)**: Micro-scale mask decoder paired with 8-connectivity connected component labeling to extract physical particle size distributions ($<50\text{ µm}, 50-200\text{ µm}, 200-500\text{ µm}, >500\text{ µm}$).

---

## 5. Multi-Task Joint Loss Formulation

Training jointly optimizes dense spatial segmentation and sparse categorical classification:

$$\mathcal{L}_{\text{debris}} = 0.6 \cdot \mathcal{L}_{\text{Dice}} + 0.4 \cdot \mathcal{L}_{\text{CE}}$$

$$\mathcal{L}_{\text{microplastic}} = \mathcal{L}_{\text{CE}}$$

$$\mathcal{L}_{\text{total}} = \lambda_1 \mathcal{L}_{\text{debris}} + \lambda_2 \mathcal{L}_{\text{microplastic}}$$

Where $\lambda_1 = 1.0$ and $\lambda_2 = 0.5$ ensure gradient equilibrium between both task decoders.

---

## 6. Model Compression for Edge & AUV Deployment

- **Total Trainable Parameters**: 1,812,193 (~1.81M), achieving over $90\%$ parameter reduction compared to ViT-Base (86M) or ResNet-50 (25M).
- **ONNX Tracing**: Dynamic batch size export for cross-platform inference on AUV embedded microcomputers.
- **INT8 Dynamic Quantization**: Compresses FP32 weights ($6.59\text{ MB}$) to INT8 ($1.85\text{ MB}$), delivering a $72.0\%$ storage reduction and 2-3x memory bandwidth speedup on edge CPUs.
