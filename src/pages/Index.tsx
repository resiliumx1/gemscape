import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Services from "@/components/Services";
import Experiences from "@/components/Experiences";
import RentalsPreview from "@/components/RentalsPreview";
import Manifesto from "@/components/Manifesto";
import Testimonials from "@/components/Testimonials";
import PackagesPreview from "@/components/PackagesPreview";
import WhyGemscape from "@/components/WhyGemscape";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import WaveDivider from "@/components/WaveDivider";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
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
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <HeroSection />
        <Services />
        <Experiences />
        <RentalsPreview />
        <Manifesto />
        <Testimonials />
        <div style={{ position: "relative" }}>
          <WaveDivider variant="ocean" height={120} />
        </div>
        <WhyGemscape />
        <div style={{ position: "relative" }}>
          <WaveDivider variant="teal" height={120} />
        </div>
        <CtaBanner />
        <div style={{ position: "relative" }}>
          <WaveDivider variant="ocean" height={120} />
        </div>
        <Footer />
      </div>
      <WhatsAppFab />
    </div>
  );
};

export default Index;
