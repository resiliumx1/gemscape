import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wave } from "./Wave";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    number: "01",
    title: "Private Rentals",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=85",
    description:
      "Our rental fleet — from premium SUVs to sailing catamarans — is hand-selected for comfort, style, and the freedom to explore Antigua entirely on your own terms.",
  },
  {
    number: "02",
    title: "Island Circumnavigation",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=85",
    description:
      "Our signature full-island journey takes you all the way around Antigua — past hidden coves, historic forts, and sleepy fishing villages that no cruise ship ever reaches.",
  },
  {
    number: "03",
    title: "Flight Concierge",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85",
    description:
      "From the moment you land at V.C. Bird International to the second your wheels lift off, we handle every detail. Private charters, VIP meet-and-greet, transfers. Not one stressful moment.",
  },
];

const Services = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="services">
      {/* Left — Image panel */}
      <div className="services__images">
        {SERVICES.map((s, i) => (
          <img
            key={s.number}
            src={s.image}
            alt={s.title}
            className={`services__img${i === active ? " active" : ""}`}
          />
        ))}
        <span className="services__counter">
          {SERVICES[active].number} / 0{SERVICES.length}
        </span>
      </div>

      {/* Right — Navigation panel */}
      <div ref={rightRef} className="services__nav">
        <span className="eyebrow">Our Services</span>

        <div className="services__rows">
          {SERVICES.map((s, i) => (
            <div
              key={s.number}
              className={`services__row${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="services__row-num">{s.number}</span>
              <span className="services__row-title">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="services__desc">
          {SERVICES.map((s, i) => (
            <div
              key={s.number}
              className={`services__desc-item${i === active ? " active" : ""}`}
            >
              <p>{s.description}</p>
              <a href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`} className="services__explore">
                Explore <span className="services__arrow">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Waves */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100px", zIndex: 10 }}>
        <Wave color="#EFF8F6" height={100} speed={0.3} offset={100} />
        <Wave color="#FDFAF4" height={80} speed={0.5} offset={400} />
      </div>
    </section>
  );
};

export default Services;
