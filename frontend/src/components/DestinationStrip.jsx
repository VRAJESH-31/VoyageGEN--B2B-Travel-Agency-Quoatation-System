import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinationStripData } from '../data/destinations';

gsap.registerPlugin(ScrollTrigger);

const DestinationStrip = () => {
    const stripRef = useRef(null);

    useEffect(() => {
        const cards = stripRef.current.children;

        gsap.fromTo(cards,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: stripRef.current,
                    start: "top 80%",
                }
            }
        );
    }, []);

    return (
        <section className="py-12 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <div
                    ref={stripRef}
                    className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible"
                >
                    {destinationStripData.map((item) => (
                        <div
                            key={item.id}
                            className="min-w-[250px] md:min-w-0 snap-center bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                        >
                            <div className="h-32 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DestinationStrip;
