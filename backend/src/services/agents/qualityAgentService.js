// Quality Agent Service - Auto review + fix itinerary

const ROMANTIC_KEYWORDS = ['romantic', 'candlelight', 'couple', 'honeymoon', 'sunset', 'spa', 'cruise', 'private'];

// Check if activity contains romantic keywords
const hasRomanticKeyword = (activity) => {
    const text = (activity.activity || '').toLowerCase();
    return ROMANTIC_KEYWORDS.some(k => text.includes(k));
};

// Perform quality checks on itinerary
const performQualityCheck = ({ supervisorOutput, plannerOutput, priceOutput }) => {
    const params = supervisorOutput.normalizedParams;
    const itinerary = plannerOutput.itinerary;
    const duration = params.duration;
    const tripType = params.tripType?.toLowerCase() || '';
    const budget = params.budget;
    
    const issues = [];
    const fixes = [];
    const passedChecks = [];
    const failedChecks = [];
    let finalItinerary = JSON.parse(JSON.stringify(itinerary)); // Deep copy
    
    // Check 1: Days count matches duration
    const daysCount = finalItinerary.days?.length || 0;
    if (daysCount === duration) {
        passedChecks.push('days_count');
    } else {
        failedChecks.push('days_count');
        issues.push(`Expected ${duration} days, got ${daysCount}`);
    }
    
    // Check 2: Each day has activities (min 2)
    let activitiesIssue = false;
    finalItinerary.days?.forEach((day, i) => {
        const actCount = day.activities?.length || 0;
        if (actCount < 2) {
            activitiesIssue = true;
            // Auto-fix: add generic activities
            if (!day.activities) day.activities = [];
            while (day.activities.length < 2) {
                day.activities.push({
                    time: '10:00',
                    activity: 'Local sightseeing and exploration',
                    cost: 500
                });
                fixes.push(`Added generic activity to Day ${i + 1}`);
            }
        }
    });
    if (!activitiesIssue) {
        passedChecks.push('activities_exist');
    } else {
        failedChecks.push('activities_exist');
        issues.push('Some days had less than 2 activities');
    }
    
    // Check 3: Honeymoon-specific checks
    if (tripType === 'honeymoon') {
        let hasRomantic = false;
        finalItinerary.days?.forEach(day => {
            day.activities?.forEach(act => {
                if (hasRomanticKeyword(act)) hasRomantic = true;
            });
        });
        
        if (hasRomantic) {
            passedChecks.push('honeymoon_romantic');
        } else {
            failedChecks.push('honeymoon_romantic');
            issues.push('No romantic activities found for honeymoon trip');
            // Auto-fix: add romantic dinner to last day
            const lastDay = finalItinerary.days?.[finalItinerary.days.length - 1];
            if (lastDay) {
                lastDay.activities.push({
                    time: '19:00',
                    activity: 'Candlelight dinner at hotel restaurant',
                    cost: 3000
                });
                fixes.push('Added romantic dinner to last day');
            }
        }
    }
    
    // Check 4: Budget fit
    const finalCost = priceOutput?.finalCost || 0;
    if (finalCost <= budget) {
        passedChecks.push('budget_fit');
    } else {
        failedChecks.push('budget_fit');
        issues.push(`Final cost ₹${finalCost} exceeds budget ₹${budget}`);
        // Don't auto-fix pricing here, just flag
    }
    
    // Calculate quality score (0-100)
    const totalChecks = passedChecks.length + failedChecks.length;
    const qualityScore = totalChecks > 0 
        ? Math.round((passedChecks.length / totalChecks) * 100) 
        : 0;
    
    return {
        qualityScore,
        issues,
        fixes,
        passedChecks,
        failedChecks,
        finalItinerary,
        autoFixed: fixes.length > 0
    };
};

module.exports = { performQualityCheck, hasRomanticKeyword, ROMANTIC_KEYWORDS };
