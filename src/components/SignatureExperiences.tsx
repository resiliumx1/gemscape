import { useRef, useEffect } from "react";
import { useWaveNav } from "@/components/WavePageTransition";
import { ArrowRight, Heart, Users, Leaf, Anchor, Sparkles, Briefcase, Map, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCES = [
  {
    icon: Heart,
    title: "Romantic Tropical Escape",
    desc: "Slow mornings, ocean views, private moments, and thoughtfully planned island experiences designed for two.",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=70&fm=webp&fit=crop",
    accent: "#d98a8a",
    tag: "For Two",
  },
  {
    icon: Users,
    title: "Girls Island Getaway",
    desc: "Celebrate friendship with beautiful stays, beach days, dining, excursions, and effortless coordination.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70&fm=webp&fit=crop",
    accent: "#C9A84C",
    tag: "Group",
  },
  {
    icon: Leaf,
    title: "Peaceful Solo Retreat",
    desc: "Reconnect with yourself through nature, stillness, wellness, and curated moments of calm.",
    image: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=900&q=70&fm=webp&fit=crop",
    accent: "#7fb89e",
    tag: "Solo",
  },
  {
    icon: Anchor,
    title: "Cruise Stop VIP Experience",
    desc: "Make the most of your island stop with a seamless, personalized day designed around your arrival time.",
    image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=900&q=70&fm=webp&fit=crop",
    accent: "#1a8a9e",
    tag: "Day Trip",
  },
  {
    icon: Sparkles,
    title: "Nature & Wellness Experience",
    desc: "Explore hidden gems, healing landscapes, quiet beaches, local culture, and restorative Caribbean beauty.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=70&fm=webp&fit=crop",
    accent: "#2cb8a8",
    tag: "Wellness",
  },
  {
    icon: Map,
    title: "Multi-Island Caribbean Journey",
    desc: "A thoughtfully sequenced journey across more than one island — coordinated stays, transfers, and quiet discoveries.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70&fm=webp&fit=crop",
    accent: "#1a8a9e",
    tag: "Multi-Island",
  },
  {
    icon: Briefcase,
    title: "Business & Leisure Escape",
    desc: "Blend productivity and peaceful exploration with transportation, planning, and island support handled for you.",
    image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=900&q=70&fm=webp&fit=crop",
    accent: "#b8956a",
    tag: "Bleisure",
  },
  {
    icon: Star,
    title: "Custom Caribbean Experience",
    desc: "Have something specific in mind? Share your vision and we'll design a personalized journey from the ground up.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=70&fm=webp&fit=crop",
    accent: "#C9A84C",
    tag: "Bespoke",
  },
];

export default function SignatureExperiences() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWaveNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".sigx-head > *",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.querySelectorAll(".sigx-card"),
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="signature-experiences"
        style={{
          background: "var(--bg-primary)",
          padding: "120px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft ambient backdrop */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 80% 10%, rgba(201,168,76,0.06) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(44,184,168,0.05) 0%, transparent 55%)",
          }}
        />

        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div className="sigx-head" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 64px" }}>
            <span
              style={{
                fontSize: 14,
                letterSpacing: ".25em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 18,
              }}
            >
              Signature Caribbean Experiences
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 400,
                color: "var(--text-primary)",
                lineHeight: 1.15,
                margin: "0 0 22px",
              }}
            >
              Designed Around Your{" "}
              <span style={{ fontStyle: "italic", color: "#C9A84C" }}>Pace, Preferences &amp; Purpose.</span>
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
              }}
            >
              Whether you're escaping for romance, wellness, celebration, business, or discovery,
              Gemscape curates meaningful Caribbean experiences around your pace, preferences, and purpose.
            </p>
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            className="sigx-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {EXPERIENCES.map((exp) => {
              const Icon = exp.icon;
              return (
                <article
                  key={exp.title}
                  className="sigx-card"
                  onClick={() => navigateTo(`/build-itinerary?experience=${encodeURIComponent(exp.title)}`)}
                  style={{
                    position: "relative",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease, border-color 0.5s ease",
                  }}
                >
                  {/* Image */}
                  <div className="sigx-img-wrap" style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
                    <img
                      src={exp.image}
                      alt={exp.title}
                      loading="lazy"
                      width={900}
                      height={675}
                      className="sigx-img"
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                        transition: "transform 1s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    />
                    {/* gradient veil */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(180deg, rgba(5,24,30,0) 40%, rgba(5,24,30,0.55) 100%)",
                      }}
                    />
                    {/* tag */}
                    <span
                      style={{
                        position: "absolute", top: 16, left: 16,
                        fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                        color: "#fff",
                        background: "rgba(5,24,30,0.55)",
                        backdropFilter: "blur(10px)",
                        padding: "6px 12px", borderRadius: 999,
                        border: `1px solid ${exp.accent}55`,
                      }}
                    >
                      {exp.tag}
                    </span>
                    {/* icon badge */}
                    <span
                      style={{
                        position: "absolute", bottom: 16, right: 16,
                        width: 40, height: 40, borderRadius: "50%",
                        background: "rgba(5,24,30,0.6)", backdropFilter: "blur(10px)",
                        border: `1px solid ${exp.accent}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: exp.accent,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "26px 26px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 24,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        lineHeight: 1.25,
                        margin: "0 0 10px",
                      }}
                    >
                      {exp.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: "var(--text-secondary)",
                        margin: "0 0 22px",
                        flex: 1,
                      }}
                    >
                      {exp.desc}
                    </p>
                    <span
                      className="sigx-cta"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14, fontWeight: 600,
                        letterSpacing: ".12em", textTransform: "uppercase",
                        color: exp.accent,
                        transition: "gap 0.3s ease",
                      }}
                    >
                      Customize This Experience
                      <ArrowRight size={14} className="sigx-arrow" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .sigx-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          border-color: rgba(201,168,76,0.35) !important;
        }
        .sigx-card:hover .sigx-img { transform: scale(1.06); }
        .sigx-card:hover .sigx-cta { gap: 14px; }

        @media (max-width: 1024px) {
          .sigx-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 22px !important; }
        }
        @media (max-width: 640px) {
          .sigx-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </>
  );
}
