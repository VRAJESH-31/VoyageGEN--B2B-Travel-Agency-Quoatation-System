import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaFilter, FaHotel, FaCar, FaUmbrellaBeach, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaStar, FaEye, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RequirementDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requirement, setRequirement] = useState(null);
    const [partners, setPartners] = useState([]);
    const [selectedPartners, setSelectedPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [viewingPartner, setViewingPartner] = useState(null);

    // Live Data State
    const [liveData, setLiveData] = useState(null);
    const [loadingLive, setLoadingLive] = useState(false);
    const [selectedAiItems, setSelectedAiItems] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        destination: '',
        budget: '',
        startDate: '',
        duration: '',
        adults: 1,
        hotelStar: 4,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token} ` } };

                // Fetch Requirement
                const reqRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/requirements/${id}`, config);
                setRequirement(reqRes.data);

                // Auto-fill filters
                setFilters({
                    destination: reqRes.data.destination,
                    budget: reqRes.data.budget,
                    startDate: reqRes.data.startDate ? reqRes.data.startDate.split('T')[0] : '',
                    duration: reqRes.data.duration,
                    adults: reqRes.data.pax.adults,
                    hotelStar: reqRes.data.hotelStar,
                });

                // Initial Partner Fetch
                fetchPartners({
                    destination: reqRes.data.destination,
                    tripType: reqRes.data.tripType,
                    budget: reqRes.data.budget,
                    startDate: reqRes.data.startDate,
                    duration: reqRes.data.duration,
                    adults: reqRes.data.pax.adults,
                    hotelStar: reqRes.data.hotelStar,
                }, config);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const fetchPartners = async (filterParams, config) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/partners/filter`, filterParams, config);
            setPartners(res.data);
        } catch (error) {
            console.error('Error filtering partners:', error);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        fetchPartners(filters, config);
    };

    const togglePartner = (partnerId) => {
        setSelectedPartners(prev =>
            prev.includes(partnerId)
                ? prev.filter(id => id !== partnerId)
                : [...prev, partnerId].slice(0, 3) // Max 3
        );
    };

    const fetchLiveData = async () => {
        setLoadingLive(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/partners/live-search`, {
                destination: requirement.destination,
                budget: requirement.budget,
                days: requirement.duration
            }, config);
            setLiveData(res.data);
        } catch (error) {
            console.error('Error fetching live data:', error);
            alert('Failed to fetch live market data');
        } finally {
            setLoadingLive(false);
        }
    };

    const toggleAiItem = (item, type) => {
        const itemWithId = { ...item, type, id: item.name }; // Use name as ID for simplicity
        setSelectedAiItems(prev => {
            const exists = prev.find(i => i.name === item.name);
            if (exists) {
                return prev.filter(i => i.name !== item.name);
            } else {
                return [...prev, itemWithId];
            }
        });
    };

    const handleGenerateQuotes = async () => {
        if (selectedPartners.length === 0 && selectedAiItems.length === 0) return;
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/quotes/generate`, {
                requirementId: id,
                partnerIds: selectedPartners,
                customItems: selectedAiItems,
            }, config);

            navigate('/agent/quotes'); // Redirect to quotes list (to be built)
        } catch (error) {
            console.error('Error generating quotes:', error);
            alert('Failed to generate quotes');
        } finally {
            setGenerating(false);
        }
    };

    if (loading || !requirement) return <div className="p-8 text-center"><FaSpinner className="animate-spin text-4xl mx-auto text-emerald-400" /></div>;

    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold mb-2">Requirement Details</h1>
                    <p className="text-gray-400">ID: {requirement._id}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Status</p>
                        <span className="text-emerald-400 font-bold">{requirement.status}</span>
                    </div>
                </div>
            </div>

            {/* Requirement Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 text-emerald-400">Traveler Info</h3>
                    <p><span className="text-gray-400">Name:</span> {requirement.contactInfo.name}</p>
                    <p><span className="text-gray-400">Email:</span> {requirement.contactInfo.email}</p>
                    <p><span className="text-gray-400">Phone:</span> {requirement.contactInfo.phone}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 text-emerald-400">Trip Details</h3>
                    <p><span className="text-gray-400">Destination:</span> {requirement.destination}</p>
                    <p><span className="text-gray-400">Type:</span> {requirement.tripType}</p>
                    <p><span className="text-gray-400">Duration:</span> {requirement.duration} Days</p>
                    <p><span className="text-gray-400">Pax:</span> {requirement.pax.adults} Ad, {requirement.pax.children} Ch</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 text-emerald-400">Preferences</h3>
                    <p><span className="text-gray-400">Budget:</span> ₹{requirement.budget.toLocaleString()}</p>
                    <p><span className="text-gray-400">Hotel:</span> {requirement.hotelStar} Star</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {requirement.preferences.map((pref, i) => (
                            <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{pref}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Verified Partners */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif">Verified Partners</h2>
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            {partners.length} Found
                        </span>
                    </div>

                    {/* Filter Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleFilter}
                        className="flex flex-col gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold">Destination</label>
                                <input
                                    type="text"
                                    value={filters.destination}
                                    onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold">Budget</label>
                                <input
                                    type="number"
                                    value={filters.budget}
                                    onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setFilters({ destination: '', budget: '', startDate: '', duration: '', adults: 1, hotelStar: 4 })} className="text-xs text-gray-500 hover:text-white px-3 py-2">Reset</button>
                            <button type="submit" className="bg-emerald-500 text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-400">Apply Filters</button>
                        </div>
                    </motion.form>

                    {/* Partners Grid */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {partners.map((partner, index) => (
                                <motion.div
                                    key={partner._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-black/20 border rounded-xl overflow-hidden flex ${selectedPartners.includes(partner.userId) ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-32 h-32 relative flex-shrink-0">
                                        <img src={partner.images?.[0] || 'https://placehold.co/400x400'} alt={partner.companyName} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                                            <FaStar /> {partner.rating}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight mb-1">{partner.companyName}</h3>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2"><FaMapMarkerAlt className="text-emerald-500" /> {partner.destinations.join(', ')}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Starting from</p>
                                                <p className="text-emerald-400 font-bold">₹{partner.startingPrice?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setViewingPartner(partner)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white"><FaEye /></button>
                                                <button
                                                    onClick={() => togglePartner(partner.userId)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold ${selectedPartners.includes(partner.userId) ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                                                >
                                                    {selectedPartners.includes(partner.userId) ? 'Selected' : 'Select'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {partners.length === 0 && <div className="text-center py-10 text-gray-500">No partners found.</div>}
                    </div>
                </div>

                {/* Right Column: Live Market Data */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-serif bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Live Market</h2>
                            <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-[10px] border border-purple-500/20 uppercase tracking-wider">AI Powered</span>
                        </div>
                        <button
                            onClick={fetchLiveData}
                            disabled={loadingLive}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingLive ? <FaSpinner className="animate-spin" /> : 'Fetch Live Data'}
                        </button>
                    </div>

                    {!liveData && !loadingLive && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-xl bg-black/20">
                            <FaCheckCircle className="text-4xl text-gray-700 mb-4" />
                            <h3 className="text-gray-400 font-bold mb-2">No Live Data Fetched</h3>
                            <p className="text-gray-500 text-sm max-w-xs">Click "Fetch Live Data" to have the AI research real-time hotel and transport options.</p>
                        </div>
                    )}

                    {loadingLive && (
                        <div className="flex-grow flex flex-col items-center justify-center p-8">
                            <FaSpinner className="text-4xl text-purple-500 animate-spin mb-4" />
                            <p className="text-purple-400 animate-pulse">Researching market prices...</p>
                        </div>
                    )}

                    {liveData && (
                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            {/* Hotels */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FaHotel className="text-purple-400" /> Hotels Found
                                </h3>
                                <div className="space-y-3">
                                    {liveData.hotels?.map((hotel, idx) => (
                                        <div key={idx} className={`bg-black/20 border rounded-xl p-4 transition-all ${selectedAiItems.find(i => i.name === hotel.name) ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-500/5' : 'border-white/5 hover:border-white/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white">{hotel.name}</h4>
                                                <span className="text-xs bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">{hotel.rating}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1"><FaMapMarkerAlt /> {hotel.location}</p>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {hotel.amenities?.slice(0, 3).map((am, i) => (
                                                    <span key={i} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{am}</span>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                <span className="text-purple-400 font-bold font-mono">₹{hotel.price_per_night?.toLocaleString()}<span className="text-gray-600 text-[10px] font-sans">/night</span></span>
                                                <button
                                                    onClick={() => toggleAiItem({ ...hotel, price: hotel.price_per_night }, 'Hotel')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedAiItems.find(i => i.name === hotel.name) ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                >
                                                    {selectedAiItems.find(i => i.name === hotel.name) ? 'Added' : 'Add'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transport */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FaCar className="text-blue-400" /> Transport Options
                                </h3>
                                <div className="space-y-3">
                                    {liveData.transport?.map((trans, idx) => (
                                        <div key={idx} className={`bg-black/20 border rounded-xl p-4 transition-all ${selectedAiItems.find(i => i.name === trans.type) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white">{trans.type}</h4>
                                                <span className="text-xs bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">{trans.capacity}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3">{trans.description}</p>
                                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                <span className="text-blue-400 font-bold font-mono">₹{trans.price_per_day?.toLocaleString()}<span className="text-gray-600 text-[10px] font-sans">/day</span></span>
                                                <button
                                                    onClick={() => toggleAiItem({ name: trans.type, price: trans.price_per_day }, 'Transport')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedAiItems.find(i => i.name === trans.type) ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                >
                                                    {selectedAiItems.find(i => i.name === trans.type) ? 'Added' : 'Add'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Generate Quote Button (Floating or Fixed) */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={handleGenerateQuotes}
                    disabled={(selectedPartners.length === 0 && selectedAiItems.length === 0) || generating}
                    className="bg-emerald-500 text-black font-bold px-8 py-4 rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-emerald-500/30 flex items-center gap-3 text-lg"
                >
                    {generating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Generate Quote ({selectedPartners.length + selectedAiItems.length})
                </button>
            </div>

            {/* Partner Details Modal */}
            <AnimatePresence>
                {viewingPartner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setViewingPartner(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-zinc-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="relative h-72 md:h-96">
                                <img
                                    src={viewingPartner.images && viewingPartner.images.length > 0 ? viewingPartner.images[0] : 'https://placehold.co/800x400'}
                                    alt={viewingPartner.companyName}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                                <button
                                    onClick={() => setViewingPartner(null)}
                                    className="absolute top-6 right-6 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all hover:rotate-90 border border-white/10"
                                >
                                    <FaTimes />
                                </button>

                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-lg">{viewingPartner.companyName}</h2>
                                    <div className="flex flex-wrap items-center gap-4 text-lg">
                                        <p className="text-emerald-400 flex items-center gap-2 font-bold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                                            <FaMapMarkerAlt /> {viewingPartner.destinations.join(', ')}
                                        </p>
                                        <p className="text-yellow-400 flex items-center gap-2 font-bold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                                            <FaStar /> {viewingPartner.rating} Star Hotel
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-10">
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold mb-4 text-white flex items-center gap-2">
                                            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> About
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg">{viewingPartner.description}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-serif font-bold mb-6 text-white flex items-center gap-2">
                                            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Amenities
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {viewingPartner.amenities && viewingPartner.amenities.map((am, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    <span className="text-gray-300 font-medium">{am}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-serif font-bold mb-6 text-white flex items-center gap-2">
                                            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Nearby Sightseeing
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {viewingPartner.sightSeeing && viewingPartner.sightSeeing.map((sight, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="text-emerald-500 mt-1 flex-shrink-0" />
                                                    <span className="text-gray-300">{sight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-zinc-800/50 p-8 rounded-3xl border border-white/10 sticky top-8">
                                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-bold">Starting Price</p>
                                        <div className="flex items-baseline gap-1 mb-8">
                                            <span className="text-4xl font-bold text-white">₹{viewingPartner.startingPrice ? viewingPartner.startingPrice.toLocaleString() : 'N/A'}</span>
                                            <span className="text-gray-500">/ night</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                togglePartner(viewingPartner.userId);
                                                setViewingPartner(null);
                                            }}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95 ${selectedPartners.includes(viewingPartner.userId)
                                                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                                                : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                                                }`}
                                        >
                                            {selectedPartners.includes(viewingPartner.userId) ? 'Selected' : 'Select Partner'}
                                        </button>

                                        <p className="text-xs text-center text-gray-500 mt-4">
                                            *Prices may vary based on season and availability.
                                        </p>
                                    </div>

                                    <div className="bg-zinc-800/50 p-8 rounded-3xl border border-white/10">
                                        <h4 className="font-bold mb-4 text-white text-lg">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingPartner.specializations && viewingPartner.specializations.map((spec, i) => (
                                                <span key={i} className="text-sm bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-medium">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RequirementDetails;
