import api from '../config/api';

interface CartItem {
    PK_CartItem: number;
    CartID: number;
    VariationID: number;
    Quantity: number;
    Price: number;
}

export const cartService = {
    getCart: async (): Promise<CartItem[]> => {
        const response = await api.get('/cart');
        return response.data;
    },

    addItem: async (variationId: number, quantity: number): Promise<CartItem> => {
        const response = await api.post('/cart/', {
            variation_id: variationId,
            quantity: quantity,
        });
        return response.data;
    },

    updateQuantity: async (cartItemId: number, quantity: number): Promise<CartItem> => {
        const response = await api.put(`/cart/${cartItemId}`, { quantity });
        return response.data;
    },

    removeItem: async (cartItemId: number): Promise<void> => {
        await api.delete(`/cart/${cartItemId}`);
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart/clear');
    },
};
