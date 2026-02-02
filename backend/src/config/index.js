const connectDB = require('./db');
const corsOptions = require('./cors');
const { generalLimiter, authLimiter } = require('./rateLimit');

module.exports = {
    connectDB,
    corsOptions,
    generalLimiter,
    authLimiter
};
