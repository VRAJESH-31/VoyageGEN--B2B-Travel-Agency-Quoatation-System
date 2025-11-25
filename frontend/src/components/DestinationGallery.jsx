import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinations } from '../data/destinations';
import { FaTemperatureHigh, FaClock } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const DestinationGallery = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const totalWidth = sectionRef.current.scrollWidth;
        const windowWidth = window.innerWidth;

        const pin = gsap.to(sectionRef.current, {
            x: () => -(totalWidth - windowWidth),
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: () => `+=${totalWidth}`,
                scrub: 0.5, // Smoother scrub
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        return () => {
            pin.kill();
        };
    }, []);

    return (
        <section ref={triggerRef} className="relative bg-black text-white overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black pointer-events-none" />

            <div ref={sectionRef} className="h-screen flex items-center px-20 gap-20 w-fit will-change-transform">

                {/* Intro Slide */}
                <div className="w-[40vw] flex-shrink-0 pl-20">
                    <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase mb-4 block">Curated Collection</span>
                    <h2 className="text-7xl md:text-8xl font-medium mb-8 leading-tight">
                        The World <br /> <span className="text-white/30 italic font-serif">Awaits You</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                        Discover destinations that defy imagination. Hand-picked for their beauty, culture, and exclusivity.
                    </p>
                </div>

                {/* Destination Slides */}
                {destinations.map((dest, index) => (
                    <div key={dest.id} className="w-[80vw] md:w-[60vw] h-[70vh] flex-shrink-0 relative group">
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 z-10" />
                            <img
                                src={dest.image}
                                alt={dest.name}
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"; // Fallback travel image
                                }}
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            />
                        </div>

                        {/* Floating Content Card */}
                        <div className="absolute -bottom-10 -left-10 bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl z-20 max-w-md shadow-2xl transform group-hover:-translate-y-4 transition-transform duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-6xl font-serif text-white/20">0{index + 1}</span>
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full text-emerald-300">
                                        <FaTemperatureHigh /> 24°C
                                    </span>
                                    <span className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full text-blue-300">
                                        <FaClock /> 5 Days
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-4xl font-medium mb-3">{dest.name}</h3>
                            <p className="text-sm text-gray-400 mb-6 line-clamp-2">{dest.description}</p>
                            <button className="text-sm font-bold uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors">
                                View Itinerary
                            </button>
                        </div>
                    </div>
                ))}

                {/* Spacer for end of scroll */}
                <div className="w-[20vw]" />
            </div>
        </section>
    );
};

export default DestinationGallery;
