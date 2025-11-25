import api from '../config/api';
import type { Order } from '../types';
import type { OrderDetail } from '../types/order';

export const orderService = {
    getAll: async (skip: number = 0, limit: number = 100): Promise<Order[]> => {
        const response = await api.get(`/admin/orders/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getById: async (id: number): Promise<Order> => {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<Order> => {
        const response = await api.post('/admin/orders/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Order>): Promise<Order> => {
        const response = await api.put(`/admin/orders/${id}`, data);
        return response.data;
    },

    cancel: async (id: number): Promise<Order> => {
        const response = await api.post(`/admin/orders/${id}/cancel`);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/orders/${id}`);
    },
    getDetail: async (id: number): Promise<OrderDetail> => {
        const response = await api.get(`/admin/orders/${id}/lines`);
        // Compose with order info
        const orderRes = await api.get(`/admin/orders/${id}`);
        return {
            ...orderRes.data,
            order_lines: response.data,
        };
    },
};
