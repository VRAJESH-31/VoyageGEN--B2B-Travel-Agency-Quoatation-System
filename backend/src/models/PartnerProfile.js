const mongoose = require('mongoose');

const partnerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    destinations: [String], // e.g., ["Italy", "Rome"]
    type: {
        type: String,
        enum: ['DMC', 'Hotel', 'CabProvider', 'Mixed'],
        default: 'DMC',
    },
    specializations: [String], // e.g., ["honeymoon", "luxury"]
    budgetRange: {
        min: Number,
        max: Number,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    tripsHandled: {
        type: Number,
        default: 0,
    },
    description: String,
    images: [String],
    amenities: [String],
    sightSeeing: [String],
    startingPrice: Number,
    reviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const PartnerProfile = mongoose.model('PartnerProfile', partnerProfileSchema);

module.exports = PartnerProfile;
