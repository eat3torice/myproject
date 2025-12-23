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

interface Category {
    PK_CategoryID: number;
    Name: string;
    Description?: string;
    Status?: string;
}

interface Brand {
    PK_BrandID: number;
    Name: string;
    Description?: string;
    Status?: string;
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

    getVariationById: async (variationId: number): Promise<ProductVariation> => {
        const response = await api.get(`/products/variation/${variationId}`);
        return response.data;
    },

    getVariationImages: async (variationId: number) => {
        const response = await api.get(`/products/variation/${variationId}/images`);
        return response.data;
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/products/categories');
        return response.data;
    },

    getBrands: async (): Promise<Brand[]> => {
        const response = await api.get('/products/brands');
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
