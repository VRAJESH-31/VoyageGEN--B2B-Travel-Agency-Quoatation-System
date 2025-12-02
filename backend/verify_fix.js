const mongoose = require('mongoose');
const { generateQuotes } = require('./controllers/quoteController');
const Requirement = require('./models/Requirement');
const User = require('./models/User');
const Quote = require('./models/Quote');

const runVerification = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/voyagegen');
        console.log('Connected to DB');

        // 1. Create a dummy agent user if needed (for req.user._id)
        const agentId = new mongoose.Types.ObjectId();

        // 2. Create a dummy Requirement
        const requirement = await Requirement.create({
            destination: 'Goa',
            tripType: 'Leisure',
            budget: 50000,
            duration: 5,
            pax: { adults: 2, children: 0 },
            contactInfo: { name: 'Test User', email: 'test@example.com', phone: '1234567890' },
            status: 'NEW',
            startDate: new Date(),
            hotelStar: 4,
            preferences: ['Beach']
        });
        console.log('Created Requirement:', requirement._id);

        // 3. Mock Request with Custom Items and NO Partners
        const req = {
            body: {
                requirementId: requirement._id,
                partnerIds: [], // Empty
                customItems: [
                    { type: 'Hotel', name: 'Test Hotel', price: 4000, location: 'North Goa' },
                    { type: 'Transport', name: 'Test Cab', price: 2000 }
                ]
            },
            user: { _id: agentId }
        };

        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Response Status: ${code}`);
                    // console.log('Response Data:', JSON.stringify(data, null, 2));
                    return data;
                }
            })
        };

        // 4. Call Controller
        console.log('Calling generateQuotes...');
        await generateQuotes(req, res);

        // 5. Verify Quote in DB
        const quotes = await Quote.find({ requirementId: requirement._id });
        console.log(`Found ${quotes.length} quotes.`);

        if (quotes.length === 1) {
            const q = quotes[0];
            if (!q.partnerId && q.sections.hotels[0].name === 'Test Hotel') {
                console.log('SUCCESS: Quote generated without partner and with custom items.');
            } else {
                console.log('FAILURE: Quote content mismatch.');
                console.log('PartnerID:', q.partnerId);
                console.log('Hotel Name:', q.sections.hotels[0]?.name);
            }
            
             if (q.aiItinerary && q.aiItinerary.summary) {
                console.log('SUCCESS: AI Itinerary preserved.');
            } else {
                console.log('WARNING: AI Itinerary missing (might be due to AI service failure or timeout).');
            }

        } else {
            console.log('FAILURE: No quote generated.');
        }

        // Cleanup
        await Requirement.findByIdAndDelete(requirement._id);
        await Quote.deleteMany({ requirementId: requirement._id });
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
