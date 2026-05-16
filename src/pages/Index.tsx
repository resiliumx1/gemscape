import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RentalsPreview from "@/components/RentalsPreview";
import Manifesto from "@/components/Manifesto";
import PackagesPreview from "@/components/PackagesPreview";
import ItineraryBuilder from "@/components/ItineraryBuilder";
import ConsultationCta from "@/components/ConsultationCta";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import {
  HomeExperiencesPreview,
  HomeServicesGrid,
  HomeWhyGemscape,
  HomeTestimonials,
  HomeFooterCta,
} from "@/components/home/HomeSections";
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
        <title>Gemscape | Curated Caribbean Itineraries — Antigua &amp; Barbuda</title>
        <meta name="description" content="Curated Caribbean experiences designed around peace, beauty, and connection. Personalized itineraries, thoughtful coordination, and trusted island support across Antigua & Barbuda." />
        <link rel="canonical" href="https://gemscapetours.com/" />
        <meta property="og:title" content="Gemscape | Curated Caribbean Itineraries" />
        <meta property="og:description" content="Curated Caribbean experiences designed around peace, beauty, and connection." />
        <meta property="og:url" content="https://gemscapetours.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://gemscapetours.com/images/hero-antigua-sunset.webp" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <HeroSection />
        <HomeExperiencesPreview />
        <HomeServicesGrid />
        <RentalsPreview />
        <Manifesto />
        <HomeWhyGemscape />
        <HomeTestimonials />
        <PackagesPreview />
        <div style={{ position: "relative" }}>
          <WaveDivider variant="ocean" height={120} />
        </div>
        <ItineraryBuilder />
        <ConsultationCta />
        <div style={{ position: "relative" }}>
          <WaveDivider variant="teal" height={120} />
        </div>
        <CtaBanner />
        <HomeFooterCta />
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
