/**
 * Research Agent Service
 * Searches Partner Inventory first, falls back to SerpApi
 */

const { PartnerHotel } = require('../../models/PartnerInventory');
const { fetchHotels } = require('../travelDataService');

/**
 * Search partner hotel inventory by destination and budget
 * @param {string} destination - Destination city/location
 * @param {number} budget - Total trip budget (used to estimate max hotel price)
 * @param {number} duration - Trip duration in days
 * @param {number} starRating - Preferred hotel star rating (optional)
 * @returns {Promise<Array>} Array of partner hotels
 */
const searchPartnerInventory = async (destination, budget, duration, starRating = null) => {
    try {
        // Estimate max hotel price per night (assume 40% of budget for hotels)
        const maxHotelBudget = budget * 0.4;
        const maxPricePerNight = duration > 0 ? maxHotelBudget / duration : maxHotelBudget;

        // Build query
        const query = {
            city: { $regex: new RegExp(destination, 'i') }, // Case-insensitive match
        };

        // Add star rating filter if provided
        if (starRating && starRating >= 1 && starRating <= 5) {
            query.starRating = { $gte: starRating - 1, $lte: starRating + 1 }; // Allow +/- 1 star
        }

        const hotels = await PartnerHotel.find(query)
            .populate('partnerId', 'name companyName')
            .limit(10)
            .lean();

        // Normalize partner hotels to standard format
        return hotels.map(hotel => {
            // Get cheapest room price
            const cheapestRoom = hotel.roomTypes?.reduce((min, room) => 
                room.price < min.price ? room : min, 
                hotel.roomTypes[0] || { price: 5000 }
            );

            return {
                name: hotel.name,
                pricePerNight: cheapestRoom?.price || 5000,
                source: 'PARTNER',
                partnerId: hotel.partnerId?._id?.toString() || null,
                partnerName: hotel.partnerId?.companyName || hotel.partnerId?.name || 'Unknown Partner',
                rating: hotel.starRating || 4,
                starRating: hotel.starRating || null,
                location: hotel.city,
                amenities: hotel.amenities || [],
                roomTypes: hotel.roomTypes || [],
            };
        });

    } catch (error) {
        console.error('Partner inventory search error:', error.message);
        return [];
    }
};

/**
 * Fetch hotels from SerpApi as fallback
 * @param {Object} normalizedParams - Supervisor normalized params
 * @returns {Promise<Array>} Array of SerpApi hotels normalized
 */
const fetchSerpApiHotels = async (normalizedParams) => {
    try {
        const { destination, startDate, endDate, pax } = normalizedParams;
        
        // Call existing travelDataService
        const hotels = await fetchHotels(
            destination,
            startDate,
            endDate,
            pax?.adults || 2
        );

        // Normalize to standard format
        return hotels.map(hotel => ({
            name: hotel.name,
            pricePerNight: hotel.price || 5000,
            source: 'SERPAPI',
            partnerId: null,
            partnerName: null,
            rating: typeof hotel.rating === 'number' ? hotel.rating : parseFloat(hotel.rating) || 4,
            starRating: null,
            location: hotel.location || destination,
            amenities: hotel.amenities || [],
            image: hotel.image || null,
        }));

    } catch (error) {
        console.error('SerpApi fallback error:', error.message);
        return [];
    }
};

/**
 * Calculate price range from hotel list
 * @param {Array} hotels - Array of hotel objects
 * @returns {Object} { min, max }
 */
const calculatePriceRange = (hotels) => {
    if (!hotels.length) return { min: 0, max: 0 };
    
    const prices = hotels.map(h => h.pricePerNight).filter(p => p > 0);
    if (!prices.length) return { min: 0, max: 0 };

    return {
        min: Math.min(...prices),
        max: Math.max(...prices),
    };
};

/**
 * Generate research suggestions based on data
 * @param {Array} hotels - Combined hotel list
 * @param {Object} params - Normalized params
 * @returns {Array} Suggestion strings
 */
const generateSuggestions = (hotels, params) => {
    const suggestions = [];

    if (hotels.length === 0) {
        suggestions.push('No hotels found for this destination. Consider expanding search.');
    } else if (hotels.length < 3) {
        suggestions.push('Limited hotel options available. Consider nearby areas.');
    }

    const partnerCount = hotels.filter(h => h.source === 'PARTNER').length;
    if (partnerCount > 0) {
        suggestions.push(`${partnerCount} partner hotels available with negotiated rates.`);
    }

    if (params.tripType === 'Honeymoon') {
        suggestions.push('Recommend booking rooms with romantic packages.');
    } else if (params.tripType === 'Family') {
        suggestions.push('Look for family suites with extra beds.');
    }

    return suggestions;
};

/**
 * Main research function - searches inventory and falls back to SerpApi
 * @param {Object} normalizedParams - Output from Supervisor step
 * @returns {Promise<Object>} Research output with hotels, priceRange, suggestions
 */
const performResearch = async (normalizedParams) => {
    const {
        destination,
        budget,
        duration,
        hotelStar,
    } = normalizedParams;

    const logs = [];
    let partnerHotels = [];
    let serpApiHotels = [];

    // Step 1: Search Partner Inventory (Priority)
    logs.push(`Searching partner inventory for: ${destination}`);
    partnerHotels = await searchPartnerInventory(destination, budget, duration, hotelStar);
    logs.push(`Found ${partnerHotels.length} partner hotels`);

    // Step 2: SerpApi Fallback (if needed)
    const needFallback = partnerHotels.length < 3;
    if (needFallback) {
        logs.push('Partner inventory insufficient, calling SerpApi fallback...');
        serpApiHotels = await fetchSerpApiHotels(normalizedParams);
        logs.push(`Found ${serpApiHotels.length} hotels from SerpApi`);
    }

    // Step 3: Combine and deduplicate hotels
    const allHotels = [...partnerHotels, ...serpApiHotels];
    
    // Remove duplicates by name (case-insensitive)
    const seen = new Set();
    const uniqueHotels = allHotels.filter(hotel => {
        const key = hotel.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort by price (ascending for budget-friendly first)
    uniqueHotels.sort((a, b) => a.pricePerNight - b.pricePerNight);

    // Take top 10
    const finalHotels = uniqueHotels.slice(0, 10);

    // Step 4: Calculate metrics
    const priceRange = calculatePriceRange(finalHotels);
    const suggestions = generateSuggestions(finalHotels, normalizedParams);

    // Calculate data confidence (0-1)
    let dataConfidence = 0;
    if (partnerHotels.length >= 3) dataConfidence = 0.9;
    else if (partnerHotels.length > 0) dataConfidence = 0.7;
    else if (serpApiHotels.length > 0) dataConfidence = 0.5;
    else dataConfidence = 0.1;

    // Step 5: Build output
    const researchOutput = {
        hotels: finalHotels,
        priceRange,
        suggestions,
        dataConfidence,
        sources: {
            partner: partnerHotels.length,
            serpapi: serpApiHotels.length,
        },
        logs,
    };

    return researchOutput;
};

module.exports = {
    performResearch,
    searchPartnerInventory,
    fetchSerpApiHotels,
    calculatePriceRange,
    generateSuggestions,
};
