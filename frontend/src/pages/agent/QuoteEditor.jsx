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
                    <p className="text-gray-500">Modify details and pricing before sending.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => navigate('/agent/quotes')}
                        className="bg-zinc-800 text-zinc-300 px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 transition-all border border-zinc-700"
                    >
                        Back to Quotes
                    </button>
                </div>
            </div>

            {/* AI Itinerary Section */}
            {quote.itineraryText && (
                <div className="glass-card p-8 rounded-xl mb-8 relative overflow-hidden border-zinc-800">
                    <div className="absolute inset-0 bg-zinc-900/50" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                                    <span className="text-lg">✨</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-100">
                                        AI-Generated Itinerary
                                    </h3>
                                    <p className="text-xs text-zinc-500">Powered by VoyageAI</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Curated</span>
                            </div>
                        </div>

                        <div className="bg-zinc-950/50 rounded-lg p-6 border border-zinc-800">
                            <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans text-sm tracking-wide">
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
                    <div className="glass-card p-6 rounded-xl border-zinc-800">
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">🏨</div>
                            Hotels
                        </h3>
                        {quote.sections.hotels.map((hotel, index) => (
                            <div key={index} className="grid grid-cols-6 gap-4 mb-4 items-end bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Hotel Name</label>
                                    <input
                                        value={hotel.name}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].name = e.target.value;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:border-zinc-600 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Nights</label>
                                    <input
                                        type="number"
                                        value={hotel.nights}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].nights = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:border-zinc-600 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Price/Night</label>
                                    <input
                                        type="number"
                                        value={hotel.unitPrice}
                                        onChange={(e) => {
                                            const newHotels = [...quote.sections.hotels];
                                            newHotels[index].unitPrice = Number(e.target.value);
                                            newHotels[index].total = newHotels[index].unitPrice * newHotels[index].nights;
                                            setQuote({ ...quote, sections: { ...quote.sections, hotels: newHotels } });
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:border-zinc-600 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-zinc-400 font-mono font-bold bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">₹{hotel.total?.toLocaleString()}</div>
                                </div>
                                <button className="text-zinc-600 hover:text-red-400 p-3 hover:bg-zinc-800 rounded-lg transition-all flex items-center justify-center">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transport Section */}
                {quote.sections?.transport?.length > 0 && (
                    <div className="glass-card p-6 rounded-xl border-zinc-800">
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">🚗</div>
                            Transport
                        </h3>
                        {quote.sections.transport.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Type</label>
                                    <input
                                        value={item.vehicleType}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-zinc-400 font-mono font-bold bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Activities Section */}
                {quote.sections?.activities?.length > 0 && (
                    <div className="glass-card p-6 rounded-xl border-zinc-800">
                        <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">🎯</div>
                            Activities
                        </h3>
                        {quote.sections.activities.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-end bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Activity</label>
                                    <input
                                        value={item.name}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Unit Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 block">Total</label>
                                    <div className="p-2.5 text-zinc-400 font-mono font-bold bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">₹{item.total?.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Costs Summary */}
                <div className="glass-card p-8 rounded-xl border-t border-zinc-800 bg-zinc-900/50">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">💰</div>
                        Cost Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <label className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Net Cost</label>
                            <div className="text-2xl font-mono text-zinc-300">₹{quote.costs?.net?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Margin (%)</label>
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
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-lg font-bold text-center focus:border-zinc-600 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Final Cost</label>
                            <div className="text-2xl font-mono text-emerald-500 font-bold">₹{quote.costs?.final?.toLocaleString()}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Per Person</label>
                            <div className="text-2xl font-mono text-zinc-400 font-bold">₹{quote.costs?.perHead?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default QuoteEditor;
