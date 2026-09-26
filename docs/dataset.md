# Dataset Preparation & Ingestion Guide

This document describes data ingestion, annotation protocols, and integration instructions for the **Marine Debris and Microplastic Segmentation System**.

---

## 1. Directory Structure

Place raw imagery and ground truth masks in the following directory layout:

```
data/
├── marine_debris/
│   ├── images/
│   │   ├── train/     # e.g., debris_0001.jpg
│   │   ├── val/
│   │   └── test/
│   └── masks/         # Single-channel 8-bit PNG grayscale masks
│       ├── train/     # e.g., debris_0001.png (identical stem to image)
│       ├── val/
│       └── test/
│
└── microplastics/
    ├── images/        # High-magnification microscopy images (JPG/PNG)
    │   ├── train/
    │   ├── val/
    │   └── test/
    └── masks/         # Optional particle instance/class masks
        ├── train/
        ├── val/
        └── test/
```

---

## 2. Marine Debris Annotation Format

Segmentation masks must be single-channel grayscale PNG images where each pixel integer value corresponds to the class index:

| Class ID | Class Name | Recommended Color | Description |
| :--- | :--- | :--- | :--- |
| `0` | **background** | Black `(0, 0, 0)` | Seafloor, open water, rocks, marine flora |
| `1` | **bottle** | Cyan `(0, 229, 255)` | Beverage containers, jars, canisters |
| `2` | **plastic_bag** | Magenta `(255, 64, 129)` | Shopping bags, food wrappers |
| `3` | **wrapper** | Yellow `(255, 234, 0)` | Thin multi-layer packaging |
| `4` | **fishing_net** | Orange-Red `(255, 87, 34)` | Monofilament, trawl netting |
| `5` | **rope** | Mint `(105, 240, 174)` | Braided lines, hawsers |
| `6` | **other_debris** | Violet `(179, 136, 255)` | Buckets, crates, unidentified plastics |

---

## 3. Microplastic Classification Categories

Under microscopy (optical brightfield, darkfield, fluorescence), microplastics are grouped into 5 categories:

| Class ID | Class Name | Color | Typical Morphological Features |
| :--- | :--- | :--- | :--- |
| `0` | **fibre** | Coral `(255, 82, 82)` | Elongated, slender filaments with uniform diameter |
| `1` | **fragment** | Blue `(68, 138, 255)` | Angular, irregular hard polymer shards |
| `2` | **film** | Amber `(255, 171, 0)` | Translucent, ultra-thin, flexible planar sheets |
| `3` | **foam** | Green `(0, 230, 118)` | Porous, cellular expanded polystyrene clusters |
| `4` | **sphere** | Neon `(224, 64, 251)` | Smooth spherical manufactured microbeads |

---

## 4. Synthetic Demonstrator Dataset

The system includes a procedural generator:
```bash
python -c "from ml.datasets.dataset import create_sample_dataset; create_sample_dataset('data', num_samples=32)"
```
This script populates `data/` with 32 paired underwater debris and microscopy samples for immediate testing without downloading external copyrighted datasets.
