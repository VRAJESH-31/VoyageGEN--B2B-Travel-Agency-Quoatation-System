import React from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const testimonials = [
    { id: 1, name: "Alice M.", text: "The most seamless travel experience of my life. VoyageGen's AI is magic.", role: "Digital Nomad" },
    { id: 2, name: "James R.", text: "I found a hidden gem in Bali that wasn't on any other site. Incredible.", role: "Photographer" },
    { id: 3, name: "Sarah K.", text: "Luxury redefined. The itinerary was perfect down to the minute.", role: "CEO" },
    { id: 4, name: "David L.", text: "Saved me hours of planning. The hotel recommendations were spot on.", role: "Architect" },
    { id: 5, name: "Elena G.", text: "A visual masterpiece of a platform, and the service matches the looks.", role: "Designer" },
];

const TestimonialMarquee = () => {
    return (
        <section className="py-24 bg-black overflow-hidden border-t border-white/10">
            <div className="container mx-auto px-6 mb-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Trusted by Visionaries</h2>
            </div>

            <div className="flex relative overflow-hidden group">
                <div className="flex animate-marquee whitespace-nowrap gap-8 pause-on-hover">
                    {[...testimonials, ...testimonials, ...testimonials].map((item, index) => (
                        <div
                            key={index}
                            className="w-[400px] bg-zinc-900/50 border border-white/10 p-8 rounded-2xl flex-shrink-0 hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="flex gap-1 text-yellow-400 mb-4 text-sm">
                                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                            </div>
                            <p className="text-gray-300 text-lg mb-6 whitespace-normal leading-relaxed">"{item.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full" />
                                <div>
                                    <h4 className="font-bold text-white">{item.name}</h4>
                                    <span className="text-sm text-gray-500">{item.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradients for fade effect */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            </div>
        </section>
    );
};

export default TestimonialMarquee;
