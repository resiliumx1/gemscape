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
      <Helmet>
        <title>Book a Private Tour in Antigua | Gemscape Travel & Tours</title>
        <meta name="description" content="Book your private Antigua experience — island tours, flight concierge, and luxury rentals. Crafted by Gemscape Travel & Tours." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} style={{ background: "var(--bg-primary)", padding: "160px 24px 60px", textAlign: "center" }}>
        <span ref={eyebrowRef} style={{
          opacity: 0, fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)",
          textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "block",
        }}>
          BOOK WITH GEMSCAPE
        </span>
        <h1 ref={h1Ref} style={{
          opacity: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 400, color: "#fff", marginTop: 12,
        }}>
          Plan Your Antigua Experience.
        </h1>
        <p ref={subRef} style={{
          opacity: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 16,
          color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 500, margin: "16px auto 0",
        }}>
          Select a service and tell us about your journey.
        </p>
      </section>

      <div style={{ background: "#05181e", minHeight: "60vh" }}>
        <BookingWizard initialService={initialService} />
      </div>

      <Footer />
      <WhatsAppFab />
    </>
  );
};

export default Book;
