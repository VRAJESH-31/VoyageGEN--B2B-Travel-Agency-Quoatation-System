import React from 'react';
import { FaPlaneDeparture, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter mb-4 md:mb-0">
                        <FaPlaneDeparture className="text-emerald-500" />
                        <span>VoyageGen</span>
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><FaTwitter size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><FaInstagram size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors"><FaLinkedin size={20} /></a>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 border-t border-slate-800 pt-8">
                    <p>&copy; {new Date().getFullYear()} VoyageGen. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
