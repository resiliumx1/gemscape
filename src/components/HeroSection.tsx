import { useEffect, useRef } from "react";
import GemHero from "@/components/GemHero";
import { useWave } from "@/components/GemscapeWave";

const HeroSection = () => {
  const { navigateTo } = useWave();

  return (
    <section
      className="hero-split-wrapper"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(ellipse 50% 55% at 50% 45%, rgba(26,138,158,0.35) 0%, rgba(10,60,80,0.18) 45%, #05181e 70%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left column — text content */}
      <div
        style={{
          width: "50%",
          paddingLeft: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        className="hero-left"
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
          }}
        >
          Antigua · Caribbean
        </span>

        {/* Gold rule */}
        <div
          style={{
            width: 40,
            height: 1,
            background: "linear-gradient(to right, transparent, #C9A84C, transparent)",
            margin: "14px 0",
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(42px, 5vw, 68px)",
            color: "#fff",
            fontWeight: 400,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Where Every Journey
          <br />
          Becomes a
          <br />
          <span
            style={{
              fontStyle: "italic",
              color: "#5ec8e0",
            }}
          >
            Gem.
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.75,
            maxWidth: 420,
            marginTop: 20,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Private rentals, island circumnavigation, and flight concierge —
          crafted for those who demand the extraordinary.
        </p>

        {/* Star rating */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
          <span style={{ color: "#C9A84C", fontSize: 13 }}>★★★★★</span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginLeft: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Rated 5 stars by over 500 travellers
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
          <button
            onClick={() => navigateTo("/book")}
            style={{
              background: "#C9A84C",
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

      {/* Right column — 3D Gem */}
      <div
        style={{
          width: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
        }}
        className="hero-right"
      >
        <GemHero />
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-split-wrapper {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh;
          }
          .hero-left {
            width: 100% !important;
            padding: 100px 24px 32px !important;
            text-align: left;
          }
          .hero-right {
            width: 100% !important;
            min-height: 50vh;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
