const { getJson } = require('serpapi');

/**
 * Fetch live hotel data using SerpApi
 * @param {string} destination - Destination city/location
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} adults - Number of adults (default: 2)
 * @returns {Promise<Array>} Array of hotel objects with name, price, rating, image
 */
const fetchHotels = async (destination, checkIn, checkOut, adults = 2) => {
    try {
        // Check if API key is configured
        if (!process.env.SERPAPI_KEY) {
            console.warn('SERPAPI_KEY not configured, returning empty hotel list');
            return [];
        }

        const params = {
            engine: 'google_hotels',
            q: destination,
            check_in_date: checkIn,
            check_out_date: checkOut,
            adults: adults,
            currency: 'INR',
            gl: 'in',
            hl: 'en',
            api_key: process.env.SERPAPI_KEY,
        };

        const response = await getJson(params);

        // Extract and format hotel data
        if (response.properties && Array.isArray(response.properties)) {
            const hotels = response.properties.slice(0, 10).map(hotel => ({
                name: hotel.name || 'Unknown Hotel',
                price: hotel.rate_per_night?.lowest ? parseFloat(hotel.rate_per_night.lowest.replace(/[^0-9.]/g, '')) : 5000,
                rating: hotel.overall_rating || 'N/A',
                image: hotel.images?.[0]?.thumbnail || null,
                location: hotel.neighborhood || destination,
                amenities: hotel.amenities || []
            }));
            
            // Sort by price (high to low) - Premium hotels first
            hotels.sort((a, b) => b.price - a.price);
            
            return hotels;
        }

        return [];
    } catch (error) {
        console.error('SerpApi fetch error:', error.message || error);
        // Return empty array instead of throwing to allow graceful degradation
        return [];
    }
};

module.exports = {
    fetchHotels,
};
