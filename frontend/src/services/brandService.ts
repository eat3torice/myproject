import api from '../config/api';
import type { Brand } from '../types';

export const brandService = {
    getAll: async (): Promise<Brand[]> => {
        const response = await api.get('/admin/brands/');
        return response.data;
    },

    getById: async (id: number): Promise<Brand> => {
        const response = await api.get(`/admin/brands/${id}`);
        return response.data;
    },

    create: async (data: Partial<Brand>): Promise<Brand> => {
        const response = await api.post('/admin/brands/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Brand>): Promise<Brand> => {
        const response = await api.put(`/admin/brands/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/brands/${id}`);
    },
};
