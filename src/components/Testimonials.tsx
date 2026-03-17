import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wave } from "./Wave";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "The circumnavigation tour was the highlight of our entire Caribbean trip. Our guide knew every hidden cove — places no tourist map would ever show you.",
    name: "Sarah M.",
    origin: "New York, USA",
  },
  {
    quote: "Gemscape handled our entire arrival — from the private jet charter to the hotel transfer. We didn't lift a finger. Pure luxury from start to finish.",
    name: "James & Fiona K.",
    origin: "London, UK",
  },
  {
    quote: "We rented a convertible for three days and Gemscape had mapped out the most incredible route around the island. Best road trip I've ever had.",
    name: "Marcus T.",
    origin: "Toronto, Canada",
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            delay: i * 0.2,
            scrollTrigger: { trigger: el, start: "top 82%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="testimonials">
      <div className="testimonials__header">
        <span className="eyebrow">Guest Experiences</span>
        <h2 className="testimonials__h2">Stories From the Water.</h2>
      </div>

      <div className="testimonials__list">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={`testimonial testimonial--${i + 1}`}
          >
            <span className="testimonial__mark">{"\u201C"}</span>
            <p className="testimonial__quote">{t.quote}</p>
            <div className="testimonial__sep" />
            <span className="testimonial__name">{t.name}</span>
            <span className="testimonial__origin">{t.origin}</span>
          </div>
        ))}
      </div>

      {/* Waves */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100px", zIndex: 10 }}>
        <Wave color="#D9CEAE" height={100} speed={0.3} offset={150} />
        <Wave color="#EAD9BB" height={80} speed={0.5} offset={450} />
      </div>
    </section>
  );
};

export default Testimonials;
