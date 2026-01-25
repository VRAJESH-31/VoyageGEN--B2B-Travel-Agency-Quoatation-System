// Agent to Quote Mapper - Convert AgentRun result to Quote
const Quote = require('../../models/Quote');

// Generate itinerary text from JSON for PDF
const generateItineraryText = (itinerary) => {
    if (!itinerary?.days) return '';
    
    let text = `${itinerary.summary || 'Travel Itinerary'}\n\n`;
    
    itinerary.days.forEach(day => {
        text += `Day ${day.dayNumber}: ${day.theme || ''}\n`;
        text += `Date: ${day.date || 'TBD'}\n`;
        day.activities?.forEach(act => {
            text += `• ${act.time || ''} - ${act.activity} (₹${act.cost || 0})\n`;
        });
        text += `Daily Cost: ₹${day.dailyCost || 0}\n\n`;
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
            type: 'Sedan',
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
