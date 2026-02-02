import React from 'react';
import { FaRobot, FaGlobeAmericas, FaShieldAlt, FaHotel, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BentoGrid = () => {
    return (
        <section className="py-32 bg-black text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase mb-4 block">Our Expertise</span>
                    <h2 className="text-5xl md:text-7xl font-medium mb-6">
                        Why Choose <span className="italic font-serif text-emerald-200">VoyageGen</span>?
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        We combine cutting-edge AI with human curation to deliver travel experiences that are simply unmatched.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-6 h-[1200px] md:h-[600px]">

                    {/* Large Card - AI */}
                    <motion.div
                        whileHover={{ scale: 0.99 }}
                        className="md:col-span-2 md:row-span-2 glass rounded-[2rem] p-10 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-400 text-2xl group-hover:scale-110 transition-transform duration-300">
                                <FaRobot />
                            </div>
                            <h3 className="text-3xl font-medium mb-4">AI-Powered Precision</h3>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                                Our algorithms analyze millions of data points to craft itineraries that perfectly match your style, budget, and pace.
                            </p>
                        </div>

                        <div className="relative z-10 mt-8">
                            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-4 transition-all">
                                Learn More <FaArrowRight />
                            </button>
                        </div>

                        <img
                            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop"
                            alt="AI Travel"
                            className="absolute bottom-0 right-0 w-3/4 opacity-10 group-hover:opacity-30 transition-opacity duration-500 mix-blend-overlay mask-image-gradient"
                        />
                    </motion.div>

                    {/* Medium Card 1 - Global */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-1 md:row-span-1 glass rounded-[2rem] p-8 flex flex-col justify-center group hover:border-blue-500/30 transition-colors"
                    >
                        <FaGlobeAmericas className="text-4xl text-blue-400 mb-6 group-hover:rotate-12 transition-transform duration-500" />
                        <h3 className="text-xl font-medium mb-2">Global Access</h3>
                        <p className="text-sm text-gray-400">Exclusive entry to 190+ countries.</p>
                    </motion.div>

                    {/* Medium Card 2 - Security */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-1 md:row-span-1 glass rounded-[2rem] p-8 flex flex-col justify-center group hover:border-purple-500/30 transition-colors"
                    >
                        <FaShieldAlt className="text-4xl text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-xl font-medium mb-2">Secure & Safe</h3>
                        <p className="text-sm text-gray-400">Bank-grade encryption for peace of mind.</p>
                    </motion.div>

                    {/* Wide Card - Stays */}
                    <motion.div
                        whileHover={{ scale: 0.99 }}
                        className="md:col-span-2 md:row-span-1 glass rounded-[2rem] p-8 flex items-center gap-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex-1 relative z-10">
                            <h3 className="text-2xl font-medium mb-2">Premium Accommodations</h3>
                            <p className="text-gray-400 text-sm">
                                From 5-star hotels to hidden boutique villas, we find the best places to rest.
                            </p>
                        </div>
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl text-yellow-400 shadow-[0_0_30px_-5px_rgba(250,204,21,0.2)] group-hover:shadow-[0_0_50px_-5px_rgba(250,204,21,0.4)] transition-shadow duration-500">
                            <FaHotel />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default BentoGrid;
