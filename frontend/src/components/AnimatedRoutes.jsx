import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PlanJourney from '../pages/PlanJourney';
import ThankYou from '../pages/ThankYou';

// Layouts
import AgentLayout from '../layouts/AgentLayout';
import PartnerLayout from '../layouts/PartnerLayout';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard';
import RequirementDetails from '../pages/agent/RequirementDetails';
import QuoteEditor from '../pages/agent/QuoteEditor';
import QuotesList from '../pages/agent/QuotesList';

// Partner Pages
import PartnerDashboard from '../pages/partner/PartnerDashboard';
import Inventory from '../pages/partner/Inventory';

// Components
import ProtectedRoute from './ProtectedRoute';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/plan-journey" element={
                    <ProtectedRoute role="USER">
                        <PlanJourney />
                    </ProtectedRoute>
                } />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Agent Routes */}
                <Route path="/agent" element={
                    <ProtectedRoute role="AGENT">
                        <AgentLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<AgentDashboard />} />
                    <Route path="requirement/:id" element={<RequirementDetails />} />
                    <Route path="quote/:id" element={<QuoteEditor />} />
                    <Route path="quotes" element={<QuotesList />} />
                </Route>

                {/* Partner Routes */}
                <Route path="/partner" element={
                    <ProtectedRoute role="PARTNER">
                        <PartnerLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<PartnerDashboard />} />
                    <Route path="inventory" element={<Inventory />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
