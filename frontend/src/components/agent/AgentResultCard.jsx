import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExternalLinkAlt, FaChartLine, FaMoneyBillWave, FaStar } from 'react-icons/fa';

const AgentResultCard = ({ result, onOpenQuote }) => {
    if (!result) return null;

    const {
        summary = '5-day Honeymoon in Goa',
        finalCost = 95200,
        budgetFit = true,
        qualityScore = 85,
        budget = 100000,
    } = result;

    const budgetPercentage = Math.round((finalCost / budget) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-6"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <FaCheckCircle className="text-black text-lg" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Quote Generated</h4>
                        <p className="text-xs text-emerald-400">AI Agent completed successfully</p>
                    </div>
                </div>
                <span className="text-[10px] bg-emerald-500 text-black px-2 py-1 rounded font-bold uppercase tracking-wider">
                    Complete
                </span>
            </div>

            {/* Trip Summary */}
            <div className="bg-black/20 rounded-lg p-4 mb-4 border border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trip Summary</p>
                <p className="text-white font-medium">{summary}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Final Cost */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <FaMoneyBillWave className="text-emerald-500 text-xs" />
                        <span className="text-[10px] text-gray-500 uppercase">Final Cost</span>
                    </div>
                    <p className="text-lg font-bold text-white">₹{finalCost.toLocaleString()}</p>
                </div>

                {/* Budget Fit */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className={`text-xs ${budgetFit ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <span className="text-[10px] text-gray-500 uppercase">Budget</span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${budgetFit
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {budgetPercentage}% used
                    </span>
                </div>

                {/* Quality Score */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-yellow-500 text-xs" />
                        <span className="text-[10px] text-gray-500 uppercase">Quality</span>
                    </div>
                    <p className="text-lg font-bold text-white">{qualityScore}%</p>
                </div>
            </div>

            {/* Open Quote Button */}
            <button
                onClick={() => {
                    console.log('Open Generated Quote clicked');
                    if (onOpenQuote) onOpenQuote();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
                Open Generated Quote
                <FaExternalLinkAlt className="text-xs group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
};

export default AgentResultCard;
