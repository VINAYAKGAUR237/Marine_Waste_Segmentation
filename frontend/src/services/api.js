/**
 * API client communicating with FastAPI backend.
 * Points directly to FastAPI backend on port 8000 with CORS support.
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to reach backend health endpoint');
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}

export async function fetchClasses() {
  const res = await fetch(`${API_BASE}/classes`);
  if (!res.ok) throw new Error('Failed to fetch class categories');
  return res.json();
}

export async function predictImage(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task', options.task || 'all');
  formData.append('enhance', options.enhance ?? true);
  if (options.clipLimit !== undefined) formData.append('clip_limit', options.clipLimit);
  if (options.denoiseStrength !== undefined) formData.append('denoise_strength', options.denoiseStrength);

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function analyzeImage(file, enhance = true) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enhance', enhance);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function preprocessImage(file, params = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (params.clipLimit !== undefined) formData.append('clip_limit', params.clipLimit);
  if (params.denoiseStrength !== undefined) formData.append('denoise_strength', params.denoiseStrength);
  if (params.redGain !== undefined) formData.append('red_gain', params.redGain);

  const res = await fetch(`${API_BASE}/preprocess`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Preprocessing failed' }));
    throw new Error(err.detail || 'Preprocessing failed');
  }
  return res.json();
}

export async function explainImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Explainability failed' }));
    throw new Error(err.detail || 'Explainability failed');
  }
  return res.json();
}

export async function toggleDemoMode(enabled) {
  const formData = new FormData();
  formData.append('enabled', enabled);
  const res = await fetch(`${API_BASE}/toggle-demo`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function exportModel(format = 'onnx', quantize = true) {
  const formData = new FormData();
  formData.append('format', format);
  formData.append('quantize', quantize);
  const res = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Export request failed');
  return res.json();
}

export async function submitFeedback(payload) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
