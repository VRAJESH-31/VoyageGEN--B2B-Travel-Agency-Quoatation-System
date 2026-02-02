const express = require('express');
const router = express.Router();
const {
    startAgentRun,
    getAgentRunById,
    getLatestAgentRunForRequirement,
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
    startAgentRunSchema,
    getAgentRunSchema,
    getLatestAgentRunSchema
} = require('../validators/agentValidators');

// All agent routes require authentication + AGENT/ADMIN role
router.use(protect);
router.use(authorize('AGENT', 'ADMIN'));

// @route   POST /api/agent/run/:requirementId
// @desc    Start a new agent run for a requirement
// @access  Private (Agent/Admin)
router.post('/run/:requirementId', validateRequest(startAgentRunSchema), startAgentRun);

// @route   GET /api/agent/run/:agentRunId
// @desc    Get agent run by ID
// @access  Private (Agent/Admin)
router.get('/run/:agentRunId', validateRequest(getAgentRunSchema), getAgentRunById);

// @route   GET /api/agent/requirement/:requirementId/latest
// @desc    Get latest agent run for a requirement
// @access  Private (Agent/Admin)
router.get('/requirement/:requirementId/latest', validateRequest(getLatestAgentRunSchema), getLatestAgentRunForRequirement);

module.exports = router;

