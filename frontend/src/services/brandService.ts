import api from '../config/api';
import type { Brand } from '../types';

export const brandService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        name?: string;
        status?: string;
    }): Promise<Brand[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.name) queryParams.append('name', params.name);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/brands/?${queryParams.toString()}`);
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
