import { useRef, useEffect } from "react";
import { useWave } from "@/components/WavePageTransition";
import {
  Compass,
  Plane,
  Car,
  Map,
  Ship,
  Users,
  Leaf,
  Briefcase,
  Sun,
  ArrowUpRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    id: "01",
    icon: Compass,
    title: "Personalized Itinerary Planning",
    description:
      "Custom Caribbean itineraries shaped around your travel style, pace, purpose, and desired feeling.",
    route: "/build-itinerary?service=itinerary",
    accent: "#2cb8a8",
    featured: true,
    tag: "Signature Service",
  },
  {
    id: "02",
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Reliable arrival and departure coordination so your trip begins and ends smoothly.",
    route: "/build-itinerary?service=airport",
    accent: "#1a8a9e",
  },
  {
    id: "03",
    icon: Car,
    title: "Transportation Coordination",
    description:
      "Island movement made easier through trusted vehicle, driver, and travel support options.",
    route: "/build-itinerary?service=transport",
    accent: "#1a8a9e",
  },
  {
    id: "04",
    icon: Map,
    title: "Island Excursions",
    description:
      "Curated experiences that help you discover beaches, culture, food, nature, and hidden gems.",
    route: "/build-itinerary?service=excursions",
    accent: "#b8956a",
  },
  {
    id: "05",
    icon: Ship,
    title: "Cruise Passenger Experiences",
    description:
      "Thoughtfully planned island experiences designed around limited cruise stop timelines.",
    route: "/build-itinerary?service=cruise",
    accent: "#2cb8a8",
  },
  {
    id: "06",
    icon: Sun,
    title: "Caribbean Getaways",
    description:
      "Restorative multi-day escapes thoughtfully arranged across stays, dining, and island moments.",
    route: "/build-itinerary?service=getaways",
    accent: "#C9A84C",
  },
  {
    id: "07",
    icon: Briefcase,
    title: "Business & Leisure Travel",
    description:
      "Support for travelers balancing work, meetings, transportation, and island exploration.",
    route: "/build-itinerary?service=business",
    accent: "#1a8a9e",
  },
  {
    id: "08",
    icon: Users,
    title: "Curated Group Experiences",
    description:
      "Coordinated travel support for families, friends, celebrations, retreats, and small groups.",
    route: "/build-itinerary?service=group",
    accent: "#b8956a",
  },
  {
    id: "09",
    icon: Leaf,
    title: "Peaceful Wellness Escapes",
    description:
      "Quiet, nature-centered escapes built around rest, restoration, beauty, and personal connection.",
    route: "/build-itinerary?service=wellness",
    accent: "#2cb8a8",
  },
  {
    id: "10",
    icon: Car,
    title: "Vehicle Rental / Rental Coordination",
    description:
      "Trusted rental coordination — booked, delivered, and supported as part of your itinerary.",
    route: "/build-itinerary?service=rental",
    accent: "#b8956a",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    const init = () => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".svc-head > *",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
          }
        );
        gsap.fromTo(
          ".svc-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: ".svc-grid", start: "top 80%" },
          }
        );
      }, sectionRef);
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
    <section
      id="services"
      ref={sectionRef}
      className="svc-section"
      style={{
        background: "var(--bg-primary)",
        padding: "clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        className="svc-head"
        style={{
          maxWidth: 880,
          margin: "0 auto clamp(60px, 7vw, 96px)",
          textAlign: "center",
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
              display: "inline-block",
            }}
          />
          <span
            className="svc-eyebrow"
            style={{
              fontSize: 13,
              letterSpacing: ".28em",
              color: "#2cb8a8",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Signature Services
          </span>
          <span
            style={{
              width: 32,
              height: 1,
              background: "#2cb8a8",
              display: "inline-block",
            }}
          />
        </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: "var(--text-primary)",
            marginBottom: 24,
            letterSpacing: "-.01em",
          }}
        >
          Signature Services Designed for{" "}
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
            Effortless Caribbean Travel
          </span>
        </h2>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(15px, 1.4vw, 17px)",
            lineHeight: 1.75,
            color: "var(--text-secondary)",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          Gemscape brings together thoughtful planning, reliable coordination,
          and local Caribbean insight to help you move, explore, celebrate, and
          reconnect with ease.
        </p>
      </div>

      {/* Card grid */}
      <div
        className="svc-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.id}
              className={`svc-card ${s.featured ? "svc-card--featured" : ""}`}
              onClick={() => navigateTo(s.route)}
              style={{
                gridColumn: s.featured ? "span 2" : "span 1",
                position: "relative",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
                padding: "36px 32px",
                cursor: "pointer",
                transition:
                  "transform 0.5s cubic-bezier(.22,1,.36,1), box-shadow 0.5s ease, border-color 0.4s ease, background 0.4s ease",
                display: "flex",
                flexDirection: "column",
                minHeight: s.featured ? 280 : 240,
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 24px 60px -24px ${s.accent}55`;
                e.currentTarget.style.borderColor = `${s.accent}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "";
              }}
            >
              {/* Top accent line */}
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)`,
                  opacity: s.featured ? 0.9 : 0.45,
                }}
              />

              {/* Featured tag */}
              {s.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    fontSize: 10,
                    letterSpacing: ".25em",
                    color: s.accent,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    border: `1px solid ${s.accent}55`,
                    padding: "5px 10px",
                    borderRadius: 999,
                  }}
                >
                  {s.tag}
                </span>
              )}

              {/* Header row: id + icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    color: "var(--text-tertiary)",
                    letterSpacing: ".1em",
                  }}
                >
                  — {s.id}
                </span>
                <div
                  className="svc-icon-wrap"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${s.accent}14`,
                    border: `1px solid ${s.accent}33`,
                    color: s.accent,
                  }}
                >
                  <Icon size={20} strokeWidth={1.4} />
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: s.featured ? 30 : 22,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  lineHeight: 1.25,
                  marginBottom: 14,
                  letterSpacing: "-.005em",
                }}
              >
                {s.title}
              </h3>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                {s.description}
              </p>

              {/* Footer link */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  letterSpacing: ".2em",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: s.accent,
                  marginTop: "auto",
                }}
              >
                Add to My Itinerary
                <ArrowUpRight size={14} strokeWidth={1.6} />
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .svc-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .svc-card { grid-column: span 1 !important; }
          .svc-card--featured { grid-column: span 2 !important; }
        }
        @media (max-width: 640px) {
          .svc-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .svc-card,
          .svc-card--featured { grid-column: span 1 !important; min-height: auto !important; padding: 28px 24px !important; }
        }

        /* Light mode */
        html:not(.dark) .svc-card {
          background: #ffffff !important;
          border-color: rgba(5,24,30,0.08) !important;
          box-shadow: 0 1px 2px rgba(5,24,30,0.04);
        }
      `}</style>
    </section>
  );
}
