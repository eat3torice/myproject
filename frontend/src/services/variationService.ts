import api from '../config/api';
import type { Variation } from '../types';

export const variationService = {
    getAll: async (skip: number = 0, limit: number = 100): Promise<Variation[]> => {
        const response = await api.get(`/admin/variations/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getById: async (id: number): Promise<Variation> => {
        const response = await api.get(`/admin/variations/${id}`);
        return response.data;
    },

    create: async (data: Partial<Variation>): Promise<Variation> => {
        const response = await api.post('/admin/variations/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Variation>): Promise<Variation> => {
        const response = await api.put(`/admin/variations/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/variations/${id}`);
    },
};
