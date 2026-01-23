const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Restrict to allowed origins only
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',  // Vite dev server fallback
            'http://localhost:3000'   // Alternative dev port
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit body size to 10KB

// Rate Limiting - General API limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate Limiting - Strict limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 login/signup attempts per window
    message: { message: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voyagegen')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('VoyageGen API is running...');
});

// Routes (to be added)
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/requirements', require('./routes/requirementRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
