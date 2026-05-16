import { useEffect, lazy, Suspense } from "react";
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
import WavePageTransition from "@/components/WavePageTransition";

// Lazy load non-critical routes
const Rentals = lazy(() => import("./pages/Rentals.tsx"));
const Book = lazy(() => import("./pages/Book.tsx"));
const Concierge = lazy(() => import("./pages/Concierge.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Experiences = lazy(() => import("./pages/Experiences.tsx"));
const Packages = lazy(() => import("./pages/Packages.tsx"));
const BuildItinerary = lazy(() => import("./pages/BuildItinerary.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

declare global {
  interface Window { __lenis?: Lenis | null }
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#05181e" }} />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/book" element={<Book />} />
        <Route path="/concierge" element={<Concierge />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/build-itinerary" element={<BuildItinerary />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Touch-primary devices: keep native momentum scroll (feels best on phones)
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: "vertical" as const,
      gestureOrientation: "vertical" as const,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      lerp: 0.1,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [isAdmin]);

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