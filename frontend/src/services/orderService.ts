import api from '../config/api';
import type { Order } from '../types';
import type { OrderDetail } from '../types/order';

export const orderService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        status?: string;
        customer_id?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<Order[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.customer_id !== undefined) queryParams.append('customer_id', params.customer_id.toString());
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);

        const response = await api.get(`/admin/orders/?${queryParams.toString()}`);
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
