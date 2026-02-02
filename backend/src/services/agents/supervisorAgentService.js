/**
 * Supervisor Agent Service
 * Normalizes and validates Requirement data for the agent pipeline
 */

/**
 * Normalize a string to Title Case
 * @param {string} str - Input string
 * @returns {string} Title cased string
 */
const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Parse date to ISO string safely
 * @param {Date|string} date - Input date
 * @returns {string|null} ISO date string or null
 */
const parseDate = (date) => {
    if (!date) return null;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Compute end date from start date and duration
 * @param {string} startDate - ISO date string
 * @param {number} duration - Number of days
 * @returns {string|null} ISO date string or null
 */
const computeEndDate = (startDate, duration) => {
    if (!startDate || !duration || duration <= 0) return null;
    const start = new Date(startDate);
    start.setDate(start.getDate() + duration);
    return start.toISOString().split('T')[0];
};

/**
 * Normalize and validate a Requirement document for the agent pipeline
 * 
 * @param {Object} requirementDoc - Mongoose Requirement document
 * @returns {Object} { normalizedParams, warnings }
 * @throws {Error} If required fields are missing/invalid
 */
const normalizeRequirement = (requirementDoc) => {
    const warnings = [];

    // Create a plain object copy to avoid mutating original
    const req = requirementDoc.toObject ? requirementDoc.toObject() : { ...requirementDoc };

    // ========================================
    // VALIDATION (Throw errors for critical fields)
    // ========================================

    // 1. Destination - Required
    if (!req.destination || typeof req.destination !== 'string' || req.destination.trim() === '') {
        throw new Error('Destination is required');
    }

    // 2. Budget - Required, must be positive number
    const budget = typeof req.budget === 'string' ? parseFloat(req.budget) : req.budget;
    if (budget === undefined || budget === null || isNaN(budget) || budget <= 0) {
        throw new Error('Budget must be a valid positive number');
    }

    // 3. Start Date - Required
    const startDate = parseDate(req.startDate);
    if (!startDate) {
        throw new Error('Start date is required and must be valid');
    }

    // 4. Duration - Must be positive if present
    let duration = parseInt(req.duration, 10);
    if (isNaN(duration) || duration <= 0) {
        // Default to 5 days if missing, add warning
        duration = 5;
        warnings.push('Duration missing or invalid, defaulting to 5 days');
    }

    // 5. Pax validation
    let adults = req.pax?.adults;
    let children = req.pax?.children;

    if (adults === undefined || adults === null || isNaN(parseInt(adults, 10))) {
        adults = 2;
        warnings.push('Adults count missing, defaulting to 2');
    } else {
        adults = parseInt(adults, 10);
    }

    if (adults < 1) {
        throw new Error('At least 1 adult is required');
    }

    if (children === undefined || children === null || isNaN(parseInt(children, 10))) {
        children = 0;
    } else {
        children = parseInt(children, 10);
        if (children < 0) children = 0;
    }

    // ========================================
    // NORMALIZATION (Safe defaults, cleaning)
    // ========================================

    // Destination - trim and title case
    const destination = toTitleCase(req.destination);

    // Trip Type - default to "Leisure" if missing
    let tripType = req.tripType;
    if (!tripType || typeof tripType !== 'string' || tripType.trim() === '') {
        tripType = 'Leisure';
        warnings.push('Trip type missing, defaulting to "Leisure"');
    } else {
        tripType = toTitleCase(tripType.trim());
    }

    // End Date - computed from start + duration
    const endDate = computeEndDate(startDate, duration);

    // Hotel Star - validate 1-5 range
    let hotelStar = req.hotelStar;
    if (hotelStar !== undefined && hotelStar !== null) {
        hotelStar = parseInt(hotelStar, 10);
        if (isNaN(hotelStar) || hotelStar < 1 || hotelStar > 5) {
            hotelStar = null;
            warnings.push('Hotel star rating invalid, ignoring');
        }
    } else {
        hotelStar = null;
    }

    // Preferences - deduplicate, trim, remove empty
    let preferences = [];
    if (Array.isArray(req.preferences)) {
        const seen = new Set();
        preferences = req.preferences
            .filter(p => typeof p === 'string' && p.trim() !== '')
            .map(p => p.trim().toLowerCase())
            .filter(p => {
                if (seen.has(p)) return false;
                seen.add(p);
                return true;
            });
    }

    // ========================================
    // BUILD NORMALIZED OUTPUT
    // ========================================

    const normalizedParams = {
        destination,
        tripType,
        duration,
        budget,
        startDate,
        endDate,
        pax: {
            adults,
            children,
        },
        hotelStar,
        preferences,
        currency: 'INR', // Hardcoded for Indian market
    };

    return {
        normalizedParams,
        warnings,
    };
};

module.exports = {
    normalizeRequirement,
    toTitleCase,
    parseDate,
    computeEndDate,
};
