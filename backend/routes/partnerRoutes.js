const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    updateProfile,
    addInventory,
    filterPartners,
    searchLivePartners,
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Partner Routes
router.get('/me', protect, authorize('PARTNER'), getMyProfile);
router.post('/profile', protect, authorize('PARTNER'), updateProfile);
router.post('/inventory/:type', protect, authorize('PARTNER'), addInventory);

// Agent Routes
router.post('/filter', protect, authorize('AGENT', 'ADMIN'), filterPartners);
router.post('/live-search', protect, authorize('AGENT', 'ADMIN'), searchLivePartners);

module.exports = router;
