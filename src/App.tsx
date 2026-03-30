import { useEffect, useState, useCallback } from "react";
import { HelmetProvider } from "react-helmet-async";

import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";

import Rentals from "./pages/Rentals.tsx";
import Book from "./pages/Book.tsx";
import Concierge from "./pages/Concierge.tsx";
import { PageTransitionProvider, PageWrapper } from "@/components/PageTransitionWave";
import IntroSplash from "@/components/IntroSplash";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

const App = () => {
  const [showIntro, setShowIntro] = useState(
    () => sessionStorage.getItem("introPlayed") !== "true"
  );

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    // Don't initialize Lenis on admin pages — it hijacks scroll events
    const isAdmin = window.location.pathname.startsWith('/admin');

    let lenis: Lenis | null = null;

    if (!isAdmin) {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical" as const,
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      // Ensure Lenis classes are removed on admin
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    }

    // Page load overlay
    gsap.to("#page-transition", {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      delay: 0.1,
    });

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <HelmetProvider>
    <CurrencyProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showIntro && window.location.pathname !== '/admin' && <IntroSplash onComplete={handleIntroComplete} />}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTransitionProvider>
            <Routes>
              <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
              <Route path="/rentals" element={<PageWrapper><Rentals /></PageWrapper>} />
              <Route path="/book" element={<PageWrapper><Book /></PageWrapper>} />
              <Route path="/concierge" element={<PageWrapper><Concierge /></PageWrapper>} />
              
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransitionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </CurrencyProvider>
    </HelmetProvider>
  );
};

export default App;
