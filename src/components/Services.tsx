import { useState, useRef, useEffect } from "react";
import { useWave } from "@/components/WavePageTransition";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    id: "01",
    category: "WATER & SEA",
    title: "Island Circumnavigation",
    headline: "Every cove. Every hidden bay.",
    description:
      "A full-day private journey around Antigua's entire coastline — past secret beaches, historic forts, and fishing villages that no cruise ship ever reaches. Your guide, your pace, your island.",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=90",
    route: "/book",
    accent: "#2cb8a8",
  },
  {
    id: "02",
    category: "LAND & CULTURE",
    title: "Heritage & Discovery",
    headline: "Roads no tourist map shows.",
    description:
      "English Harbour. Shirley Heights. Local rum distilleries and colonial ruins. We take you through Antigua's living history with a guide who was born and raised in these stories.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90",
    route: "/book",
    accent: "#b8956a",
  },
  {
    id: "03",
    category: "ARRIVAL & DEPARTURE",
    title: "Flight Concierge",
    headline: "From touchdown to your first sunset.",
    description:
      "VIP airport arrivals, private charter coordination, hotel transfers. We eliminate every point of friction between your plane seat and your first Antiguan sunset drink.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=90",
    route: "/concierge",
    accent: "#1a8a9e",
  },
  {
    id: "04",
    category: "PRIVATE RENTALS",
    title: "Your Island, Your Wheels",
    headline: "Freedom with no itinerary.",
    description:
      "Premium SUVs, open-top Jeeps, sailing catamarans. Delivered to your hotel, airport, or marina. Full insurance, 24/7 support, and the freedom to find your own Antigua.",
    image:
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1600&q=90",
    route: "/rentals",
    accent: "#C9A84C",
  },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".svc-left",
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        }
      );
      gsap.fromTo(
        ".svc-right",
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const current = SERVICES[active];

  return (
    <>
      <section
        id="services"
        ref={sectionRef}
        className="svc-section"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        {/* ── Left: Image panel ── */}
        <div className="svc-left" style={{ position: "relative", overflow: "hidden" }}>
          <div
            ref={imageRef}
            className="svc-image-wrap"
            style={{
              position: "sticky",
              top: 0,
              width: "100%",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${s.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "scale(1)" : "scale(1.08)",
                  transition: "opacity 0.8s ease, transform 1.2s ease",
                }}
              />
            ))}

            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(5,24,30,0.1) 0%, rgba(5,24,30,0.3) 60%, rgba(5,24,30,0.7) 100%)",
                zIndex: 1,
              }}
            />

            {/* Active category badge */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: ".2em",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background: "rgba(5,24,30,0.5)",
                  backdropFilter: "blur(12px)",
                  padding: "8px 16px",
                  borderRadius: 2,
                  border: `1px solid ${current.accent}33`,
                }}
              >
                {current.category}
              </span>
            </div>

            {/* Counter */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                right: 40,
                zIndex: 2,
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {String(active + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  width: 24,
                  height: 1,
                  background: "rgba(255,255,255,0.3)",
                  display: "inline-block",
                  margin: "0 6px",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 400,
                }}
              >
                {String(SERVICES.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Content panel ── */}
        <div
          className="svc-right"
          style={{
            background: "var(--bg-primary)",
            padding: "80px 64px 80px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Section eyebrow */}
          <div
            className="eyebrow"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 32,
                height: 1,
                background: "#2cb8a8",
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: ".25em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Our Services
            </span>
          </div>

          {/* Service selector list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SERVICES.map((s, i) => {
              const isActive = i === active;
              const isHov = i === hovered;
              return (
                <div
                  key={s.id}
                  className={`svc-item ${isActive ? "svc-item--active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-color)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    ...(i === 0
                      ? { borderTop: "1px solid var(--border-color)" }
                      : {}),
                  }}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'Cormorant Garamond', serif",
                      color: isActive ? s.accent : "var(--text-tertiary)",
                      fontWeight: 400,
                      minWidth: 28,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {s.id}
                  </span>

                  <div style={{ flex: 1 }}>
                    <div
                      className="svc-item-title"
                      style={{
                        fontSize: 16,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        color:
                          isActive || isHov
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                        transition: "color 0.3s ease",
                        letterSpacing: ".02em",
                      }}
                    >
                      {s.title}
                    </div>
                    <span
                      className="svc-item-tag"
                      style={{
                        fontSize: 9,
                        letterSpacing: ".15em",
                        color: "var(--text-tertiary)",
                        fontFamily: "'DM Sans', sans-serif",
                        textTransform: "uppercase",
                        marginTop: 2,
                        display: "block",
                      }}
                    >
                      {s.category}
                    </span>
                  </div>

                  <div
                    style={{
                      opacity: isActive || isHov ? 1 : 0,
                      transform:
                        isActive || isHov
                          ? "translateX(0)"
                          : "translateX(-6px)",
                      transition: "all 0.3s ease",
                      color: s.accent,
                    }}
                  >
                    <ArrowRight size={16} />
                  </div>

                  {/* Active indicator line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      height: 2,
                      background: s.accent,
                      width: isActive ? "100%" : "0%",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Active service description */}
          <div
            className="svc-desc-panel"
            style={{
              marginTop: 36,
              minHeight: 220,
              position: "relative",
            }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                style={{
                  position: i === active ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: i === active ? 1 : 0,
                  transform:
                    i === active ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <h3
                  className="svc-desc-headline"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--text-tertiary)",
                    marginBottom: 14,
                    lineHeight: 1.4,
                  }}
                >
                  {s.headline}
                </h3>
                <p
                  className="svc-desc-body"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    maxWidth: 440,
                    marginBottom: 28,
                  }}
                >
                  {s.description}
                </p>
                <button
                  onClick={() => navigateTo(s.route)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 11,
                    letterSpacing: ".12em",
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: "uppercase",
                    color: s.accent,
                    background: "transparent",
                    border: `1px solid ${s.accent}55`,
                    padding: "12px 28px",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${s.accent}12`;
                    e.currentTarget.style.borderColor = s.accent;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 0 20px ${s.accent}33`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = `${s.accent}55`;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Discover This Experience
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .svc-right { padding: 60px 40px 60px 44px !important; }
        }
        @media (max-width: 768px) {
          .svc-section {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .svc-image-wrap {
            position: relative !important;
            height: 55vw !important;
            min-height: 260px !important;
          }
          .svc-right {
            padding: 48px 24px !important;
          }
          .svc-desc-panel { min-height: 200px !important; }
        }

        /* ── LIGHT MODE ── */
        html:not(.dark) .svc-right {
          background: #f4f1ee !important;
        }
        html:not(.dark) .svc-item { border-color: rgba(5,24,30,0.1) !important; }
        html:not(.dark) .svc-item:first-child { border-color: rgba(5,24,30,0.1) !important; }
        html:not(.dark) .svc-item-title { color: rgba(5,24,30,0.85) !important; }
        html:not(.dark) .svc-item--active .svc-item-title,
        html:not(.dark) .svc-item:hover .svc-item-title { color: #05181e !important; }
        html:not(.dark) .svc-item-tag { color: rgba(5,24,30,0.5) !important; }
        html:not(.dark) .svc-desc-headline { color: rgba(5,24,30,0.75) !important; }
        html:not(.dark) .svc-desc-body { color: rgba(5,24,30,0.7) !important; }
        html:not(.dark) .eyebrow span { color: #1a8a9e !important; }
      `}</style>
    </>
  );
}
