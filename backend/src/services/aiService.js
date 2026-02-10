const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate AI-powered itinerary text using Google Gemini
 * @param {Object} requirement - Requirement details (destination, duration, tripType, startDate)
 * @param {string} hotelName - Selected hotel name
 * @param {number} hotelPrice - Hotel price per night
 * @returns {Promise<string>} Formatted itinerary text
 */
const generateItinerary = async (requirement, hotelName, hotelPrice) => {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not configured, returning basic itinerary');
            return generateFallbackItinerary(requirement, hotelName, hotelPrice);
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Generate a detailed day-by-day travel itinerary for the following trip:

Destination: ${requirement.destination}
Duration: ${requirement.duration} days
Trip Type: ${requirement.tripType}
Start Date: ${requirement.startDate || 'TBD'}
Selected Hotel: ${hotelName}
Hotel Price per Night: ₹${hotelPrice}

IMPORTANT: You MUST follow this EXACT format for the output:

Here is your detailed ${requirement.duration}-day trip plan to ${requirement.destination}

Day 1: [Date]
Temperature: [Temp]°C, [Weather Condition]
• [Activity 1]
• [Activity 2]
• [Activity 3]
Estimated Cost: ₹[Cost]

Day 2: [Date]
Temperature: [Temp]°C, [Weather Condition]
• [Activity 1]
• [Activity 2]
• [Activity 3]
Estimated Cost: ₹[Cost]

... (continue for all ${requirement.duration} days)

RULES:
1. Start with exactly: "Here is your detailed [X]-day trip plan to [Destination]"
2. Each day must have a date, temperature with weather, bullet-pointed activities, and estimated cost in INR
3. Include realistic activities based on the trip type (${requirement.tripType})
4. Costs should be reasonable for Indian travelers
5. Keep activities practical and destination-specific
6. DO NOT add any additional sections or summaries

Generate the itinerary now:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error('Gemini API error:', error.message);
        // Return fallback itinerary on error
        return generateFallbackItinerary(requirement, hotelName, hotelPrice);
    }
};

/**
 * Generate a basic fallback itinerary when AI service is unavailable
 */
const generateFallbackItinerary = (requirement, hotelName, hotelPrice) => {
    const { destination, duration, tripType, startDate } = requirement;
    let itinerary = `Here is your detailed ${duration}-day trip plan to ${destination}\n\n`;

    const startDateObj = startDate ? new Date(startDate) : new Date();
    const avgDailyCost = 3000; // Default average daily cost

    for (let i = 1; i <= duration; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setDate(currentDate.getDate() + (i - 1));
        const dateStr = currentDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

        itinerary += `Day ${i}: ${dateStr}\n`;
        itinerary += `Temperature: 25°C, Pleasant\n`;
        itinerary += `• Explore ${destination} attractions\n`;
        itinerary += `• Local sightseeing\n`;
        itinerary += `• ${tripType === 'Adventure' ? 'Adventure activities' : tripType === 'Leisure' ? 'Relaxation and leisure' : 'Cultural experiences'}\n`;
        itinerary += `Estimated Cost: ₹${avgDailyCost}\n\n`;
    }

    return itinerary.trim();
};

module.exports = {
    generateItinerary,
};
