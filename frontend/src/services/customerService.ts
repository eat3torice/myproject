import api from '../config/api';
import type { Customer } from '../types';

export const customerService = {
    getAll: async (skip: number = 0, limit: number = 100): Promise<Customer[]> => {
        const response = await api.get(`/admin/customers/?skip=${skip}&limit=${limit}`);
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
