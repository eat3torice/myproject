import api from '../config/api';
import type { Employee } from '../types';

export const employeeService = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        name?: string;
        phone?: string;
        email?: string;
        status?: string;
    }): Promise<Employee[]> => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params?.name) queryParams.append('name', params.name);
        if (params?.phone) queryParams.append('phone', params.phone);
        if (params?.email) queryParams.append('email', params.email);
        if (params?.status) queryParams.append('status', params.status);

        const response = await api.get(`/admin/employees/?${queryParams.toString()}`);
        return response.data;
    },

    getById: async (id: number): Promise<Employee> => {
        const response = await api.get(`/admin/employees/${id}`);
        return response.data;
    },

    create: async (data: Partial<Employee>): Promise<Employee> => {
        const response = await api.post('/admin/employees/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
        const response = await api.put(`/admin/employees/${id}`, data);
        return response.data;
    },

    deactivate: async (id: number): Promise<void> => {
        await api.put(`/admin/employees/${id}/deactivate`);
    },

    reactivate: async (id: number): Promise<void> => {
        await api.put(`/admin/employees/${id}/reactivate`);
    },
};
