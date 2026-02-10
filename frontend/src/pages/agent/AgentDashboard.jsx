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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/requirements`, config);
                
                // Handle different response formats
                let requirementsData = [];
                if (response.data?.success && Array.isArray(response.data.data)) {
                    requirementsData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    requirementsData = response.data;
                } else {
                    console.warn('Unexpected API response format:', response.data);
                    requirementsData = [];
                }
                
                setRequirements(requirementsData);
            } catch (error) {
                // Show more detailed error information
                if (error.response) {
                    // Show user-friendly error message
                    if (error.response.status === 401) {
                        alert('Your session has expired. Please log in again.');
                    } else if (error.response.status === 403) {
                        alert('You do not have permission to access this page.');
                    } else {
                        alert(`Error: ${error.response.data?.message || 'Failed to fetch requirements'}`);
                    }
                } else {
                    alert('Network error. Please check your connection.');
                }
                
                // Set empty array on error to prevent map errors
                setRequirements([]);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchRequirements();
        } else {
            setLoading(false);
        }
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
                <div className="glass-card rounded-xl p-16 text-center border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center animate-enter">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-800">
                        <FaPlane className="text-3xl text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Queue is Empty</h3>
                    <p className="text-gray-500 max-w-md mx-auto">No travel requirements found. New requests from the main site will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.isArray(requirements) && requirements.map((req, index) => (
                        <div
                            key={req._id}
                            className="glass-card rounded-xl p-6 group hover:bg-zinc-900/60 relative overflow-hidden flex flex-col h-full animate-enter transition-all duration-300 border-zinc-800/50 hover:border-zinc-700"
                            style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${req.status === 'NEW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                            req.status === 'QUOTES_READY' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' :
                                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                                            }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-mono">#{req._id.slice(-4)}</span>
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1" title={req.destination}>
                                        {req.destination}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800 group-hover:border-zinc-700 transition-colors shrink-0">
                                    <FaPlane />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                        <FaUser /> Traveler
                                    </div>
                                    <p className="text-zinc-300 font-medium text-sm truncate" title={req.contactInfo.name}>{req.contactInfo.name}</p>
                                </div>
                                <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                        <FaCalendar /> Date
                                    </div>
                                    <p className="text-zinc-300 font-medium text-sm truncate">
                                        {req.startDate ? new Date(req.startDate).toLocaleDateString() : 'Flexible'}
                                    </p>
                                </div>
                                <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                        <FaWallet /> Budget
                                    </div>
                                    <p className="text-emerald-500/80 font-medium text-sm font-mono">₹{req.budget.toLocaleString()}</p>
                                </div>
                                <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                                        <FaMapMarkerAlt /> Type
                                    </div>
                                    <p className="text-zinc-300 font-medium text-sm">{req.tripType}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-auto">
                                <Link
                                    to={`/agent/requirement/${req._id}`}
                                    className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <FaEye /> View
                                </Link>
                                <button
                                    onClick={() => deleteRequirement(req._id)}
                                    className="px-4 py-3 bg-zinc-900 hover:bg-red-900/20 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 rounded-lg transition-all"
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
