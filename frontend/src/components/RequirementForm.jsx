import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlane, FaCalendarAlt, FaUserFriends, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RequirementForm = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        destination: '',
        tripType: 'Honeymoon',
        budget: '',
        startDate: '',
        duration: '',
        pax: { adults: 2, children: 0 },
        hotelStar: 4,
        preferences: [],
        contactInfo: { name: '', email: '', phone: '', whatsapp: '' }
    });

    // Lock Body Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStarClick = (rating) => {
        setFormData(prev => ({ ...prev, hotelStar: rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, this URL would be in .env
            await axios.post(`${import.meta.env.VITE_API_URL}/api/requirements`, formData);
            setLoading(false);
            onClose();
            // Small delay to ensure state update propagates before navigation
            setTimeout(() => {
                navigate('/thank-you');
            }, 100);
        } catch (error) {
            console.error('Error submitting requirement:', error);
            setLoading(false);
            alert('Something went wrong. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-900/50 shrink-0">
                        <h2 className="text-2xl font-serif text-white">Plan Your Journey</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                            {/* Destination */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Where to?</label>
                                <div className="relative">
                                    <FaPlane className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="e.g., Italy, Maldives, Japan"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Trip Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Trip Type</label>
                                <select
                                    name="tripType"
                                    value={formData.tripType}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                >
                                    <option>Honeymoon</option>
                                    <option>Family</option>
                                    <option>Business</option>
                                    <option>Friends</option>
                                    <option>Solo</option>
                                </select>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Budget (Total)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="e.g., 100000"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>

                            {/* Dates */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 7"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>

                            {/* Pax */}
                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Adults</label>
                                    <div className="relative">
                                        <FaUserFriends className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <input
                                            type="number"
                                            name="pax.adults"
                                            value={formData.pax.adults}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Children</label>
                                    <input
                                        type="number"
                                        name="pax.children"
                                        value={formData.pax.children}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Hotel Star Rating */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Hotel Preference (Stars)</label>
                                <div className="flex gap-4">
                                    {[3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleStarClick(star)}
                                            className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.hotelStar === star
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{star}</span>
                                            <FaStar className={formData.hotelStar === star ? 'text-emerald-400' : 'text-gray-600'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="col-span-2 border-t border-white/10 pt-6 mt-2">
                                <h3 className="text-lg font-serif text-white mb-4">Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        type="text"
                                        name="contactInfo.name"
                                        value={formData.contactInfo.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="contactInfo.email"
                                        value={formData.contactInfo.email}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="contactInfo.phone"
                                        value={formData.contactInfo.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-emerald-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Get My Free Quote'}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RequirementForm;
