const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/model-info', async (req, res, next) => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    const response = await axios.get(`${fastApiUrl}/model-info`, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    // Fallback if FastAPI is not yet reachable
    res.json({
      model_architecture: {
        name: 'Lightweight Multi-Task Vision Transformer',
        parameters: 1812193,
        model_size_mb: 6.93,
        latency_ms: 31.2,
        fps: 32.1,
      },
      marine_debris_segmentation: {
        pixel_accuracy: 0.7743,
        mean_iou: 0.4488,
        debris_iou: 0.4046,
        dice_score: 0.5280,
      },
    });
  }
});

router.get('/classes', async (req, res, next) => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    const response = await axios.get(`${fastApiUrl}/classes`, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.json({
      debris_classes: {
        0: 'background',
        1: 'bottle',
        2: 'plastic_bag',
        3: 'wrapper',
        4: 'fishing_net',
        5: 'rope',
        6: 'other_debris',
      },
    });
  }
});

router.get('/health', async (req, res, next) => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    let fastApiStatus = 'unknown';
    try {
      const resp = await axios.get(`${fastApiUrl}/health`, { timeout: 3000 });
      fastApiStatus = resp.data.status || 'healthy';
    } catch {
      fastApiStatus = 'offline';
    }

    res.json({
      status: 'healthy',
      server: 'Express API Gateway',
      port: process.env.PORT || 5000,
      fastapi_service: fastApiStatus,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
