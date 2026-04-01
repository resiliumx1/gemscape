import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
        requestAnimationFrame(() => ScrollTrigger.refresh());
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
    <div id="main-content" className="min-h-screen relative overflow-x-hidden flex flex-col bg-[#022c22]">
      <Helmet>
        <title>Gemscape Travel & Tours | Private Tours, Rentals & Concierge — Antigua & Barbuda</title>
        <meta name="description" content="Antigua & Barbuda's premier private travel experience. Island circumnavigation tours, luxury car rentals, VIP flight concierge, and signature planning packages. Crafted for those who demand the extraordinary." />
        <link rel="canonical" href="https://gemscapetours.com/" />
      </Helmet>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <HeroSection />
        <Services />
        <Experiences />
        <RentalsPreview />
        <Manifesto />
        <Testimonials />
        <PackagesPreview />
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
