import api from '../config/api';
import type { Category } from '../types';

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get('/admin/categories/');
        return response.data;
    },

    getById: async (id: number): Promise<Category> => {
        const response = await api.get(`/admin/categories/${id}`);
        return response.data;
    },

    create: async (data: Partial<Category>): Promise<Category> => {
        const response = await api.post('/admin/categories/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Category>): Promise<Category> => {
        const response = await api.put(`/admin/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/categories/${id}`);
    },
};
