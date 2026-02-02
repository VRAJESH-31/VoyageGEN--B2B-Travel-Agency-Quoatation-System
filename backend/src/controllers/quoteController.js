const Quote = require('../models/Quote');
const Requirement = require('../models/Requirement');
const PartnerProfile = require('../models/PartnerProfile');
const axios = require('axios');
const travelDataService = require('../services/travelDataService');
const aiService = require('../services/aiService');

// @desc    Auto-generate quotes for selected partners
// @route   POST /api/quotes/generate
// @access  Private (Agent)
const generateQuotes = async (req, res) => {
    const { requirementId, partnerIds, customItems, selectedHotel } = req.body;

    try {
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });

        const quotes = [];
        const duration = requirement.duration || 6;
        const adults = requirement.adults || 2;

        // 1. Fetch Live Hotel Data using SerpApi
        let liveHotels = [];
        try {
            const checkInDate = requirement.startDate 
                ? new Date(requirement.startDate).toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0];
            
            const checkOutDate = requirement.startDate 
                ? new Date(new Date(requirement.startDate).getTime() + (duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                : new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

            liveHotels = await travelDataService.fetchHotels(
                requirement.destination,
                checkInDate,
                checkOutDate,
                adults
            );
            
            if (liveHotels.length > 0) {
                console.log(`Fetched ${liveHotels.length} live hotels for ${requirement.destination}`);
            }
        } catch (error) {
            console.error('Live hotel fetch error:', error.message);
            // Continue without live data
        }

        // 2. Generate Quotes for Selected Partners
        if (partnerIds && partnerIds.length > 0) {
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
                
                // START: Base Package Price (Partner's rate * Number of Days)
                const basePackagePrice = (partner.startingPrice || 50000) * duration; // e.g., ₹200,000/day * 4 days = 800,000
                netCost += basePackagePrice;
                
                console.log(`Partner ${partner.companyName}: Base package ₹${partner.startingPrice || 50000}/day * ${duration} days = ₹${basePackagePrice}`);
                
                let selectedHotelName = partner.companyName;
                let selectedHotelPrice = partner.startingPrice || 5000;

                // Add Hotel based on: 1) User-selected hotel, 2) Live hotel data, or 3) Partner's price
                if (partner.type === 'Hotel' || partner.type === 'DMC' || partner.type === 'Mixed') {
                    // Priority 1: User-selected hotel from frontend
                    if (selectedHotel) {
                        selectedHotelName = selectedHotel.name;
                        selectedHotelPrice = selectedHotel.price;
                    }
                    // Priority 2: Auto-fetched live hotel data
                    else if (liveHotels.length > 0) {
                        const liveHotel = liveHotels[0]; // Use best match (first result)
                        selectedHotelName = liveHotel.name;
                        selectedHotelPrice = liveHotel.price;
                    }
                    // Priority 3: Partner's default pricing (fallback)

                    const nights = duration - 1;
                    const roomCost = selectedHotelPrice * nights;

                    quoteSections.hotels.push({
                        name: selectedHotelName,
                        city: partner.destinations[0] || requirement.destination,
                        roomType: 'Deluxe Room',
                        nights: nights,
                        unitPrice: selectedHotelPrice,
                        qty: 1,
                        total: roomCost,
                    });
                    netCost += roomCost;
                }

                // Add Transport
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

                // Add Activities based on sightseeing
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

                // Add Custom AI Items (Live Market)
                if (customItems && customItems.length > 0) {
                    customItems.forEach(item => {
                        if (item.type === 'Hotel') {
                            quoteSections.hotels.push({
                                name: item.name,
                                city: item.location || requirement.destination,
                                roomType: 'Standard Room',
                                nights: duration - 1,
                                unitPrice: item.price,
                                qty: 1,
                                total: item.price * (duration - 1),
                                source: 'AI'
                            });
                            netCost += item.price * (duration - 1);
                        } else if (item.type === 'Transport') {
                            quoteSections.transport.push({
                                type: item.name,
                                days: duration,
                                unitPrice: item.price,
                                total: item.price * duration,
                                source: 'AI'
                            });
                            netCost += item.price * duration;
                        }
                    });
                }

                // Generate AI Itinerary Text for this specific quote
                let itineraryText = '';
                try {
                    itineraryText = await aiService.generateItinerary(
                        {
                            destination: requirement.destination,
                            duration: duration,
                            tripType: requirement.tripType,
                            startDate: requirement.startDate
                        },
                        selectedHotelName,
                        selectedHotelPrice
                    );
                } catch (error) {
                    console.error('AI Itinerary generation error:', error.message);
                    // Continue without itinerary text
                }

                // Create Quote Record
                const quote = await Quote.create({
                    requirementId,
                    partnerId: partner.userId._id,
                    agentId: req.user._id,
                    title: `${requirement.destination} Trip - ${requirement.tripType} (Partner)`,
                    sections: quoteSections,
                    costs: {
                        net: netCost,
                        margin: 10, // Default 10%
                        final: netCost * 1.1,
                        perHead: (netCost * 1.1) / adults,
                    },
                    status: 'DRAFT',
                    itineraryText: itineraryText,
                });

                quotes.push(quote);
            }
        }

        // 3. Generate Standalone Quote for Custom Items (if no partners selected)
        if ((!partnerIds || partnerIds.length === 0) && customItems && customItems.length > 0) {
            const quoteSections = {
                hotels: [],
                transport: [],
                activities: [],
            };
            let netCost = 0;

            customItems.forEach(item => {
                if (item.type === 'Hotel') {
                    quoteSections.hotels.push({
                        name: item.name,
                        city: item.location || requirement.destination,
                        roomType: 'Standard Room',
                        nights: duration - 1,
                        unitPrice: item.price,
                        qty: 1,
                        total: item.price * (duration - 1),
                        source: 'AI'
                    });
                    netCost += item.price * (duration - 1);
                } else if (item.type === 'Transport') {
                    quoteSections.transport.push({
                        type: item.name,
                        days: duration,
                        unitPrice: item.price,
                        total: item.price * duration,
                        source: 'AI'
                    });
                    netCost += item.price * duration;
                }
            });

            const quote = await Quote.create({
                requirementId,
                partnerId: null, // No partner
                agentId: req.user._id,
                title: `${requirement.destination} Trip - Market Options`,
                sections: quoteSections,
                costs: {
                    net: netCost,
                    margin: 10,
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

// @desc    Get all quotes for agent with pagination
// @route   GET /api/quotes?page=1&limit=10
// @access  Private (Agent)
const getQuotes = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const total = await Quote.countDocuments({});
        const quotes = await Quote.find({})
            .populate('requirementId', 'destination tripType budget startDate duration')
            .populate('agentId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: quotes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
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
