import api from '../config/api';

export const userService = {
    register: async (userData: {
        username: string;
        password: string;
        name: string;
        phone?: string;
        address?: string;
    }) => {
        const response = await api.post('/user/register', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    updateProfile: async (data: {
        name?: string;
        phone?: string;
        address?: string;
    }) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    getOrders: async () => {
        const response = await api.get('/user/orders');
        return response.data;
    },

    createOrder: async (orderData: {
        payment_method_id: number;
        note?: string;
    }) => {
        const response = await api.post('/user/orders', orderData);
        return response.data;
    },
};
