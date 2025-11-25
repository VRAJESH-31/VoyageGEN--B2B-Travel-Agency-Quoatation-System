import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ThankYou = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-emerald-500/10 p-8 rounded-full mb-8 animate-pulse-slow">
                <FaCheckCircle className="text-6xl text-emerald-500" />
            </div>

            <h1 className="text-4xl md:text-6xl font-serif mb-6">Request Received</h1>

            <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                Thank you for choosing VoyageGen. We are currently matching your requirements with our top-tier partners.
                <br />
                You will receive a curated quotation on your email and WhatsApp shortly.
            </p>

            <Link
                to="/"
                className="px-8 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all"
            >
                Return Home
            </Link>
        </div>
    );
};

export default ThankYou;
