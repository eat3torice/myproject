import api from '../config/api';

interface ProductVariation {
    PK_Variation: number;
    ProductID: number;
    SKU: string;
    Name: string;
    Price: number;
    Quantity: number;
    Color?: string;
    Material?: string;
    Size?: string;
    Description?: string;
    Status?: string;
    CategoryID?: number;
}

export const publicProductService = {
    getAll: async (skip: number = 0, limit: number = 100): Promise<ProductVariation[]> => {
        const response = await api.get(`/products?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getByCategory: async (categoryId?: number, skip: number = 0, limit: number = 100): Promise<ProductVariation[]> => {
        const params = new URLSearchParams();
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());
        if (categoryId) {
            params.append('category_id', categoryId.toString());
        }
        const response = await api.get(`/products?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number): Promise<ProductVariation> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getFeatured: async (): Promise<ProductVariation[]> => {
        const response = await api.get('/products/featured');
        return response.data;
    },

    search: async (keyword: string): Promise<ProductVariation[]> => {
        const response = await api.get(`/products/search?keyword=${keyword}`);
        return response.data;
    },
};
