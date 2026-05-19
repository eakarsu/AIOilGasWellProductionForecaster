import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4500/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => API.post('/auth/login', { email, password });

export const getItems = (endpoint) => API.get(endpoint);
export const getItem = (endpoint, id) => API.get(`${endpoint}/${id}`);
export const createItem = (endpoint, data) => API.post(endpoint, data);
export const updateItem = (endpoint, id, data) => API.put(`${endpoint}/${id}`, data);
export const deleteItem = (endpoint, id) => API.delete(`${endpoint}/${id}`);
export const analyzeWithAI = (type, data) => API.post(`/ai/analyze/${type}`, { data });
export const aiProductionAnomaly = (data) => API.post('/ai/analyze/production-anomaly', data);
export const aiPipelineRupture = (data) => API.post('/ai/analyze/pipeline-rupture-predict', data);
export const aiOptimalMaintenanceWindow = (data) => API.post('/ai/analyze/optimal-maintenance-window', data);
export const aiNearMissSeverity = (data) => API.post('/ai/analyze/near-miss-severity-predict', data);
export const aiAssetLifecycle = (data) => API.post('/ai/analyze/asset-lifecycle', data);
export const aiMultiWellPortfolio = (body) => API.post('/ai/analyze/multi-well-portfolio', body);
export const aiSensorAnomalyBatch = (body) => API.post('/ai/analyze/sensor-anomaly-batch', body);

// Non-AI feature APIs
export const exportCSV = (tableName) => API.get(`/export/${tableName}`, { responseType: 'blob' });
export const convertUnit = (data) => API.post('/unit-converter/convert', data);
export const getAlerts = () => API.get('/alerts');
export const createAlert = (data) => API.post('/alerts', data);
export const updateAlert = (id, data) => API.put(`/alerts/${id}`, data);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);
export const checkAlerts = () => API.get('/alerts/check');
export const getKPISummary = () => API.get('/kpi/summary');
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);
export const changePassword = (data) => API.put('/profile/password', data);
export const getFieldNotes = () => API.get('/field-notes');
export const getFieldNote = (id) => API.get(`/field-notes/${id}`);
export const createFieldNote = (data) => API.post('/field-notes', data);
export const updateFieldNote = (id, data) => API.put(`/field-notes/${id}`, data);
export const deleteFieldNote = (id) => API.delete(`/field-notes/${id}`);

// Production History
export const getProductionHistory = (params) => API.get('/production-history', { params });
export const createProductionHistory = (data) => API.post('/production-history', data);
export const updateProductionHistory = (id, data) => API.put(`/production-history/${id}`, data);
export const deleteProductionHistory = (id) => API.delete(`/production-history/${id}`);
export const importProductionHistoryCSV = (wellId, file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('well_id', wellId);
  return API.post('/production-history/import-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Decline Curve calculation
export const calculateDeclineCurve = (id) => API.post(`/decline-curves/${id}/calculate`);

// AI History
export const getAIHistory = (params) => API.get('/ai-history', { params });
export const getAIHistoryItem = (id) => API.get(`/ai-history/${id}`);

// Alert Rules
export const getAlertRules = () => API.get('/alerts/rules');
export const createAlertRule = (data) => API.post('/alerts/rules', data);
export const updateAlertRule = (id, data) => API.put(`/alerts/rules/${id}`, data);
export const deleteAlertRule = (id) => API.delete(`/alerts/rules/${id}`);
export const evaluateAlerts = () => API.get('/alerts/evaluate');

export default API;
