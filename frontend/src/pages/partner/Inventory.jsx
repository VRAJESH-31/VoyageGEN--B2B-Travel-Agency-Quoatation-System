import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaHotel, FaCar, FaUmbrellaBeach } from 'react-icons/fa';

const Inventory = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('hotel');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/partners/inventory/${activeTab}`, formData, config);
            alert('Item added successfully!');
            setFormData({}); // Reset form
        } catch (error) {
            console.error('Error adding inventory:', error);
            alert('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif mb-8">Inventory Management</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('hotel')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'hotel' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <FaHotel /> Hotels
                </button>
                <button
                    onClick={() => setActiveTab('transport')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'transport' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <FaCar /> Transport
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'activity' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <FaUmbrellaBeach /> Activities
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold text-emerald-400 capitalize">Add New {activeTab}</h3>

                {activeTab === 'hotel' && (
                    <>
                        <input type="text" name="name" placeholder="Hotel Name" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="number" name="starRating" placeholder="Star Rating (1-5)" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" />
                    </>
                )}

                {activeTab === 'transport' && (
                    <>
                        <input type="text" name="type" placeholder="Type (Sedan, SUV)" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="number" name="price" placeholder="Price Per Day" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" />
                    </>
                )}

                {activeTab === 'activity' && (
                    <>
                        <input type="text" name="name" placeholder="Activity Name" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                        <input type="number" name="price" placeholder="Price Per Person" onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white" required />
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <FaPlus /> {loading ? 'Adding...' : 'Add Item'}
                </button>
            </form>
        </div>
    );
};

export default Inventory;
