import { useRef, useEffect } from "react";
import { MapPin, Sparkles, ArrowRight, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    icon: MapPin,
    title: "Locally Owned",
    desc: "Born and raised in Antigua. We know every cove, every back road, every person worth knowing on this island.",
    stat: "100%",
    statLabel: "Antiguan",
  },
  {
    icon: Sparkles,
    title: "Fully Bespoke",
    desc: "No packages. No itineraries to follow. Every journey is built from scratch around exactly what you want.",
    stat: "0",
    statLabel: "Fixed packages",
  },
  {
    icon: ArrowRight,
    title: "End-to-End",
    desc: "We coordinate everything. From your flight arriving to your last sunset drink — no handoffs, no gaps.",
    stat: "24/7",
    statLabel: "Support",
  },
  {
    icon: Star,
    title: "Premium Partners",
    desc: "First access to Antigua's finest vessels, vendors, villas, and venues. The relationships took years to build.",
    stat: "5★",
    statLabel: "Rated",
  },
];

export default function WhyGemscape() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wg-left",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        }
      );
      gsap.fromTo(
        ".wg-pillar",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          padding: "100px 24px",
          overflow: "hidden",
          background: "var(--bg-primary)",
        }}
      >
        {/* Background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 20% 50%, rgba(26,138,158,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="wg-inner"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left — editorial copy */}
          <div className="wg-left">
            <span
              style={{
                fontSize: 14,
                letterSpacing: ".25em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 16,
              }}
            >
              Why Gemscape
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 400,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                margin: "0 0 20px",
              }}
            >
              Antigua &amp; Barbuda is Our Home.
              <br />
              <span style={{ fontStyle: "italic", color: "var(--text-tertiary)" }}>
                Your Experience
              </span>
              <br />
              is Our Craft.
            </h2>
            <div
              style={{
                width: 40,
                height: 2,
                background: "linear-gradient(90deg, #C9A84C, #2cb8a8)",
                marginBottom: 20,
              }}
            />
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "var(--text-secondary)",
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: 460,
                marginBottom: 32,
              }}
            >
              We're not a booking engine. We're a small, proudly Antiguan team
              who knows every bay, every pilot, every road by name. When you
              travel with Gemscape, you're not getting a package — you're
              getting an insider.
            </p>

            {/* Signature metric */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 48,
                  fontWeight: 400,
                  color: "#C9A84C",
                  lineHeight: 1,
                }}
              >
                1,000+
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Guests who've explored
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: "var(--text-tertiary)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Antigua &amp; Barbuda with us
                </span>
              </div>
            </div>
          </div>

          {/* Right — pillar grid */}
          <div
            className="wg-pillars"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="wg-pillar"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                    padding: "28px 24px",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(44,184,168,0.2)";
                    e.currentTarget.style.background = "rgba(44,184,168,0.04)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.background = "var(--card-bg)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(44,184,168,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color="#2cb8a8" strokeWidth={1.5} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 1,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 22,
                          fontWeight: 400,
                          color: "#C9A84C",
                          lineHeight: 1,
                        }}
                      >
                        {p.stat}
                      </span>
                      <span
                        style={{
                          fontSize: 8,
                          letterSpacing: ".12em",
                          color: "var(--text-tertiary)",
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: "uppercase",
                        }}
                      >
                        {p.statLabel}
                      </span>
                    </div>
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: 8,
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .wg-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
          .wg-pillars { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .wg-pillars { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
