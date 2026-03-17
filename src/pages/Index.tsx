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
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  useEffect(() => {
    // Refresh ScrollTrigger after all images load
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
    <>
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
      <WhatsAppFab />
    </>
  );
};

export default Index;
