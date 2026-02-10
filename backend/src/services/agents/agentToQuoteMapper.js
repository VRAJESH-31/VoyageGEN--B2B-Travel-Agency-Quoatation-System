// Agent to Quote Mapper - Convert AgentRun result to Quote
const Quote = require('../../models/Quote');

// Helper to format 12h time
const formatTime12h = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

// Generate itinerary text from JSON for PDF
const generateItineraryText = (itinerary) => {
    if (!itinerary?.days) return '';
    
    let text = `${itinerary.summary || 'Premium Travel Itinerary'}\n\n`;
    text += `------------------------------------------------\n\n`;
    
    itinerary.days.forEach(day => {
        text += `Day ${day.dayNumber}: ${day.theme || 'Adventure Details'}\n`;
        text += `Date: ${day.date || 'TBD'} 🗓️\n`;
        
        // Mock Weather for premium feel (since we don't have live weather)
        const weathers = ['Sunny ☀️', 'Partly Cloudy ⛅', 'Clear Skies 🌞', 'Pleasant 🍃'];
        const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
        const randomTemp = Math.floor(Math.random() * (32 - 24 + 1)) + 24;
        text += `Weather: ${randomWeather} • ${randomTemp}°C\n`;

        text += `\n`; // Spacer
        
        day.activities?.forEach(act => {
            const timeStr = formatTime12h(act.time);
            text += `• ${timeStr} - ${act.activity}`;
            if (act.cost > 0) text += ` (₹${act.cost})`;
            text += '\n';
        });
        
        text += `\nEst. Daily Cost: ₹${day.dailyCost || 0}\n`;
        text += `------------------------------------------------\n\n`;
    });
    
    return text.trim();
};

// Map AgentRun data to Quote document
const mapAgentRunToQuote = ({ agentRun, requirement, priceOutput, researchOutput, itinerary }) => {
    const selectedHotel = priceOutput?.selectedHotel || itinerary?.selectedHotel || {};
    const breakdown = priceOutput?.breakdown || {};
    const duration = requirement.duration || itinerary?.days?.length || 1;
    
    // Find partner ID if hotel source is PARTNER
    let partnerId = null;
    const hotelInResearch = researchOutput?.hotels?.find(h => h.name === selectedHotel.name);
    if (hotelInResearch?.source === 'PARTNER' && hotelInResearch?.partnerId) {
        partnerId = hotelInResearch.partnerId;
    }
    
    // Build sections
    const sections = {
        hotels: [{
            name: selectedHotel.name || 'Standard Hotel',
            city: requirement.destination,
            roomType: 'Standard',
            nights: duration,
            unitPrice: selectedHotel.pricePerNight || 5000,
            qty: 1,
            total: selectedHotel.totalCost || (selectedHotel.pricePerNight * duration)
        }],
        transport: [{
            vehicleType: 'Sedan',
            days: duration,
            unitPrice: Math.round((breakdown.transport || 0) / duration) || 1000,
            total: breakdown.transport || 0
        }],
        activities: []
    };
    
    // Extract activities from itinerary
    itinerary?.days?.forEach(day => {
        day.activities?.forEach(act => {
            if (act.cost > 0) {
                sections.activities.push({
                    name: act.activity,
                    unitPrice: act.cost,
                    qty: 1,
                    total: act.cost
                });
            }
        });
    });
    
    return {
        requirementId: requirement._id,
        agentId: agentRun.startedBy,
        partnerId,
        agentRunId: agentRun._id,
        title: `${requirement.destination} - ${requirement.tripType} Trip`,
        sections,
        costs: {
            net: priceOutput?.netCost || 0,
            margin: priceOutput?.marginPercent || 12,
            final: priceOutput?.finalCost || 0,
            perHead: priceOutput?.perHeadCost || 0
        },
        status: 'READY',
        itineraryText: generateItineraryText(itinerary),
        itineraryJson: itinerary
    };
};

// Create quote from AgentRun
const createQuoteFromAgentRun = async ({ agentRun, requirement }) => {
    const priceOutput = agentRun.steps?.find(s => s.stepName === 'PRICE')?.output;
    const researchOutput = agentRun.steps?.find(s => s.stepName === 'RESEARCH')?.output;
    const qualityOutput = agentRun.steps?.find(s => s.stepName === 'QUALITY')?.output;
    const itinerary = qualityOutput?.finalItinerary || agentRun.finalResult;
    
    if (!itinerary || !priceOutput) {
        throw new Error('Missing itinerary or pricing data');
    }
    
    const quoteData = mapAgentRunToQuote({
        agentRun,
        requirement,
        priceOutput,
        researchOutput,
        itinerary
    });
    
    const quote = await Quote.create(quoteData);
    return quote;
};

module.exports = {
    createQuoteFromAgentRun,
    mapAgentRunToQuote,
    generateItineraryText
};
