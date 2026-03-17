import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import BookingWizard from "@/components/BookingWizard";

const Book = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || undefined;
  const heroRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(eyebrowRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out", delay: 0.3 });
      gsap.fromTo(h1Ref.current, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.5 });
      gsap.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.8 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="book-hero">
        <div className="book-hero__grain" />
        <div className="book-hero__content">
          <span ref={eyebrowRef} className="eyebrow" style={{ opacity: 0, justifyContent: "center" }}>
            Book Your Experience
          </span>
          <h1 ref={h1Ref} className="book-hero__h1" style={{ opacity: 0 }}>
            Let's Plan Your Antigua.
          </h1>
          <p ref={subRef} className="book-hero__sub" style={{ opacity: 0 }}>
            Select a service and tell us about your journey.
          </p>
        </div>
      </section>

      <BookingWizard initialService={initialService} />

      <Footer />
      <WhatsAppFab />
    </>
  );
};

export default Book;
