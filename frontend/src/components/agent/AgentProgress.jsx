import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

// Shared constant - export for use in RequirementDetails
export const AGENT_STEPS = [
    { id: 'SUPERVISOR', label: 'Supervisor', description: 'Normalizing parameters' },
    { id: 'RESEARCH', label: 'Research', description: 'Finding hotels & activities' },
    { id: 'PLANNER', label: 'Planner', description: 'Building itinerary' },
    { id: 'PRICE', label: 'Price', description: 'Calculating costs' },
    { id: 'QUALITY', label: 'Quality', description: 'Final checks' },
];

const AgentProgress = ({ status = 'IDLE', currentStep = 0, steps = AGENT_STEPS, error = null }) => {
    if (status === 'IDLE') return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
        >
            <div className="flex flex-col gap-3">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep && status === 'RUNNING';
                    const isFailed = status === 'ERROR' && index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            {/* Step indicator */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                                ${isCompleted ? 'bg-emerald-500 text-black' : ''}
                                ${isActive ? 'bg-emerald-500/20 border-2 border-emerald-500' : ''}
                                ${isFailed ? 'bg-red-500/20 border-2 border-red-500' : ''}
                                ${isPending ? 'bg-white/5 border border-white/10' : ''}
                            `}>
                                {isCompleted && <FaCheck className="text-sm" />}
                                {isActive && <FaSpinner className="text-emerald-500 animate-spin text-sm" />}
                                {isFailed && <FaExclamationTriangle className="text-red-500 text-sm" />}
                                {isPending && <span className="text-xs text-gray-500">{index + 1}</span>}
                            </div>

                            {/* Step info */}
                            <div className="flex-1">
                                <p className={`font-medium text-sm ${isCompleted ? 'text-emerald-400' : isActive ? 'text-white' : isFailed ? 'text-red-400' : 'text-gray-500'}`}>
                                    {step.label}
                                </p>
                                <p className={`text-xs ${isCompleted ? 'text-emerald-400/60' : isActive ? 'text-gray-400' : isFailed ? 'text-red-400/60' : 'text-gray-600'}`}>
                                    {isFailed ? error || 'Step failed' : step.description}
                                </p>
                            </div>

                            {/* Status badge */}
                            {isCompleted && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Done
                                </span>
                            )}
                            {isActive && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                    Running
                                </span>
                            )}
                            {isFailed && (
                                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                                    Failed
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${status === 'ERROR' ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

export default AgentProgress;

