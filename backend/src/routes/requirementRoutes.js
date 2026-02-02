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
const { validateRequest } = require('../middleware/validateRequest');
const { createRequirementSchema, updateRequirementSchema } = require('../validators/requirementValidators');

router.post('/', validateRequest(createRequirementSchema), createRequirement);
router.get('/', protect, authorize('AGENT', 'ADMIN'), getRequirements);
router.get('/:id', protect, authorize('USER', 'AGENT', 'ADMIN'), getRequirementById);
router.put('/:id', protect, authorize('AGENT', 'ADMIN'), validateRequest(updateRequirementSchema), updateRequirement);
router.delete('/:id', protect, authorize('AGENT', 'ADMIN'), deleteRequirement);

module.exports = router;
