import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ onOpenForm }) => {
    const heroRef = useRef(null);
    const textRef = useRef(null);
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                CLOUDS({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    skyColor: 0x68b8d7,
                    cloudColor: 0xffffff,
                    cloudShadowColor: 0x183550,
                    sunColor: 0xff9919,
                    sunGlareColor: 0xff6633,
                    sunlightColor: 0xff9933,
                    speed: 1.0
                })
            );
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    useEffect(() => {
        const tl = gsap.timeline();

        // Split text animation
        const letters = textRef.current.querySelectorAll('.char');
        tl.fromTo(letters,
            { y: 100, opacity: 0, rotateX: -45 },
            {
                y: 0,
                opacity: 1,
                rotateX: 0,
                stagger: 0.03,
                duration: 1.2,
                ease: "power3.out"
            },
            0.5
        );

    }, []);

    const title = "Where smart planning meets unforgettable journeys.";
    const words = title.split(" ");

    return (
        <section ref={heroRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            <div ref={vantaRef} className="absolute inset-0 z-0" />
            <div className="absolute inset-0 z-10 bg-black/10 pointer-events-none" />
            <div className="relative z-20 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full pt-20">
                <div className="mb-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium tracking-widest uppercase text-emerald-800 mb-6 animate-[fadeIn_1s_ease-out_1s_forwards] opacity-0 shadow-sm">
                        Redefining Luxury Travel
                    </span>
                </div>

                <div ref={textRef} className="overflow-hidden mb-8 max-w-5xl flex flex-wrap justify-center gap-x-3 md:gap-x-6 px-4">
                    {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="inline-block whitespace-nowrap">
                            {word.split('').map((char, charIndex) => (
                                <span key={charIndex} className="char inline-block text-white drop-shadow-lg font-serif text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight">{char}</span>
                            ))}
                        </span>
                    ))}
                </div>

                <p className="text-lg md:text-xl text-white max-w-xl mx-auto mb-12 font-medium opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards] leading-relaxed drop-shadow-md">
                    Curated journeys for the modern explorer. <br className="hidden md:block" />
                    Where AI precision meets human wanderlust.
                </p>

                <Link to="/signup">
                    <button className="group relative px-10 py-4 bg-white text-black rounded-full font-serif font-medium text-lg overflow-hidden transition-all hover:scale-105 opacity-0 animate-[fadeIn_1s_ease-out_1.8s_forwards] shadow-xl hover:shadow-2xl">
                        <span className="relative z-10 group-hover:text-white transition-colors duration-500">Start Your Journey</span>
                        <div className="absolute inset-0 bg-emerald-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out" />
                    </button>
                </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 animate-[fadeIn_1s_ease-out_2.5s_forwards]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white to-white/0" />
            </div>
        </section>
    );
};

export default Hero;
