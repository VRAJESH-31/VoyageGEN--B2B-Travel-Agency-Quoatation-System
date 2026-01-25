const Requirement = require('../models/Requirement');
const AgentRun = require('../models/AgentRun');
const { sendSuccess, sendCreated, sendNotFound, sendError } = require('../utils/response');
const { initSteps, getStepIndex, STEP_STATUS } = require('../services/agents/agentRunHelpers');
const { normalizeRequirement } = require('../services/agents/supervisorAgentService');
const { performResearch } = require('../services/agents/researchAgentService');
const { generateItineraryJSON } = require('../services/agents/plannerAgentService');
const { calculatePricing } = require('../services/agents/priceAgentService');
const { performQualityCheck } = require('../services/agents/qualityAgentService');
const { createQuoteFromAgentRun } = require('../services/agents/agentToQuoteMapper');

// @desc    Start a new agent run for a requirement
// @route   POST /api/agent/run/:requirementId
// @access  Private (Agent/Admin)
const startAgentRun = async (req, res) => {
    let agentRun = null;
    let requirement = null;
    let normalizedParams = null;

    try {
        const { requirementId } = req.params;

        // 1. Find the requirement
        requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return sendNotFound(res, 'Requirement not found');
        }

        // 2. Block duplicate run
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
            meta: { provider: 'gemini', model: 'gemini-2.5-flash', version: 'v1' },
        });

        // 4. Update Requirement
        requirement.agentStatus = 'IN_AGENT';
        requirement.lastAgentRunId = agentRun._id;
        requirement.lastAgentRunAt = new Date();
        await requirement.save();

        // ========================================
        // 5. SUPERVISOR STEP
        // ========================================
        const supervisorIndex = getStepIndex('SUPERVISOR');
        agentRun.steps[supervisorIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[supervisorIndex].startedAt = new Date();
        agentRun.steps[supervisorIndex].logs.push('Starting normalization...');
        await agentRun.save();

        try {
            const supervisorResult = normalizeRequirement(requirement);
            normalizedParams = supervisorResult.normalizedParams;
            
            if (supervisorResult.warnings.length > 0) {
                agentRun.steps[supervisorIndex].logs.push(`Warnings: ${supervisorResult.warnings.join(', ')}`);
            }
            agentRun.steps[supervisorIndex].status = STEP_STATUS.DONE;
            agentRun.steps[supervisorIndex].endedAt = new Date();
            agentRun.steps[supervisorIndex].output = supervisorResult;
            await agentRun.save();
        } catch (err) {
            agentRun.steps[supervisorIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[supervisorIndex].endedAt = new Date();
            agentRun.steps[supervisorIndex].error = err.message;
            agentRun.status = 'FAILED';
            agentRun.error = `Supervisor failed: ${err.message}`;
            await agentRun.save();
            requirement.agentStatus = 'FAILED';
            await requirement.save();
            return sendError(res, `Supervisor failed: ${err.message}`, 422);
        }

        // ========================================
        // 6. RESEARCH STEP
        // ========================================
        const researchIndex = getStepIndex('RESEARCH');
        agentRun.steps[researchIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[researchIndex].startedAt = new Date();
        agentRun.steps[researchIndex].logs.push('Starting research...');
        await agentRun.save();

        let researchOutput = null;
        try {
            researchOutput = await performResearch(normalizedParams);
            if (researchOutput.logs?.length) {
                agentRun.steps[researchIndex].logs.push(...researchOutput.logs);
            }
            agentRun.steps[researchIndex].logs.push(`Found ${researchOutput.hotels?.length || 0} hotels`);
            agentRun.steps[researchIndex].status = STEP_STATUS.DONE;
            agentRun.steps[researchIndex].endedAt = new Date();
            agentRun.steps[researchIndex].output = researchOutput;
            await agentRun.save();
        } catch (err) {
            agentRun.steps[researchIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[researchIndex].endedAt = new Date();
            agentRun.steps[researchIndex].error = err.message;
            agentRun.status = 'FAILED';
            agentRun.error = `Research failed: ${err.message}`;
            await agentRun.save();
            requirement.agentStatus = 'FAILED';
            await requirement.save();
            return sendError(res, `Research failed: ${err.message}`, 422);
        }

        // ========================================
        // 7. PLANNER STEP (Day 6)
        // ========================================
        const plannerIndex = getStepIndex('PLANNER');
        agentRun.steps[plannerIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[plannerIndex].startedAt = new Date();
        agentRun.steps[plannerIndex].logs.push('Starting itinerary generation...');
        await agentRun.save();

        let plannerOutput = null;
        try {
            plannerOutput = await generateItineraryJSON(normalizedParams, researchOutput);
            
            agentRun.steps[plannerIndex].logs.push(`Generated in ${plannerOutput.attempts} attempt(s)`);
            if (plannerOutput.warnings?.length) {
                agentRun.steps[plannerIndex].logs.push(`Warnings: ${plannerOutput.warnings.join(', ')}`);
            }
            agentRun.steps[plannerIndex].status = STEP_STATUS.DONE;
            agentRun.steps[plannerIndex].endedAt = new Date();
            agentRun.steps[plannerIndex].output = plannerOutput;
            agentRun.finalResult = plannerOutput.itinerary;
            await agentRun.save();
        } catch (err) {
            agentRun.steps[plannerIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[plannerIndex].endedAt = new Date();
            agentRun.steps[plannerIndex].error = err.message;
            agentRun.status = 'FAILED';
            agentRun.error = `Planner failed: ${err.message}`;
            await agentRun.save();
            requirement.agentStatus = 'FAILED';
            await requirement.save();
            return sendError(res, `Planner failed: ${err.message}`, 422);
        }

        // ========================================
        // 8. PRICE STEP (Day 7)
        // ========================================
        const priceIndex = getStepIndex('PRICE');
        agentRun.steps[priceIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[priceIndex].startedAt = new Date();
        agentRun.steps[priceIndex].logs.push('Calculating pricing...');
        await agentRun.save();

        let priceOutput = null;
        try {
            priceOutput = calculatePricing({
                supervisorOutput: agentRun.steps[getStepIndex('SUPERVISOR')].output,
                researchOutput,
                plannerOutput
            });
            
            agentRun.steps[priceIndex].logs.push(`Net: ₹${priceOutput.netCost}, Final: ₹${priceOutput.finalCost}`);
            agentRun.steps[priceIndex].logs.push(`Budget fit: ${priceOutput.budgetFit}`);
            if (priceOutput.adjustedHotel) {
                agentRun.steps[priceIndex].logs.push(`Adjusted hotel: ${priceOutput.adjustedHotel}`);
            }
            agentRun.steps[priceIndex].status = STEP_STATUS.DONE;
            agentRun.steps[priceIndex].endedAt = new Date();
            agentRun.steps[priceIndex].output = priceOutput;
            await agentRun.save();
        } catch (err) {
            agentRun.steps[priceIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[priceIndex].endedAt = new Date();
            agentRun.steps[priceIndex].error = err.message;
            agentRun.status = 'FAILED';
            agentRun.error = `Price failed: ${err.message}`;
            await agentRun.save();
            requirement.agentStatus = 'FAILED';
            await requirement.save();
            return sendError(res, `Price failed: ${err.message}`, 422);
        }

        // ========================================
        // 9. QUALITY STEP (Day 8)
        // ========================================
        const qualityIndex = getStepIndex('QUALITY');
        agentRun.steps[qualityIndex].status = STEP_STATUS.RUNNING;
        agentRun.steps[qualityIndex].startedAt = new Date();
        agentRun.steps[qualityIndex].logs.push('Running quality checks...');
        await agentRun.save();

        let qualityOutput = null;
        try {
            qualityOutput = performQualityCheck({
                supervisorOutput: agentRun.steps[getStepIndex('SUPERVISOR')].output,
                plannerOutput,
                priceOutput
            });
            
            agentRun.steps[qualityIndex].logs.push(`Quality score: ${qualityOutput.qualityScore}/100`);
            agentRun.steps[qualityIndex].logs.push(`Passed: ${qualityOutput.passedChecks.join(', ')}`);
            if (qualityOutput.failedChecks.length) {
                agentRun.steps[qualityIndex].logs.push(`Failed: ${qualityOutput.failedChecks.join(', ')}`);
            }
            if (qualityOutput.fixes.length) {
                agentRun.steps[qualityIndex].logs.push(`Auto-fixed: ${qualityOutput.fixes.length} issues`);
            }
            agentRun.steps[qualityIndex].status = STEP_STATUS.DONE;
            agentRun.steps[qualityIndex].endedAt = new Date();
            agentRun.steps[qualityIndex].output = qualityOutput;
            
            // Update final result with quality-fixed itinerary
            agentRun.finalResult = qualityOutput.finalItinerary;
            agentRun.status = 'DONE';
            await agentRun.save();
            
            // Mark requirement as COMPLETED
            requirement.agentStatus = 'COMPLETED';
            await requirement.save();
        } catch (err) {
            agentRun.steps[qualityIndex].status = STEP_STATUS.FAILED;
            agentRun.steps[qualityIndex].endedAt = new Date();
            agentRun.steps[qualityIndex].error = err.message;
            agentRun.status = 'FAILED';
            agentRun.error = `Quality failed: ${err.message}`;
            await agentRun.save();
            requirement.agentStatus = 'FAILED';
            await requirement.save();
            return sendError(res, `Quality failed: ${err.message}`, 422);
        }

        // ========================================
        // 10. AUTO-CREATE QUOTE (Day 9)
        // ========================================
        let quote = null;
        try {
            quote = await createQuoteFromAgentRun({ agentRun, requirement });
            
            // Link quote back to AgentRun and Requirement
            agentRun.quoteId = quote._id;
            await agentRun.save();
            
            requirement.latestQuoteId = quote._id;
            requirement.status = 'QUOTES_READY';
            await requirement.save();
        } catch (quoteErr) {
            console.error('Quote creation failed:', quoteErr);
            // Don't fail the entire run, just log it
        }

        // 11. Return success - All 5 steps + quote
        return sendCreated(res, {
            agentRunId: agentRun._id,
            requirementId: requirement._id,
            status: agentRun.status,
            stepsCompleted: ['SUPERVISOR', 'RESEARCH', 'PLANNER', 'PRICE', 'QUALITY'],
            quoteId: quote?._id || null,
            finalCost: priceOutput?.finalCost || 0,
            budgetFit: priceOutput?.budgetFit || false,
            qualityScore: qualityOutput?.qualityScore || 0,
        }, 'Agent run completed, quote generated');

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
