import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaSpinner, FaTrash } from 'react-icons/fa';

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
                setRequirements(data);
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
            <div className="flex items-center justify-center h-full text-emerald-400">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-serif mb-8">New Requirements</h2>

            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-6 font-medium">Traveler</th>
                                <th className="p-6 font-medium">Destination</th>
                                <th className="p-6 font-medium">Trip Type</th>
                                <th className="p-6 font-medium">Budget</th>
                                <th className="p-6 font-medium">Status</th>
                                <th className="p-6 font-medium">Date</th>
                                <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requirements.map((req) => (
                                <tr key={req._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 font-medium text-white">{req.contactInfo.name}</td>
                                    <td className="p-6 text-gray-300">{req.destination}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                            {req.tripType}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-300">₹{req.budget.toLocaleString()}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${req.status === 'NEW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            req.status === 'QUOTES_READY' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                req.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                            }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-400 text-sm">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/agent/requirement/${req._id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-emerald-400 hover:text-white transition-all"
                                            >
                                                <FaEye /> Open
                                            </Link>
                                            <button
                                                onClick={() => deleteRequirement(req._id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-400 transition-all"
                                                title="Delete Requirement"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {requirements.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500">
                                        No requirements found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
