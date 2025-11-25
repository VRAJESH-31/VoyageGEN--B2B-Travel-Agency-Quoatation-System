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

    const handleGenerateQuotes = async () => {
        if (selectedPartners.length === 0) return;
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/quotes/generate`, {
                requirementId: id,
                partnerIds: selectedPartners,
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

            {/* Partner Filter & Selection */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif">Match Partners</h2>
                    <button
                        onClick={handleGenerateQuotes}
                        disabled={selectedPartners.length === 0 || generating}
                        className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {generating ? 'Generating...' : `Generate Quotes (${selectedPartners.length})`}
                    </button>
                </div>

                {/* Filter Bar */}
                {/* Filter Bar */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleFilter}
                    className="flex flex-wrap gap-4 mb-8 bg-zinc-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl"
                >
                    <div className="w-full md:w-auto flex-1 min-w-[200px]">
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Destination</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                            <input
                                type="text"
                                placeholder="Where to?"
                                value={filters.destination}
                                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:border-emerald-500 outline-none text-white transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex-1 min-w-[150px]">
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Budget (Max)</label>
                        <div className="relative">
                            <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                            <input
                                type="number"
                                placeholder="Budget"
                                value={filters.budget}
                                onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:border-emerald-500 outline-none text-white transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex-1 min-w-[250px]">
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Hotel Class</label>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                            {[3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFilters({ ...filters, hotelStar: star })}
                                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${filters.hotelStar === star
                                        ? 'bg-emerald-500 text-black font-bold shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {star} <FaStar className={filters.hotelStar === star ? "text-black" : "text-yellow-500"} /> Star
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex items-end gap-2">
                        <button
                            type="submit"
                            className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-white/20"
                        >
                            <FaFilter /> Apply
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFilters({
                                    destination: '',
                                    budget: '',
                                    startDate: '',
                                    duration: '',
                                    adults: 1,
                                    hotelStar: 4,
                                });
                                // Trigger fetch with empty filters or initial state if needed
                            }}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-3 rounded-lg transition-all border border-white/5"
                            title="Reset Filters"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </motion.form>

                {/* Partners Grid */}
                {/* Partners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {partners.map((partner, index) => (
                            <motion.div
                                key={partner._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all group relative flex flex-col h-full ${selectedPartners.includes(partner.userId)
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                    : 'border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-black/50'
                                    }`}
                            >
                                {/* Image */}
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={partner.images && partner.images.length > 0 ? partner.images[0] : 'https://placehold.co/600x400?text=No+Image'}
                                        alt={partner.companyName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />

                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-1 border border-white/10">
                                        <FaStar className="text-yellow-400" /> {partner.rating}
                                    </div>

                                    {selectedPartners.includes(partner.userId) && (
                                        <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                            <FaCheckCircle /> Selected
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl font-serif font-bold text-white mb-1 drop-shadow-lg">{partner.companyName}</h3>
                                        <p className="text-sm text-gray-300 flex items-center gap-1 drop-shadow-md">
                                            <FaMapMarkerAlt className="text-emerald-500" /> {partner.destinations.join(', ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10 leading-relaxed">{partner.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {partner.amenities && partner.amenities.slice(0, 3).map((am, i) => (
                                            <span key={i} className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors">
                                                {am}
                                            </span>
                                        ))}
                                        {partner.amenities && partner.amenities.length > 3 && (
                                            <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-gray-500 border border-white/5">
                                                +{partner.amenities.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Starting from</p>
                                            <p className="text-xl font-bold text-emerald-400">₹{partner.startingPrice ? partner.startingPrice.toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setViewingPartner(partner)}
                                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95 border border-white/5"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => togglePartner(partner.userId)}
                                                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${selectedPartners.includes(partner.userId)
                                                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                                                    : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                                                    }`}
                                            >
                                                {selectedPartners.includes(partner.userId) ? 'Selected' : 'Select'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {partners.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-white/10"
                        >
                            <FaUmbrellaBeach className="text-6xl text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">No partners found</h3>
                            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                            <button
                                onClick={() => {
                                    setFilters({
                                        destination: '',
                                        budget: '',
                                        startDate: '',
                                        duration: '',
                                        adults: 1,
                                        hotelStar: 4,
                                    });
                                    // Trigger fetch
                                }}
                                className="mt-6 text-emerald-500 hover:text-emerald-400 font-bold underline underline-offset-4"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    )}
                </div>
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
