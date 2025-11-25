const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PartnerProfile = require('./models/PartnerProfile');

dotenv.config();

const testFilter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Test Case 1: Filter by Destination (e.g., "Maldives")
        console.log('\n--- Test Case 1: Filter by Destination (Maldives) ---');
        const maldivesPartners = await PartnerProfile.find({
            destinations: { $regex: 'Maldives', $options: 'i' }
        });
        console.log(`Found ${maldivesPartners.length} partners in Maldives`);

        // Test Case 2: Filter by Budget (e.g., 200000)
        console.log('\n--- Test Case 2: Filter by Budget (200000) ---');
        const budget = 200000;
        const budgetPartners = await PartnerProfile.find({
            $or: [
                {
                    'budgetRange.min': { $lte: budget },
                    'budgetRange.max': { $gte: budget }
                },
                { budgetRange: { $exists: false } },
                { 'budgetRange.min': null },
                { 'budgetRange.max': null }
            ]
        });
        console.log(`Found ${budgetPartners.length} partners matching budget ${budget}`);

        // Test Case 3: Filter by Hotel Star Rating (e.g., 5)
        console.log('\n--- Test Case 3: Filter by Rating (5) ---');
        const ratingPartners = await PartnerProfile.find({
            rating: { $gte: 5 }
        });
        console.log(`Found ${ratingPartners.length} partners with rating 5+`);

        // Test Case 4: Smart Fallback (Paris + Low Budget)
        console.log('\n--- Test Case 4: Smart Fallback (Paris + Low Budget) ---');
        // Simulate the logic: First try strict
        const strictQuery = {
            destinations: { $regex: 'Paris', $options: 'i' },
            'budgetRange.max': { $lte: 1000 } // Impossible budget for Paris luxury
        };
        let partners = await PartnerProfile.find(strictQuery);
        console.log(`Strict search found: ${partners.length}`);

        if (partners.length === 0) {
            console.log('Triggering fallback...');
            const fallbackQuery = {
                destinations: { $regex: 'Paris', $options: 'i' }
            };
            partners = await PartnerProfile.find(fallbackQuery);
        }
        console.log(`Fallback search found: ${partners.length} partners in Paris`);

        process.exit();
    } catch (error) {
        console.error('Error testing filter:', error);
        process.exit(1);
    }
};

testFilter();
