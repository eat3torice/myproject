import api from '../config/api';
import type { Category } from '../types';

export const categoryService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        name?: string;
        status?: string;
    }): Promise<Category[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.name) queryParams.append('name', params.name);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/categories/?${queryParams.toString()}`);
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
