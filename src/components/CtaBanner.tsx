import { useRef, useEffect } from "react";
import { useWaveNav } from "@/components/WavePageTransition";
import { ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CtaBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWaveNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image with parallax */}
        <div
          ref={imgRef}
          style={{
            position: "absolute",
            inset: "-20% 0",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=90')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            willChange: "transform",
          }}
        />

        {/* Layered overlays for depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,24,30,0.55) 0%, rgba(5,24,30,0.75) 50%, rgba(5,24,30,0.9) 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(44,184,168,0.08) 0%, transparent 65%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 90%, rgba(201,168,76,0.06) 0%, transparent 50%)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 680,
            textAlign: "center",
            padding: "80px 24px",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 32,
                height: 1,
                background: "rgba(201,168,76,0.5)",
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: ".25em",
                color: "#C9A84C",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Begin Your Journey
            </span>
            <div
              style={{
                width: 32,
                height: 1,
                background: "rgba(201,168,76,0.5)",
              }}
            />
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.15,
              margin: "0 0 20px",
            }}
          >
            <span className="hero-country-shimmer">Antigua &amp; Barbuda</span> Are Waiting
            <br />
            <span
              style={{
                fontStyle: "italic",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              for You.
            </span>
          </h2>

          {/* Sub copy */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'DM Sans', sans-serif",
              maxWidth: 480,
              margin: "0 auto 36px",
            }}
          >
            Tell us your dream. We'll handle every detail —
            <br />
            from the moment you land to the last golden hour.
          </p>

          {/* CTA buttons */}
          <div
            className="cta2-buttons"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            <button
              className="cta2-btn-primary"
              onClick={() => navigateTo("/book")}
              style={{
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff",
                padding: "16px 32px",
                border: "none",
                borderRadius: 4,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.35s ease",
                animation: "ctaGlow 3s ease-in-out infinite",
              }}
            >
              <span className="cta2-btn-shimmer" />
              <span className="cta2-btn-content">
                Start Planning
                <ArrowRight size={16} />
              </span>
            </button>

            <a
              href="https://wa.me/12687805510"
              target="_blank"
              rel="noopener noreferrer"
              className="cta2-btn-whatsapp"
            >
              <MessageCircle size={16} />
              WhatsApp Us
            </a>
          </div>

          {/* Trust signals */}
          <div className="cta2-trust">
            <span>✦ No upfront payment</span>
            <span>✦ Reply within 2 hours</span>
            <span>✦ Fully bespoke</span>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes ctaGlow {
          0%,100% { box-shadow: 0 0 20px rgba(44,184,168,0.3), 0 4px 16px rgba(0,0,0,0.3); }
          50%      { box-shadow: 0 0 40px rgba(44,184,168,0.55), 0 0 80px rgba(44,184,168,0.2), 0 4px 16px rgba(0,0,0,0.3); }
        }
        .cta2-btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 0 50px rgba(44,184,168,0.65), 0 8px 24px rgba(0,0,0,0.4) !important;
          animation: none !important;
        }
        .cta2-btn-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%);
          transform: translateX(-100%);
        }
        .cta2-btn-primary:hover .cta2-btn-shimmer {
          animation: cta2Shimmer 0.7s ease forwards;
        }
        @keyframes cta2Shimmer {
          to { transform: translateX(100%); }
        }
        .cta2-btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cta2-btn-whatsapp {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.85);
          padding: 16px 28px;
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .cta2-btn-whatsapp:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.5);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .cta2-trust {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.06em;
        }
        @media (max-width: 600px) {
          .cta2-buttons { flex-direction: column; align-items: center; }
          .cta2-btn-primary, .cta2-btn-whatsapp { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
