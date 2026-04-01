import { useRef, useEffect, useState } from "react";
import { useWave } from "@/components/WavePageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, Star } from "lucide-react";
import { motion } from "framer-motion";
import React, { Suspense } from "react";

const BrilliantGem = React.lazy(() => import("@/components/BrilliantGem"));

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
          fontSize: 15,
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
  const [isTablet, setIsTablet] = useState(false);
  const [showGem, setShowGem] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 768 && w <= 1024);
    };
    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  // Delay gem render by 2s to let page become interactive first
  useEffect(() => {
    if (isMobile) return;
    const timer = setTimeout(() => setShowGem(true), 2000);
    return () => clearTimeout(timer);
  }, [isMobile]);

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
      data-theme="dark"
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: -1,
      }}
    >
      {/* ═══ LAYER 1 — DRONE VIDEO / KEN BURNS POSTER ═══ */}
      <video
        ref={heroVideoRef}
        src="/videos/antigua-aerial.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
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
          (e.currentTarget as HTMLVideoElement).style.display = 'none';
        }}
      />

      {/* ═══ LAYER 2A — LINEAR GRADIENT OVERLAY ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(5,24,30,0.30) 0%, rgba(5,24,30,0.15) 40%, rgba(5,24,30,0.55) 85%, rgba(5,24,30,1.0) 100%)",
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

      {/* ═══ LAYER 3 — TWO-COLUMN GRID LAYOUT ═══ */}
      <div className="hero-grid-layout" style={{ position: "relative", zIndex: 3, width: "100%", height: "100%" }}>

        {/* GEM — hidden on mobile for performance, delayed load on desktop */}
        {!isMobile && showGem && (
          <div className="hero-gem-float">
            <div style={{ position: "relative", zIndex: 1 }}>
              <Suspense fallback={null}>
                <BrilliantGem
                  width={isTablet ? 180 : 520}
                  height={isTablet ? 180 : 520}
                  observerTarget={heroRef as React.RefObject<HTMLElement>}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* LEFT COLUMN — TEXT */}
        <div className="hero-text-col">
          {/* Eyebrow */}
          <span
            style={{
              fontSize: 15,
              letterSpacing: ".18em",
              color: "rgba(201,168,76,0.75)",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            <span className="hero-country-shimmer">ANTIGUA &amp; BARBUDA</span> · CARIBBEAN
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
                fontWeight: 400,
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
            Antigua &amp; Barbuda, privately. Beautifully. Entirely on your terms.
          </p>

          {/* Animated star rating */}
          <AnimatedStars />

          {/* CTA buttons — 2 options */}
          <div className="hero-cta-row" style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <button
              onClick={() => navigateTo("/book")}
              className="hero-btn-primary"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '.12em',
                padding: '14px 32px',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'uppercase' as const,
                transition: 'all 0.35s ease',
                minWidth: 180,
                textAlign: 'center' as const,
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 0 28px rgba(44,184,168,0.55), 0 0 60px rgba(44,184,168,0.2), 0 8px 20px rgba(0,0,0,0.3)';
                btn.style.background = 'linear-gradient(135deg, #2cb8a8 0%, #3cc8b8 100%)';
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
                btn.style.background = 'linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)';
              }}
            >
              <span className="hero-btn-shimmer" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 9l10 13 10-13L12 2z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" />
                  <path d="M2 9h20M12 2l5 7-5 11-5-11 5-7z" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                </svg>
                Book Now
              </span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hero-btn-secondary"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.45)',
                color: '#C9A84C',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '.12em',
                padding: '14px 32px',
                borderRadius: 3,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'uppercase' as const,
                transition: 'all 0.35s ease',
                minWidth: 180,
                textAlign: 'center' as const,
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(-2px)';
                btn.style.borderColor = 'rgba(201,168,76,0.9)';
                btn.style.boxShadow = '0 0 24px rgba(201,168,76,0.35), 0 0 50px rgba(201,168,76,0.12), inset 0 0 20px rgba(201,168,76,0.05)';
                btn.style.color = '#E8C96A';
                btn.style.background = 'rgba(201,168,76,0.06)';
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget;
                btn.style.transform = 'translateY(0)';
                btn.style.borderColor = 'rgba(201,168,76,0.45)';
                btn.style.boxShadow = 'none';
                btn.style.color = '#C9A84C';
                btn.style.background = 'transparent';
              }}
            >
              <span className="hero-btn-shimmer-gold" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 9l10 13 10-13L12 2z" stroke="rgba(201,168,76,0.8)" strokeWidth="1.5" fill="rgba(201,168,76,0.1)" />
                </svg>
                Explore Services
              </span>
            </button>
          </div>

          {/* Mobile stats row */}
          <div className="hero-mobile-stats">
            <div className="hero-mobile-stat">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>365</span>
              <span style={{ fontSize: 14, letterSpacing: '.15em', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' as const }}>Beaches</span>
            </div>
            <div className="hero-mobile-stat">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>1,000+</span>
              <span style={{ fontSize: 14, letterSpacing: '.15em', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' as const }}>Guests</span>
            </div>
            <div className="hero-mobile-stat">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#C9A84C', fontFamily: "'Cormorant Garamond', serif" }}>5★</span>
              <span style={{ fontSize: 14, letterSpacing: '.15em', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' as const }}>Rated</span>
            </div>
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
        /* ═══ HERO LAYOUT ═══ */
        .hero-grid-layout {
          display: flex;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          height: 100%;
          position: relative;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          max-width: 560px;
          position: relative;
          z-index: 3;
        }
        .hero-headline {
          font-size: clamp(40px, 5vw, 72px);
        }

        /* ═══ GEM — Desktop: absolute right side ═══ */
        .hero-gem-float {
          position: absolute;
          z-index: 2;
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        /* ═══ CHEVRON ═══ */
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .hero-chevron-bounce {
          animation: chevronBounce 2s ease-in-out infinite;
        }

        /* ═══ TABLET — gem above text, centered, ONE gem only ═══ */
        @media (min-width: 768px) and (max-width: 1024px) {
          .hero-grid-layout {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0 32px;
            gap: 0;
          }
          .hero-text-col {
            align-items: center;
            text-align: center;
            max-width: 640px;
          }
          .hero-headline {
            font-size: clamp(30px, 4.5vw, 46px) !important;
          }
          .hero-gem-float {
            position: relative;
            right: auto;
            top: auto;
            transform: none;
            margin-bottom: 8px;
            flex-shrink: 0;
          }
          .hero-gem-float canvas {
            width: 180px !important;
            height: 180px !important;
          }
        }

        /* ═══ MOBILE — gem above text, larger, centered ═══ */
        @media (max-width: 767px) {
          .hero-grid-layout {
            flex-direction: column;
            justify-content: center;
            padding: 0 20px;
            gap: 0;
          }
          .hero-text-col {
            align-items: center;
            text-align: center;
          }
          .hero-headline {
            font-size: clamp(26px, 8vw, 38px) !important;
          }
          .hero-gem-float {
            position: relative;
            right: auto;
            top: auto;
            transform: none;
            margin-bottom: 8px;
            flex-shrink: 0;
          }
          .hero-gem-float canvas {
            width: 200px !important;
            height: 200px !important;
          }
          .hero-right-col {
            display: none !important;
          }
        }

        /* ═══ MOBILE CTAs — full width, equal sizing ═══ */
        @media (max-width: 767px) {
          .hero-cta-row {
            flex-direction: column !important;
            width: 100%;
          }
          .hero-cta-row .hero-btn-primary,
          .hero-cta-row .hero-btn-secondary {
            width: 100% !important;
            min-width: unset !important;
            text-align: center !important;
            justify-content: center !important;
            display: flex !important;
            padding: 16px 24px !important;
          }
        }

        /* ═══ BUTTON SHIMMER ═══ */
        .hero-btn-shimmer,
        .hero-btn-shimmer-gold {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%);
          transform: translateX(-100%);
          transition: none;
        }
        .hero-btn-primary:hover .hero-btn-shimmer {
          animation: btn-shimmer 0.6s ease forwards;
        }
        .hero-btn-secondary:hover .hero-btn-shimmer-gold {
          animation: btn-shimmer 0.6s ease forwards;
        }
        @keyframes btn-shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }

        /* ═══ MOBILE STATS ═══ */
        .hero-mobile-stats {
          display: none;
          flex-direction: row;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        @media (max-width: 767px) {
          .hero-mobile-stats {
            display: flex;
          }
        }
        .hero-mobile-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
