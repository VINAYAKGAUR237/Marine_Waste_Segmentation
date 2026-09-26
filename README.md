# Lightweight Multi-Task Vision Transformer for Marine Debris and Microplastic Segmentation

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.14-EE4C2C.svg)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![ONNX](https://img.shields.io/badge/ONNX-INT8_Quantized-005CED.svg)](https://onnx.ai)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end AI-powered computer vision system designed to identify marine pollution at two distinct physical scales—**large visible macro debris** and **microscopic plastic particles**—using a single shared lightweight hybrid CNN + Vision Transformer encoder. Engineered specifically for edge deployment on low-power Autonomous Underwater Vehicles (AUVs), Remotely Operated Vehicles (ROVs), and coastal monitoring stations.

---

## 1. System Architecture

```mermaid
flowchart TD
    Raw["Raw Image Input (AUV/ROV or Microscope)"] --> Preproc["Underwater Optical Preprocessing"]
    
    subgraph Preprocessing ["6-Stage Optical Enhancement"]
        Preproc --> Denoise["Bilateral Edge-Preserving Denoising"]
        Denoise --> WB["Gray-World Chromatic White Balance"]
        WB --> CC["Red Attenuation Compensation (1.25x Gain)"]
        CC --> CLAHE["CIELAB CLAHE Contrast Enhancement"]
        CLAHE --> Norm["Tensor Normalization"]
    end
    
    Norm --> Encoder["Shared Lightweight CNN + ViT Encoder (1.81M params)"]
    
    subgraph SharedEncoder ["Shared Hybrid Backbone"]
        Encoder --> Stem["Conv Stem (Stride 2) -> (32, 128, 128)"]
        Stem --> InvRes["Inverted Residual DW Convs -> (48, 64, 64) & (80, 32, 32)"]
        InvRes --> MobileViT["MobileViT Block: 4x Transformer Layers (4 Heads, 144 Dim)"]
        MobileViT --> MultiScale["Multi-Scale Skip Representations"]
    end
    
    MultiScale --> DebrisHead["Task Head 1: Compact U-Net Decoder"]
    MultiScale --> MicroHead["Task Head 2: Microplastic Dual-Mode Head"]
    
    subgraph TaskDecoders ["Task Outputs"]
        DebrisHead --> DebrisMask["7-Class Pixel Segmentation Mask & Overlay"]
        DebrisHead --> DebrisArea["Debris Coverage % & Bounding Boxes"]
        MicroHead --> MicroCls["5-Class Categorization (Fibre, Fragment, Film, Foam, Sphere)"]
        MicroHead --> MicroCount["Particle Morphology & Sizing Histogram"]
    end
    
    DebrisMask --> Dashboard["React 18 Results Dashboard & XAI Heatmap"]
    DebrisArea --> Dashboard
    MicroCls --> Dashboard
    MicroCount --> Dashboard
```

---

## 2. Technology Stack

- **Deep Learning**: PyTorch 2.14 (with Apple Silicon MPS GPU acceleration), torchvision, Albumentations, ONNX Runtime, ONNXScript.
- **Computer Vision**: OpenCV (Bilateral Filtering, Gray-World, CIELAB CLAHE, Connected Components morphology).
- **Backend API**: Python 3.14, FastAPI, Uvicorn, Pydantic.
- **Frontend Dashboard**: React 18, Vite 5, Tailwind CSS, Lucide React, Recharts.
- **Model Quantization**: Dynamic INT8 quantization delivering 72% model size compression.

---

## 3. Project Directory Structure

```
gallant-carson/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application & middleware
│   │   ├── config.py                  # Model hyperparameters, classes & settings
│   │   ├── models/
│   │   │   ├── lightweight_vit.py     # Master Multi-Task ViT architecture
│   │   │   ├── encoder.py             # Shared CNN + MobileViT hybrid encoder
│   │   │   ├── marine_debris_head.py  # Compact U-Net segmentation decoder
│   │   │   └── microplastic_head.py   # Classification & particle morphology head
│   │   ├── preprocessing/
│   │   │   └── underwater_preprocessor.py # 6-stage optical enhancement pipeline
│   │   ├── inference/
│   │   │   └── engine.py              # Inference runner with Demo Mode separation
│   │   ├── routes/
│   │   │   ├── prediction.py          # /predict, /analyze, /batch-predict, /explain
│   │   │   ├── preprocessing.py       # /preprocess (interactive enhancement)
│   │   │   └── health.py              # /health, /model-info, /classes, /export
│   │   └── utils/
│   │       └── image_utils.py         # Mask overlays, base64 conversion & XAI
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Navbar, Sidebar, ImageCompareSlider, StatCard
│   │   ├── pages/                     # 8 Dedicated Views (Dashboard, Analysis, Debris, etc.)
│   │   ├── services/api.js            # FastAPI client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── ml/
│   ├── datasets/dataset.py            # PyTorch Dataset & procedural sample generator
│   ├── augmentation/augmentation.py   # Albumentations with underwater turbidity
│   ├── training/
│   │   ├── train_multitask.py         # AdamW multi-task training loop
│   │   └── losses.py                  # Dice + Cross-Entropy composite loss
│   ├── evaluation/
│   │   └── evaluate.py                # Evaluation suite & comparison table
│   ├── export/
│   │   └── export_model.py            # ONNX export & INT8 dynamic quantization
│   └── checkpoints/                   # Saved .pt checkpoints & .onnx graphs
│
├── data/                              # Datasets (marine_debris & microplastics)
├── docs/
│   ├── architecture.md                # Layer-by-layer parameter mapping
│   ├── methodology.md                 # Mathematical derivations & optical theory
│   └── dataset.md                     # Data ingestion and format guide
└── README.md
```

---

## 4. Key Features

1. **Shared Lightweight Hybrid Encoder**:
   - Only **1.81 Million parameters** (6.93 MB FP32), eliminating redundant dual-backbone memory footprint.
   - Combines depthwise separable convolutions (local spatial texture) with lightweight Vision Transformer self-attention (global context).
2. **Dual-Scale Marine Pollution Heads**:
   - **Marine Debris (Macro)**: Compact U-Net decoder with multi-scale skip connections segmenting 7 classes (`bottle`, `plastic_bag`, `wrapper`, `fishing_net`, `rope`, `other_debris`).
   - **Microplastics (Micro)**: Dual-mode head supporting fast classification across 5 types (`fibre`, `fragment`, `film`, `foam`, `sphere`) or morphological particle counting.
3. **Underwater Optical Restoration Pipeline**:
   - Bilateral denoising, Gray-World chromatic white balancing, red light attenuation compensation, and CIELAB CLAHE.
4. **Explainable AI (XAI)**:
   - Transformer attention weight extraction projected into spatial heatmaps overlaid on the original image.
5. **Edge Compression (ONNX & INT8)**:
   - Dynamic INT8 quantization compresses the graph down to **1.85 MB** (72% reduction) for subsea microcontrollers.
6. **Honest Scientific Evaluation**:
   - Strictly reports real empirical metrics for evaluated models and labels untrained baselines as `"Not evaluated yet"`.
7. **Offline Demo Mode Support**:
   - Distinct `DEMO_MODE` flag allowing immediate demonstration with clearly marked `"DEMO / SAMPLE OUTPUT"` badges.

---

## 5. Quickstart Installation & Setup

### Prerequisites
- Python 3.10 - 3.14
- Node.js >= 18 and npm

### 1. Backend Setup
```bash
# Navigate to project root
cd /Users/anilkumar/Documents/antigravity/gallant-carson

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
python backend/run.py
# Backend runs at http://127.0.0.1:8000 (Swagger docs at http://127.0.0.1:8000/docs)
```

### 2. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
# Frontend runs at http://127.0.0.1:5173
```

---

## 6. Training & Evaluation Commands

### Generate Demonstration Dataset
```bash
python -c "from ml.datasets.dataset import create_sample_dataset; create_sample_dataset('data', num_samples=32)"
```

### Multi-Task Model Training
```bash
python ml/training/train_multitask.py --epochs 10 --batch_size 4 --lr 0.0001
```

### Evaluation & Metrics Generation
```bash
python ml/evaluation/evaluate.py --checkpoint ml/checkpoints/best_multitask_vit.pt
```

### ONNX Export & INT8 Quantization
```bash
python ml/export/export_model.py --format onnx --quantize
```

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Hardware telemetry, device type, and demo mode status |
| `GET` | `/model-info` | Parameter count, memory footprint, and evaluation metrics |
| `GET` | `/classes` | Marine debris and microplastic taxonomy and color palettes |
| `POST` | `/predict` | Single image analysis returning masks, confidence, and overlay |
| `POST` | `/analyze` | Comprehensive telemetry with particle morphology and histograms |
| `POST` | `/preprocess`| Interactive CLAHE and optical enhancement before/after preview |
| `POST` | `/batch-predict` | Batch processing for multiple image files |
| `POST` | `/explain` | Transformer attention visualization heatmap (XAI) |
| `POST` | `/export` | Trigger ONNX export and INT8 quantization |
| `POST` | `/feedback` | User correction logging for active learning loop |

---

## 8. Limitations & Future Scope

### Current Limitations
- Preprocessing gains are statically tuned for temperate coastal waters; deep-ocean oceanic waters may require dynamic wavelength absorption tuning.
- Extreme turbidity with high backscatter can still occlude microscopic particle boundaries.

### Planned Future Extensions
- **AUV Video Stream Integration**: Real-time GStreamer/RTSP subsea camera ingestion.
- **GPS-Based Pollution Heatmapping**: Geo-spatial database integration for oceanographic mapping.
- **Multispectral / FLIM Imaging**: Optical spectroscopy fusion for polymer chemical identification.
- **Federated Edge Learning**: Swarm training across multiple autonomous AUV units.
