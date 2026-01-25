// Price Agent Service - Budget calculation + margin + per-head cost

const DEFAULT_MARGIN_PERCENT = 12;

// Calculate pricing from itinerary and research data
const calculatePricing = ({ supervisorOutput, researchOutput, plannerOutput }) => {
    const params = supervisorOutput.normalizedParams;
    const itinerary = plannerOutput.itinerary;
    const hotels = researchOutput.hotels || [];
    
    const budget = params.budget;
    const duration = params.duration;
    const totalPax = (params.pax?.adults || 2) + (params.pax?.children || 0);
    
    let selectedHotel = itinerary.selectedHotel || hotels[0] || { name: 'Standard', pricePerNight: 5000 };
    let hotelCost = (selectedHotel.pricePerNight || 5000) * duration;
    
    // Get costs from itinerary or estimate
    let breakdown = itinerary.costBreakdown || {};
    let activitiesCost = breakdown.activities || Math.round(budget * 0.15);
    let transportCost = breakdown.transport || Math.round(budget * 0.10);
    let mealsCost = breakdown.meals || Math.round(budget * 0.12);
    let miscCost = breakdown.misc || Math.round(budget * 0.05);
    
    // Calculate net cost
    let netCost = hotelCost + activitiesCost + transportCost + mealsCost + miscCost;
    
    // Apply margin
    const marginPercent = DEFAULT_MARGIN_PERCENT;
    let marginAmount = Math.round(netCost * (marginPercent / 100));
    let finalCost = netCost + marginAmount;
    
    // Check budget fit
    let budgetFit = finalCost <= budget;
    let originalHotel = selectedHotel.name;
    let adjustedHotel = null;
    
    // Budget adjustment - try cheaper hotels
    if (!budgetFit && hotels.length > 1) {
        const sortedHotels = [...hotels].sort((a, b) => a.pricePerNight - b.pricePerNight);
        
        for (const hotel of sortedHotels) {
            if (hotel.name === originalHotel) continue;
            
            const newHotelCost = (hotel.pricePerNight || 5000) * duration;
            const newNetCost = newHotelCost + activitiesCost + transportCost + mealsCost + miscCost;
            const newMargin = Math.round(newNetCost * (marginPercent / 100));
            const newFinalCost = newNetCost + newMargin;
            
            if (newFinalCost <= budget) {
                // Found a budget-fit hotel
                selectedHotel = hotel;
                hotelCost = newHotelCost;
                netCost = newNetCost;
                marginAmount = newMargin;
                finalCost = newFinalCost;
                budgetFit = true;
                adjustedHotel = hotel.name;
                break;
            }
        }
    }
    
    // Per-head cost
    const perHeadCost = Math.round(finalCost / totalPax);
    
    return {
        netCost,
        marginPercent,
        marginAmount,
        finalCost,
        perHeadCost,
        budgetFit,
        originalHotel,
        adjustedHotel,
        selectedHotel: {
            name: selectedHotel.name,
            pricePerNight: selectedHotel.pricePerNight,
            totalCost: hotelCost
        },
        breakdown: {
            hotel: hotelCost,
            activities: activitiesCost,
            transport: transportCost,
            meals: mealsCost,
            misc: miscCost
        },
        budget,
        savings: budgetFit ? budget - finalCost : 0
    };
};

module.exports = { calculatePricing, DEFAULT_MARGIN_PERCENT };
