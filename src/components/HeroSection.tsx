import { useRef, useEffect } from "react";
import { useWave } from "@/components/GemscapeWave";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, Star } from "lucide-react";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ── Inline 3D Gem (sits inside the headline) ── */
function InlineGem({ size = 88 }: { size?: number }) {
  const mountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const SIZE = size;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.3, 3.2);
    camera.lookAt(0, 0, 0);

    // Brilliant-cut gem geometry
    const gemGeo = new THREE.ConeGeometry(0.7, 1.1, 8, 1);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x2cb8a8,
      metalness: 0,
      roughness: 0,
      transmission: 0.95,
      thickness: 0.8,
      ior: 2.42,
      clearcoat: 1,
      clearcoatRoughness: 0,
      transparent: true,
      opacity: 0.92,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.rotation.x = Math.PI;
    scene.add(gem);

    // Gold wireframe edges
    const edgesGeo = new THREE.EdgesGeometry(gemGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xd4ad7c,
      linewidth: 1,
      transparent: true,
      opacity: 0.85,
    });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    wireframe.rotation.x = Math.PI;
    scene.add(wireframe);

    // Flat top cap
    const capGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 8);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0x2cb8a8,
      transmission: 0.9,
      roughness: 0,
      ior: 2.42,
      transparent: true,
      opacity: 0.85,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.55;
    scene.add(cap);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const p1 = new THREE.PointLight(0x3cc8b8, 3, 10);
    p1.position.set(2, 3, 2);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xd4ad7c, 2, 10);
    p2.position.set(-2, -1, 2);
    scene.add(p2);
    const p3 = new THREE.PointLight(0xffffff, 1.5, 10);
    p3.position.set(0, 0, 3);
    scene.add(p3);

    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.012;
      gem.rotation.y = t * 0.4;
      wireframe.rotation.y = t * 0.4;
      cap.rotation.y = t * 0.4;
      const floatY = Math.sin(t * 0.8) * 0.04;
      gem.position.y = floatY;
      wireframe.position.y = floatY;
      cap.position.y = 0.55 + floatY;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <span
      ref={mountRef}
      data-inline-gem
      style={{
        display: "inline-block",
        width: size,
        height: size,
        verticalAlign: "middle",
        position: "relative",
        top: -4,
      }}
    />
  );
}

/* ── Animated Stars ── */
const AnimatedStars = () => (
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

/* ── Stat Cards (right column) ── */
const stats = [
  { value: "365", label: "Beaches in Antigua" },
  { value: "500+", label: "Happy Travellers" },
  { value: "5★", label: "Average Rating" },
];

const StatCards = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
    {stats.map((s, i) => (
      <motion.div
        key={s.label}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 + i * 0.2, duration: 0.7, ease: "easeOut" }}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "24px 32px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontWeight: 600,
            background: "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
          }}
        >
          {s.value}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            marginTop: 4,
            letterSpacing: ".04em",
          }}
        >
          {s.label}
        </div>
      </motion.div>
    ))}
  </div>
);

/* ── Hero Section ── */
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
        console.warn("Hero video autoplay blocked:", err.message);
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
          document.removeEventListener("keydown", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("touchstart", playOnInteraction, { once: true });
        document.addEventListener("keydown", playOnInteraction, { once: true });
      });
    };
    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener("canplay", attemptPlay, { once: true });
    }
    return () => {
      video.removeEventListener("canplay", attemptPlay);
    };
  }, []);

  const gemSize = isMobile ? 64 : 88;

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
      {/* ═══ LAYER 1 — DRONE VIDEO ═══ */}
      <video
        ref={heroVideoRef}
        src="/videos/antigua-aerial.mp4"
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
          opacity: 0.65,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = "none";
        }}
      />

      {/* ═══ LAYER 2A — LINEAR GRADIENT OVERLAY ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(5,24,30,0.50) 0%, rgba(5,24,30,0.35) 35%, rgba(5,24,30,0.55) 70%, rgba(5,24,30,0.90) 100%)",
          pointerEvents: "none",
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

      {/* ═══ LAYER 3 — TWO-COLUMN GRID ═══ */}
      <div className="hero-grid-layout" style={{ position: "relative", zIndex: 3, width: "100%", height: "100%" }}>
        {/* LEFT — TEXT */}
        <div className="hero-text-col">
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

          {/* Headline with inline 3D gem */}
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
            {"Becomes a "}
            <InlineGem size={gemSize} />
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .
            </span>
          </h1>

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

          <AnimatedStars />

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

        {/* RIGHT — STAT CARDS */}
        <div className="hero-right-col">
          <StatCards />
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

      <style>{`
        .hero-grid-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
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
        .hero-right-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          max-width: 360px;
          justify-self: center;
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
            grid-template-columns: 1.2fr 0.8fr;
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
            gap: 24px;
            justify-items: center;
            align-content: center;
          }
          .hero-right-col {
            order: 1;
            max-width: 100%;
            width: 100%;
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
