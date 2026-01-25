const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement',
        required: true,
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: String,
    sections: {
        hotels: [{
            name: String,
            city: String,
            roomType: String,
            nights: Number,
            unitPrice: Number,
            qty: Number,
            total: Number,
        }],
        transport: [{
            type: String, // e.g., Sedan
            days: Number,
            unitPrice: Number,
            total: Number,
        }],
        activities: [{
            name: String,
            unitPrice: Number,
            qty: Number,
            total: Number,
        }],
    },
    costs: {
        net: Number,
        margin: Number, // Percentage or fixed amount
        final: Number,
        perHead: Number,
    },
    status: {
        type: String,
        enum: ['DRAFT', 'READY', 'SENT_TO_USER'],
        default: 'DRAFT',
    },
    itineraryText: {
        type: String,
        default: '',
    },
    itineraryJson: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    agentRunId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentRun',
        default: null,
    },
}, {
    timestamps: true,
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
