import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WaveOverlay } from "@/components/WaveTransition";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Experiences from "@/components/Experiences";
import RentalsPreview from "@/components/RentalsPreview";
import Manifesto from "@/components/Manifesto";
import Testimonials from "@/components/Testimonials";
import WhyGemscape from "@/components/WhyGemscape";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

const INTRO_KEY = "gem_intro_seen";

const Index = () => {
  const [showWave, setShowWave] = useState(() => {
    return !sessionStorage.getItem(INTRO_KEY);
  });
  const [revealed, setRevealed] = useState(() => {
    return !!sessionStorage.getItem(INTRO_KEY);
  });

  useEffect(() => {
    if (showWave) {
      sessionStorage.setItem(INTRO_KEY, "1");
    }
  }, [showWave]);

  useEffect(() => {
    const images = document.querySelectorAll("img");
    let loaded = 0;
    const total = images.length;
    const onLoad = () => {
      loaded++;
      if (loaded >= total) {
        ScrollTrigger.refresh();
      }
    };
    images.forEach((img) => {
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load", onLoad, { once: true });
      }
    });

    return () => {
      images.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, []);

  const handleMidpoint = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleComplete = useCallback(() => {
    setShowWave(false);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex flex-col"
      style={{
        backgroundColor: revealed ? 'transparent' : '#0a3d4a',
        transition: 'background-color 0.4s ease 1.5s',
      }}
    >
      <AnimatePresence>
        {showWave && (
          <WaveOverlay
            variant="dual"
            onMidpoint={handleMidpoint}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 flex flex-col min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navbar />
        <Hero />
        <Services />
        <Experiences />
        <RentalsPreview />
        <Manifesto />
        <Testimonials />
        <WhyGemscape />
        <CtaBanner />
        <Footer />
      </motion.div>
      <WhatsAppFab />
    </div>
  );
};

export default Index;
