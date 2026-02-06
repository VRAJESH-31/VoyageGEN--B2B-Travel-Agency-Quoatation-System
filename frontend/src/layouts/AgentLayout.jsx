import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartPie, FaList, FaSignOutAlt, FaUserTie, FaBars, FaTimes } from 'react-icons/fa';

const AgentLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/agent', icon: <FaList />, label: 'Requirements' },
        { path: '/agent/quotes', icon: <FaChartPie />, label: 'My Quotes' },
    ];

    return (
        <div className="flex h-screen w-full bg-black text-white font-sans selection:bg-emerald-500/30">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                        <FaUserTie />
                    </div>
                    <span className="font-serif font-bold text-lg">VoyageGen</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-zinc-400 hover:text-white"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shrink-0">
                                <FaUserTie />
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-white tracking-wide leading-none">VoyageGen</h1>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Agent Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/agent' && location.pathname.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-zinc-900/80 text-emerald-400 border border-zinc-800/50'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 hover:border-zinc-800/30 border border-transparent'
                                        }`}
                                >
                                    <span className={`text-lg ${isActive ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`font-medium text-sm ${isActive ? 'font-bold' : ''}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profle */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 text-xs shadow-sm">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-zinc-200 truncate">{user?.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-red-500/10"
                        >
                            <FaSignOutAlt />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-hidden flex flex-col pt-16 lg:pt-0 bg-black">
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AgentLayout;
