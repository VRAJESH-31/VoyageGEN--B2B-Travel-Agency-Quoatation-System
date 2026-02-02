import React from 'react';
import Header from '../components/common/Header';
import Hero from '../components/features/Hero';
import Footer from '../components/common/Footer';
import DestinationGallery from '../components/features/DestinationGallery';
import BentoGrid from '../components/features/BentoGrid';
import TestimonialMarquee from '../components/features/TestimonialMarquee';

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
