import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || (role && user.role !== role)) return <Login />;
    return children;
};

export default ProtectedRoute;
