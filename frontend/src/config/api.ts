import axios from 'axios';

// Remove trailing slash to prevent double slashes in URLs
const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const API_BASE_URL = baseUrl;

// Determine token key based on current path
const getTokenKey = (): string => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
        return 'admin_token';
    }
    return 'user_token';
};

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const tokenKey = getTokenKey();
    const token = localStorage.getItem(tokenKey);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            const tokenKey = getTokenKey();
            localStorage.removeItem(tokenKey);
            window.location.href = tokenKey === 'admin_token' ? '/admin/login' : '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
