const express = require('express');
const router = express.Router();
const {
    generateQuotes,
    getQuotesByRequirement,
    getQuoteById,
    updateQuote,
    getQuotes,
    deleteQuote,
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { generateQuotesSchema, updateQuoteSchema } = require('../validators/quoteValidators');

router.post('/generate', protect, authorize('AGENT', 'ADMIN'), validateRequest(generateQuotesSchema), generateQuotes);
router.get('/', protect, authorize('AGENT', 'ADMIN'), getQuotes);
router.get('/requirement/:id', protect, authorize('AGENT', 'ADMIN'), getQuotesByRequirement);
router.get('/:id', protect, authorize('AGENT', 'ADMIN'), getQuoteById);
router.put('/:id', protect, authorize('AGENT', 'ADMIN'), validateRequest(updateQuoteSchema), updateQuote);
router.delete('/:id', protect, authorize('AGENT', 'ADMIN'), deleteQuote);

module.exports = router;
