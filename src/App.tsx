import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import Contact from "./pages/Contact.tsx";
import Experiences from "./pages/Experiences.tsx";
import { PageTransitionProvider } from "@/components/PageTransitionWave";
import WaveTransition from "@/components/WaveTransition";
import { WavePageTransition } from "@/components/WavePageTransition";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const lenisEl = document.querySelector('[data-lenis-scroll]') as HTMLElement;
    if (lenisEl) lenisEl.scrollTop = 0;
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WaveTransition color="teal"><Index /></WaveTransition>} />
        <Route path="/rentals" element={<WaveTransition color="gold"><Rentals /></WaveTransition>} />
        <Route path="/book" element={<WaveTransition color="teal"><Book /></WaveTransition>} />
        <Route path="/concierge" element={<WaveTransition color="blue"><Concierge /></WaveTransition>} />
        <Route path="/contact" element={<WaveTransition color="green"><Contact /></WaveTransition>} />
        <Route path="/experiences" element={<WaveTransition color="teal"><Experiences /></WaveTransition>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const isAdmin = window.location.pathname.startsWith('/admin');

  useEffect(() => {
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
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    }

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
        
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <PageTransitionProvider>
            <ScrollToTop />
            <AnimatedRoutes />
          </PageTransitionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </CurrencyProvider>
    </HelmetProvider>
  );
};

export default App;
