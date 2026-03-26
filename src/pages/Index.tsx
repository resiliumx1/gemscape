import { useEffect } from "react";
import { motion } from "framer-motion";
import { WaveTransition, hasPlayedIntro } from "@/components/WaveTransition";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
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

const Index = () => {
  const contentDelay = 0; // Intro handled by IntroSplash

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

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-[#022c22]">
      <WaveTransition />

      <motion.div
        className="relative z-10 flex flex-col min-h-screen"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.5,
          delay: contentDelay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <Navbar />
        <HeroSection />
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
