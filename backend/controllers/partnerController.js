const PartnerProfile = require('../models/PartnerProfile');
const { PartnerHotel, PartnerTransport, PartnerActivity } = require('../models/PartnerInventory');

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

// @desc    Filter partners (Agent)
// @route   POST /api/partners/filter
// @access  Private (Agent)
const filterPartners = async (req, res) => {
    const { destination, tripType, budget, startDate, duration, adults, hotelStar } = req.body;

    try {
        const query = {};

        // Filter by destination (case-insensitive, partial match)
        if (destination) {
            query.destinations = { $regex: destination, $options: 'i' };
        }

        // Filter by trip type via specializations (case-insensitive)
        if (tripType) {
            query.specializations = { $regex: tripType, $options: 'i' };
        }

        // Filter by budget range - partner's range should overlap with requirement budget
        if (budget) {
            const budgetNum = Number(budget);
            query.$or = [
                {
                    'budgetRange.min': { $lte: budgetNum },
                    'budgetRange.max': { $gte: budgetNum }
                },
                { budgetRange: { $exists: false } },
                { 'budgetRange.min': null },
                { 'budgetRange.max': null }
            ];
        }

        // Filter by rating (exact match for hotel star rating)
        if (hotelStar) {
            query.rating = { $gte: Number(hotelStar) };
        }

        let partners = await PartnerProfile.find(query).populate('userId', 'name email');

        // Smart Fallback: If no partners found but destination was provided, 
        // return partners from that destination ignoring other strict filters (like budget)
        if (partners.length === 0 && destination) {
            console.log(`No exact matches found for ${destination} with strict filters. Attempting fallback...`);
            const fallbackQuery = {
                destinations: { $regex: destination, $options: 'i' }
            };
            partners = await PartnerProfile.find(fallbackQuery).populate('userId', 'name email');
        }

        res.json(partners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyProfile,
    updateProfile,
    addInventory,
    filterPartners,
};
