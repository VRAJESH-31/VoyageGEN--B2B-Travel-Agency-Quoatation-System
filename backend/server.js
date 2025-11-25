const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voyagegen')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('VoyageGen API is running...');
});

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/requirements', require('./routes/requirementRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
