import api from '../config/api';
import type { Product } from '../types';

export const productService = {
    getAll: async (skip = 0, limit = 10): Promise<Product[]> => {
        const response = await api.get(`/admin/products/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/admin/products/${id}`);
        return response.data;
    },

    create: async (data: Partial<Product>): Promise<Product> => {
        const response = await api.post('/admin/products/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Product>): Promise<Product> => {
        const response = await api.put(`/admin/products/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/products/${id}`);
    },
};
