const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PartnerProfile = require('../src/models/PartnerProfile');

dotenv.config();

const indianPartners = [
    {
        name: "Taj Hotels",
        type: "Hotel",
        location: "Mumbai, India",
        services: ["Luxury Stay", "Spa", "Fine Dining"],
        rating: 5,
        price: 15000,
        contact: "reservations@tajhotels.com",
        destinations: ["Mumbai", "Delhi", "Goa", "Rajasthan", "Kerala"],
        description: "Experience the quintessential Indian hospitality.",
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"]
    },
    {
        name: "Oberoi Udaivilas",
        type: "Hotel",
        location: "Udaipur, India",
        services: ["Heritage Stay", "Lake View", "Royal Dining"],
        rating: 5,
        price: 25000,
        contact: "reservations@oberoigroup.com",
        destinations: ["Udaipur"],
        description: "The best hotel in the world, located on the banks of Lake Pichola.",
        images: ["https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=2070"]
    },
    // Add more partners as needed or fetch from separate data file
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await PartnerProfile.deleteMany({});
        console.log('Cleared existing partners');

        // Insert new data
        await PartnerProfile.insertMany(indianPartners);
        console.log(`Seeded ${indianPartners.length} Partners Successfully`);

        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
