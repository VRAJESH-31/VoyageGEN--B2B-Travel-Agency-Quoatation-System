const Requirement = require('../models/Requirement');
const AgentRun = require('../models/AgentRun');
const { sendSuccess, sendCreated, sendNotFound, sendError } = require('../utils/response');
const { initSteps, getStepIndex, STEP_STATUS } = require('../services/agents/agentRunHelpers');
const { normalizeRequirement } = require('../services/agents/supervisorAgentService');

// @desc    Start a new agent run for a requirement
// @route   POST /api/agent/run/:requirementId
// @access  Private (Agent/Admin)
const startAgentRun = async (req, res) => {
    let agentRun = null;
    let requirement = null;

    try {
        const { requirementId } = req.params;

        // 1. Find the requirement
        requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return sendNotFound(res, 'Requirement not found');
        }

        // 2. Block duplicate run - prevent starting if already running
        if (requirement.agentStatus === 'IN_AGENT') {
            return sendError(res, 'Agent run already in progress for this requirement', 409);
        }

        // 3. Create AgentRun document
        agentRun = await AgentRun.create({
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

        // ========================================
        // 5. EXECUTE SUPERVISOR STEP (Day 4)
        // ========================================
        const supervisorIndex = getStepIndex('SUPERVISOR'); // 0

        // Mark SUPERVISOR as RUNNING
        agentRun.steps[supervisorIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[supervisorIndex].startedAt = new Date();
        agentRun.steps[supervisorIndex].logs.push('Starting supervisor normalization...');
        await agentRun.save();

        try {
            // Execute Supervisor logic
            const { normalizedParams, warnings } = normalizeRequirement(requirement);

            // Log warnings if any
            if (warnings.length > 0) {
                agentRun.steps[supervisorIndex].logs.push(`Warnings: ${warnings.join(', ')}`);
            }
            agentRun.steps[supervisorIndex].logs.push('Normalization completed successfully');

            // Mark SUPERVISOR as DONE with output
            agentRun.steps[supervisorIndex].status = STEP_STATUS.DONE;
            agentRun.steps[supervisorIndex].endedAt = new Date();
            agentRun.steps[supervisorIndex].output = { normalizedParams, warnings };
            await agentRun.save();

        } catch (supervisorError) {
            // SUPERVISOR FAILED
            console.error('Supervisor Error:', supervisorError);

            agentRun.steps[supervisorIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[supervisorIndex].endedAt = new Date();
            agentRun.steps[supervisorIndex].error = supervisorError.message;
            agentRun.steps[supervisorIndex].logs.push(`Error: ${supervisorError.message}`);
            agentRun.status = 'FAILED';
            agentRun.error = `Supervisor failed: ${supervisorError.message}`;
            await agentRun.save();

            // Update Requirement status to FAILED
            requirement.agentStatus = 'FAILED';
            await requirement.save();

            return sendError(res, `Supervisor step failed: ${supervisorError.message}`, 422);
        }

        // 6. Return success response (Supervisor complete, pipeline continues)
        return sendCreated(res, {
            agentRunId: agentRun._id,
            requirementId: requirement._id,
            status: agentRun.status,
            supervisorStatus: agentRun.steps[supervisorIndex].status,
        }, 'Agent run started, Supervisor step completed');

    } catch (error) {
        console.error('startAgentRun Error:', error);

        // Cleanup on unexpected error
        if (agentRun) {
            agentRun.status = 'FAILED';
            agentRun.error = error.message;
            await agentRun.save();
        }
        if (requirement && requirement.agentStatus === 'IN_AGENT') {
            requirement.agentStatus = 'FAILED';
            await requirement.save();
        }

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
