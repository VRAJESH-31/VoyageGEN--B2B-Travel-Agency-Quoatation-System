import api from './axios';
import { API_ENDPOINTS } from '../constants/api';

export const authApi = {
    login: async (credentials) => {
        const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        if (data.token) {
            localStorage.setItem('userInfo', JSON.stringify(data));
        }
        return data;
    },
    
    register: async (userData) => {
        const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        if (data.token) {
            localStorage.setItem('userInfo', JSON.stringify(data));
        }
        return data;
    },
    
    logout: () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    }
};
