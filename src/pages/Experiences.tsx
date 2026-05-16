import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";
import { EXPERIENCE_IMAGES } from "@/data/experienceDetails";

const NAVY = "#0d1b2a";
const NAVY_DEEP = "#0a1622";
const TEAL = "#2a9d8f";
const TEAL_BRIGHT = "#3dbcad";
const GOLD = "#e9c46a";
const CREAM = "#f6f1e7";

type Category =
  | "Romance"
  | "Solo"
  | "Groups"
  | "Wellness"
  | "Cruise"
  | "Adventure"
  | "Business";

type Experience = {
  name: string;
  slug: string;
  category: Category;
  duration: string;
  desc: string;
  gradient: string;
};

const EXPERIENCES: Experience[] = [
  {
    name: "Romantic Tropical Escape",
    slug: "romantic-tropical-escape",
    category: "Romance",
    duration: "2–3 Days",
    desc: "Sunset dinners, secluded beaches, and private island moments designed entirely for two.",
    gradient: "linear-gradient(135deg,#1a4a6b,#2a9d8f)",
  },
  {
    name: "Girls Island Getaway",
    slug: "girls-island-getaway",
    category: "Groups",
    duration: "3–4 Days",
    desc: "Freedom, laughter, and curated island moments shared with the people you love most.",
    gradient: "linear-gradient(135deg,#4a1a2a,#9e3d6e)",
  },
  {
    name: "Peaceful Solo Retreat",
    slug: "peaceful-solo-retreat",
    category: "Solo",
    duration: "Flexible",
    desc: "Solitude, stillness, and the Caribbean at your own pace — no rush, no noise, no agenda.",
    gradient: "linear-gradient(135deg,#1a3a4a,#2a6b8f)",
  },
  {
    name: "Cruise Stop VIP Experience",
    slug: "cruise-stop-vip",
    category: "Cruise",
    duration: "Half Day",
    desc: "Make the most of your port stop with a private, expertly coordinated island discovery.",
    gradient: "linear-gradient(135deg,#3d1f5e,#6b4fac)",
  },
  {
    name: "Luxury Weekend Escape",
    slug: "luxury-weekend-escape",
    category: "Adventure",
    duration: "2 Days",
    desc: "Two nights curated to perfection — the best of Antigua in one seamless experience.",
    gradient: "linear-gradient(135deg,#2a1a0d,#8f5a2a)",
  },
  {
    name: "Nature & Wellness Retreat",
    slug: "nature-wellness-retreat",
    category: "Wellness",
    duration: "4–5 Days",
    desc: "Rain forests, hidden coves, and curated wellness moments across Antigua's terrain.",
    gradient: "linear-gradient(135deg,#1e4d40,#4a7c59)",
  },
  {
    name: "Multi-Island Caribbean Journey",
    slug: "multi-island-journey",
    category: "Adventure",
    duration: "5–7 Days",
    desc: "Discover multiple islands — each with its own personality, culture, and hidden gems.",
    gradient: "linear-gradient(135deg,#0d2a4a,#1e6a8f)",
  },
  {
    name: "Business & Leisure Escape",
    slug: "business-leisure-escape",
    category: "Business",
    duration: "Flexible",
    desc: "Professional commitments handled, Caribbean experiences waiting — Gemscape bridges both.",
    gradient: "linear-gradient(135deg,#1a1a2a,#3a3a6a)",
  },
];

const FILTERS: Array<"All" | Category> = [
  "All",
  "Romance",
  "Solo",
  "Groups",
  "Wellness",
  "Cruise",
  "Adventure",
  "Business",
];

