import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { AuthProvider } from './context/AuthContext';
import AnimatedRoutes from './components/AnimatedRoutes';

// Component to handle Lenis initialization inside Router
const LenisWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Only enable Lenis smooth scroll on landing page, not in portals
    if (location.pathname.startsWith('/agent') ||
      location.pathname.startsWith('/partner') ||
      location.pathname === '/login' ||
      location.pathname === '/signup' ||
      location.pathname === '/plan-journey' ||
      location.pathname === '/thank-you') {
      return; // Skip Lenis for these routes
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [location.pathname]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <LenisWrapper>
          <div className="font-sans antialiased bg-black text-white selection:bg-emerald-500 selection:text-white">
            <AnimatedRoutes />
          </div>
        </LenisWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
