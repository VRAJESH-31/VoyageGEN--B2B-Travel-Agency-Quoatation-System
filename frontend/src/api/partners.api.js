import api from './axios';
import { API_ENDPOINTS } from '../constants/api';

export const partnersApi = {
    getProfile: async () => {
        const { data } = await api.get(API_ENDPOINTS.PARTNERS.PROFILE);
        return data;
    },
    
    updateProfile: async (profileData) => {
        const { data } = await api.post(API_ENDPOINTS.PARTNERS.PROFILE, profileData);
        return data;
    },
    
    addInventory: async (type, itemData) => {
        const { data } = await api.post(API_ENDPOINTS.PARTNERS.INVENTORY(type), itemData);
        return data;
    },
    
    filterPartners: async (criteria) => {
        const { data } = await api.post(API_ENDPOINTS.PARTNERS.FILTER, criteria);
        return data;
    }
};
