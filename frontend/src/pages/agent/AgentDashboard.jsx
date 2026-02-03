import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaSpinner, FaTrash, FaMapMarkerAlt, FaCalendar, FaWallet, FaUser, FaPlane } from 'react-icons/fa';

const AgentDashboard = () => {
    const { user } = useAuth();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequirements = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/requirements`, config);
                // Handle paginated response format
                setRequirements(data.data || data);
            } catch (error) {
                console.error('Error fetching requirements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [user]);

    const deleteRequirement = async (requirementId) => {
        if (!window.confirm('Are you sure you want to delete this requirement?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/requirements/${requirementId}`, config);

            // Remove from local state
            setRequirements(requirements.filter(r => r._id !== requirementId));
        } catch (error) {
            console.error('Error deleting requirement:', error);
            alert('Failed to delete requirement');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh] text-emerald-400">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-enter">
                <div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">Requirement Queue</h2>
                    <p className="text-gray-400 text-lg font-light">Manage incoming travel requests and AI generations.</p>
                </div>
                <div className="bg-zinc-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Requests</span>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-emerald-400 font-bold text-xl font-serif">{requirements.length}</span>
                </div>
            </div>

            {/* Grid Layout */}
            {requirements.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border-dashed border-2 border-white/10 flex flex-col items-center justify-center animate-enter">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                        <FaPlane className="text-3xl text-emerald-500/50" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Queue is Empty</h3>
                    <p className="text-gray-400 max-w-md mx-auto">No travel requirements found. New requests from the main site will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requirements.map((req, index) => (
                        <div
                            key={req._id}
                            className="glass-card rounded-3xl p-6 group hover:border-emerald-500/30 relative overflow-hidden flex flex-col h-full animate-enter"
                            style={{ animationDelay: `${index * 100}ms`, opacity: 0 }} // opacity 0 initially handled by keyframes
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${req.status === 'NEW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                req.status === 'QUOTES_READY' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    req.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-zinc-500/10 text-gray-400 border-zinc-500/20'
                                            }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">#{req._id.slice(-4)}</span>
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1" title={req.destination}>
                                        {req.destination}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors shrink-0">
                                    <FaPlane />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaUser /> Traveler
                                    </div>
                                    <p className="text-white font-medium text-sm truncate" title={req.contactInfo.name}>{req.contactInfo.name}</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaCalendar /> Date
                                    </div>
                                    <p className="text-white font-medium text-sm truncate">
                                        {req.startDate ? new Date(req.startDate).toLocaleDateString() : 'Flexible'}
                                    </p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaWallet /> Budget
                                    </div>
                                    <p className="text-emerald-400 font-medium text-sm font-mono">₹{req.budget.toLocaleString()}</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaMapMarkerAlt /> Type
                                    </div>
                                    <p className="text-white font-medium text-sm">{req.tripType}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                                <Link
                                    to={`/agent/requirement/${req._id}`}
                                    className="flex-1 bg-white text-black hover:bg-emerald-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                                >
                                    <FaEye /> Open Details
                                </Link>
                                <button
                                    onClick={() => deleteRequirement(req._id)}
                                    className="px-4 py-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
