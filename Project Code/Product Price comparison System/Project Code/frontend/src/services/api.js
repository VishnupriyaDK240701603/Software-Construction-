import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 min — live scraping across 6 platforms takes time
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ppc-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (token expired)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('ppc-token');
        // Don't redirect for unauthenticated API calls that are expected
        if (error.config?.headers?.Authorization) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
