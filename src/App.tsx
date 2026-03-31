import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
import WavePageTransition from "@/components/WavePageTransition";

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
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route path="/book" element={<Book />} />
      <Route path="/concierge" element={<Concierge />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/experiences" element={<Experiences />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
          <WavePageTransition>
            <ScrollToTop />
            <AnimatedRoutes />
          </WavePageTransition>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </CurrencyProvider>
    </HelmetProvider>
  );
};

export default App;
