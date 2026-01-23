// Number formatters
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Date formatters
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// String helpers
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getUserRoleLabel = (role) => {
    const roles = {
        AGENT: 'Travel Agent',
        PARTNER: 'Service Partner',
        ADMIN: 'Administrator',
        USER: 'Traveler'
    };
    return roles[role] || role;
};
