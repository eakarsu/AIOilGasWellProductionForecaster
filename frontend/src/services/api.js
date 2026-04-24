import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
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

export default API;
