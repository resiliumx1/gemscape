import { useEffect, useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWave } from "@/components/WavePageTransition";

gsap.registerPlugin(ScrollTrigger);

export default function ConsultationCta() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    const init = () => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".consult-reveal",
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: ref.current, start: "top 80%" },
          }
        );
      }, ref);
    };
    const id =
      "requestIdleCallback" in window
        ? requestIdleCallback(init)
        : requestAnimationFrame(init);
    return () => {
      if ("requestIdleCallback" in window) cancelIdleCallback(id as number);
      else cancelAnimationFrame(id as number);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        padding: "clamp(96px, 11vw, 160px) clamp(20px, 5vw, 80px)",
        background:
          "radial-gradient(ellipse at top, rgba(26,138,158,0.08), transparent 60%), var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* Soft accent line */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #b8956a, transparent)",
        }}
      />

      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          className="consult-reveal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <span
            style={{ width: 24, height: 1, background: "#2cb8a8" }}
          />
          <span
            style={{
              fontSize: 12,
              letterSpacing: ".3em",
              color: "#2cb8a8",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Begin a Conversation
          </span>
          <span
            style={{ width: 24, height: 1, background: "#2cb8a8" }}
          />
        </div>

        <h2
          className="consult-reveal"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(30px, 4.2vw, 52px)",
            fontWeight: 400,
            lineHeight: 1.22,
            letterSpacing: "-.01em",
            color: "var(--text-primary)",
            marginBottom: 24,
            paddingBottom: "0.12em",
          }}
        >
          Not Sure Where{" "}
          <span
            style={{
              fontStyle: "italic",
              background:
                "linear-gradient(135deg, #b8956a 0%, #d4ad7c 50%, #b8956a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            To Start?
          </span>
        </h2>

        <p
          className="consult-reveal"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(15px, 1.4vw, 17px)",
            lineHeight: 1.8,
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "0 auto 40px",
          }}
        >
          Tell us what kind of Caribbean experience you want, and we'll help
          guide the next step — peacefully, thoughtfully, and at your pace.
        </p>

        <div
          className="consult-reveal"
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => navigateTo("/build-itinerary")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 32px",
              background:
                "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 3,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 18px 40px -16px rgba(26,138,158,0.55)",
              transition: "transform .3s ease, box-shadow .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 22px 50px -16px rgba(26,138,158,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 18px 40px -16px rgba(26,138,158,0.55)";
            }}
          >
            Request A Custom Experience
            <ArrowRight size={16} />
          </button>

          <a
            href="https://wa.me/12687805510?text=Hi%20Gemscape%2C%20I'd%20like%20help%20planning%20a%20Caribbean%20experience."
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 28px",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: 3,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2cb8a8";
              e.currentTarget.style.color = "#2cb8a8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            <MessageCircle size={15} />
            Chat With Us
          </a>
        </div>

        <p
          className="consult-reveal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "var(--text-tertiary)",
            letterSpacing: ".05em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#2cb8a8",
              boxShadow: "0 0 12px rgba(44,184,168,0.6)",
            }}
          />
          Personalized support from inquiry to arrival.
        </p>
      </div>
    </section>
  );
}
