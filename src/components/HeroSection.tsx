import { useRef, useEffect } from "react";
import { useWave } from "@/components/GemscapeWave";
import BrilliantGem from "@/components/BrilliantGem";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, Star } from "lucide-react";
import { motion } from "framer-motion";

const AnimatedStars = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.8 + i * 0.12, type: "spring", stiffness: 300, damping: 15 }}
            style={{ color: "#C9A84C", fontSize: 22, display: "inline-block" }}
          >
            <Star size={20} fill="#C9A84C" strokeWidth={0} />
          </motion.span>
        ))}
      </div>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.4, duration: 0.6 }}
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
        }}
      >
        Rated 5 stars by over <strong style={{ color: "#C9A84C", fontWeight: 600 }}>1,000+</strong> travellers
      </motion.span>
    </div>
  );
};

const HeroSection = () => {
  const { navigateTo } = useWave();
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    const attemptPlay = () => {
      video.play().catch((err) => {
        console.warn('Hero video autoplay blocked:', err.message);
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
      });
    };
    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', attemptPlay, { once: true });
    }
    return () => {
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

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
      <video
        ref={heroVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/antigua-hero-poster.jpg"
        className="hero-video"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.38,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = 'none';
        }}
      >
        <source src="/videos/antigua-aerial.mp4" type="video/mp4" />
      </video>

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

      {/* ═══ LAYER 3 — TWO-COLUMN GRID LAYOUT ═══ */}
      <div className="hero-grid-layout" style={{ position: "relative", zIndex: 3, width: "100%", height: "100%" }}>
        {/* LEFT COLUMN — TEXT */}
        <div className="hero-text-col">
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
              maxWidth: 480,
              marginTop: 16,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Antigua, privately. Beautifully. Entirely on your terms.
          </p>

          {/* Animated star rating */}
          <AnimatedStars />

          {/* CTA buttons — 2 options */}
          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <button
              onClick={() => navigateTo("/book")}
              style={{
                background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".12em",
                padding: "14px 28px",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Book Now
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("services");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.5)",
                color: "#C9A84C",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".12em",
                padding: "14px 28px",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore Services
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — GEM */}
        <div className="hero-gem-col">
          {/* Atmospheric glow behind gem */}
          <div
            style={{
              position: "absolute",
              width: "120%",
              height: "120%",
              background:
                "radial-gradient(ellipse, rgba(44,184,168,0.15) 0%, rgba(26,138,158,0.08) 40%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div className="hero-gem-canvas" style={{ position: "relative", zIndex: 1 }}>
            <BrilliantGem
              width={isMobile ? 220 : 500}
              height={isMobile ? 220 : 500}
              observerTarget={heroRef as React.RefObject<HTMLElement>}
            />
          </div>
        </div>
      </div>

      {/* ═══ SCROLL CHEVRON ═══ */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ChevronDown size={28} color="rgba(212,173,124,0.7)" className="hero-chevron-bounce" />
      </div>

      {/* Responsive styles */}
      <style>{`
        .hero-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          gap: 48px;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-headline {
          font-size: clamp(40px, 5vw, 72px);
        }
        .hero-gem-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hero-gem-canvas {
          width: clamp(300px, 40vw, 560px);
          height: clamp(300px, 40vw, 560px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .hero-chevron-bounce {
          animation: chevronBounce 2s ease-in-out infinite;
        }

        /* Tablet */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-grid-layout {
            padding: 0 24px;
            gap: 24px;
            grid-template-columns: 1fr 1fr;
          }
          .hero-gem-canvas {
            width: clamp(240px, 35vw, 380px);
            height: clamp(240px, 35vw, 380px);
          }
          .hero-headline {
            font-size: clamp(28px, 4.5vw, 48px) !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-grid-layout {
            grid-template-columns: 1fr;
            padding: 0 20px;
            gap: 0;
            justify-items: center;
            align-content: center;
          }
          .hero-gem-col {
            order: -1;
            margin-bottom: -8px;
          }
          .hero-gem-canvas {
            width: 180px;
            height: 180px;
          }
          .hero-text-col {
            align-items: center;
            text-align: center;
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
