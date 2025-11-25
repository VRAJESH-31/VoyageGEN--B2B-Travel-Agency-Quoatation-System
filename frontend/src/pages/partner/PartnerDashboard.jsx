import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaSave, FaSpinner } from 'react-icons/fa';

const PartnerDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        companyName: '',
        destinations: [],
        type: 'DMC',
        specializations: [],
        budgetRange: { min: 0, max: 0 },
        images: [],
        startingPrice: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/partners/me`, config);
                if (data) setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, field) => {
        const value = e.target.value.split(',').map(item => item.trim());
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/partners/profile`, profile, config);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><FaSpinner className="animate-spin text-4xl mx-auto text-emerald-400" /></div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-8">Partner Profile</h2>

            <form onSubmit={handleSave} className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Partner Type</label>
                    <select
                        name="type"
                        value={profile.type}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                    >
                        <option value="DMC">DMC</option>
                        <option value="Hotel">Hotel</option>
                        <option value="CabProvider">Cab Provider</option>
                        <option value="Mixed">Mixed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Destinations (comma separated)</label>
                    <input
                        type="text"
                        value={profile.destinations.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'destinations')}
                        placeholder="e.g., Italy, Rome, Venice"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Specializations (comma separated)</label>
                    <input
                        type="text"
                        value={profile.specializations.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'specializations')}
                        placeholder="e.g., honeymoon, luxury, budget"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Image URLs (comma separated)
                    </label>
                    <input
                        type="text"
                        value={profile.images?.join(', ') || ''}
                        onChange={(e) => handleArrayChange(e, 'images')}
                        placeholder="e.g., https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add image URLs for your services/properties</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Starting Price (₹)
                    </label>
                    <input
                        type="number"
                        name="startingPrice"
                        value={profile.startingPrice || 0}
                        onChange={(e) => setProfile(prev => ({ ...prev, startingPrice: Number(e.target.value) }))}
                        placeholder="e.g., 5000"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Base price for your services (per day/night)</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Min Budget</label>
                        <input
                            type="number"
                            name="min"
                            value={profile.budgetRange?.min || 0}
                            onChange={(e) => setProfile(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, min: Number(e.target.value) } }))}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Max Budget</label>
                        <input
                            type="number"
                            name="max"
                            value={profile.budgetRange?.max || 0}
                            onChange={(e) => setProfile(prev => ({ ...prev, budgetRange: { ...prev.budgetRange, max: Number(e.target.value) } }))}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <FaSave /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default PartnerDashboard;
