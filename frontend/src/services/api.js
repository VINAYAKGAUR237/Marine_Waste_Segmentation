/**
 * API client communicating with Express + MongoDB backend on http://localhost:5000/api.
 * Includes JWT token storage and Bearer authentication headers.
 */

const API_BASE = '/api';

// Authentication Token Utilities
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('marine_jwt_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('marine_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('marine_jwt_token', token);
  if (user) localStorage.setItem('marine_user', JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('marine_jwt_token');
  localStorage.removeItem('marine_user');
}

export function isAuthenticated() {
  return Boolean(getToken());
}

function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication Endpoints
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  setAuth(data.token, data.user);
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  setAuth(data.token, data.user);
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(true),
  });
  if (!res.ok) return null;
  return res.json();
}

// Prediction & Analysis
export async function predictImage(fileOrUrl, options = {}) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isUrl = typeof fileOrUrl === 'string';
  let bodyJson = null;
  let bodyFormData = null;

  if (isUrl) {
    bodyJson = JSON.stringify({
      imageUrl: fileOrUrl,
      task: 'debris',
      enhance: options.enhance ? 'true' : 'false',
    });
  } else {
    bodyFormData = new FormData();
    bodyFormData.append('file', fileOrUrl);
    bodyFormData.append('task', 'debris');
    bodyFormData.append('enhance', options.enhance ? 'true' : 'false');
  }

  // Endpoints to try in sequence: Vite proxy (/api), Direct Express, Direct FastAPI
  const endpoints = [
    `${API_BASE}/predict`,
    `http://127.0.0.1:5000/api/predict`,
    `http://127.0.0.1:8000/predict`,
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const requestHeaders = { ...headers };
      let body;

      if (isUrl) {
        requestHeaders['Content-Type'] = 'application/json';
        body = bodyJson;
      } else {
        // Create fresh FormData for each attempt to avoid consumed stream
        const fd = new FormData();
        fd.append('file', fileOrUrl);
        fd.append('task', 'debris');
        fd.append('enhance', options.enhance ? 'true' : 'false');
        body = fd;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.detail || `Server returned ${res.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`Endpoint ${endpoint} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || 'Prediction failed. Please ensure the backend server is running.');
}

// History
export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    headers: getAuthHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch analysis history');
  }
  return data.history || [];
}

// Feedback
export async function submitFeedback({ analysisId, correctClass, comment }) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ analysisId, correctClass, comment }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to submit feedback');
  }
  return data;
}

// System Metadata
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', server: 'Express API Gateway' };
  }
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

export async function preprocessImage(file, params = {}) {
  // Can call predict with enhance
  return predictImage(file, { enhance: true });
}

export async function analyzeImage(file, enhance = false) {
  return predictImage(file, { enhance });
}

export async function explainImage(file) {
  return predictImage(file, { enhance: false });
}

export async function exportModel(format = 'onnx', quantize = true) {
  return { status: 'exported', format, quantize };
}

export async function toggleDemoMode(enabled) {
  return { is_demo_mode: false };
}
