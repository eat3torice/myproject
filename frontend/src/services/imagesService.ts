import api from '../config/api';

interface Image {
    PK_Images: number;
    ProductID?: number;
    VariationID?: number;
    Id_Image: string;
    Set_Default: boolean;
}

export const imagesService = {
    getImagesByVariation: async (variationId: number): Promise<Image[]> => {
        const response = await api.get(`/products/variation/${variationId}/images`);
        return response.data;
    },

    getImagesByVariationAdmin: async (variationId: number): Promise<Image[]> => {
        const response = await api.get(`/admin/images?variation_id=${variationId}`);
        return response.data;
    },

    getImagesByProduct: async (productId: number): Promise<Image[]> => {
        const response = await api.get(`/admin/images?product_id=${productId}`);
        return response.data;
    },

    deleteImage: async (imageId: number): Promise<void> => {
        await api.delete(`/admin/images/${imageId}`);
    },
};