import { useEffect, useRef, useState } from "react";
import { useWave } from "@/components/WavePageTransition";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import bettysHopeImg from "@/assets/bettys-hope-windmill.webp";
import airportVipImg from "@/assets/airport-vip-greeting.webp";
import catamaranImg from "@/assets/catamaran-white-beach.webp";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    images: [
      { src: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=85", alt: "English Harbour aerial — yachts anchored in turquoise bay" },
      { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85", alt: "Dickenson Bay — pristine white sand beach" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85", alt: "Devil's Bridge — turquoise surf crashing through limestone" },
      { src: "https://images.unsplash.com/photo-1559827291-bac2e36b8cf2?w=800&q=85", alt: "Pink sand beach with crystalline turquoise waters" },
    ],
    category: "Water & Sea",
    title: "Island Circumnavigation",
    desc: "Full-island private tour — every cove, every beach, every hidden bay.",
    route: "/book",
    accent: "#2cb8a8",
    detail: {
      headline: "365 Beaches. One Unforgettable Day.",
      body: "Most visitors see five beaches in a week. You'll see the entire coastline in a single day — from the sheltered turquoise coves of the north shore to the raw Atlantic cliffs of Devil's Bridge, past colonial ruins only reachable by sea, and through fishing villages where the only footprints in the sand are yours. Your captain knows every hidden anchorage, every reef worth snorkelling, every cliff where the sunset hits different. This isn't a tour. It's the day you finally understand why they call it the land of 365 beaches.",
      highlights: ["Full day — 8 hours", "Private vessel & captain", "Up to 12 guests", "Snorkelling stops included", "Lunch & drinks on board"],
      price: "From $280 per group",
    },
  },
  {
    images: [
      { src: bettysHopeImg, alt: "Betty's Hope — restored 17th century sugar mill windmill" },
      { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85", alt: "St. John's Cathedral — baroque stone towers against blue sky" },
      { src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=85", alt: "ATV buggy adventure through island trails" },
    ],
    category: "Land & Culture",
    title: "Heritage & Discovery",
    desc: "History, local rum, and roads no tourist map would ever show you.",
    route: "/book",
    accent: "#b8956a",
    detail: {
      headline: "The Real Antigua. Not the Brochure Version.",
      body: "Forget the resort bubble. This is the Antigua that locals are proud of — the 17th century sugar plantations at Betty's Hope where the windmill still stands against the trade winds, the baroque magnificence of St. John's Cathedral towering over the capital, the back roads through Fig Tree Drive where the rainforest swallows the sky. Your guide was born here, raised here, and knows every rum shop, every shortcut, and every story that the history books forgot. End the day at Shirley Heights with the best sunset view in the Caribbean and a steel pan soundtrack.",
      highlights: ["Half day — 4 hours", "Local-born guide", "Up to 8 guests", "Historic sites & hidden trails", "Rum tasting included"],
      price: "From $180 per group",
    },
  },
  {
    images: [
      { src: airportVipImg, alt: "VIP airport greeting — professional staff welcoming guest" },
      { src: catamaranImg, alt: "Catamaran anchored at pristine white sand beach" },
      { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=85", alt: "Driving along turquoise Caribbean coastal road" },
    ],
    category: "Arrival & Departure",
    title: "Flight Concierge",
    desc: "From wheels down to your first sunset drink. We handle everything.",
    route: "/concierge",
    accent: "#1a8a9e",
    detail: {
      headline: "Your Holiday Starts at the Gate. Not the Hotel.",
      body: "The moment your wheels touch the tarmac at V.C. Bird International, we're already there. A dedicated Gemscape host meets you at the aircraft door — no immigration queues, no baggage chaos, no haggling with taxi drivers. Your chilled towels are waiting. Your vehicle is parked steps away. Your hotel knows you're coming and your first dinner reservation is confirmed. We coordinate private charter transfers, yacht arrivals, and multi-island itineraries across Antigua and Barbuda. Whether you're arriving by commercial flight or private jet, the transition from travel to paradise is seamless, silent, and entirely handled.",
      highlights: ["Meet & greet at aircraft", "Fast-track immigration", "Private vehicle transfer", "Hotel & dinner coordination", "Return departure handled"],
      price: "From $150 per arrival",
    },
  },
];

const Experiences = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { navigateTo } = useWave();

  const [activeImages, setActiveImages] = useState<number[]>(CARDS.map(() => 0));
  const [activeDetail, setActiveDetail] = useState<number | null>(null);

  // Auto-advance image carousel — stagger each card
  useEffect(() => {
    const intervals = CARDS.map((card, cardIndex) => {
      if (card.images.length <= 1) return null;
      const delay = 3500 + cardIndex * 800;
      return setInterval(() => {
        setActiveImages(prev => {
          const next = [...prev];
          next[cardIndex] = (next[cardIndex] + 1) % card.images.length;
          return next;
        });
      }, delay);
    });
    return () => intervals.forEach(id => id && clearInterval(id));
  }, []);

  // Lock scroll when detail popup is open
  useEffect(() => {
    if (activeDetail !== null) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActiveDetail(null);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [activeDetail]);

  // GSAP scroll reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.1,
            ease: "power4.out",
            delay: i * 0.18,
            scrollTrigger: { trigger: el, start: "top 82%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experiences" className="experiences">
      <div className="experiences__header">
        <span className="eyebrow">Curated Experiences</span>
        <h2 className="experiences__h2">
          <span className="hero-country-shimmer">Antigua &amp; Barbuda</span> Seen Differently<span className="experiences__dot">.</span>
        </h2>
        <p className="experiences__intro">
          Every journey we design is a private, unhurried encounter with the most beautiful islands in the Caribbean.
        </p>
      </div>

      <div className="experiences__grid">
        {CARDS.map((card, i) => (
          <div key={card.title} className="exp-card">
            <div
              ref={(el) => { wrapperRefs.current[i] = el; }}
              className="exp-card__img-wrap"
            >
              {card.images.map((img, imgIdx) => (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  className="exp-card__img"
                  loading="lazy"
                  width={800}
                  height={1200}
                  style={{
                    opacity: imgIdx === activeImages[i] ? 1 : 0,
                    zIndex: imgIdx === activeImages[i] ? 2 : 1,
                  }}
                />
              ))}

              {/* Image counter dots */}
              {card.images.length > 1 && (
                <div style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                  zIndex: 5,
                }}>
                  {card.images.map((_, dotIdx) => (
                    <div
                      key={dotIdx}
                      style={{
                        width: dotIdx === activeImages[i] ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background: dotIdx === activeImages[i] ? "#fff" : "rgba(255,255,255,0.4)",
                        transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                        boxShadow: dotIdx === activeImages[i] ? "0 0 8px rgba(255,255,255,0.4)" : "none",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="exp-card__body">
              <span className="exp-card__cat">{card.category}</span>
              <h3 className="exp-card__title">{card.title}</h3>
              <p className="exp-card__desc">{card.desc}</p>
              <button
                className="exp-card__cta"
                onClick={() => setActiveDetail(i)}
              >
                <span className="exp-card__cta-text">Discover This Experience</span>
                <span className="exp-card__cta-arrow">→</span>
                <span className="exp-card__cta-shine" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Experience Detail Popup ─── */}
      {activeDetail !== null && (() => {
        const card = CARDS[activeDetail];
        const detail = card.detail;
        return (
          <div
            className="exp-detail-overlay"
            onClick={() => setActiveDetail(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(5, 24, 30, 0.94)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              overflowY: "auto",
              animation: "expDetailFadeIn 0.35s ease forwards",
            }}
          >
            <div
              className="exp-detail-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "60px 40px 80px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                minHeight: "100vh",
                alignItems: "center",
                animation: "expDetailSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
            >
              {/* Left — Image gallery */}
              <div style={{ position: "relative" }}>
                <div style={{
                  aspectRatio: "4 / 3",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                }}>
                  <img
                    src={card.images[activeImages[activeDetail]].src}
                    alt={card.images[activeImages[activeDetail]].alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "opacity 0.8s ease",
                    }}
                  />
                </div>

                {/* Thumbnail strip */}
                <div style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  justifyContent: "center",
                }}>
                  {card.images.map((img, idx) => (
                    <button
                      key={img.src}
                      onClick={() => {
                        setActiveImages(prev => {
                          const next = [...prev];
                          next[activeDetail] = idx;
                          return next;
                        });
                      }}
                      style={{
                        width: 64,
                        height: 48,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: idx === activeImages[activeDetail]
                          ? `2px solid ${card.accent}`
                          : "2px solid rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        opacity: idx === activeImages[activeDetail] ? 1 : 0.5,
                        transition: "all 0.3s ease",
                        padding: 0,
                        background: "none",
                      }}
                    >
                      <img
                        src={img.src}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right — Copy */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Close button */}
                <button
                  onClick={() => setActiveDetail(null)}
                  aria-label="Close"
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 20,
                    transition: "all 0.3s ease",
                    zIndex: 10001,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.borderColor = card.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                >
                  ✕
                </button>

                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: card.accent,
                }}>
                  {card.category}
                </span>

                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: "clamp(28px, 4vw, 42px)",
                  color: "#fff",
                  lineHeight: 1.1,
                  marginTop: 12,
                }}>
                  {detail.headline}
                </h2>

                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 15,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 20,
                }}>
                  {detail.body}
                </p>

                {/* Highlights */}
                <div style={{
                  display: "flex",
                  flexWrap: "wrap" as const,
                  gap: "8px 16px",
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {detail.highlights.map((h: string) => (
                    <span key={h} style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      background: "rgba(255,255,255,0.05)",
                      padding: "6px 14px",
                      borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.08)",
                      letterSpacing: "0.05em",
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div style={{ marginTop: 24 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: 26,
                    color: "#C9A84C",
                  }}>
                    {detail.price}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    setActiveDetail(null);
                    setTimeout(() => navigateTo(card.route), 300);
                  }}
                  style={{
                    marginTop: 28,
                    padding: "16px 36px",
                    background: `linear-gradient(135deg, ${card.accent}, ${card.accent}cc)`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 16px 40px ${card.accent}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Book This Experience →
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

export default Experiences;
