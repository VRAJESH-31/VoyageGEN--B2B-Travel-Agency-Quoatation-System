const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true,
    },
    tripType: {
        type: String,
        required: true, // e.g., Honeymoon, Family, Business
    },
    budget: {
        type: Number,
        required: true,
    },
    startDate: Date,
    duration: Number, // in days
    pax: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 },
    },
    hotelStar: {
        type: Number,
        min: 1,
        max: 5,
    },
    preferences: [String], // e.g., "balcony", "pool"
    contactInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        whatsapp: String,
    },
    status: {
        type: String,
        enum: ['NEW', 'IN_PROGRESS', 'QUOTES_READY', 'SENT_TO_USER', 'COMPLETED'],
        default: 'NEW',
    },
    // Agent Tracking Fields (Day 2)
    agentStatus: {
        type: String,
        enum: ['NEW', 'IN_AGENT', 'COMPLETED', 'FAILED'],
        default: 'NEW',
    },
    lastAgentRunId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentRun',
        default: null,
    },
    lastAgentRunAt: {
        type: Date,
        default: null,
    },
    latestQuoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote',
        default: null,
    },
}, {
    timestamps: true,
});

// Index for agent status filtering
requirementSchema.index({ agentStatus: 1, createdAt: -1 });

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;
