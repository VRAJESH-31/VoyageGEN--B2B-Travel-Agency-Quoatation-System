import React, { useEffect, useRef } from 'react';
import { FaUser, FaBriefcase, FaHandshake } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const cards = sectionRef.current.querySelectorAll('.service-card');

        gsap.fromTo(cards,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                }
            }
        );
    }, []);

    const services = [
        {
            title: "For Travelers",
            icon: <FaUser className="text-4xl text-emerald-500" />,
            features: [
                "Get multiple travel quotations in minutes.",
                "Discover curated destinations that match your vibe.",
                "View clean, shareable itineraries and PDFs."
            ],
            gradient: "from-emerald-50 to-teal-50"
        },
        {
            title: "For Agents",
            icon: <FaBriefcase className="text-4xl text-blue-500" />,
            features: [
                "AI-assisted quotation building.",
                "RAG-based hotel and package search.",
                "Standardized costing and templates."
            ],
            gradient: "from-blue-50 to-indigo-50"
        },
        {
            title: "For Partners",
            icon: <FaHandshake className="text-4xl text-purple-500" />,
            features: [
                "Collaborate on pricing with agents.",
                "Showcase your hotels and packages.",
                "Improve conversions with better quotation quality."
            ],
            gradient: "from-purple-50 to-fuchsia-50"
        }
    ];

    return (
        <section ref={sectionRef} className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">What We Provide</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Whether you're exploring the world, planning trips for others, or providing the best stays, VoyageGen empowers you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`service-card p-8 rounded-2xl bg-gradient-to-br ${service.gradient} border border-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-2`}
                        >
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-6">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">{service.title}</h3>
                            <ul className="space-y-4">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
