import api from './axios';
import { API_ENDPOINTS } from '../constants/api';

export const quotesApi = {
    getAll: async () => {
        const { data } = await api.get(API_ENDPOINTS.QUOTES.BASE);
        return data;
    },
    
    getByRequirementId: async (reqId) => {
        const { data } = await api.get(API_ENDPOINTS.QUOTES.BY_REQ_ID(reqId));
        return data;
    },
    
    getById: async (id) => {
        const { data } = await api.get(API_ENDPOINTS.QUOTES.BY_ID(id));
        return data;
    },
    
    generate: async (payload) => {
        const { data } = await api.post(API_ENDPOINTS.QUOTES.GENERATE, payload);
        return data;
    },
    
    update: async (id, updateData) => {
        const { data } = await api.put(API_ENDPOINTS.QUOTES.BY_ID(id), updateData);
        return data;
    },
    
    delete: async (id) => {
        const { data } = await api.delete(API_ENDPOINTS.QUOTES.BY_ID(id));
        return data;
    }
};
