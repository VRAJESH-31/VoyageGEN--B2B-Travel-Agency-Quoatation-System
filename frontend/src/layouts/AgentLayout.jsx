import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartPie, FaList, FaSignOutAlt, FaUserTie } from 'react-icons/fa';

const AgentLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/agent', icon: <FaList />, label: 'Requirements' },
        { path: '/agent/quotes', icon: <FaChartPie />, label: 'My Quotes' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-zinc-900/50 backdrop-blur-md flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                        <FaUserTie className="text-emerald-400" />
                        Agent Portal
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Welcome, {user?.name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <FaSignOutAlt />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen bg-black scrollbar-thin" style={{ touchAction: 'pan-y' }}>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AgentLayout;
