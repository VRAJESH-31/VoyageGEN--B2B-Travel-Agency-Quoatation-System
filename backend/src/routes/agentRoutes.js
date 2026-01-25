const express = require('express');
const router = express.Router();
const {
    startAgentRun,
    getAgentRunById,
    getLatestAgentRunForRequirement,
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All agent routes require authentication + AGENT/ADMIN role
router.use(protect);
router.use(authorize('AGENT', 'ADMIN'));

// @route   POST /api/agent/run/:requirementId
// @desc    Start a new agent run for a requirement
// @access  Private (Agent/Admin)
router.post('/run/:requirementId', startAgentRun);

// @route   GET /api/agent/run/:agentRunId
// @desc    Get agent run by ID
// @access  Private (Agent/Admin)
router.get('/run/:agentRunId', getAgentRunById);

// @route   GET /api/agent/requirement/:requirementId/latest
// @desc    Get latest agent run for a requirement
// @access  Private (Agent/Admin)
router.get('/requirement/:requirementId/latest', getLatestAgentRunForRequirement);

module.exports = router;
