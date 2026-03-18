import { useEffect, useRef } from "react";
import { Diamond, Plane, ArrowLeft } from "lucide-react";
import { useWave } from "@/components/GemscapeWave";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

const Concierge = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".concierge-icon", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.3 });
      gsap.fromTo(".concierge-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 });
      gsap.fromTo(".concierge-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.8 });
      gsap.fromTo(".concierge-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", delay: 1.0 });
      gsap.fromTo(".concierge-desc", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.1 });
      gsap.fromTo(".concierge-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.3 });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--gem-navy))" }}>
      <Navbar />
      <div ref={contentRef} className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32" style={{ minHeight: "80vh" }}>
        <div className="concierge-icon" style={{ opacity: 0 }}>
          <div style={{
            width: 80, height: 80,
            border: "1px solid rgba(184,150,90,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            position: "relative",
          }}>
            <Plane size={32} style={{ color: "hsl(var(--gem-gold))" }} />
            <div style={{
              position: "absolute", inset: -6,
              border: "1px solid rgba(184,150,90,0.15)",
            }} />
          </div>
        </div>

        <h1 className="concierge-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300, fontSize: "clamp(40px, 8vw, 80px)",
          color: "#fff", lineHeight: 0.92, opacity: 0,
        }}>
          Coming <em style={{ fontStyle: "italic", color: "hsl(var(--gem-aqua))" }}>Soon</em>
        </h1>

        <p className="concierge-sub" style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em",
          color: "hsl(var(--gem-gold))", marginTop: 16, opacity: 0,
        }}>
          Flight Concierge Service
        </p>

        <div className="concierge-divider" style={{
          width: 60, height: 1,
          background: "linear-gradient(90deg, transparent, hsl(var(--gem-gold)), transparent)",
          margin: "32px auto", transformOrigin: "center",
        }} />

        <p className="concierge-desc" style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          fontSize: 17, lineHeight: 1.8, maxWidth: 520,
          color: "rgba(255,255,255,0.65)", opacity: 0,
        }}>
          Our flight concierge service is being crafted to perfection. 
          From VIP meet-and-greet at V.C. Bird International to private charter arrangements — 
          every detail of your arrival and departure will be effortless.
        </p>

        <div className="concierge-cta" style={{ opacity: 0, marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/"
            className="hero__btn-secondary"
            onClick={(e) => { e.preventDefault(); navigateTo("/", "dual"); }}
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.8)",
              padding: "14px 28px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none", display: "inline-flex",
              alignItems: "center", gap: 8,
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
          <a
            href="https://wa.me/1268XXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: "1px solid #25D366",
              color: "#25D366",
              background: "rgba(37,211,102,0.1)",
              padding: "14px 28px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none", display: "inline-flex",
              alignItems: "center", gap: 8,
            }}
          >
            Get Notified via WhatsApp
          </a>
        </div>
      </div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
};

export default Concierge;
