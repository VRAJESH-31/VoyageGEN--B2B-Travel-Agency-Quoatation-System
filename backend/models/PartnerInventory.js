const mongoose = require('mongoose');

// Hotel Schema
const hotelSchema = new mongoose.Schema({
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    starRating: { type: Number, min: 1, max: 5 },
    amenities: [String],
    roomTypes: [{
        name: String,
        price: Number,
        maxOccupancy: Number,
    }],
    photos: [String],
});

// Transport Schema
const transportSchema = new mongoose.Schema({
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // Sedan, SUV
    price: Number,
    maxPax: Number,
    city: String,
});

// Activity Schema
const activitySchema = new mongoose.Schema({
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    price: Number,
    description: String,
});

const PartnerHotel = mongoose.model('PartnerHotel', hotelSchema);
const PartnerTransport = mongoose.model('PartnerTransport', transportSchema);
const PartnerActivity = mongoose.model('PartnerActivity', activitySchema);

module.exports = { PartnerHotel, PartnerTransport, PartnerActivity };
