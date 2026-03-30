import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaveDivider from "@/components/WaveDivider";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "The circumnavigation tour was the highlight of our entire Caribbean trip. Our guide knew every hidden cove — places no tourist map would ever show you.",
    name: "Sarah M.",
    origin: "New York, USA",
  },
  {
    quote: "Our private tour to English Harbour was beyond anything we imagined. Pure magic from start to finish.",
    name: "James K.",
    origin: "London, UK",
  },
  {
    quote: "Gemscape handled every detail of our arrival — car, hotel, first dinner. We felt like VIPs from the moment we landed.",
    name: "Priya & Rohan S.",
    origin: "Toronto, Canada",
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => setActive((p) => (p + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", scrollTrigger: { trigger: cardRef.current, start: "top 82%" } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section ref={sectionRef} className="testimonials">
      <div className="testimonials__header">
        <span className="eyebrow">Guest Experiences</span>
        <h2 className="testimonials__h2">Stories From the Water.</h2>
      </div>

      <div
        ref={cardRef}
        style={{ position: "relative", maxWidth: 700, margin: "0 auto", padding: "0 60px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left arrow */}
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "#b8956a",
            fontSize: "2rem",
            cursor: "pointer",
            padding: 8,
            lineHeight: 1,
          }}
        >
          ‹
        </button>

        {/* Card */}
        <div className="testimonial" style={{ textAlign: "center" }}>
          <span className="testimonial__mark">{"\u201C"}</span>
          <p className="testimonial__quote">{t.quote}</p>
          <div className="testimonial__sep" />
          <span className="testimonial__name">{t.name}</span>
          <span className="testimonial__origin">{t.origin}</span>
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          aria-label="Next testimonial"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "#b8956a",
            fontSize: "2rem",
            cursor: "pointer",
            padding: 8,
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            style={{
              width: i === active ? 24 : 8,
              height: 4,
              borderRadius: 2,
              background: i === active ? "#b8956a" : "rgba(5,24,30,0.25)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <WaveDivider variant="ocean" height={120} />
    </section>
  );
};

export default Testimonials;
