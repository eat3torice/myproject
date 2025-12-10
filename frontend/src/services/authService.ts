import api from '../config/api';
import type { LoginRequest, LoginResponse } from '../types';

// Determine token key based on current path
const getTokenKey = (): string => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
        return 'admin_token';
    }
    return 'user_token';
};

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: () => {
        const tokenKey = getTokenKey();
        localStorage.removeItem(tokenKey);
        window.location.href = tokenKey === 'admin_token' ? '/admin/login' : '/login';
    },

    isAuthenticated: (): boolean => {
        const tokenKey = getTokenKey();
        return !!localStorage.getItem(tokenKey);
    },

    getToken: (): string | null => {
        const tokenKey = getTokenKey();
        return localStorage.getItem(tokenKey);
    },

    setToken: (token: string) => {
        const tokenKey = getTokenKey();
        localStorage.setItem(tokenKey, token);
    },
};
