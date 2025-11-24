import api from '../config/api';
import type { Employee } from '../types';

export const employeeService = {
    getAll: async (skip: number = 0, limit: number = 100): Promise<Employee[]> => {
        const response = await api.get(`/admin/employees/?skip=${skip}&limit=${limit}`);
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

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/employees/${id}`);
    },
};