const Experiences = () => {
  const { navigateTo } = useWaveNav();
  const [filter, setFilter] = useState<"All" | Category>("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? EXPERIENCES
        : EXPERIENCES.filter((e) => e.category === filter),
    [filter]
  );

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Helmet>
        <title>Experiences | Gemscape — Curated Caribbean Itineraries</title>
        <meta
          name="description"
          content="Eight signature Caribbean experiences — romance, wellness, solo retreats, cruise VIP and more. Each fully customizable around you."
        />
        <link rel="canonical" href="https://gemscapetours.com/experiences" />
      </Helmet>

      <Navbar />

      {/* ─── PAGE HERO ─── */}
      <section
        style={{
          background: NAVY,
          minHeight: 260,
          padding: "120px 40px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 44,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.005em",
              margin: 0,
            }}
            className="exp-hero-h1"
          >
            Find Your{" "}
            <em style={{ color: GOLD, fontStyle: "italic", fontWeight: 300 }}>
              Perfect
            </em>{" "}
            Caribbean Experience
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              marginTop: 16,
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Every experience is fully customizable. These are simply beautiful
            starting points.
          </p>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <div
        style={{
          position: "sticky",
          top: "var(--header-height, 72px)",
          zIndex: 20,
          background: "#ffffff",
          borderBottom: "1px solid rgba(13,27,42,0.08)",
          padding: "12px 40px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        className="exp-filter-bar"
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "nowrap",
            minWidth: "max-content",
            margin: "0 auto",
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: "0.02em",
                  padding: "8px 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: active
                    ? `1px solid ${TEAL}`
                    : "1px solid rgba(13,27,42,0.14)",
                  background: active ? TEAL : "#ffffff",
                  color: active ? "#ffffff" : NAVY,
                  transition: "all .2s ease",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CARD GRID ─── */}
      <section
        style={{
          background: CREAM,
          padding: "56px 40px",
        }}
        className="exp-grid-section"
      >
        <div
          style={{ maxWidth: 1280, margin: "0 auto" }}
          className="exp-grid"
          key={filter}
        >
          {filtered.map((exp) => (
            <article
              key={exp.slug}
              className="exp-card"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(13,27,42,0.08)",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform .2s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(13,27,42,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  height: 160,
                  background: `${exp.gradient}`,
                  backgroundImage: EXPERIENCE_IMAGES[exp.slug]
                    ? `linear-gradient(to top, rgba(13,27,42,0.45) 0%, rgba(13,27,42,0) 55%), url(${EXPERIENCE_IMAGES[exp.slug]})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    zIndex: 2,
                    background: GOLD,
                    color: NAVY,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "4px 9px",
                    borderRadius: 4,
                  }}
                >
                  {exp.duration}
                </span>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "18px 18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    fontSize: 17,
                    color: NAVY,
                    margin: "0 0 8px",
                    lineHeight: 1.25,
                  }}
                >
                  {exp.name}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    color: "rgba(13,27,42,0.6)",
                    lineHeight: 1.55,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {exp.desc}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: "auto",
                    paddingTop: 18,
                  }}
                >
                  <button
                    onClick={() => navigateTo(`/experiences/${exp.slug}`)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: NAVY,
                      background: "#ffffff",
                      border: "1px solid rgba(13,27,42,0.14)",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                      transition: "all .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = NAVY;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(13,27,42,0.14)";
                    }}
                  >
                    View Full Itinerary
                  </button>
                  <button
                    onClick={() =>
                      navigateTo(
                        `/start-planning?experience=${encodeURIComponent(
                          exp.name
                        )}`
                      )
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: TEAL,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Customize →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section
        style={{
          background: NAVY_DEEP,
          padding: "56px 40px",
          textAlign: "center",
        }}
        className="exp-bottom-cta"
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: 32,
              color: GOLD,
              margin: "0 0 14px",
              lineHeight: 1.2,
            }}
            className="exp-bottom-h2"
          >
            Not seeing exactly what you’re dreaming of?
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 15,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              margin: "0 auto 28px",
              maxWidth: 480,
            }}
          >
            Tell us your vision — we’ll build a completely bespoke itinerary
            around you.
          </p>
          <button
            onClick={() => navigateTo("/build-itinerary")}
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_BRIGHT} 100%)`,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "16px 32px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 0 28px rgba(44,184,168,0.55), 0 8px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Build My Custom Itinerary →
          </button>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .exp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          animation: expFade .35s ease;
        }
        @keyframes expFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .exp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .exp-grid { grid-template-columns: 1fr; gap: 16px; }
          .exp-hero-h1 { font-size: 32px !important; }
          .exp-grid-section { padding: 40px 20px !important; }
          .exp-filter-bar { padding: 10px 16px !important; }
          .exp-bottom-cta { padding: 48px 20px !important; }
          .exp-bottom-h2 { font-size: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Experiences;
