const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const PartnerProfile = require('./models/PartnerProfile');

dotenv.config();

const partnersData = [
    // Maldives
    {
        companyName: "Soneva Jani",
        destinations: ["Maldives"],
        type: "Hotel",
        specializations: ["Luxury", "Honeymoon", "Wellness"],
        budgetRange: { min: 150000, max: 1000000 },
        rating: 5,
        description: "A benchmark for overwater luxury, Soneva Jani offers a collection of Water Villas and Island Reserves set within a lagoon of crystal clear waters. Each villa comes with its own private pool and a retractable roof to stargaze from the master bedroom.",
        amenities: ["Private Pool", "Retractable Roof", "Water Slide", "Cinema Paradiso", "Observatory", "Organic Gardens"],
        sightSeeing: ["Noonu Atoll Marine Park", "Dolphin Cruise", "Private Sandbank"],
        startingPrice: 250000,
        images: [
            "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Gili Lankanfushi",
        destinations: ["Maldives"],
        type: "Hotel",
        specializations: ["Eco-Luxury", "Honeymoon"],
        budgetRange: { min: 100000, max: 500000 },
        rating: 5,
        description: "Gili Lankanfushi is an intimate coral island in a sparkling lagoon, with jetties threading across the water out to spacious villa accommodations. It is a place of positive energy and absolute privacy.",
        amenities: ["Overwater Bar", "Meera Spa", "Jungle Cinema", "Underground Wine Cellar", "Mr. Friday Butler Service"],
        sightSeeing: ["Manta Ray Point", "Local Island Visit", "Sunset Dhoni Cruise"],
        startingPrice: 120000,
        images: [
            "https://images.unsplash.com/photo-1439066615861-d1fbced6530e?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Velaa Private Island",
        destinations: ["Maldives"],
        type: "Hotel",
        specializations: ["Ultra-Luxury", "Privacy"],
        budgetRange: { min: 300000, max: 1500000 },
        rating: 5,
        description: "Born from a dream to create a 'beyond luxury' exclusive boutique hideaway. Velaa Private Island is the realization of a dream to create a 'beyond luxury' exclusive boutique hideaway in the Maldives.",
        amenities: ["Golf Academy", "Snow Room", "Clarins Spa", "Private Submarine", "Kids Club"],
        sightSeeing: ["Turtle Conservation", "Private Yacht Charter", "Night Golf"],
        startingPrice: 350000,
        images: [
            "https://images.unsplash.com/photo-1590523741831-ab7f8512d568?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "One&Only Reethi Rah",
        destinations: ["Maldives"],
        type: "Hotel",
        specializations: ["Family", "Luxury"],
        budgetRange: { min: 200000, max: 800000 },
        rating: 4,
        description: "Surrounded by the wonders of the Indian Ocean, One&Only Reethi Rah makes its home on one of the largest islands in North Malé Atoll. A jewel among a string of coral atolls, lagoons and white sands.",
        amenities: ["12 Beaches", "KidsOnly Club", "ESPA", "Climbing Wall", "FIFA Certified Football Pitch"],
        sightSeeing: ["Shark Safari", "Big Game Fishing", "Island Picnic"],
        startingPrice: 220000,
        images: [
            "https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1586611292717-f828b167408c?q=80&w=1000&auto=format&fit=crop"
        ]
    },

    // Paris
    {
        companyName: "Four Seasons Hotel George V",
        destinations: ["Paris", "France"],
        type: "Hotel",
        specializations: ["Luxury", "City", "Gastronomy"],
        budgetRange: { min: 150000, max: 600000 },
        rating: 5,
        description: "An art deco landmark built in 1928, Four Seasons Hotel George V is nestled in the Golden Triangle of Paris, just off the historic Champs-Elysées. It features three Michelin-starred restaurants.",
        amenities: ["Michelin Dining", "Decadent Spa", "Flower Arrangements", "Indoor Pool", "Concierge"],
        sightSeeing: ["Eiffel Tower", "Arc de Triomphe", "Champs-Elysées"],
        startingPrice: 180000,
        images: [
            "https://images.unsplash.com/photo-1560131914-6870372444d8?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "The Ritz Paris",
        destinations: ["Paris", "France"],
        type: "Hotel",
        specializations: ["History", "Luxury"],
        budgetRange: { min: 200000, max: 700000 },
        rating: 5,
        description: "The Ritz Paris is a hotel in central Paris, overlooking the Place Vendôme in the city's 1st arrondissement. A member of the Leading Hotels of the World, it is known for its grand decor and famous guests.",
        amenities: ["Hemingway Bar", "Ritz Club Paris", "Cooking School", "Chanel Spa", "Private Garden"],
        sightSeeing: ["Place Vendôme", "Louvre Museum", "Opera Garnier"],
        startingPrice: 210000,
        images: [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Le Meurice",
        destinations: ["Paris", "France"],
        type: "Hotel",
        specializations: ["Art", "Luxury"],
        budgetRange: { min: 120000, max: 500000 },
        rating: 4,
        description: "Ideally located opposite the Tuileries Garden, between Place de la Concorde and the Louvre Museum, Le Meurice has held sway as the jewel in the crown of French luxury hotels since 1835.",
        amenities: ["Valmont Spa", "Alain Ducasse Dining", "Pastry Shop", "Pet Friendly", "Fitness Center"],
        sightSeeing: ["Tuileries Garden", "Musée d'Orsay", "Rue de Rivoli"],
        startingPrice: 140000,
        images: [
            "https://images.unsplash.com/photo-1549651721-f9b050d4403f?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1000&auto=format&fit=crop"
        ]
    },

    // Bali
    {
        companyName: "Viceroy Bali",
        destinations: ["Bali", "Indonesia"],
        type: "Hotel",
        specializations: ["Jungle", "Honeymoon", "Wellness"],
        budgetRange: { min: 40000, max: 200000 },
        rating: 5,
        description: "Family owned and operated, Viceroy Bali is a luxury resort with 40 private pool villas. It sits in the Valley of the Kings, a name given by locals for the generations of Balinese royalty who have resided in nearby villages.",
        amenities: ["Infinity Pool", "Lembah Spa", "Cascades Restaurant", "Helipad", "Yoga Pavilion"],
        sightSeeing: ["Ubud Monkey Forest", "Tegallalang Rice Terrace", "Goa Gajah"],
        startingPrice: 55000,
        images: [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Mandapa, a Ritz-Carlton Reserve",
        destinations: ["Bali", "Indonesia"],
        type: "Hotel",
        specializations: ["Culture", "Luxury", "Nature"],
        budgetRange: { min: 80000, max: 300000 },
        rating: 5,
        description: "Fronting the Ayung River near the Ubud jungle, Mandapa, a Ritz-Carlton Reserve offers individually tailored spiritual, wellness, and health programs as well as the finest dining.",
        amenities: ["Riverfront Dining", "Vitality Pool", "Organic Farm", "Kids Hut", "Butler Service"],
        sightSeeing: ["Campuhan Ridge Walk", "Tirta Empul Temple", "Bali Swing"],
        startingPrice: 90000,
        images: [
            "https://images.unsplash.com/photo-1552853843-bf7e211bb43f?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Amankila",
        destinations: ["Bali", "Indonesia"],
        type: "Hotel",
        specializations: ["Secluded", "Architecture"],
        budgetRange: { min: 70000, max: 250000 },
        rating: 4,
        description: "Claiming a breathtaking stretch of coastline on the Lombok Strait, Amankila rests on a lush hillside beneath the sacred Mount Agung. Connected by frangipani-lined walkways, stilted suites offer spectacular views.",
        amenities: ["Three-tier Pool", "Beach Club", "Library", "Massage Pavilions", "Water Sports"],
        sightSeeing: ["Tenganan Village", "Water Palaces", "Lempuyang Temple"],
        startingPrice: 85000,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop"
        ]
    },

    // Dubai
    {
        companyName: "Burj Al Arab Jumeirah",
        destinations: ["Dubai", "UAE"],
        type: "Hotel",
        specializations: ["Ultra-Luxury", "Iconic"],
        budgetRange: { min: 150000, max: 1000000 },
        rating: 5,
        description: "The distinctive sail-shaped silhouette of Burj Al Arab Jumeirah is more than just a stunning hotel, it is a symbol of modern Dubai. Repeatedly voted the world's most luxurious hotel.",
        amenities: ["Helipad", "Talise Spa", "Private Beach", "Aquarium Restaurant", "Rolls-Royce Fleet"],
        sightSeeing: ["Wild Wadi Waterpark", "Palm Jumeirah", "Dubai Mall"],
        startingPrice: 180000,
        images: [
            "https://images.unsplash.com/photo-1528702748617-c64d49f918af?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512453979798-5ea9ba6a80f6?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Atlantis The Royal",
        destinations: ["Dubai", "UAE"],
        type: "Hotel",
        specializations: ["Entertainment", "Luxury"],
        budgetRange: { min: 60000, max: 400000 },
        rating: 5,
        description: "A new icon of Dubai, Atlantis The Royal welcomes you to an experience that will completely redefine your perspective of luxury. Crafted by the world’s leading designers, architects and artists.",
        amenities: ["Cloud 22 Skypool", "Nobu by the Beach", "Awaken Wellness", "Royal Club", "Fountains"],
        sightSeeing: ["Aquaventure Waterpark", "The Lost Chambers", "The Pointe"],
        startingPrice: 75000,
        images: [
            "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "One&Only The Palm",
        destinations: ["Dubai", "UAE"],
        type: "Hotel",
        specializations: ["Secluded", "Beach"],
        budgetRange: { min: 90000, max: 350000 },
        rating: 4,
        description: "Dubai's most intimate seaside enclave. Immerse yourself in the romance of the Riviera, on a private peninsula of the Palm Island. A tranquil haven for those seeking total relaxation.",
        amenities: ["Guerlain Spa", "Private Marina", "Temperature-controlled Pool", "Tennis Court", "Beachfront Villas"],
        sightSeeing: ["Dubai Marina", "Skydive Dubai", "Ain Dubai"],
        startingPrice: 100000,
        images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=1000&auto=format&fit=crop"
        ]
    },

    // Switzerland
    {
        companyName: "Badrutt's Palace Hotel",
        destinations: ["St. Moritz", "Switzerland"],
        type: "Hotel",
        specializations: ["Alpine", "Luxury", "Winter"],
        budgetRange: { min: 80000, max: 400000 },
        rating: 5,
        description: "A legendary hotel in St. Moritz, Badrutt's Palace Hotel has been a landmark in the center of the village since 1896. It offers breathtaking views of the Engadin Alps and Lake St. Moritz.",
        amenities: ["Palace Wellness", "King's Social House", "Ice Rink", "Private Ski School", "Rolls-Royce Transfers"],
        sightSeeing: ["Lake St. Moritz", "Corviglia Ski Area", "Segantini Museum"],
        startingPrice: 95000,
        images: [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1483095348487-53dbf97d8d5b?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "The Dolder Grand",
        destinations: ["Zurich", "Switzerland"],
        type: "Hotel",
        specializations: ["City Resort", "Wellness"],
        budgetRange: { min: 60000, max: 300000 },
        rating: 4,
        description: "The Dolder Grand provides the perfect environment for people who are looking for pleasure, exclusivity and relaxation: 175 luxurious rooms and suites, fine dining, a spa covering 4,000 square metres.",
        amenities: ["Award-winning Spa", "Art Collection", "Golf Course", "Fine Dining", "Limousine Service"],
        sightSeeing: ["Lake Zurich", "Bahnhofstrasse", "Old Town"],
        startingPrice: 70000,
        images: [
            "https://images.unsplash.com/photo-1562790351-d273a961e05b?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Bürgenstock Hotel & Alpine Spa",
        destinations: ["Lucerne", "Switzerland"],
        type: "Hotel",
        specializations: ["Wellness", "Views"],
        budgetRange: { min: 100000, max: 500000 },
        rating: 5,
        description: "Perched 500 metres above Lake Lucerne, the Bürgenstock Hotel & Alpine Spa offers modern comfort and Swiss tradition. The resort is a masterpiece of modern architecture.",
        amenities: ["Alpine Spa", "Infinity Edge Pool", "Private Cinema", "Tennis Courts", "Funicular Railway"],
        sightSeeing: ["Hammetschwand Lift", "Lake Lucerne Cruise", "Chapel Bridge"],
        startingPrice: 110000,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop"
        ]
    },

    // Others
    {
        companyName: "Aman Tokyo",
        destinations: ["Tokyo", "Japan"],
        type: "Hotel",
        specializations: ["Urban", "Zen"],
        budgetRange: { min: 120000, max: 400000 },
        rating: 5,
        description: "Occupying the top six floors of the Otemachi Tower, Aman Tokyo is an urban sanctuary high above the atmospheric whirl of tradition and modernity that defines Tokyo.",
        amenities: ["Aman Spa", "Wine Cellar", "Cigar Lounge", "Library", "Indoor Pool"],
        sightSeeing: ["Imperial Palace", "Ginza District", "Senso-ji Temple"],
        startingPrice: 130000,
        images: [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1493997181344-712f2f19dcf1?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Marina Bay Sands",
        destinations: ["Singapore"],
        type: "Hotel",
        specializations: ["Iconic", "City"],
        budgetRange: { min: 40000, max: 200000 },
        rating: 4,
        description: "Marina Bay Sands is an integrated resort fronting Marina Bay in Singapore. The resort includes a hotel, a convention-exhibition centre, a mall, a museum, a theatre, celebrity chef restaurants and the world's largest atrium casino.",
        amenities: ["Infinity Pool", "SkyPark", "Casino", "ArtScience Museum", "Shopping Mall"],
        sightSeeing: ["Gardens by the Bay", "Merlion Park", "Singapore Flyer"],
        startingPrice: 50000,
        images: [
            "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Grace Hotel, Auberge Resorts Collection",
        destinations: ["Santorini", "Greece"],
        type: "Hotel",
        specializations: ["Romance", "Views"],
        budgetRange: { min: 80000, max: 300000 },
        rating: 4.9,
        description: "Grace Hotel Santorini is an exclusive boutique hotel in Santorini, Greece, perched above the world-famous Caldera with breathtaking views and sumptuous sunsets.",
        amenities: ["Infinity Pool", "Champagne Lounge", "Yoga & Pilates", "In-room Dining", "Concierge"],
        sightSeeing: ["Oia Sunset", "Red Beach", "Ancient Thera"],
        startingPrice: 90000,
        images: [
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        companyName: "Four Seasons Resort Bora Bora",
        destinations: ["Bora Bora", "French Polynesia"],
        type: "Hotel",
        specializations: ["Tropical", "Honeymoon"],
        budgetRange: { min: 150000, max: 600000 },
        rating: 5.0,
        description: "Wrap yourself in the luxury of Four Seasons Resort Bora Bora, a sand-fringed idyll in the shadow of Mount Otemanu. Toast sunsets from your private plunge pool, marvel at the Tahitian night sky.",
        amenities: ["Overwater Bungalows", "Lagoon Sanctuary", "Te Mahana Spa", "Tennis Courts", "Kids for All Seasons"],
        sightSeeing: ["Mount Otemanu", "Matira Beach", "Coral Gardens"],
        startingPrice: 170000,
        images: [
            "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1000&auto=format&fit=crop"
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing partners and their users
        // Note: In a real app, be careful deleting users. Here we assume a dev environment.
        // We will find users who are partners and delete them.
        const existingPartners = await PartnerProfile.find({});
        const userIds = existingPartners.map(p => p.userId);

        await PartnerProfile.deleteMany({});
        await User.deleteMany({ _id: { $in: userIds } });

        console.log('Cleared existing partners');

        for (const partner of partnersData) {
            // Create User
            const email = `partner.${partner.companyName.replace(/\s+/g, '').toLowerCase()}@voyagegen.com`;
            const hashedPassword = await bcrypt.hash('password123', 10);

            const user = await User.create({
                name: partner.companyName,
                email: email,
                password: hashedPassword,
                role: 'PARTNER',
            });

            // Create Profile
            await PartnerProfile.create({
                userId: user._id,
                ...partner
            });
        }

        console.log('Seeded 20 Partners Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
