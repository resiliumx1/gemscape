import { useRef, useEffect, useState } from "react";
import { useWave } from "@/components/WavePageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";
import React, { Suspense } from "react";

const BrilliantGem = React.lazy(() => import("@/components/BrilliantGem"));

const TRUST_ITEMS = [
  { icon: "🌿", label: "Locally Based & Guided" },
  { icon: "✦", label: "100% Personalized" },
  { icon: "💬", label: "WhatsApp Available" },
  { icon: "⚡", label: "Response Within 2 Hours" },
];

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

  useEffect(() => {
    if (isMobile) return;
    const timer = setTimeout(() => setShowGem(true), 3000);
    return () => clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    const attemptPlay = () => {
      video.play().catch(() => {
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
    if (video.readyState >= 2) attemptPlay();
    else video.addEventListener("canplay", attemptPlay, { once: true });
    return () => video.removeEventListener("canplay", attemptPlay);
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        className="hero-cinematic"
        data-theme="dark"
        style={{
          width: "100vw",
          minHeight: "100svh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1b2a",
          paddingTop: "calc(var(--header-height) + 2rem)",
          paddingBottom: "2rem",
        }}
      >
        {/* Drone video (kept, dimmed so #0d1b2a base reads) */}
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
            opacity: 0.32,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLVideoElement).style.display = "none";
          }}
        />

        {/* Darkening overlay so #0d1b2a dominates */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(13,27,42,0.55) 0%, rgba(13,27,42,0.45) 40%, rgba(13,27,42,0.75) 85%, rgba(13,27,42,1) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Teal bottom-left + gold top-right radial glows */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "radial-gradient(ellipse 60% 55% at 15% 90%, rgba(42,157,143,0.18) 0%, transparent 65%), radial-gradient(ellipse 55% 50% at 88% 8%, rgba(233,196,106,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Ambient gem (opacity 0.28) */}
        {!isMobile && showGem && (
          <div
            className="hero-gem-ambient"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              opacity: 0.28,
            }}
          >
            <Suspense fallback={null}>
              <BrilliantGem
                width={isTablet ? 320 : 560}
                height={isTablet ? 320 : 560}
                observerTarget={heroRef as React.RefObject<HTMLElement>}
              />
            </Suspense>
          </div>
        )}

        {/* Centered content */}
        <div
          className="hero-center-col"
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 760,
            width: "100%",
          }}
        >
          {/* Badge */}
          <span
            style={{
              display: "inline-block",
              border: "1px solid rgba(61,188,173,0.32)",
              background: "rgba(42,157,143,0.15)",
              color: "#3dbcad",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              borderRadius: 20,
              padding: "5px 14px",
              marginBottom: 22,
            }}
          >
            ✦ Curated Caribbean Experiences
          </span>

          {/* Headline */}
          <h1
            className="hero-headline"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#ffffff",
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              margin: 0,
              maxWidth: 680,
            }}
          >
            Curated Caribbean Experiences Designed Around{" "}
            <em style={{ color: "#e9c46a", fontStyle: "italic", fontWeight: 300 }}>
              Peace
            </em>
            , Beauty &amp; Connection.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 16,
              color: "rgba(255,255,255,0.54)",
              lineHeight: 1.8,
              maxWidth: 520,
              marginTop: 22,
            }}
          >
            From itinerary creation to island arrival, Gemscape handles the details
            so you can experience the Caribbean meaningfully.
          </p>

          {/* CTAs */}
          <div
            className="hero-cta-row"
            style={{
              display: "flex",
              gap: 10,
              marginTop: 30,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => navigateTo("/build-itinerary")}
              className="hero-btn-primary"
              style={{
                background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: ".1em",
                padding: "14px 28px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                minWidth: 200,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(44,184,168,0.55), 0 8px 20px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Build My Itinerary
            </button>
            <button
              onClick={() => navigateTo("/experiences")}
              className="hero-btn-secondary"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.88)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: ".1em",
                padding: "14px 28px",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                minWidth: 200,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              Explore Experiences
            </button>
          </div>
        </div>

        {/* Scroll chevron */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          <ChevronDown size={26} color="rgba(212,173,124,0.7)" className="hero-chevron-bounce" />
        </div>

        <style>{`
          .hero-headline {
            font-size: 56px;
          }
          @media (max-width: 767px) {
            .hero-headline {
              font-size: 36px !important;
            }
            .hero-cta-row {
              flex-direction: column !important;
              width: 100%;
            }
            .hero-cta-row button {
              width: 100% !important;
            }
          }
          @keyframes chevronBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
          .hero-chevron-bounce {
            animation: chevronBounce 2s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Trust strip — directly below hero */}
      <div
        className="hero-trust-strip"
        style={{
          width: "100%",
          background: "#162436",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="hero-trust-item"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(42,157,143,0.17)",
                borderRadius: 7,
                fontSize: 14,
                color: "#3dbcad",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: 13,
                color: "rgba(255,255,255,0.60)",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}

        <style>{`
          @media (max-width: 640px) {
            .hero-trust-strip {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 14px 12px !important;
              padding: 18px 20px !important;
            }
            .hero-trust-item {
              justify-content: flex-start;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HeroSection;
