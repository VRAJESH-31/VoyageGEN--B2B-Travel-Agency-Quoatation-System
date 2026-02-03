import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartPie, FaList, FaSignOutAlt, FaUserTie, FaLayerGroup } from 'react-icons/fa';

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
        <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans selection:bg-emerald-500/30 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="noise-bg" />
            </div>

            {/* Floating Glass Sidebar */}
            <aside className="w-20 lg:w-72 fixed left-4 top-4 bottom-4 glass-card rounded-3xl flex flex-col z-50 overflow-hidden transition-all duration-300 group">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-center lg:justify-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <FaUserTie className="text-white text-lg" />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-serif font-bold text-white tracking-wide">VoyageGen</h1>
                        <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Agent Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide flex flex-col items-center lg:items-stretch">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/agent' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-3 lg:px-5 py-3.5 rounded-2xl transition-all duration-300 relative group/link w-full justify-center lg:justify-start ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full lg:hidden" />
                                )}
                                <span className={`text-xl ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                                    {item.icon}
                                </span>
                                <span className={`font-medium hidden lg:block ${isActive ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="hidden lg:flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-5 py-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl transition-all border border-transparent hover:border-red-500/10"
                        title="Logout"
                    >
                        <FaSignOutAlt className="text-lg" />
                        <span className="font-medium hidden lg:block">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-28 lg:ml-80 mr-4 my-4 relative z-10 transition-all duration-300">
                {/* Inner Content Wrapper */}
                <div className="h-full rounded-3xl glass-card overflow-hidden relative flex flex-col">
                    {/* Top Ambient Bar (Optional, simpler header inside pages) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-indigo-500/0 opacity-50" />

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 hover:scrollbar-thumb-emerald-500/50 p-6 lg:p-10">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AgentLayout;
