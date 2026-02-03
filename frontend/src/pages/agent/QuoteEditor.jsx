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
        <div className="max-w-5xl mx-auto animate-enter">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-white">Edit Quote</h1>
                    <p className="text-gray-400">Modify details and pricing before sending.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg hover:shadow-emerald-500/20"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => navigate('/agent/quotes')}
                        className="bg-white/5 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                        Back to Quotes
                    </button>
                </div>
            </div>

            {/* AI Itinerary Section - Enhanced UI */}
            {quote.itineraryText && (
                <div className="glass-card p-1 rounded-3xl mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-50" />
                    <div className="bg-black/40 backdrop-blur-md rounded-[20px] p-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                        AI-Generated Itinerary
                                    </h3>
                                    <p className="text-sm text-gray-400">Powered by VoyageAI</p>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Curated</span>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                            <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-sm tracking-wide">
                                {quote.itineraryText}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Sections */}
            <div className="space-y-6">
                {/* Hotels Section */}
                {quote.sections?.hotels?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">🏨</div>
                            Hotels
                        </h3>
                        {quote.sections.hotels.map((hotel, index) => (
                            <div key={index} className="grid grid-cols-6 gap-4 mb-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Hotel Name</label>
                                    <input
                                        value={hotel.name}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].name = e.target.value;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Nights</label>
                                    <input
                                        type="number"
                                        value={hotel.nights}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].nights = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Price/Night</label>
                                    <input
                                        type="number"
                                        value={hotel.unitPrice}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].unitPrice = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-emerald-400 font-mono font-bold bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">₹{hotel.total?.toLocaleString()}</div>
                                </div>
                                <button className="text-gray-500 hover:text-red-400 p-3 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transport Section */}
                {quote.sections?.transport?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">🚗</div>
                            Transport
                        </h3>
                        {quote.sections.transport.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Type</label>
                                    <input
                                        value={item.vehicleType}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-blue-400 font-mono font-bold bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Activities Section */}
                {quote.sections?.activities?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">🎯</div>
                            Activities
                        </h3>
                        {quote.sections.activities.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Activity</label>
                                    <input
                                        value={item.name}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-purple-400 font-mono font-bold bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Costs Summary */}
                <div className="glass-card p-8 rounded-2xl border-t border-emerald-500/20 bg-emerald-900/5">
                    <h3 className="text-xl font-bold mb-6 text-emerald-400 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">💰</div>
                        Cost Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Net Cost</label>
                            <div className="text-2xl font-mono text-white">₹{quote.costs?.net?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Margin (%)</label>
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
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-lg font-bold text-center focus:border-emerald-500/50 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Final Cost</label>
                            <div className="text-2xl font-mono text-emerald-400 font-bold">₹{quote.costs?.final?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Per Person</label>
                            <div className="text-2xl font-mono text-blue-400 font-bold">₹{quote.costs?.perHead?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default QuoteEditor;
