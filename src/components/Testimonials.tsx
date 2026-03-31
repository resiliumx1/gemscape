import { useEffect, useRef, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    quote:
      "The circumnavigation tour was the highlight of our entire Caribbean trip. Our guide knew every hidden cove — places no tourist map would ever show you.",
    name: "Sarah M.",
    origin: "New York, USA",
    service: "Island Circumnavigation",
    initials: "SM",
    accent: "#2cb8a8",
  },
  {
    quote:
      "Gemscape handled every detail of our arrival — car, hotel, first dinner. We felt like VIPs from the moment we landed in Antigua. Seamless from start to finish.",
    name: "Priya & Rohan S.",
    origin: "Toronto, Canada",
    service: "Flight Concierge",
    initials: "PS",
    accent: "#b8956a",
  },
  {
    quote:
      "We rented a Jeep for the week and found our own Antigua. The pickup was seamless, the vehicle was immaculate. No tourist trap, just raw island freedom.",
    name: "Carlos D.",
    origin: "Miami, USA",
    service: "Vehicle Rental",
    initials: "CD",
    accent: "#C9A84C",
  },
  {
    quote:
      "From Darkwood Beach to Devil's Bridge — they showed us an Antigua that most tourists never see. Absolute world-class guiding. We're already planning our return.",
    name: "Emma & Liam T.",
    origin: "Sydney, Australia",
    service: "Beach Exploration",
    initials: "ET",
    accent: "#1a8a9e",
  },
  {
    quote:
      "Our private charter to Cades Reef was beyond anything we imagined. Every detail arranged, zero stress. Just us, the crew, and the most beautiful water on earth.",
    name: "James K.",
    origin: "London, UK",
    service: "Private Charter",
    initials: "JK",
    accent: "#3cc8b8",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(() => {
    setActive((a) => {
      setPrev(a);
      return (a + 1) % REVIEWS.length;
    });
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setPrev(active);
      setActive(i);
    },
    [active]
  );

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, advance]);

  const r = REVIEWS[active];

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          padding: "100px 24px 80px",
          overflow: "hidden",
          background: "var(--bg-primary)",
        }}
      >
        {/* Ambient background particles */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                borderRadius: "50%",
                background:
                  i % 3 === 0
                    ? "#C9A84C"
                    : i % 3 === 1
                    ? "#2cb8a8"
                    : "#fff",
                animation: `voaFloat ${3 + Math.random() * 4}s ease-in-out ${
                  Math.random() * 5
                }s infinite`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="voa-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="voa-header-line" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span
              style={{
                fontSize: 12,
                letterSpacing: ".25em",
                color: "#2cb8a8",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Guest Experiences
            </span>
            <h2 className="voa-h2">Voices of Antigua</h2>
            <p className="voa-sub">
              Unscripted. Unfiltered. From guests who lived it.
            </p>
          </div>
          <div className="voa-header-line" />
        </div>

        {/* Main stage */}
        <div
          className="voa-stage"
          style={{ position: "relative", zIndex: 1 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Large quote mark */}
          <div className="voa-quote-mark">
            <Quote size={64} />
          </div>

          {/* Quote content */}
          <div className="voa-content">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className={`voa-card ${
                  i === active
                    ? "voa-card--active"
                    : i === prev
                    ? "voa-card--exit"
                    : ""
                }`}
              >
                {/* Stars */}
                <div className="voa-stars">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      fill="#C9A84C"
                      strokeWidth={0}
                      color="#C9A84C"
                    />
                  ))}
                </div>

                {/* The quote */}
                <p className="voa-quote">"{review.quote}"</p>

                {/* Attribution */}
                <div className="voa-attribution">
                  <div
                    className="voa-avatar"
                    style={{
                      background: `${review.accent}20`,
                      border: `1px solid ${review.accent}40`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: review.accent,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {review.initials}
                    </span>
                  </div>
                  <div className="voa-author">
                    <span className="voa-name">{review.name}</span>
                    <span className="voa-origin">{review.origin}</span>
                  </div>
                  <span
                    className="voa-service-badge"
                    style={{
                      color: review.accent,
                      borderColor: `${review.accent}40`,
                    }}
                  >
                    {review.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="voa-nav" style={{ position: "relative", zIndex: 1 }}>
          {REVIEWS.map((review, i) => (
            <button
              key={i}
              className={`voa-dot ${i === active ? "voa-dot--active" : ""}`}
              style={
                i === active
                  ? { background: review.accent }
                  : undefined
              }
              onClick={() => goTo(i)}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="voa-progress-wrap" style={{ position: "relative", zIndex: 1 }}>
          <div
            key={active}
            className="voa-progress-bar"
            style={{
              background: r.accent,
              animation: paused ? "none" : "voaProgress 5s linear forwards",
            }}
          />
        </div>
      </section>

      <style>{`
        @keyframes voaFloat {
          0%,100% { opacity: 0.2; transform: translateY(0) scale(1); }
          50%      { opacity: 0.8; transform: translateY(-12px) scale(1.5); }
        }
        .voa-header {
          display: flex;
          align-items: center;
          gap: 32px;
          justify-content: center;
          text-align: center;
          margin-bottom: 64px;
        }
        .voa-header-line {
          flex: 1;
          max-width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(44,184,168,0.4), transparent);
        }
        .voa-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 300;
          color: #ffffff;
          margin: 8px 0 4px;
          letter-spacing: -0.01em;
        }
        html:not(.dark) .voa-h2 { color: #05181e; }
        .voa-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.04em;
        }
        html:not(.dark) .voa-sub { color: rgba(5,24,30,0.5); }
        .voa-stage {
          position: relative;
          max-width: 860px;
          margin: 0 auto 40px;
          min-height: 300px;
        }
        .voa-quote-mark {
          position: absolute;
          top: -16px; left: -8px;
          color: rgba(44,184,168,0.12);
          z-index: 0;
          pointer-events: none;
        }
        .voa-content {
          position: relative;
          min-height: 260px;
          z-index: 1;
        }
        .voa-card {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
          padding: 48px 56px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          backdrop-filter: blur(8px);
        }
        html:not(.dark) .voa-card {
          background: rgba(5,24,30,0.04);
          border-color: rgba(5,24,30,0.08);
        }
        .voa-card--active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .voa-card--exit {
          opacity: 0;
          transform: translateY(-12px);
        }
        .voa-stars {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
        }
        .voa-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.9);
          line-height: 1.65;
          margin: 0 0 32px;
          letter-spacing: 0.01em;
        }
        html:not(.dark) .voa-quote { color: rgba(5,24,30,0.85); }
        .voa-attribution {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .voa-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .voa-author {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .voa-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }
        html:not(.dark) .voa-name { color: #05181e; }
        .voa-origin {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        html:not(.dark) .voa-origin { color: rgba(5,24,30,0.45); }
        .voa-service-badge {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px solid;
          border-radius: 3px;
          padding: 5px 10px;
          margin-left: auto;
        }
        .voa-nav {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .voa-dot {
          height: 4px; width: 8px;
          border-radius: 2px;
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.4s ease;
        }
        html:not(.dark) .voa-dot { background: rgba(5,24,30,0.2); }
        .voa-dot--active { width: 32px; }
        .voa-progress-wrap {
          max-width: 160px;
          margin: 0 auto;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 1px;
          overflow: hidden;
        }
        .voa-progress-bar {
          height: 100%; width: 0%;
          border-radius: 1px;
        }
        @keyframes voaProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @media (max-width: 768px) {
          .voa-card { padding: 32px 24px; }
          .voa-quote { font-size: clamp(17px, 5vw, 22px); }
          .voa-header { gap: 16px; }
          .voa-header-line { max-width: 40px; }
          .voa-service-badge { display: none; }
        }
      `}</style>
    </>
  );
}
