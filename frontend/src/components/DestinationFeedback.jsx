import React, { useEffect, useRef } from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { gsap } from 'gsap';

const DestinationFeedback = ({ selectedDestination }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (selectedDestination) {
            // Animate content change
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [selectedDestination]);

    if (!selectedDestination) return null;

    return (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-6" ref={containerRef}>
                <div ref={contentRef} className="flex flex-col lg:flex-row gap-12">

                    {/* Left: Destination Info */}
                    <div className="lg:w-1/3">
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">
                            Why Travelers Love <span className="text-emerald-500">{selectedDestination.name}</span>
                        </h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            {selectedDestination.description}
                        </p>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm inline-block">
                            <div className="text-4xl font-bold text-slate-900">{selectedDestination.averageRating}</div>
                            <div>
                                <div className="flex text-yellow-400 text-lg">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(selectedDestination.averageRating) ? "text-yellow-400" : "text-gray-300"} />
                                    ))}
                                </div>
                                <span className="text-sm text-slate-500">Average Rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Reviews */}
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedDestination.reviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <FaQuoteLeft className="text-emerald-100 text-4xl mb-4" />
                                <p className="text-slate-700 mb-4 italic">"{review.comment}"</p>
                                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                    <span className="font-bold text-slate-900">{review.user}</span>
                                    <div className="flex text-yellow-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DestinationFeedback;
