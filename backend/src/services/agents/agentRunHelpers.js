/**
 * Agent Run Helpers
 * Utility functions for agent pipeline execution
 */

/**
 * Step names in the agent pipeline (in execution order)
 */
const AGENT_STEPS = ['SUPERVISOR', 'RESEARCH', 'PLANNER', 'PRICE', 'QUALITY'];

/**
 * Step status values
 */
const STEP_STATUS = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    DONE: 'DONE',
    FAILED: 'FAILED',
};

/**
 * Initialize all 5 agent pipeline steps with PENDING status
 * @returns {Array} Array of step objects ready for AgentRun.steps
 */
const initSteps = () => AGENT_STEPS.map(stepName => ({
    stepName,
    status: STEP_STATUS.PENDING,
    startedAt: null,
    endedAt: null,
    logs: [],
    output: null,
    error: null,
}));

/**
 * Create a step object with custom initial status
 * @param {string} stepName - One of AGENT_STEPS
 * @param {string} status - Initial status (default: PENDING)
 * @returns {Object} Step object
 */
const createStep = (stepName, status = STEP_STATUS.PENDING) => ({
    stepName,
    status,
    startedAt: status === STEP_STATUS.RUNNING ? new Date() : null,
    endedAt: null,
    logs: [],
    output: null,
    error: null,
});

/**
 * Find step index by name
 * @param {string} stepName - Step name to find
 * @returns {number} Index in AGENT_STEPS array
 */
const getStepIndex = (stepName) => AGENT_STEPS.indexOf(stepName);

module.exports = {
    AGENT_STEPS,
    STEP_STATUS,
    initSteps,
    createStep,
    getStepIndex,
};
