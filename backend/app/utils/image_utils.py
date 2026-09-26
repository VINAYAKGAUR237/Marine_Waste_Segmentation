"""Image utility functions for Base64 conversion, transparent mask overlays,
particle morphology analysis, and attention heatmap generation.
"""

import io
import cv2
import base64
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Tuple, Optional
from backend.app.config import DEBRIS_CLASSES, DEBRIS_COLORS, MICROPLASTIC_CLASSES, MICROPLASTIC_COLORS


def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    """Decodes raw uploaded image bytes into a BGR OpenCV NumPy array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image from uploaded bytes. Ensure valid JPG, PNG, or WEBP.")
    return image


def cv2_to_base64(image: np.ndarray, ext: str = "png") -> str:
    """Encodes an OpenCV image to a base64 Data URL string."""
    success, buffer = cv2.imencode(f".{ext}", image)
    if not success:
        raise ValueError("Failed to encode image to buffer.")
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/{ext};base64,{b64_str}"


def create_mask_overlay(
    image_bgr: np.ndarray,
    mask: np.ndarray,
    alpha: float = 0.55,
    colors: Optional[Dict[str, Tuple[int, int, int]]] = None,
    classes: Optional[Dict[int, str]] = None
) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
    """Blends class-colored segmentation masks over the original image with transparency.
    Returns:
        (colored_mask, blended_overlay, detected_objects_metadata)
    """
    colors_map = colors or DEBRIS_COLORS
    classes_map = classes or DEBRIS_CLASSES

    h, w = mask.shape
    resized_img = cv2.resize(image_bgr, (w, h))

    colored_mask = np.zeros((h, w, 3), dtype=np.uint8)
    detected_objects = []

    unique_classes = np.unique(mask)
    for class_id in unique_classes:
        if class_id == 0:  # Skip background
            continue

        class_name = classes_map.get(int(class_id), f"class_{class_id}")
        color = colors_map.get(class_name, (0, 255, 255))  # Default yellow

        binary_mask = (mask == class_id).astype(np.uint8)
        colored_mask[binary_mask == 1] = color

        # Compute bounding boxes and area
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        pixel_count = int(np.sum(binary_mask))
        area_pct = round((pixel_count / (h * w)) * 100.0, 2)

        boxes = []
        for cnt in contours:
            if cv2.contourArea(cnt) > 20:  # filter tiny noise specks
                x, y, bw, bh = cv2.boundingRect(cnt)
                boxes.append({"x": int(x), "y": int(y), "width": int(bw), "height": int(bh)})

        detected_objects.append({
            "class_id": int(class_id),
            "class_name": class_name,
            "color_rgb": list(color),
            "pixel_count": pixel_count,
            "area_percentage": area_pct,
            "bounding_boxes": boxes
        })

    # Transparent overlay blend: alpha * mask + (1 - alpha) * image
    mask_pixels = np.any(colored_mask > 0, axis=-1)
    overlay = resized_img.copy()
    overlay[mask_pixels] = cv2.addWeighted(
        colored_mask, alpha, resized_img, 1.0 - alpha, 0
    )[mask_pixels]

    return colored_mask, overlay, detected_objects


def calculate_coverage_percentage(mask: np.ndarray) -> float:
    """Calculates non-background pixel percentage in the segmentation mask."""
    total_pixels = mask.size
    debris_pixels = np.sum(mask > 0)
    return round((debris_pixels / total_pixels) * 100.0, 2)


def analyze_microplastic_particles(
    mask: np.ndarray,
    classes: Optional[Dict[int, str]] = None
) -> Dict[str, Any]:
    """Performs connected-component morphological analysis for microscopic particle count and distribution."""
    classes_map = classes or MICROPLASTIC_CLASSES
    h, w = mask.shape
    total_pixels = h * w

    particles_by_class: Dict[str, int] = {name: 0 for name in classes_map.values()}
    size_histogram = {"<50um": 0, "50-200um": 0, "200-500um": 0, ">500um": 0}
    total_particles = 0
    total_area_pixels = 0

    unique_classes = np.unique(mask)
    for class_id in unique_classes:
        if class_id == 0:
            continue
        cls_name = classes_map.get(int(class_id) - 1, f"type_{class_id}")
        binary = (mask == class_id).astype(np.uint8)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)

        count = max(0, num_labels - 1)
        particles_by_class[cls_name] = particles_by_class.get(cls_name, 0) + count
        total_particles += count

        for stat in stats[1:]:
            area = stat[cv2.CC_STAT_AREA]
            total_area_pixels += area
            # Approximate particle diameter assuming circular/elliptical equivalence
            approx_dia = np.sqrt(area / np.pi) * 2
            if approx_dia < 10:
                size_histogram["<50um"] += 1
            elif approx_dia < 25:
                size_histogram["50-200um"] += 1
            elif approx_dia < 50:
                size_histogram["200-500um"] += 1
            else:
                size_histogram[">500um"] += 1

    area_pct = round((total_area_pixels / total_pixels) * 100.0, 2)

    return {
        "total_particles_detected": total_particles,
        "area_percentage": area_pct,
        "particle_count_by_class": particles_by_class,
        "size_distribution": size_histogram
    }


def generate_attention_heatmap(
    attention_map: np.ndarray,
    target_size: Tuple[int, int] = (256, 256),
    original_bgr: Optional[np.ndarray] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """Generates an Explainable AI (XAI) attention heatmap overlay from Transformer attention weights."""
    # Normalize attention map to 0 - 255
    att_norm = cv2.normalize(attention_map, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    att_resized = cv2.resize(att_norm, target_size, interpolation=cv2.INTER_CUBIC)

    # Apply Jet/Turbo colormap for thermal attention
    heatmap = cv2.applyColorMap(att_resized, cv2.COLORMAP_TURBO)

    if original_bgr is not None:
        resized_orig = cv2.resize(original_bgr, target_size)
        overlay = cv2.addWeighted(heatmap, 0.5, resized_orig, 0.5, 0)
    else:
        overlay = heatmap

    return heatmap, overlay
