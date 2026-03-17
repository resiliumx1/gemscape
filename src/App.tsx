import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
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

    // Custom cursor (desktop only)
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      const xTo = gsap.quickTo("#cursor", "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo("#cursor", "y", { duration: 0.4, ease: "power3" });
      const dotXTo = gsap.quickTo("#cursor-dot", "x", { duration: 0.15, ease: "power3" });
      const dotYTo = gsap.quickTo("#cursor-dot", "y", { duration: 0.15, ease: "power3" });

      const onMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        dotXTo(e.clientX);
        dotYTo(e.clientY);
      };

      const cursorEl = document.getElementById("cursor");

      const onMouseEnterInteractive = () => cursorEl?.classList.add("hovering");
      const onMouseLeaveInteractive = () => cursorEl?.classList.remove("hovering");

      window.addEventListener("mousemove", onMouseMove);

      const addHoverListeners = () => {
        document.querySelectorAll("a, button").forEach((el) => {
          el.addEventListener("mouseenter", onMouseEnterInteractive);
          el.addEventListener("mouseleave", onMouseLeaveInteractive);
        });
      };

      addHoverListeners();
      const observer = new MutationObserver(addHoverListeners);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        observer.disconnect();
        lenis.destroy();
      };
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Custom cursor elements */}
        <div id="cursor" />
        <div id="cursor-dot" />
        {/* Page transition overlay */}
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
  );
};

export default App;
