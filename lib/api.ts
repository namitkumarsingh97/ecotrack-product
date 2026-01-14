import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Company
export const companyAPI = {
  create: (data: any) => api.post('/company', data),
  getAll: () => api.get('/company'),
  getById: (id: string) => api.get(`/company/${id}`),
  update: (id: string, data: any) => api.put(`/company/${id}`, data),
};

// Metrics
export const metricsAPI = {
  createEnvironmental: (data: any) => api.post('/metrics/environment', data),
  createSocial: (data: any) => api.post('/metrics/social', data),
  createGovernance: (data: any) => api.post('/metrics/governance', data),
  getByCompany: (companyId: string) => api.get(`/metrics/${companyId}`),
};

// ESG
export const esgAPI = {
  calculate: (companyId: string, period: string) =>
    api.post(`/esg/calculate/${companyId}`, { period }),
  getScore: (companyId: string) => api.get(`/esg/score/${companyId}`),
  getReport: (companyId: string, format: string = 'json', period?: string) => {
    if (format === 'pdf' || format === 'excel') {
      return api.get(`/esg/report/${companyId}`, {
        params: { format, period },
        responseType: 'blob',
      });
    }
    return api.get(`/esg/report/${companyId}`, { params: { format, period } });
  },
};

export default api;

