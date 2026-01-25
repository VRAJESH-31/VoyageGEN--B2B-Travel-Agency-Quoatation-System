// Planner Agent Service - Gemini JSON Itinerary Generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Strict JSON prompt for itinerary
const buildItineraryPrompt = (params, research) => {
    const hotel = research.hotels?.[0] || { name: 'Standard Hotel', pricePerNight: 5000 };
    
    return `Generate a travel itinerary as VALID JSON ONLY. No markdown, no explanation.

TRIP DETAILS:
- Destination: ${params.destination}
- Duration: ${params.duration} days
- Type: ${params.tripType}
- Start: ${params.startDate}
- Budget: ₹${params.budget}
- Guests: ${params.pax.adults} adults, ${params.pax.children} children
- Hotel: ${hotel.name} (₹${hotel.pricePerNight}/night)

Return ONLY this JSON structure:
{
  "summary": "Brief trip summary",
  "selectedHotel": {
    "name": "${hotel.name}",
    "pricePerNight": ${hotel.pricePerNight},
    "totalCost": ${hotel.pricePerNight * params.duration}
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        { "time": "HH:MM", "activity": "Activity name", "cost": 0 }
      ],
      "meals": { "breakfast": "Location", "lunch": "Location", "dinner": "Location" },
      "dailyCost": 0
    }
  ],
  "totalEstimatedCost": 0,
  "costBreakdown": { "hotel": 0, "activities": 0, "transport": 0, "meals": 0, "misc": 0 },
  "highlights": ["highlight1", "highlight2"],
  "notes": ["note1", "note2"]
}

RULES:
1. days array must have exactly ${params.duration} items
2. Each day must have activities array with 3-5 items
3. All costs in INR
4. Output ONLY valid JSON, no backticks or markdown`;
};

// Validate itinerary JSON structure
const validateItinerary = (itinerary, expectedDays) => {
    const errors = [];
    
    if (!itinerary.summary) errors.push('Missing summary');
    if (!itinerary.selectedHotel) errors.push('Missing selectedHotel');
    if (!Array.isArray(itinerary.days)) errors.push('days must be array');
    else if (itinerary.days.length !== expectedDays) {
        errors.push(`Expected ${expectedDays} days, got ${itinerary.days.length}`);
    }
    if (!itinerary.totalEstimatedCost) errors.push('Missing totalEstimatedCost');
    
    // Validate each day
    itinerary.days?.forEach((day, i) => {
        if (!Array.isArray(day.activities) || day.activities.length === 0) {
            errors.push(`Day ${i + 1} missing activities`);
        }
    });
    
    return { valid: errors.length === 0, errors };
};

// Extract JSON from potentially messy response
const extractJson = (text) => {
    let cleaned = text.trim();
    
    // Remove markdown code blocks
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '');
    }
    
    // Find JSON boundaries
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        cleaned = cleaned.slice(start, end + 1);
    }
    
    return JSON.parse(cleaned);
};

// Main planner function
const generateItineraryJSON = async (normalizedParams, researchOutput) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = buildItineraryPrompt(normalizedParams, researchOutput);
    let itinerary = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
        attempts++;
        
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            itinerary = extractJson(text);
            const validation = validateItinerary(itinerary, normalizedParams.duration);
            
            if (validation.valid) {
                return { itinerary, warnings: [], attempts };
            }
            
            // Retry with fix prompt
            if (attempts < maxAttempts) {
                console.log('Validation failed, retrying:', validation.errors);
            } else {
                return { 
                    itinerary, 
                    warnings: validation.errors, 
                    attempts,
                    partialSuccess: true 
                };
            }
            
        } catch (parseError) {
            if (attempts >= maxAttempts) {
                throw new Error(`JSON parse failed after ${attempts} attempts: ${parseError.message}`);
            }
        }
    }
    
    throw new Error('Failed to generate valid itinerary');
};

module.exports = {
    generateItineraryJSON,
    validateItinerary,
    extractJson,
    buildItineraryPrompt,
};
