import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import WaveDivider from "@/components/WaveDivider";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "The circumnavigation tour was the highlight of our entire Caribbean trip. Our guide knew every hidden cove — places no tourist map would ever show you.",
    name: "Sarah M.",
    origin: "New York, USA",
    service: "Island Circumnavigation",
    rating: 5,
  },
  {
    quote: "Our private tour to English Harbour was beyond anything we imagined. The stories, the rum, the sunset — pure magic from start to finish.",
    name: "James K.",
    origin: "London, UK",
    service: "Heritage & Discovery Tour",
    rating: 5,
  },
  {
    quote: "Gemscape handled every detail of our arrival — car, hotel, first dinner reservation. We felt like VIPs from the moment we landed in Antigua.",
    name: "Priya & Rohan S.",
    origin: "Toronto, Canada",
    service: "Flight Concierge",
    rating: 5,
  },
  {
    quote: "We rented a Jeep for the week and explored the island on our own terms. Pickup was seamless, the vehicle was immaculate, and the price was unbeatable.",
    name: "Carlos D.",
    origin: "Miami, USA",
    service: "Vehicle Rental",
    rating: 5,
  },
  {
    quote: "From Darkwood Beach to Devil's Bridge — they showed us an Antigua that most tourists never see. Absolutely unforgettable.",
    name: "Emma & Liam T.",
    origin: "Sydney, Australia",
    service: "Beach Exploration",
    rating: 5,
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => setActive((p) => (p + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section
      ref={sectionRef}
      className="testimonials"
      style={{ padding: "80px 20px 40px", position: "relative" }}
    >
      <div className="testimonials__header" style={{ textAlign: "center", marginBottom: 48 }}>
        <span className="eyebrow">Guest Experiences</span>
        <h2 className="testimonials__h2">Stories From the Water.</h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: "rgba(255,255,255,0.5)",
          maxWidth: 480,
          margin: "12px auto 0",
          lineHeight: 1.7,
        }}>
          Real reviews from guests who explored Antigua with us.
        </p>
      </div>

      {/* Main card */}
      <div
        style={{
          position: "relative",
          maxWidth: 640,
          margin: "0 auto",
          padding: "0 52px",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Nav arrows */}
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(184,149,106,0.1)",
            border: "1px solid rgba(184,149,106,0.25)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b8956a",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next testimonial"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(184,149,106,0.1)",
            border: "1px solid rgba(184,149,106,0.25)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b8956a",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Card content */}
        <div
          key={active}
          style={{
            textAlign: "center",
            padding: "36px 24px",
            background: "rgba(5,24,30,0.5)",
            border: "1px solid rgba(184,149,106,0.12)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Stars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={16} fill="#C9A84C" stroke="none" />
            ))}
          </div>

          {/* Service badge */}
          <span style={{
            fontSize: 10,
            letterSpacing: ".14em",
            color: "#2cb8a8",
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}>
            {t.service}
          </span>

          {/* Quote */}
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(17px, 2.2vw, 22px)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.7,
            margin: "20px 0 24px",
          }}>
            "{t.quote}"
          </p>

          {/* Divider */}
          <div style={{
            width: 40,
            height: 1,
            background: "linear-gradient(90deg, transparent, #b8956a, transparent)",
            margin: "0 auto 16px",
          }} />

          {/* Attribution */}
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#b8956a",
            display: "block",
          }}>
            {t.name}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}>
            {t.origin}
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            style={{
              width: i === active ? 28 : 8,
              height: 4,
              borderRadius: 2,
              background: i === active ? "#b8956a" : "rgba(184,149,106,0.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        maxWidth: 200,
        margin: "20px auto 0",
        height: 2,
        background: "rgba(184,149,106,0.1)",
        borderRadius: 1,
        overflow: "hidden",
      }}>
        <div
          key={`progress-${active}`}
          style={{
            height: "100%",
            background: "#b8956a",
            borderRadius: 1,
            animation: paused ? "none" : "progressFill 5s linear forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <WaveDivider variant="ocean" height={120} />
    </section>
  );
};

export default Testimonials;
