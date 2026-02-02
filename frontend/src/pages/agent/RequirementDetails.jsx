import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaFilter, FaHotel, FaUmbrellaBeach, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaStar, FaEye, FaTimes, FaMoneyBillWave, FaBolt, FaUserFriends, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AgentProgress, { AGENT_STEPS } from '../../components/agent/AgentProgress';
import AgentResultCard from '../../components/agent/AgentResultCard';

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

    // Hotel Fetch State
    const [liveHotels, setLiveHotels] = useState([]);
    const [loadingHotels, setLoadingHotels] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        destination: '',
        budget: '',
        startDate: '',
        duration: '',
        adults: 1,
        hotelStar: 4,
        tripType: '',
    });

    // Agent UI State
    const [agentStatus, setAgentStatus] = useState('IDLE'); // IDLE | RUNNING | DONE | ERROR
    const [agentStep, setAgentStep] = useState(0);
    const [agentResult, setAgentResult] = useState(null);
    const [agentError, setAgentError] = useState(null);
    const [agentRunId, setAgentRunId] = useState(null);
    const [forceRerun, setForceRerun] = useState(false);
    const [is409Error, setIs409Error] = useState(false);
    const pollingRef = useRef(null);
    const redirectTimeoutRef = useRef(null);

    // Cleanup polling and redirect timeout on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, []);

    // Map backend steps to UI step index
    const mapStepsToUI = (steps) => {
        if (!steps || steps.length === 0) return 0;

        // Backend step names: SUPERVISOR, RESEARCH, PLANNER, PRICE, QUALITY
        const stepOrder = ['SUPERVISOR', 'RESEARCH', 'PLANNER', 'PRICE', 'QUALITY'];

        // Find the current step index based on backend data
        let completedCount = 0;

        for (let i = 0; i < stepOrder.length; i++) {
            const stepName = stepOrder[i];
            const backendStep = steps.find(s => s.stepName === stepName);

            if (!backendStep) continue;

            if (backendStep.status === 'DONE') {
                completedCount = i + 1; // Next step should be active
            } else if (backendStep.status === 'RUNNING') {
                return i; // Currently running this step
            } else if (backendStep.status === 'FAILED') {
                return i; // Failed at this step
            }
        }

        // console.log('Step mapping result:', completedCount, 'from steps:', steps);
        return completedCount;
    };

    // Poll agent run status
    const pollAgentRun = useCallback(async (runId) => {
        if (!runId || !user?.token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/agent/run/${runId}`,
                config
            );

            const run = res.data?.data || res.data;

            // Update step progress
            setAgentStep(mapStepsToUI(run.steps));

            if (run.status === 'DONE') {
                // Stop polling
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }

                // Extract result from run
                const priceStep = run.steps?.find(s => s.stepName === 'PRICE');
                const qualityStep = run.steps?.find(s => s.stepName === 'QUALITY');
                const quoteId = run.quoteId || null;

                setAgentStatus('DONE');
                setAgentResult({
                    summary: `${requirement?.duration || 5}-day ${requirement?.tripType || 'Trip'} in ${requirement?.destination || 'Destination'}`,
                    finalCost: priceStep?.output?.finalCost || 0,
                    budget: requirement?.budget || 100000,
                    budgetFit: priceStep?.output?.budgetFit ?? true,
                    qualityScore: qualityStep?.output?.qualityScore || 0,
                    quoteId,
                });

                // Auto-redirect to quote after 2 seconds
                if (quoteId) {
                    redirectTimeoutRef.current = setTimeout(() => {
                        navigate(`/agent/quote/${quoteId}`);
                    }, 2000);
                }
            } else if (run.status === 'FAILED') {
                // Stop polling on failure
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                setAgentStatus('ERROR');
                setAgentError(run.error || 'Agent run failed');
            }
        } catch (err) {
            console.error('Polling error:', err);
            // Don't stop polling on transient errors
        }
    }, [user, requirement, navigate]);

    // Start agent run (real API call)
    const runAgent = useCallback(async (overrideForce = false) => {
        if (agentStatus === 'RUNNING' || !user?.token) return;

        // Clear previous polling
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setAgentStatus('RUNNING');
        setAgentStep(0);
        setAgentResult(null);
        setAgentError(null);
        setIs409Error(false);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Add forceRun query param if checked or overridden
            const shouldForce = forceRerun || overrideForce;
            const url = shouldForce
                ? `${import.meta.env.VITE_API_URL}/api/agent/run/${id}?forceRun=true`
                : `${import.meta.env.VITE_API_URL}/api/agent/run/${id}`;

            const res = await axios.post(url, {}, config);

            const runId = res.data?.data?.agentRunId || res.data?.agentRunId;
            setAgentRunId(runId);
            setForceRerun(false); // Reset checkbox after successful start

            // Start polling every 3 seconds
            pollingRef.current = setInterval(() => {
                pollAgentRun(runId);
            }, 3000);

            // Also poll immediately
            pollAgentRun(runId);

        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;

            if (status === 409) {
                // Duplicate run - show friendly message with force rerun option
                setAgentError('Agent run already in progress.');
                setIs409Error(true);
                setAgentStatus('ERROR');
            } else {
                setAgentError(message || 'Failed to start agent');
                setAgentStatus('ERROR');
            }
        }
    }, [agentStatus, user, id, forceRerun, pollAgentRun]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

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

                // Auto-resume: Check for latest agent run
                try {
                    const latestRes = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/agent/requirement/${id}/latest`,
                        config
                    );
                    const latestRun = latestRes.data?.data || latestRes.data;

                    if (latestRun && latestRun._id) {
                        setAgentRunId(latestRun._id);

                        if (latestRun.status === 'RUNNING') {
                            // Resume polling
                            setAgentStatus('RUNNING');
                            setAgentStep(mapStepsToUI(latestRun.steps));
                            pollingRef.current = setInterval(() => {
                                pollAgentRun(latestRun._id);
                            }, 3000);
                        } else if (latestRun.status === 'DONE') {
                            // Show result immediately
                            const priceStep = latestRun.steps?.find(s => s.stepName === 'PRICE');
                            const qualityStep = latestRun.steps?.find(s => s.stepName === 'QUALITY');
                            setAgentStatus('DONE');
                            setAgentStep(5);
                            setAgentResult({
                                summary: `${reqRes.data.duration}-day ${reqRes.data.tripType} in ${reqRes.data.destination}`,
                                finalCost: priceStep?.output?.finalCost || 0,
                                budget: reqRes.data.budget,
                                budgetFit: priceStep?.output?.budgetFit ?? true,
                                qualityScore: qualityStep?.output?.qualityScore || 0,
                                quoteId: latestRun.quoteId || null,
                            });
                        } else if (latestRun.status === 'FAILED') {
                            // Show error state
                            setAgentStatus('ERROR');
                            setAgentStep(mapStepsToUI(latestRun.steps));
                            setAgentError(latestRun.error || 'Previous run failed');
                        }
                    }
                } catch (latestErr) {
                    // No previous run or endpoint not found - that's okay, stay IDLE
                    console.log('No previous agent run found');
                }

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

    const fetchLiveHotels = async () => {
        setLoadingHotels(true);
        setLiveHotels([]);
        setSelectedHotel(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const checkInDate = requirement.startDate
                ? new Date(requirement.startDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            const checkOutDate = requirement.startDate
                ? new Date(new Date(requirement.startDate).getTime() + (requirement.duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                : new Date(Date.now() + (requirement.duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/partners/fetch-hotels`, {
                destination: requirement.destination,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                adults: requirement.pax.adults
            }, config);

            setLiveHotels(res.data.hotels || []);
        } catch (error) {
            console.error('Error fetching hotels:', error);
            alert('Failed to fetch hotels. Please check your SerpApi key.');
        } finally {
            setLoadingHotels(false);
        }
    };

    const handleGenerateQuotes = async () => {
        if (selectedPartners.length === 0) return;
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/quotes/generate`, {
                requirementId: id,
                partnerIds: selectedPartners,
                selectedHotel: selectedHotel, // Pass selected hotel to backend
            }, config);

            navigate('/agent/quotes'); // Redirect to quotes list (to be built)
        } catch (error) {
            console.error('Error generating quotes:', error);
            alert('Failed to generate quotes');
        } finally {
            setGenerating(false);
        }
    };

    if (loading || !requirement) return <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center text-white"><FaSpinner className="animate-spin text-4xl mx-auto text-emerald-400" /></div>;

    return (
        <div className="min-h-screen bg-black text-gray-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Modern Header */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                                {requirement.status}
                            </span>
                            <span className="text-gray-500 text-sm font-mono tracking-tighter">#{requirement._id.slice(-6)}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-medium text-white tracking-tight">
                            {requirement.destination}
                            <span className="text-emerald-500">.</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg font-light flex items-center gap-6">
                            <span>{requirement.duration} Days</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>{requirement.tripType}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>₹{requirement.budget.toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Stats Pill */}
                        <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <FaUserFriends className="text-gray-400" />
                                <span className="text-white font-medium">{requirement.pax.adults + requirement.pax.children}</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-500/80" />
                                <span className="text-white font-medium">{requirement.hotelStar}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Agent Console (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* MAIN AI CONSOLE */}
                        <motion.div
                            layout
                            className="bg-zinc-900/40 border border-white/10 rounded-3xl p-1 overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/50"
                        >
                            <div className="bg-black/40 rounded-[20px] p-6 md:p-10 border border-white/5 relative overflow-hidden group">
                                {/* Decorative Glow */}
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] transition-opacity duration-1000 ${agentStatus === 'RUNNING' ? 'opacity-100' : 'opacity-0'}`} />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                {agentStatus === 'RUNNING' ? (
                                                    <FaSpinner className="text-white text-2xl animate-spin" />
                                                ) : (
                                                    <FaBolt className="text-white text-2xl" />
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-serif text-white mb-1">Voyage AI Agent</h2>
                                                <p className="text-gray-400 text-sm">
                                                    {agentStatus === 'RUNNING' ? 'Orchestrating your perfect trip...' : 'Ready to curate your experience'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dynamic Status Badge */}
                                        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase transition-all ${agentStatus === 'RUNNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' :
                                                agentStatus === 'DONE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    'bg-white/5 border-white/10 text-gray-500'
                                            }`}>
                                            {agentStatus === 'IDLE' && 'IDLE'}
                                            {agentStatus === 'RUNNING' && 'PROCESSING'}
                                            {agentStatus === 'DONE' && 'COMPLETED'}
                                            {agentStatus === 'ERROR' && 'FAILED'}
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="space-y-6">
                                        {/* Progress Visualization */}
                                        <AnimatePresence mode="wait">
                                            {(agentStatus === 'RUNNING' || agentStatus === 'ERROR') && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <AgentProgress status={agentStatus} currentStep={agentStep} error={agentError} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Result Card Preview */}
                                        <AnimatePresence>
                                            {agentStatus === 'DONE' && agentResult && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                                    <AgentResultCard
                                                        result={agentResult}
                                                        onOpenQuote={() => {
                                                            if (agentResult.quoteId) {
                                                                navigate(`/agent/quote/${agentResult.quoteId}`);
                                                            }
                                                        }}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Primary Button */}
                                        {(agentStatus === 'IDLE' || agentStatus === 'ERROR' || agentStatus === 'DONE') && (
                                            <div className="pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => {
                                                        const isRegeneration = agentStatus === 'DONE';
                                                        runAgent(isRegeneration);
                                                    }}
                                                    disabled={agentStatus === 'RUNNING'}
                                                    className="group relative w-full overflow-hidden rounded-xl bg-white p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                                >
                                                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#50a799_50%,#E2E8F0_100%)]" />
                                                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-8 py-4 text-base font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900">
                                                        {agentStatus === 'ERROR' ? (forceRerun ? 'Force Rerun' : 'Retry Agent') : agentStatus === 'DONE' ? 'Regenerate Itinerary' : 'Initialize Agent Run'}
                                                        <FaBolt className="ml-2 group-hover:text-emerald-400 transition-colors" />
                                                    </span>
                                                </button>

                                                {is409Error && (
                                                    <div className="flex justify-center mt-3">
                                                        <label className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
                                                            <input type="checkbox" checked={forceRerun} onChange={(e) => setForceRerun(e.target.checked)} className="rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-0" />
                                                            Force overwrite existing run
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* PARTNERS SECTION */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-serif text-white">Curated Partners</h2>
                                <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-400 border border-white/5">{partners.length} Available</span>
                            </div>

                            {/* Filter Bar Redesign */}
                            <motion.form
                                onSubmit={handleFilter}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                            >
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Destination</label>
                                    <input
                                        type="text"
                                        value={filters.destination}
                                        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Budget</label>
                                    <input
                                        type="number"
                                        value={filters.budget}
                                        onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Trip Type</label>
                                    <select
                                        value={filters.tripType || ''}
                                        onChange={(e) => setFilters({ ...filters, tripType: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors"
                                    >
                                        <option value="">Any</option>
                                        <option value="Honeymoon">Honeymoon</option>
                                        <option value="Family">Family</option>
                                        <option value="Adventure">Adventure</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-lg border border-white/10 transition-colors">
                                        Update
                                    </button>
                                </div>
                            </motion.form>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {partners.map((partner) => (
                                        <motion.div
                                            key={partner._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => togglePartner(partner.userId)}
                                            className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${selectedPartners.includes(partner.userId)
                                                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                                                    : 'border-white/5 bg-black/20 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPartners.includes(partner.userId) ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 bg-black/50'
                                                    }`}>
                                                    {selectedPartners.includes(partner.userId) && <FaCheckCircle className="text-black text-xs" />}
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                                    <img src={partner.images?.[0]} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{partner.companyName}</h3>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{partner.destinations.join(', ')}</p>
                                                    <p className="text-sm font-mono text-emerald-500 mt-2">₹{partner.startingPrice?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Info & Tools (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Live Hotels Mini-Widget */}
                        <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl text-white">Live Hotels</h3>
                                <button
                                    onClick={fetchLiveHotels}
                                    disabled={loadingHotels}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                >
                                    {loadingHotels ? <FaSpinner className="animate-spin" /> : <FaHotel />}
                                </button>
                            </div>

                            {loadingHotels ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : liveHotels.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                                    {liveHotels.map((hotel, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedHotel(selectedHotel?.name === hotel.name ? null : hotel)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedHotel?.name === hotel.name
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-black/20 border-white/5 hover:bg-black/40'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-medium text-white line-clamp-1">{hotel.name}</h4>
                                                {hotel.rating && <span className="text-[10px] text-yellow-500 flex items-center gap-1"><FaStar />{hotel.rating}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{hotel.location}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-emerald-400 font-mono text-sm">₹{hotel.price?.toLocaleString()}</span>
                                                {selectedHotel?.name === hotel.name && <FaCheckCircle className="text-emerald-500 text-xs" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sm text-gray-600">
                                    Click refresh to fetch live prices
                                </div>
                            )}
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="font-serif text-lg text-white mb-4">Traveler</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                        {requirement.contactInfo.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{requirement.contactInfo.name}</p>
                                        <p className="text-xs text-gray-500">{requirement.contactInfo.email}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="text-gray-300">{requirement.contactInfo.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Floating Generate Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={handleGenerateQuotes}
                        disabled={selectedPartners.length === 0 || generating}
                        className="group flex items-center gap-3 bg-white text-black pl-6 pr-8 py-4 rounded-full font-bold shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {generating ? <FaSpinner className="animate-spin" /> : (
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                                <span className="text-xs">{selectedPartners.length}</span>
                            </div>
                        )}
                        <span>Generate Quotes</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Modal for Partner Details (Simplified) */}
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
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                    <span className="text-gray-300 font-medium">{am}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                                        <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Starting From</p>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl lg:text-4xl font-serif font-bold text-white">₹{viewingPartner.startingPrice?.toLocaleString()}</span>
                                            <span className="text-gray-500">/ person</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                togglePartner(viewingPartner.userId);
                                                setViewingPartner(null);
                                            }}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 ${selectedPartners.includes(viewingPartner.userId)
                                                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                                : 'bg-white text-black hover:bg-gray-200'
                                                }`}
                                        >
                                            {selectedPartners.includes(viewingPartner.userId) ? 'Selected' : 'Select Partner'}
                                        </button>
                                    </div>

                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                                        <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                                            <FaCheckCircle /> Verified Partner
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            This partner has been verified by VoyageGen guidelines and quality standards.
                                        </p>
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
