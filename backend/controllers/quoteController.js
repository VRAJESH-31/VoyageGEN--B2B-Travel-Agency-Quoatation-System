const Quote = require('../models/Quote');
const Requirement = require('../models/Requirement');
const PartnerProfile = require('../models/PartnerProfile');

// @desc    Auto-generate quotes for selected partners
// @route   POST /api/quotes/generate
// @access  Private (Agent)
const generateQuotes = async (req, res) => {
    const { requirementId, partnerIds } = req.body;

    try {
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });

        const quotes = [];

        for (const partnerId of partnerIds) {
            // Fetch partner profile instead of inventory
            const partner = await PartnerProfile.findOne({ userId: partnerId }).populate('userId', 'name email');
            if (!partner) continue;

            // Build quote sections using partner data
            const quoteSections = {
                hotels: [],
                transport: [],
                activities: [],
            };

            let netCost = 0;
            const duration = requirement.duration || 6;
            const adults = requirement.adults || 2;

            // 1. Add Hotel based on partner's starting price
            if (partner.type === 'Hotel' || partner.type === 'DMC' || partner.type === 'Mixed') {
                const hotelPrice = partner.startingPrice || 5000;
                const nights = duration - 1;
                const roomCost = hotelPrice * nights;

                quoteSections.hotels.push({
                    name: partner.companyName,
                    city: partner.destinations[0] || requirement.destination,
                    roomType: 'Deluxe Room',
                    nights: nights,
                    unitPrice: hotelPrice,
                    qty: 1,
                    total: roomCost,
                });
                netCost += roomCost;
            }

            // 2. Add Transport
            if (partner.type === 'CabProvider' || partner.type === 'DMC' || partner.type === 'Mixed') {
                const transportPrice = 3000; // Default per day
                const days = duration;
                const transportCost = transportPrice * days;

                quoteSections.transport.push({
                    type: 'Private Sedan',
                    days: days,
                    unitPrice: transportPrice,
                    total: transportCost,
                });
                netCost += transportCost;
            }

            // 3. Add Activities based on sightseeing
            if (partner.sightSeeing && partner.sightSeeing.length > 0) {
                const activitiesToAdd = partner.sightSeeing.slice(0, 3);
                activitiesToAdd.forEach((sight, index) => {
                    const activityPrice = 1500 + (index * 500); // Varying prices
                    const activityCost = activityPrice * adults;

                    quoteSections.activities.push({
                        name: sight,
                        unitPrice: activityPrice,
                        qty: adults,
                        total: activityCost,
                    });
                    netCost += activityCost;
                });
            }

            // Create Quote Record
            const quote = await Quote.create({
                requirementId,
                partnerId: partner.userId._id,
                agentId: req.user._id,
                title: `${requirement.destination} Trip - ${requirement.tripType}`,
                sections: quoteSections,
                costs: {
                    net: netCost,
                    margin: 10, // Default 10%
                    final: netCost * 1.1,
                    perHead: (netCost * 1.1) / adults,
                },
                status: 'DRAFT',
            });

            quotes.push(quote);
        }

        // Update Requirement Status to QUOTES_READY
        requirement.status = 'QUOTES_READY';
        await requirement.save();

        res.status(201).json(quotes);
    } catch (error) {
        console.error('Quote generation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quotes for agent
// @route   GET /api/quotes
// @access  Private (Agent)
const getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({})
            .populate('requirementId', 'destination tripType budget startDate duration')
            .populate('agentId', 'name email')
            .sort({ createdAt: -1 });

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get quotes for a requirement
// @route   GET /api/quotes/requirement/:id
// @access  Private (Agent)
const getQuotesByRequirement = async (req, res) => {
    try {
        const quotes = await Quote.find({ requirementId: req.params.id }).populate('partnerId', 'name companyName');
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quote by ID
// @route   GET /api/quotes/:id
// @access  Private (Agent)
const getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id).populate('partnerId', 'name companyName');
        if (quote) {
            res.json(quote);
        } else {
            res.status(404).json({ message: 'Quote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a quote (Editor)
// @route   PUT /api/quotes/:id
// @access  Private (Agent)
const updateQuote = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) return res.status(404).json({ message: 'Quote not found' });

        // Update fields
        const { sections, costs, status } = req.body;
        if (sections) quote.sections = sections;
        if (costs) quote.costs = costs;
        if (status) quote.status = status;

        await quote.save();
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a quote
// @route   DELETE /api/quotes/:id
// @access  Private (Agent)
const deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) return res.status(404).json({ message: 'Quote not found' });

        await Quote.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateQuotes,
    getQuotes,
    getQuotesByRequirement,
    getQuoteById,
    updateQuote,
    deleteQuote,
};
