import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlaneDeparture } from 'react-icons/fa';
import { gsap } from 'gsap';

const Header = () => {
    const headerRef = useRef(null);

    useEffect(() => {
        // Initial animation
        gsap.fromTo(headerRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
        );
    }, []);

    return (
        <header
            ref={headerRef}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl"
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 flex justify-between items-center shadow-2xl">
                {/* Logo */}
                <div className="flex items-center gap-2 text-xl font-bold tracking-tighter cursor-pointer text-white">
                    <FaPlaneDeparture className="text-emerald-400" />
                    <span>VoyageGen</span>
                </div>

                {/* Nav Links - Hidden on mobile */}
                <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <a href="#destinations" className="hover:text-white transition-colors relative group">
                        Destinations
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-400 transition-all group-hover:w-full" />
                    </a>
                    <a href="#services" className="hover:text-white transition-colors relative group">
                        Services
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-400 transition-all group-hover:w-full" />
                    </a>
                    <a href="#about" className="hover:text-white transition-colors relative group">
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-400 transition-all group-hover:w-full" />
                    </a>
                    <a href="#contact" className="hover:text-white transition-colors relative group">
                        Contact
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-400 transition-all group-hover:w-full" />
                    </a>
                </nav>

                {/* CTA */}
                <div className="flex gap-4">
                    <Link to="/login">
                        <button className="hidden sm:block px-5 py-2 text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                            Login
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-emerald-400 hover:text-white transition-all shadow-lg hover:shadow-emerald-400/20">
                            Sign Up
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
