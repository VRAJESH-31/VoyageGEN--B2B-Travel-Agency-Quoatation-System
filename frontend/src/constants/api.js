export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/signup',
    },
    REQUIREMENTS: {
        BASE: '/api/requirements',
        BY_ID: (id) => `/api/requirements/${id}`,
    },
    PARTNERS: {
        PROFILE: '/api/partners/profile',
        BASE: '/api/partners',
        FILTER: '/api/partners/filter',
        INVENTORY: (type) => `/api/partners/inventory/${type}`,
    },
    QUOTES: {
        GENERATE: '/api/quotes/generate',
        BASE: '/api/quotes',
        BY_ID: (id) => `/api/quotes/${id}`,
        BY_REQ_ID: (id) => `/api/quotes/requirement/${id}`,
    }
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    PLAN: '/plan-journey',
    THANK_YOU: '/thank-you',
    AGENT: {
        DASHBOARD: '/agent',
        QUOTES: '/agent/quotes',
        QUOTE_edit: (id) => `/agent/quote/${id}`,
        REQ_DETAILS: (id) => `/agent/requirement/${id}`,
    },
    PARTNER: {
        DASHBOARD: '/partner',
        INVENTORY: '/partner/inventory',
    }
};
