const Requirement = require('../models/Requirement');
const AgentRun = require('../models/AgentRun');
const { sendSuccess, sendCreated, sendNotFound, sendError } = require('../utils/response');

/**
 * Initialize 5 agent pipeline steps with PENDING status
 */
const initSteps = () => [
    { stepName: 'SUPERVISOR', status: 'PENDING', startedAt: null, endedAt: null, logs: [], output: null, error: null },
    { stepName: 'RESEARCH', status: 'PENDING', startedAt: null, endedAt: null, logs: [], output: null, error: null },
    { stepName: 'PLANNER', status: 'PENDING', startedAt: null, endedAt: null, logs: [], output: null, error: null },
    { stepName: 'PRICE', status: 'PENDING', startedAt: null, endedAt: null, logs: [], output: null, error: null },
    { stepName: 'QUALITY', status: 'PENDING', startedAt: null, endedAt: null, logs: [], output: null, error: null },
];

// @desc    Start a new agent run for a requirement
// @route   POST /api/agent/run/:requirementId
// @access  Private (Agent/Admin)
const startAgentRun = async (req, res) => {
    try {
        const { requirementId } = req.params;

        // 1. Find the requirement
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return sendNotFound(res, 'Requirement not found');
        }

        // 2. Block duplicate run - prevent starting if already running
        if (requirement.agentStatus === 'IN_AGENT') {
            return sendError(res, 'Agent run already in progress for this requirement', 409);
        }

        // 3. Create AgentRun document
        const agentRun = await AgentRun.create({
            requirementId: requirement._id,
            startedBy: req.user._id,
            status: 'RUNNING',
            steps: initSteps(),
            finalResult: null,
            error: null,
            meta: {
                provider: 'gemini',
                model: 'gemini-2.5-flash',
                version: 'v1',
            },
        });

        // 4. Update Requirement with agent tracking
        requirement.agentStatus = 'IN_AGENT';
        requirement.lastAgentRunId = agentRun._id;
        requirement.lastAgentRunAt = new Date();
        await requirement.save();

        // 5. Return success response
        return sendCreated(res, {
            agentRunId: agentRun._id,
            requirementId: requirement._id,
            status: agentRun.status,
        }, 'Agent run started');

    } catch (error) {
        console.error('startAgentRun Error:', error);
        return sendError(res, error.message, 500);
    }
};

// @desc    Get agent run by ID
// @route   GET /api/agent/run/:agentRunId
// @access  Private (Agent/Admin)
const getAgentRunById = async (req, res) => {
    try {
        const { agentRunId } = req.params;

        const agentRun = await AgentRun.findById(agentRunId)
            .populate('requirementId', 'destination tripType budget')
            .populate('startedBy', 'name email');

        if (!agentRun) {
            return sendNotFound(res, 'Agent run not found');
        }

        return sendSuccess(res, {
            _id: agentRun._id,
            requirementId: agentRun.requirementId,
            startedBy: agentRun.startedBy,
            status: agentRun.status,
            steps: agentRun.steps,
            finalResult: agentRun.finalResult,
            error: agentRun.error,
            meta: agentRun.meta,
            createdAt: agentRun.createdAt,
            updatedAt: agentRun.updatedAt,
        });

    } catch (error) {
        console.error('getAgentRunById Error:', error);
        return sendError(res, error.message, 500);
    }
};

// @desc    Get latest agent run for a requirement
// @route   GET /api/agent/requirement/:requirementId/latest
// @access  Private (Agent/Admin)
const getLatestAgentRunForRequirement = async (req, res) => {
    try {
        const { requirementId } = req.params;

        // 1. Find the requirement
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return sendNotFound(res, 'Requirement not found');
        }

        // 2. Check if lastAgentRunId exists
        if (!requirement.lastAgentRunId) {
            return sendSuccess(res, null, 'No agent run found yet');
        }

        // 3. Fetch the AgentRun
        const agentRun = await AgentRun.findById(requirement.lastAgentRunId)
            .populate('startedBy', 'name email');

        if (!agentRun) {
            return sendSuccess(res, null, 'Agent run reference exists but run not found');
        }

        return sendSuccess(res, {
            _id: agentRun._id,
            requirementId: agentRun.requirementId,
            startedBy: agentRun.startedBy,
            status: agentRun.status,
            steps: agentRun.steps,
            finalResult: agentRun.finalResult,
            error: agentRun.error,
            meta: agentRun.meta,
            createdAt: agentRun.createdAt,
            updatedAt: agentRun.updatedAt,
        });

    } catch (error) {
        console.error('getLatestAgentRunForRequirement Error:', error);
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    startAgentRun,
    getAgentRunById,
    getLatestAgentRunForRequirement,
};
