import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaSave, FaSpinner, FaTrash } from 'react-icons/fa';

const QuoteEditor = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotes/${id}`, config);
                setQuote(res.data);
            } catch (error) {
                console.error('Error fetching quote:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, [id, user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/quotes/${id}`, quote, config);
            alert('Quote saved successfully!');
        } catch (error) {
            console.error('Error saving quote:', error);
            alert('Failed to save quote');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FaSpinner className="animate-spin text-4xl text-emerald-400" />
            </div>
        );
    }

    if (!quote) {
        return <div className="p-8 text-center text-gray-400">Quote not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold">Edit Quote</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => navigate('/agent/quotes')}
                        className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
                    >
                        Back to Quotes
                    </button>
                </div>
            </div>

            {/* Quote Sections */}
            <div className="space-y-6">
                {/* Hotels Section */}
                {quote.sections?.hotels?.length > 0 && (
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4 text-emerald-400">🏨 Hotels</h3>
                        {quote.sections.hotels.map((hotel, index) => (
                            <div key={index} className="grid grid-cols-6 gap-4 mb-4 items-end">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Hotel Name</label>
                                    <input
                                        value={hotel.name}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].name = e.target.value;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Nights</label>
                                    <input
                                        type="number"
                                        value={hotel.nights}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].nights = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Price/Night</label>
                                    <input
                                        type="number"
                                        value={hotel.unitPrice}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].unitPrice = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Total</label>
                                    <div className="p-2 text-emerald-400 font-mono font-bold">₹{hotel.total?.toLocaleString()}</div>
                                </div>
                                <button className="text-red-400 hover:text-red-300 p-2">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transport Section */}
                {quote.sections?.transport?.length > 0 && (
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">🚗 Transport</h3>
                        {quote.sections.transport.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Type</label>
                                    <input
                                        value={item.type}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Total</label>
                                    <div className="p-2 text-blue-400 font-mono font-bold">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Activities Section */}
                {quote.sections?.activities?.length > 0 && (
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                        <h3 className="text-xl font-bold mb-4 text-purple-400">🎯 Activities</h3>
                        {quote.sections.activities.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Activity</label>
                                    <input
                                        value={item.name}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Total</label>
                                    <div className="p-2 text-purple-400 font-mono font-bold">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Costs Summary */}
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-emerald-400">💰 Cost Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Net Cost</label>
                            <div className="text-2xl font-mono text-white">₹{quote.costs?.net?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Margin (%)</label>
                            <input
                                type="number"
                                value={quote.costs?.margin || 0}
                                onChange={(e) => {
                                    const margin = Number(e.target.value);
                                    const final = quote.costs.net * (1 + margin / 100);
                                    setQuote({
                                        ...quote,
                                        costs: {
                                            ...quote.costs,
                                            margin,
                                            final,
                                            perHead: final / 2
                                        }
                                    });
                                }}
                                className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Final Cost</label>
                            <div className="text-2xl font-mono text-emerald-400 font-bold">₹{quote.costs?.final?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Per Person</label>
                            <div className="text-2xl font-mono text-blue-400 font-bold">₹{quote.costs?.perHead?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteEditor;
