const mongoose = require('mongoose');

/**
 * Step Sub-Schema
 * Represents a single step in the agent pipeline
 */
const stepSchema = new mongoose.Schema({
    stepName: {
        type: String,
        enum: ['SUPERVISOR', 'RESEARCH', 'PLANNER', 'PRICE', 'QUALITY'],
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'RUNNING', 'DONE', 'FAILED'],
        default: 'PENDING',
    },
    startedAt: {
        type: Date,
        default: null,
    },
    endedAt: {
        type: Date,
        default: null,
    },
    logs: {
        type: [String],
        default: [],
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    error: {
        type: String,
        default: null,
    },
}, { _id: false }); // No separate _id for sub-documents

/**
 * AgentRun Schema
 * Tracks a single execution of the multi-step agent pipeline
 */
const agentRunSchema = new mongoose.Schema({
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement',
        required: true,
    },
    startedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'RUNNING', 'DONE', 'FAILED'],
        default: 'RUNNING',
    },
    steps: {
        type: [stepSchema],
        default: [],
    },
    finalResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    error: {
        type: String,
        default: null,
    },
    meta: {
        provider: {
            type: String,
            default: 'gemini',
        },
        model: {
            type: String,
            default: 'gemini-2.5-flash',
        },
        version: {
            type: String,
            default: 'v1',
        },
    },
    quoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote',
        default: null,
    },
}, {
    timestamps: true,
});

// Indexes for efficient querying
agentRunSchema.index({ requirementId: 1, createdAt: -1 });
agentRunSchema.index({ status: 1, createdAt: -1 });

const AgentRun = mongoose.model('AgentRun', agentRunSchema);

module.exports = AgentRun;
