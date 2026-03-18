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

    // Custom crosshair cursor (desktop only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const cross = document.getElementById('gc-cross');
      const ring = document.getElementById('gc-ring');

      if (cross && ring) {
        const xC = gsap.quickTo(cross, 'x', { duration: 0.08, ease: 'power2' });
        const yC = gsap.quickTo(cross, 'y', { duration: 0.08, ease: 'power2' });
        const xR = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
        const yR = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

        const onMouseMove = (e: MouseEvent) => {
          xC(e.clientX); yC(e.clientY);
          xR(e.clientX); yR(e.clientY);
        };
        window.addEventListener('mousemove', onMouseMove);

        const addHoverListeners = () => {
          document.querySelectorAll('a, button, [role="button"], label').forEach((el) => {
            el.addEventListener('mouseenter', () => {
              gsap.to(cross, { opacity: 0, scale: 0.5, duration: 0.2 });
              gsap.to(ring, { width: 52, height: 52, borderColor: 'rgba(201,148,58,0.65)', duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
              gsap.to(cross, { opacity: 1, scale: 1, duration: 0.2 });
              gsap.to(ring, { width: 36, height: 36, borderColor: 'rgba(201,148,58,0.28)', duration: 0.3 });
            });
          });

          document.querySelectorAll('img, .exp-card, .r-card, .bw-svc-card').forEach((el) => {
            el.addEventListener('mouseenter', () => {
              gsap.to(cross, { rotation: 45, duration: 0.35, ease: 'power2' });
              gsap.to(ring, { scale: 1.15, duration: 0.35 });
            });
            el.addEventListener('mouseleave', () => {
              gsap.to(cross, { rotation: 0, duration: 0.35, ease: 'power2' });
              gsap.to(ring, { scale: 1, duration: 0.35 });
            });
          });
        };

        addHoverListeners();
        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('mouseleave', () => {
          gsap.to([cross, ring], { opacity: 0, duration: 0.2 });
        });
        document.addEventListener('mouseenter', () => {
          gsap.to([cross, ring], { opacity: 1, duration: 0.2 });
        });

        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          observer.disconnect();
          lenis.destroy();
        };
      }
    }

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
        <div id="gc-cross" aria-hidden="true" />
        <div id="gc-ring" aria-hidden="true" />
        <div id="page-transition" />
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/book" element={<Book />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </CurrencyProvider>
    </HelmetProvider>
  );
};

export default App;
