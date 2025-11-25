import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import DestinationGallery from '../components/DestinationGallery';
import BentoGrid from '../components/BentoGrid';
import TestimonialMarquee from '../components/TestimonialMarquee';

const LandingPage = () => {
    return (
        <>
            <Header />
            <main>
                <div id="home"><Hero /></div>
                <div id="destinations"><DestinationGallery /></div>
                <div id="services"><BentoGrid /></div>
                <div id="about"><TestimonialMarquee /></div>
            </main>
            <div id="contact"><Footer /></div>
        </>
    );
};

export default LandingPage;
