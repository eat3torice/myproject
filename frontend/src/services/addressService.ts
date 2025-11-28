import api from '../config/api';

export interface Province {
    PK_Province: number;
    Name: string;
    Code: string;
}

export interface District {
    PK_District: number;
    ProvinceID: number;
    Name: string;
    Code: string;
}

export interface Ward {
    PK_Ward: number;
    DistrictID: number;
    Name: string;
    Code: string;
}

export interface Address {
    PK_Address: number;
    CustomerID: number;
    ProvinceID: number;
    DistrictID: number;
    WardID: number;
    StreetAddress: string;
    IsDefault: number;
    ProvinceName?: string;
    DistrictName?: string;
    WardName?: string;
    Creation_date?: string;
    Edit_date?: string;
}

export const addressService = {
    // Province APIs
    getProvinces: async (): Promise<Province[]> => {
        const response = await api.get('/user/addresses/provinces');
        return response.data;
    },

    // District APIs
    getDistrictsByProvince: async (provinceId: number): Promise<District[]> => {
        const response = await api.get(`/user/addresses/districts/${provinceId}`);
        return response.data;
    },

    // Ward APIs
    getWardsByDistrict: async (districtId: number): Promise<Ward[]> => {
        const response = await api.get(`/user/addresses/wards/${districtId}`);
        return response.data;
    },

    // Address APIs
    getMyAddresses: async (): Promise<Address[]> => {
        const response = await api.get('/user/addresses');
        return response.data;
    },

    getAddressById: async (addressId: number): Promise<Address> => {
        const response = await api.get(`/user/addresses/${addressId}`);
        return response.data;
    },

    createAddress: async (addressData: {
        ProvinceID: number;
        DistrictID: number;
        WardID: number;
        StreetAddress: string;
        IsDefault?: number;
    }): Promise<Address> => {
        const response = await api.post('/user/addresses', addressData);
        return response.data;
    },

    updateAddress: async (addressId: number, addressData: Partial<{
        ProvinceID: number;
        DistrictID: number;
        WardID: number;
        StreetAddress: string;
        IsDefault: number;
    }>): Promise<Address> => {
        const response = await api.put(`/user/addresses/${addressId}`, addressData);
        return response.data;
    },

    deleteAddress: async (addressId: number): Promise<void> => {
        await api.delete(`/user/addresses/${addressId}`);
    },

    setDefaultAddress: async (addressId: number): Promise<void> => {
        await api.post(`/user/addresses/${addressId}/set-default`);
    },
};