import axios from 'axios';

// In production the Vite dev proxy is not available, so we read the
// backend URL from the VITE_API_URL environment variable injected at
// build time. Falls back to '' (same-origin) for local development
// where the Vite proxy handles routing to localhost:5050.
const BASE_URL = import.meta.env.VITE_API_URL || '';

// Create a configured axios client instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration or central errors
api.interceptors.response.use(
  (response) => {
    // Return standard success response data
    return response;
  },
  (error) => {
    // Check for 401 unauthorized / expired tokens and purge local records
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt_token');
      // Optional: Redirect to login or trigger callback if necessary
    }
    return Promise.reject(error);
  }
);

export default api;
