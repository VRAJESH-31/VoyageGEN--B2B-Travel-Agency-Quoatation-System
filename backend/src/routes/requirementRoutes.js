const express = require('express');
const router = express.Router();
const {
    createRequirement,
    getRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement,
} = require('../controllers/requirementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', createRequirement);
router.get('/', protect, authorize('AGENT', 'ADMIN'), getRequirements);
router.get('/:id', protect, authorize('USER', 'AGENT', 'ADMIN'), getRequirementById);
router.put('/:id', protect, authorize('AGENT', 'ADMIN'), updateRequirement);
router.delete('/:id', protect, authorize('AGENT', 'ADMIN'), deleteRequirement);

module.exports = router;
