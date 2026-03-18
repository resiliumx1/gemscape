import { useEffect } from "react";
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
import AdminLogin from "./pages/AdminLogin.tsx";
import Rentals from "./pages/Rentals.tsx";
import Book from "./pages/Book.tsx";
import Concierge from "./pages/Concierge.tsx";
import { WaveTransitionProvider } from "@/components/GemscapeWave";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical" as const,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Page load overlay
    gsap.to("#page-transition", {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      delay: 0.1,
    });

    return () => {
      lenis.destroy();
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
          <WaveTransitionProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/book" element={<Book />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </WaveTransitionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </CurrencyProvider>
    </HelmetProvider>
  );
};

export default App;
