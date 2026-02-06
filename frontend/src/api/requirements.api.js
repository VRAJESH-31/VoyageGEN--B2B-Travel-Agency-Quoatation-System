import api from './axios';
import { API_ENDPOINTS } from '../constants/api';

export const requirementsApi = {
    getAll: async () => {
        const { data } = await api.get(API_ENDPOINTS.REQUIREMENTS.BASE);
        return data;
    },
    
    getById: async (id) => {
        const { data } = await api.get(API_ENDPOINTS.REQUIREMENTS.BY_ID(id));
        return data;
    },
    
    create: async (requirementData) => {
        const { data } = await api.post(API_ENDPOINTS.REQUIREMENTS.BASE, requirementData);
        return data;
    },
    
    update: async (id, updateData) => {
        const { data } = await api.put(API_ENDPOINTS.REQUIREMENTS.BY_ID(id), updateData);
        return data;
    },
    
    delete: async (id) => {
        const { data } = await api.delete(API_ENDPOINTS.REQUIREMENTS.BY_ID(id));
        return data;
    }
};
