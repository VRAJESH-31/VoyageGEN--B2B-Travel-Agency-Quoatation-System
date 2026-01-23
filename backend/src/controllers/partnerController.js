const PartnerProfile = require('../models/PartnerProfile');
const { PartnerHotel, PartnerTransport, PartnerActivity } = require('../models/PartnerInventory');
const axios = require('axios');

// @desc    Get current partner profile
// @route   GET /api/partners/me
// @access  Private (Partner)
const getMyProfile = async (req, res) => {
    try {
        const profile = await PartnerProfile.findOne({ userId: req.user._id });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update partner profile
// @route   POST /api/partners/profile
// @access  Private (Partner)
const updateProfile = async (req, res) => {
    try {
        const { companyName, destinations, type, specializations, budgetRange } = req.body;

        let profile = await PartnerProfile.findOne({ userId: req.user._id });

        if (profile) {
            profile.companyName = companyName || profile.companyName;
            profile.destinations = destinations || profile.destinations;
            profile.type = type || profile.type;
            profile.specializations = specializations || profile.specializations;
            profile.budgetRange = budgetRange || profile.budgetRange;
            await profile.save();
        } else {
            profile = await PartnerProfile.create({
                userId: req.user._id,
                companyName,
                destinations,
                type,
                specializations,
                budgetRange,
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add inventory item (Hotel, Transport, Activity)
// @route   POST /api/partners/inventory/:type
// @access  Private (Partner)
const addInventory = async (req, res) => {
    const { type } = req.params; // hotel, transport, activity
    const data = { ...req.body, partnerId: req.user._id };

    try {
        let item;
        if (type === 'hotel') item = await PartnerHotel.create(data);
        else if (type === 'transport') item = await PartnerTransport.create(data);
        else if (type === 'activity') item = await PartnerActivity.create(data);
        else return res.status(400).json({ message: 'Invalid inventory type' });

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Filter partners (Agent) - Flexible matching
// @route   POST /api/partners/filter
// @access  Private (Agent)
const filterPartners = async (req, res) => {
    const { destination, tripType, budget, startDate, duration, adults, hotelStar } = req.body;

    try {
        // Start with broad query - destination is most important
        const mustHaveQuery = {};
        
        // Destination filter (most important)
        if (destination) {
            mustHaveQuery.destinations = { $regex: destination, $options: 'i' };
        }

        // Get all partners matching destination (or all if no destination)
        let partners = await PartnerProfile.find(mustHaveQuery).populate('userId', 'name email');

        // Score-based filtering for best matches
        if (partners.length > 0) {
            partners = partners.map(partner => {
                let score = 0;
                
                // Destination match = +100 points (already filtered)
                if (destination && partner.destinations.some(d => d.toLowerCase().includes(destination.toLowerCase()))) {
                    score += 100;
                }
                
                // Trip type/specialization match = +50 points
                if (tripType && partner.specializations && partner.specializations.some(s => s.toLowerCase().includes(tripType.toLowerCase()))) {
                    score += 50;
                }
                
                // Budget compatibility = +30 points
                if (budget) {
                    const budgetNum = Number(budget);
                    if (!partner.budgetRange || !partner.budgetRange.min || partner.budgetRange.min <= budgetNum) {
                        score += 30;
                    }
                }
                
                // Star rating match = +20 points
                if (hotelStar && partner.rating >= Number(hotelStar)) {
                    score += 20;
                }
                
                return { ...partner.toObject(), matchScore: score };
            });
            
            // Sort by score (best matches first)
            partners.sort((a, b) => b.matchScore - a.matchScore);
            
            console.log(`Found ${partners.length} partners, sorted by relevance`);
        } else if (!destination) {
            // If no destination specified, return all partners
            partners = await PartnerProfile.find({}).populate('userId', 'name email');
            console.log(`No filters applied, returning all ${partners.length} partners`);
        } else {
            console.log(`No partners found for destination: ${destination}`);
        }

        res.json(partners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch live hotels from SerpApi
// @route   POST /api/partners/fetch-hotels
// @access  Private (Agent)
const fetchLiveHotels = async (req, res) => {
    const { destination, checkIn, checkOut, adults } = req.body;

    try {
        const travelDataService = require('../services/travelDataService');
        
        const hotels = await travelDataService.fetchHotels(
            destination,
            checkIn,
            checkOut,
            adults || 2
        );

        res.json({
            hotels,
            message: hotels.length > 0 ? `Found ${hotels.length} hotels` : 'No hotels found'
        });
    } catch (error) {
        console.error('Error fetching live hotels:', error.message);
        res.status(500).json({ 
            message: 'Failed to fetch live hotels',
            error: error.message 
        });
    }
};

module.exports = {
    getMyProfile,
    updateProfile,
    addInventory,
    filterPartners,
    fetchLiveHotels,
};
