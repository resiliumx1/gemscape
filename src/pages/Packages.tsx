import { useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, Crown, Star, Check, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";

gsap.registerPlugin(ScrollTrigger);

const PACKAGES = [
  {
    name: "Gemscape Explorer",
    price: 65,
    priceLabel: "$65",
    icon: Star,
    accent: "#2cb8a8",
    popular: false,
    description:
      "Perfect for independent travellers who want local insight without the full planning service. We'll build your roadmap — you drive the adventure.",
    features: [
      "Custom day-by-day itinerary",
      "Destination recommendations",
      "Suggested activities & timing",
      "Restaurant recommendations",
      "Delivered within 48 hours",
    ],
    ctaLabel: "Choose Explorer",
    gradient: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
  },
  {
    name: "Gemscape Experience",
    price: 95,
    priceLabel: "$95",
    icon: Sparkles,
    accent: "#C9A84C",
    popular: true,
    description:
      "Our signature package. We plan everything — where to go, where to eat, what to do, and when to do it. You just show up and live it.",
    features: [
      "Full curated itinerary",
      "Hotel recommendations",
      "Activity planning & booking",
      "Restaurant guidance & reservations",
      "Local travel tips & hidden gems",
      "WhatsApp support during trip",
    ],
    ctaLabel: "Choose Experience",
    gradient: "linear-gradient(135deg, #C9A84C 0%, #b8956a 100%)",
  },
  {
    name: "Gemscape Elite Concierge",
    price: 195,
    priceLabel: "$195+",
    icon: Crown,
    accent: "#b8956a",
    popular: false,
    description:
      "The white-glove experience. We don't just plan your trip — we orchestrate every moment, handle every booking, and stand by every step of the way.",
    features: [
      "Full travel planning A–Z",
      "Flight guidance & monitoring",
      "Hotel booking assistance",
      "All excursions arranged & confirmed",
      "Airport transfers arranged",
      "Priority 24/7 travel support",
      "On-island emergency assistance",
    ],
    ctaLabel: "Choose Elite",
    gradient: "linear-gradient(135deg, #b8956a 0%, #8a6d4a 100%)",
  },
];

const STEPS = [
  { num: "01", title: "Choose Your Package", desc: "Pick the level of planning that suits your style" },
  { num: "02", title: "Tell Us Your Dates", desc: "Share your travel dates and preferences" },
  { num: "03", title: "We Plan, You Enjoy", desc: "Receive your curated itinerary and start dreaming" },
];

const Packages = () => {
  const { navigateTo } = useWaveNav();
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (eyebrowRef.current) tl.fromTo(eyebrowRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
      if (h1Ref.current) tl.fromTo(h1Ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.5);
      if (subRef.current) tl.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8);

      // Cards stagger
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
          }
        );
      }

      // Steps stagger
      if (stepsRef.current) {
        gsap.fromTo(
          stepsRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: stepsRef.current, start: "top 85%" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--gem-navy))" }}>
      <Helmet>
        <title>Signature Packages | Gemscape Travel & Tours</title>
        <meta name="description" content="Choose your level of planning — from custom itineraries to full white-glove concierge. Let Gemscape handle your perfect Antigua escape." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="packages-hero">
        <div className="packages-hero__bg" />
        <div className="packages-hero__content">
          <span className="eyebrow eyebrow--aqua" ref={eyebrowRef} style={{ opacity: 0 }}>
            Signature Packages
          </span>
          <h1 ref={h1Ref} style={{ opacity: 0 }} className="packages-hero__h1">
            Let Us Plan Your<br />
            <em>Perfect Escape.</em>
          </h1>
          <p ref={subRef} style={{ opacity: 0 }} className="packages-hero__sub">
            From a quick itinerary to full white-glove concierge — choose your level of planning and let Gemscape handle the rest.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ background: "hsl(var(--gem-navy))", paddingTop: 20 }}>
        <div ref={cardsRef} className="packages-grid">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.name}
                className={`pkg-card ${pkg.popular ? "pkg-card--popular" : ""}`}
              >
                {pkg.popular && (
                  <div style={{
                    position: "absolute",
                    top: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #C9A84C, #b8956a)",
                    color: "#05181e",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "6px 20px",
                    borderRadius: "0 0 8px 8px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Most Popular
                  </div>
                )}

                <Icon size={28} style={{ color: pkg.accent, marginBottom: 16 }} />

                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#fff",
                  margin: "0 0 12px",
                }}>
                  {pkg.name}
                </h3>

                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 56,
                    fontWeight: 300,
                    color: "#fff",
                    lineHeight: 1,
                  }}>
                    <span style={{ fontSize: 28 }}>$</span>
                    {pkg.price}
                  </span>
                  {pkg.name.includes("Elite") && (
                    <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", fontFamily: "'Cormorant Garamond', serif" }}>+</span>
                  )}
                </div>

                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 28,
                }}>
                  {pkg.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {pkg.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Check size={16} style={{ color: pkg.accent, flexShrink: 0, marginTop: 2 }} />
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.7)",
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigateTo(`/contact?package=${pkg.name.split(" ").pop()?.toLowerCase()}`)}
                  style={{
                    marginTop: 32,
                    padding: "16px 32px",
                    width: "100%",
                    background: pkg.gradient,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 12px 40px ${pkg.accent}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {pkg.ctaLabel} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        background: "hsl(var(--gem-navy))",
        padding: "80px 24px 100px",
      }}>
        <h2 style={{
          textAlign: "center",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 300,
          color: "#fff",
          marginBottom: 60,
        }}>
          How It Works
        </h2>
        <div
          ref={stepsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            flexWrap: "wrap",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.num}
              style={{
                textAlign: "center",
                maxWidth: 240,
                flex: "1 1 200px",
              }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 40,
                fontWeight: 300,
                color: "#C9A84C",
                display: "block",
                marginBottom: 12,
              }}>
                {step.num}
              </span>
              <h3 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: "hsl(var(--gem-navy))",
        padding: "60px 24px 120px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(24px, 3.5vw, 36px)",
          fontWeight: 300,
          color: "#fff",
          marginBottom: 12,
        }}>
          Not sure which package is right?
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 32,
        }}>
          Contact us and we'll help you decide.
        </p>
        <button
          onClick={() => navigateTo("/contact")}
          style={{
            padding: "16px 40px",
            background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.35s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(44,184,168,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Get in Touch
        </button>
      </section>

      <Footer />
      <WhatsAppFab />
    </div>
  );
};

export default Packages;
