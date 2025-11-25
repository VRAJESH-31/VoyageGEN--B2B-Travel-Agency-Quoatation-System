import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinations } from '../data/destinations';

gsap.registerPlugin(ScrollTrigger);

const FeaturedDestinations = ({ onSelect, selectedId }) => {
    const gridRef = useRef(null);

    useEffect(() => {
        const cards = gridRef.current.children;

        gsap.fromTo(cards,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 75%",
                }
            }
        );
    }, []);

    return (
        <section id="destinations" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Most Loved Destinations</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Explore the top-rated locations that our travelers can't stop raving about. Click on a destination to see what people are saying.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {destinations.map((dest) => (
                        <div
                            key={dest.id}
                            onClick={() => onSelect(dest)}
                            className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${selectedId === dest.id ? 'ring-4 ring-emerald-500 ring-offset-4' : 'hover:shadow-2xl hover:-translate-y-1'}`}
                        >
                            <div className="aspect-[16/9] overflow-hidden">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"; // Fallback travel image
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-3xl font-bold text-white mb-2">{dest.name}</h3>
                                <p className="text-gray-200 line-clamp-2">{dest.brief}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedDestinations;
