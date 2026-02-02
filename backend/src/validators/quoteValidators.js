// Quote Validators - Zod Schemas
const { z } = require('zod');

// MongoDB ObjectId regex
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

// Generate quotes validation
const generateQuotesSchema = z.object({
    body: z.object({
        requirementId: z.string().regex(objectIdRegex, 'Invalid requirement ID'),
        partnerIds: z.array(z.string().regex(objectIdRegex)).optional(),
        customItems: z.array(z.object({
            type: z.enum(['Hotel', 'Transport']),
            name: z.string(),
            price: z.number().positive(),
            location: z.string().optional()
        })).optional(),
        selectedHotel: z.object({
            name: z.string(),
            price: z.number().positive()
        }).optional()
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

// Update quote validation
const updateQuoteSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, 'Invalid quote ID')
    }),
    body: z.object({
        sections: z.object({
            hotels: z.array(z.object({
                name: z.string().optional(),
                city: z.string().optional(),
                roomType: z.string().optional(),
                nights: z.number().optional(),
                unitPrice: z.number().optional(),
                qty: z.number().optional(),
                total: z.number().optional()
            })).optional(),
            transport: z.array(z.object({
                type: z.string().optional(),
                days: z.number().optional(),
                unitPrice: z.number().optional(),
                total: z.number().optional()
            })).optional(),
            activities: z.array(z.object({
                name: z.string().optional(),
                unitPrice: z.number().optional(),
                qty: z.number().optional(),
                total: z.number().optional()
            })).optional()
        }).optional(),
        costs: z.object({
            net: z.number().optional(),
            margin: z.number().optional(),
            final: z.number().optional(),
            perHead: z.number().optional()
        }).optional(),
        status: z.enum(['DRAFT', 'READY', 'SENT_TO_USER']).optional()
    }),
    query: z.object({}).optional()
});

module.exports = {
    generateQuotesSchema,
    updateQuoteSchema
};
