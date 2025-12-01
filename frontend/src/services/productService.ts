import api from '../config/api';
import type { Product } from '../types';

export const productService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        name?: string;
        category_id?: number;
        brand_id?: number;
    }): Promise<Product[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.name) queryParams.append('name', params.name);
        if (params?.category_id !== undefined) queryParams.append('category_id', params.category_id.toString());
        if (params?.brand_id !== undefined) queryParams.append('brand_id', params.brand_id.toString());

        const response = await api.get(`/admin/products/?${queryParams.toString()}`);
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
