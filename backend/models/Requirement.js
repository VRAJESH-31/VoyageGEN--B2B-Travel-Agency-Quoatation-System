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
}, {
    timestamps: true,
});

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;
