import api from '../config/api';
import type { Customer } from '../types';

export const customerService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        name?: string;
        phone?: string;
        status?: string;
    }): Promise<Customer[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.name) queryParams.append('name', params.name);
        if (params?.phone) queryParams.append('phone', params.phone);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/customers/?${queryParams.toString()}`);
        return response.data;
    },

    getById: async (id: number): Promise<Customer> => {
        const response = await api.get(`/admin/customers/${id}`);
        return response.data;
    },

    create: async (data: Partial<Customer>): Promise<Customer> => {
        const response = await api.post('/admin/customers/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
        const response = await api.put(`/admin/customers/${id}`, data);
        return response.data;
    },

    deactivate: async (id: number): Promise<void> => {
        await api.put(`/admin/customers/${id}/deactivate`);
    },
};
