import { useRef, useEffect } from "react";
import { Star, Sparkles, Crown, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWaveNav } from "@/components/WavePageTransition";
import { useCurrency } from "@/contexts/CurrencyContext";

gsap.registerPlugin(ScrollTrigger);

const MINI_PACKAGES = [
  { name: "Explorer", price: "$65", icon: Star, accent: "#2cb8a8" },
  { name: "Experience", price: "$95", icon: Sparkles, accent: "#C9A84C" },
  { name: "Elite Concierge", price: "$195+", icon: Crown, accent: "#b8956a" },
];

const PackagesPreview = () => {
  const { navigateTo } = useWaveNav();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "hsl(var(--gem-navy))",
        padding: "100px 24px",
        textAlign: "center",
      }}
    >
      <span className="eyebrow eyebrow--aqua" style={{ marginBottom: 16, display: "block" }}>
        Signature Packages
      </span>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(28px, 4.5vw, 44px)",
        fontWeight: 400,
        color: "#fff",
        lineHeight: 1.15,
        marginBottom: 12,
      }}>
        Let <span className="hero-country-shimmer">Gemscape</span> Plan Your Perfect Day.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        color: "rgba(255,255,255,0.5)",
        maxWidth: 520,
        margin: "0 auto 48px",
        lineHeight: 1.7,
      }}>
        From quick itineraries to full concierge — choose the level of planning that fits your style.
      </p>

      <div
        ref={cardsRef}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          flexWrap: "wrap",
          maxWidth: 800,
          margin: "0 auto 48px",
        }}
      >
        {MINI_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.name}
              onClick={() => navigateTo("/packages")}
              style={{
                background: "rgba(5,24,30,0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(44,184,168,0.12)",
                borderRadius: 12,
                padding: "32px 28px",
                flex: "1 1 200px",
                maxWidth: 240,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
                e.currentTarget.style.borderColor = `${pkg.accent}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(44,184,168,0.12)";
              }}
            >
              <Icon size={24} style={{ color: pkg.accent, marginBottom: 12 }} />
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 400,
                color: "#fff",
                margin: "0 0 8px",
              }}>
                {pkg.name}
              </h3>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 400,
                color: pkg.accent,
              }}>
                {pkg.price}
              </span>
              <div style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em",
              }}>
                Learn More <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigateTo("/packages")}
        style={{
          padding: "14px 36px",
          background: "transparent",
          border: "1px solid rgba(201,168,76,0.4)",
          color: "#C9A84C",
          borderRadius: 4,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.35s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.08)";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.7)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        View All Packages
      </button>
    </section>
  );
};

export default PackagesPreview;
