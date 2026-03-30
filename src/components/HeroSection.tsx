import { useRef } from "react";
import { useWave } from "@/components/GemscapeWave";
import BrilliantGem from "@/components/BrilliantGem";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const { navigateTo } = useWave();
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  return (
    <section
      ref={heroRef}
      className="hero-cinematic"
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ═══ LAYER 1 — DRONE VIDEO / KEN BURNS POSTER ═══ */}
      {!isMobile ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/antigua-hero-poster.jpg"
          className="hero-video"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src="/videos/antigua-aerial.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="hero-ken-burns"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: "url(/images/antigua-hero-poster.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* ═══ LAYER 2A — LINEAR GRADIENT OVERLAY ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(5,24,30,0.55) 0%, rgba(5,24,30,0.30) 35%, rgba(5,24,30,0.50) 70%, rgba(5,24,30,0.92) 100%)",
        }}
      />

      {/* ═══ LAYER 2B — TEAL AMBIENT GLOW ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(26,138,158,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ═══ LAYER 3 — GEM GLOW ═══ */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? 360 : 520,
          height: isMobile ? 360 : 520,
          background: "radial-gradient(ellipse, rgba(26,138,158,0.18) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ═══ LAYER 3 — THREE.JS GEM ═══ */}
      <div
        className="hero-gem-floating"
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          pointerEvents: "auto",
        }}
      >
        <BrilliantGem
          width={isMobile ? 320 : 500}
          height={isMobile ? 320 : 500}
          observerTarget={heroRef as React.RefObject<HTMLElement>}
        />
      </div>

      {/* ═══ LAYER 4 — HEADLINE TEXT & CTA ═══ */}
      <div
        className="hero-centered-content"
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "90%",
          maxWidth: 700,
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".18em",
            color: "rgba(201,168,76,0.75)",
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          ANTIGUA · CARIBBEAN
        </span>

        {/* Headline */}
        <h1
          className="hero-headline"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 5vw, 64px)",
            color: "#fff",
            fontWeight: 400,
            lineHeight: 1.1,
            margin: 0,
            maxWidth: 700,
          }}
        >
          Where Every Journey
          <br />
          Becomes a{" "}
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              background:
                "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Gem.
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 440,
            marginTop: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Private rentals, island circumnavigation, and flight concierge —
          crafted for those who demand the extraordinary.
        </p>

        {/* Star rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <span style={{ color: "#C9A84C", fontSize: 13 }}>★★★★★</span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Rated 5 stars by over 500 travellers
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <button
            onClick={() => navigateTo("/book")}
            style={{
              background: "linear-gradient(135deg, #b8956a 0%, #d4ad7c 100%)",
              color: "#05181e",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              padding: "14px 28px",
              border: "none",
              borderRadius: 3,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
            }}
          >
            Explore Experiences
          </button>
          <button
            onClick={() => navigateTo("/book")}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.6)",
              color: "#C9A84C",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              padding: "14px 28px",
              borderRadius: 3,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
            }}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* ═══ SCROLL INDICATOR ═══ */}
      <div
        className="hero-scroll-indicator"
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ChevronDown size={28} color="rgba(201,168,76,0.8)" className="hero-chevron-bounce" />
      </div>

      {/* Responsive + Ken Burns + bounce styles */}
      <style>{`
        @keyframes kenBurns {
          0%, 100% { transform: scale(1.0); }
          50% { transform: scale(1.08); }
        }
        .hero-ken-burns {
          animation: kenBurns 15s ease-in-out infinite alternate;
        }
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .hero-chevron-bounce {
          animation: chevronBounce 2s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .hero-gem-floating {
            top: 12% !important;
          }
          .hero-headline {
            font-size: clamp(24px, 7vw, 36px) !important;
          }
          .hero-centered-content {
            bottom: 12% !important;
          }
        }
        @media (max-width: 1024px) {
          .hero-headline {
            font-size: clamp(28px, 4.5vw, 48px) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
