import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Compass, Heart, MapPin, LifeBuoy, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWave } from "@/components/WavePageTransition";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80";
const PHILOSOPHY_IMG =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80";
const PORTRAIT_IMG =
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1400&q=80";

const DIFFERENTIATORS = [
  {
    icon: Compass,
    title: "Curated, not generic",
    copy: "Every recommendation we make is intentional — chosen for the moment, the mood, and the traveler.",
  },
  {
    icon: Heart,
    title: "Personalized around your travel style",
    copy: "Your pace, your preferences, your purpose — your trip is shaped around how you want to feel.",
  },
  {
    icon: MapPin,
    title: "Locally informed Caribbean coordination",
    copy: "Real island knowledge — quiet beaches, trusted drivers, the right table at the right hour.",
  },
  {
    icon: LifeBuoy,
    title: "Support from inquiry to arrival",
    copy: "One thoughtful point of contact, gently coordinating the details so you can simply enjoy them.",
  },
];

export default function About() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    const init = () => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 82%" },
            }
          );
        });
      }, rootRef);
    };
    const id =
      "requestIdleCallback" in window
        ? requestIdleCallback(init)
        : requestAnimationFrame(init);
    return () => {
      if ("requestIdleCallback" in window) cancelIdleCallback(id as number);
      else cancelAnimationFrame(id as number);
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Helmet>
        <title>About Gemscape | Curated Caribbean Travel With Intention</title>
        <meta name="description" content="Gemscape curates Caribbean travel with peace, beauty, culture, and effortless coordination at the heart of every journey." />
        <link rel="canonical" href="https://gemscapetours.com/about" />
        <meta property="og:title" content="About Gemscape | Curated Caribbean Travel With Intention" />
        <meta property="og:description" content="Our travel philosophy: thoughtful planning, local Caribbean knowledge, and a calm, human approach to every journey." />
        <meta property="og:url" content="https://gemscapetours.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://gemscapetours.com/images/hero-antigua-sunset.webp" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="dark"
        style={{
          position: "relative",
          minHeight: "78vh",
          display: "flex",
          alignItems: "flex-end",
          padding: "180px 24px 80px",
          overflow: "hidden",
          background: "#05181e",
        }}
      >
        <img
          src={HERO_IMG}
          alt="Caribbean coastline at golden hour"
          loading="eager"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,24,30,0.55) 0%, rgba(5,24,30,0.35) 40%, rgba(5,24,30,0.92) 100%)",
          }}
        />
        <div
          className="reveal"
          style={{
            position: "relative",
            maxWidth: 980,
            margin: "0 auto",
            width: "100%",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 32,
                height: 1,
                background: "#2cb8a8",
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: ".3em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              About Gemscape
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(40px, 6vw, 76px)",
              lineHeight: 1.08,
              fontWeight: 400,
              letterSpacing: "-.015em",
              maxWidth: 880,
              marginBottom: 28,
            }}
          >
            Caribbean Travel,{" "}
            <span
              style={{
                fontStyle: "italic",
                background:
                  "linear-gradient(135deg, #b8956a 0%, #d4ad7c 50%, #b8956a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Curated With Intention
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(16px, 1.4vw, 19px)",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 720,
            }}
          >
            Gemscape was created for travelers who want more than a booking. We
            help people experience the Caribbean with peace, beauty, culture,
            and effortless coordination at the center of the journey.
          </p>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section
        style={{
          padding: "clamp(90px, 11vw, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "center",
          }}
          className="philos-grid"
        >
          <div className="reveal" style={{ position: "relative" }}>
            <img
              src={PHILOSOPHY_IMG}
              alt="Quiet Caribbean shoreline"
              loading="lazy"
              style={{
                width: "100%",
                height: "clamp(360px, 52vw, 580px)",
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: -1,
                top: 24,
                bottom: 24,
                width: 2,
                background:
                  "linear-gradient(180deg, transparent, #b8956a, transparent)",
              }}
            />
          </div>

          <div className="reveal">
            <span
              style={{
                fontSize: 12,
                letterSpacing: ".3em",
                color: "#b8956a",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Our Philosophy
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--text-primary)",
                margin: "18px 0 28px",
                letterSpacing: "-.005em",
              }}
            >
              Travel that feels{" "}
              <em style={{ color: "#1a8a9e" }}>personal, restorative, and meaningful.</em>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                marginBottom: 18,
              }}
            >
              We believe travel should feel personal, restorative, and
              meaningful. Every journey has a different purpose — celebration,
              reconnection, rest, discovery, romance, or renewal.
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                lineHeight: 1.85,
                color: "var(--text-secondary)",
              }}
            >
              Gemscape exists to help shape those moments with care — quietly
              coordinating the details, listening closely, and grounding every
              recommendation in real Caribbean knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* ── Differentiators ── */}
      <section
        style={{
          background: "var(--bg-secondary)",
          padding: "clamp(90px, 11vw, 150px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            className="reveal"
            style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 72px" }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: ".3em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              The Gemscape Difference
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--text-primary)",
                marginTop: 18,
                letterSpacing: "-.005em",
              }}
            >
              What Makes Gemscape Different
            </h2>
          </div>

          <div
            className="diff-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}
          >
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <article
                  key={d.title}
                  className="reveal diff-card"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 6,
                    padding: "36px 32px",
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                    transition:
                      "transform .5s cubic-bezier(.22,1,.36,1), border-color .4s ease, box-shadow .5s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 22px 50px -28px rgba(26,138,158,0.45)";
                    e.currentTarget.style.borderColor = "rgba(44,184,168,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        i % 2 === 0
                          ? "rgba(44,184,168,0.1)"
                          : "rgba(184,149,106,0.12)",
                      border:
                        i % 2 === 0
                          ? "1px solid rgba(44,184,168,0.3)"
                          : "1px solid rgba(184,149,106,0.35)",
                      color: i % 2 === 0 ? "#2cb8a8" : "#b8956a",
                    }}
                  >
                    <Icon size={22} strokeWidth={1.4} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 14,
                        color: "var(--text-tertiary)",
                        letterSpacing: ".15em",
                      }}
                    >
                      0{i + 1}
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 24,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        margin: "6px 0 10px",
                        lineHeight: 1.25,
                      }}
                    >
                      {d.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14.5,
                        lineHeight: 1.75,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {d.copy}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing / Caribbean Connection ── */}
      <section
        style={{
          padding: "clamp(90px, 11vw, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div
          className="caribbean-grid"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "center",
          }}
        >
          <div className="reveal">
            <span
              style={{
                fontSize: 12,
                letterSpacing: ".3em",
                color: "#b8956a",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Caribbean Connection
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--text-primary)",
                margin: "18px 0 28px",
                letterSpacing: "-.005em",
              }}
            >
              Rooted in the islands.{" "}
              <em style={{ color: "#1a8a9e" }}>Always close at hand.</em>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                marginBottom: 18,
              }}
            >
              Gemscape is led by people who live the Caribbean every day — its
              quiet bays, its rhythms, its hospitality. That closeness is what
              lets us coordinate trips with warmth, accuracy, and genuine care.
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                marginBottom: 36,
              }}
            >
              Whether your visit is a single cruise stop or a slow island week,
              you'll always have a thoughtful point of contact — present, calm,
              and quietly handling the details.
            </p>
            <button
              onClick={() => navigateTo("/build-itinerary")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 32px",
                background:
                  "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 3,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 18px 40px -16px rgba(26,138,158,0.55)",
                transition: "transform .3s ease, box-shadow .3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Begin Your Itinerary
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="reveal" style={{ position: "relative" }}>
            <img
              src={PORTRAIT_IMG}
              alt="Caribbean island detail"
              loading="lazy"
              style={{
                width: "100%",
                height: "clamp(400px, 56vw, 620px)",
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        @media (max-width: 900px) {
          .philos-grid,
          .caribbean-grid { grid-template-columns: 1fr !important; }
          .diff-grid { grid-template-columns: 1fr !important; }
        }
        html:not(.dark) .diff-card {
          background: #ffffff !important;
          border-color: rgba(5,24,30,0.08) !important;
        }
      `}</style>
    </div>
  );
}
