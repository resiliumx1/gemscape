import { useWave } from "@/components/GemscapeWave";
import heroImage from "@/assets/hero-antigua-sunset.png";
import BrilliantGem from "@/components/BrilliantGem";

const HeroSection = () => {
  const { navigateTo } = useWave();

  return (
    <section
      style={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="hero-centered-wrapper"
    >
      {/* Full-bleed background photo */}
      <img
        src={heroImage}
        alt="Aerial view of Antigua's turquoise Caribbean coastline at sunset"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center 40%, rgba(4,20,28,0.55) 0%, rgba(4,20,28,0.82) 60%, rgba(4,20,28,0.95) 100%)",
          zIndex: 1,
        }}
      />

      {/* Centered content */}
      <div
        className="hero-centered-content"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          paddingTop: "clamp(100px, 12vh, 140px)",
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
            maxWidth: 600,
          }}
        >
          Where Every Journey
          <br />
          Becomes a
        </h1>

        {/* 3D Brilliant Gem replaces the word "Gem" */}
        <div
          className="hero-gem-container"
          style={{
            background: "transparent",
            overflow: "visible",
            margin: "-30px auto -10px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <BrilliantGem width={420} height={420} />
        </div>

        {/* Subtext */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 440,
            marginTop: -10,
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
            marginTop: 12,
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
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-gem-container canvas {
            width: 350px !important;
            height: 350px !important;
          }
          .hero-headline {
            font-size: clamp(28px, 4.5vw, 48px) !important;
          }
        }
        @media (max-width: 768px) {
          .hero-centered-wrapper {
            min-height: 100vh;
          }
          .hero-centered-content {
            padding-top: 100px !important;
          }
          .hero-gem-container canvas {
            width: 280px !important;
            height: 280px !important;
          }
          .hero-headline {
            font-size: clamp(24px, 7vw, 36px) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
