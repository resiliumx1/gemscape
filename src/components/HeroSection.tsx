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

      {/* Animated wave separator */}
      <HeroWaveDivider />

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

function HeroWaveDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const colors = [
      "rgba(4,20,28,0.97)",
      "rgba(8,45,60,0.92)",
      "rgba(15,90,110,0.82)",
      "rgba(26,138,158,0.65)",
      "rgba(60,185,200,0.35)",
    ];
    const baseYPcts = [0.52, 0.61, 0.70, 0.78, 0.86];
    const amps = [32, 25, 19, 14, 9];
    const speeds = [0.55, 0.82, 1.18, 1.55, 2.1];
    const offsets = [0, 1.4, 2.9, 0.7, 3.3];

    const dots = Array.from({ length: 30 }, () => ({
      xPct: Math.random(),
      speed: 0.8 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      radius: 1 + Math.random() * 2,
    }));

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function getWaveY(x: number, w: number, h: number, layerIdx: number, t: number) {
      const freq = (2 * Math.PI) / (w * 0.55);
      const amp = amps[layerIdx];
      const spd = speeds[layerIdx];
      const off = offsets[layerIdx];
      const baseY = h * baseYPcts[layerIdx];
      return (
        baseY +
        Math.sin(x * freq + t * spd + off) * amp +
        Math.sin(x * freq * 1.65 - t * spd * 0.68 + off * 1.3) * amp * 0.38 +
        Math.sin(x * freq * 2.9 + t * spd * 1.25) * amp * 0.15
      );
    }

    function draw() {
      const t = performance.now() / 1000;
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < 5; i++) {
        ctx!.beginPath();
        ctx!.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          ctx!.lineTo(x, getWaveY(x, w, h, i, t));
        }
        ctx!.lineTo(w, h);
        ctx!.closePath();
        ctx!.fillStyle = colors[i];
        ctx!.fill();
      }

      // Foam dots on layer 3 (index 2)
      for (const dot of dots) {
        const x = dot.xPct * w;
        const y = getWaveY(x, w, h, 2, t);
        const pulse = 0.35 + 0.65 * Math.abs(Math.sin(t * dot.speed + dot.phase));
        const opacity = (0.1 + 0.12 * pulse).toFixed(3);
        ctx!.beginPath();
        ctx!.arc(x, y, dot.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: 120,
        display: "block",
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
  );
}
