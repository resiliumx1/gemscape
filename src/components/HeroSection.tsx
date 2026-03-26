import GemHero from "@/components/GemHero";
import { useWave } from "@/components/GemscapeWave";
import heroImage from "@/assets/hero-antigua-sunset.png";

const HeroSection = () => {
  const { navigateTo } = useWave();

  return (
    <section
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
      className="hero-split-wrapper"
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
            "linear-gradient(to right, rgba(4,20,28,0.88) 0%, rgba(4,20,28,0.65) 40%, rgba(4,20,28,0.15) 70%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Left column — text content */}
      <div
        className="hero-left"
        style={{
          position: "relative",
          zIndex: 2,
          width: "48%",
          paddingLeft: "clamp(40px, 6vw, 96px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
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
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 5.5vw, 72px)",
            color: "#fff",
            fontWeight: 400,
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          Where Every Journey
          <br />
          Becomes a
          <br />
          <span style={{ fontStyle: "italic", color: "#5ec8e0" }}>Gem.</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 400,
            marginTop: 20,
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
            marginTop: 16,
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

      {/* Right column — GemHero floating over beach */}
      <div
        className="hero-right"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "54%",
          height: "100%",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <GemHero width={560} height={560} />
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
            padding: 120px 24px 40px !important;
            text-align: left;
          }
          .hero-right {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
