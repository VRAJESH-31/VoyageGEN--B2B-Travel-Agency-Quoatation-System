// Requirement Validators - Zod Schemas
const { z } = require('zod');

// MongoDB ObjectId regex
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

// Create requirement validation
const createRequirementSchema = z.object({
    body: z.object({
        destination: z.string().min(1, 'Destination is required'),
        tripType: z.string().min(1, 'Trip type is required'),
        budget: z.number().positive('Budget must be greater than 0'),
        duration: z.number().int().min(1, 'Duration must be at least 1 day').optional(),
        startDate: z.string().optional(),
        pax: z.object({
            adults: z.number().int().min(1, 'At least 1 adult required').optional(),
            children: z.number().int().min(0).optional()
        }).optional(),
        hotelStar: z.number().min(1).max(5).optional(),
        preferences: z.array(z.string()).optional(),
        contactInfo: z.object({
            name: z.string().min(1, 'Contact name is required'),
            email: z.string().email('Invalid email format'),
            phone: z.string().min(1, 'Phone number is required'),
            whatsapp: z.string().optional()
        })
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

// Update requirement validation (partial)
const updateRequirementSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, 'Invalid requirement ID')
    }),
    body: z.object({
        destination: z.string().min(1).optional(),
        tripType: z.string().min(1).optional(),
        budget: z.number().positive().optional(),
        duration: z.number().int().min(1).optional(),
        startDate: z.string().optional(),
        pax: z.object({
            adults: z.number().int().min(1).optional(),
            children: z.number().int().min(0).optional()
        }).optional(),
        hotelStar: z.number().min(1).max(5).optional(),
        preferences: z.array(z.string()).optional(),
        contactInfo: z.object({
            name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            phone: z.string().min(1).optional(),
            whatsapp: z.string().optional()
        }).optional(),
        status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTES_READY', 'SENT_TO_USER', 'COMPLETED']).optional(),
        agentStatus: z.enum(['NEW', 'IN_AGENT', 'COMPLETED', 'FAILED']).optional()
    }),
    query: z.object({}).optional()
});

module.exports = {
    createRequirementSchema,
    updateRequirementSchema
};
