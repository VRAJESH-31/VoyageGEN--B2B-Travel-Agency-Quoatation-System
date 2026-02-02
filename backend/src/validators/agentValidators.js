// Agent Validators - Zod Schemas
const { z } = require('zod');

// MongoDB ObjectId regex
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

// Start agent run request validation
const startAgentRunSchema = z.object({
    params: z.object({
        requirementId: z.string().regex(objectIdRegex, 'Invalid requirementId format')
    }),
    body: z.object({
        debug: z.boolean().optional().default(false)
    }).optional().default({}),
    query: z.object({
        forceRun: z.string().optional().transform(val => val === 'true')
    }).optional()
});

// Get agent run by ID validation
const getAgentRunSchema = z.object({
    params: z.object({
        agentRunId: z.string().regex(objectIdRegex, 'Invalid agentRunId format')
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional()
});

// Get latest agent run for requirement validation
const getLatestAgentRunSchema = z.object({
    params: z.object({
        requirementId: z.string().regex(objectIdRegex, 'Invalid requirementId format')
    }),
    body: z.object({}).optional(),
    query: z.object({}).optional()
});

// List agent runs with pagination
const listAgentRunsSchema = z.object({
    params: z.object({}).optional(),
    body: z.object({}).optional(),
    query: z.object({
        requirementId: z.string().regex(objectIdRegex).optional(),
        page: z.string().transform(Number).optional().default('1'),
        limit: z.string().transform(Number).optional().default('10'),
        status: z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED']).optional()
    }).optional()
});

module.exports = {
    startAgentRunSchema,
    getAgentRunSchema,
    getLatestAgentRunSchema,
    listAgentRunsSchema
};
