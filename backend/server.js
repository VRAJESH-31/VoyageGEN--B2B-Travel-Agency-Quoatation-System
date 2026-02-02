const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configs
const { connectDB, corsOptions, generalLimiter, authLimiter, agentLimiter } = require('./src/config');

// Import middleware
const { errorHandler, notFound } = require('./src/middleware/error.middleware');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting (exclude /api/agent which has its own limiter)
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/agent')) return next();
    generalLimiter(req, res, next);
});

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'VoyageGen API is running',
        version: '1.0.0'
    });
});

// Routes
app.use('/api/auth', authLimiter, require('./src/routes/authRoutes'));
app.use('/api/requirements', require('./src/routes/requirementRoutes'));
app.use('/api/partners', require('./src/routes/partnerRoutes'));
app.use('/api/quotes', require('./src/routes/quoteRoutes'));
app.use('/api/agent', agentLimiter, require('./src/routes/agentRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
