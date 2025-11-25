const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PartnerProfile = require('./models/PartnerProfile');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const count = await PartnerProfile.countDocuments();
        console.log(`Total Partners: ${count}`);

        const hotels = await PartnerProfile.find({ type: 'Hotel' });
        console.log(`Total Hotels: ${hotels.length}`);

        if (hotels.length > 0) {
            console.log('Sample Hotel:', hotels[0]);
        }

        process.exit();
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
};

checkData();
