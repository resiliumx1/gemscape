import { useState, useEffect, useRef } from "react";
import { useWave } from "@/components/GemscapeWave";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaveDivider from "./WaveDivider";
import { useCurrency } from "@/contexts/CurrencyContext";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    number: "01",
    title: "Private Rentals",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=85",
    alt: "Premium SUV available for private rental in Antigua",
    description:
      "Our rental fleet — from premium SUVs to sailing catamarans — is hand-selected for comfort, style, and the freedom to explore Antigua entirely on your own terms.",
    priceUsd: 65,
    priceSuffix: "/day",
  },
  {
    number: "02",
    title: "Island Circumnavigation",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=85",
    alt: "Private sailing catamaran charter in Antigua waters",
    description:
      "Our signature full-island journey takes you all the way around Antigua — past hidden coves, historic forts, and sleepy fishing villages that no cruise ship ever reaches.",
    priceUsd: 280,
    priceSuffix: " per group",
  },
  {
    number: "03",
    title: "Flight Concierge",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85",
    alt: "Private flight concierge service departing Antigua",
    description:
      "From the moment you land at V.C. Bird International to the second your wheels lift off, we handle every detail. Private charters, VIP meet-and-greet, transfers. Not one stressful moment.",
    priceUsd: 150,
    priceSuffix: " per person",
  },
];

const Services = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const { format } = useCurrency();
  const { navigateTo } = useWave();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 1.0, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="services">
      <div className="services__images">
        {SERVICES.map((s, i) => (
          <img
            key={s.number}
            src={s.image}
            alt={s.alt}
            className={`services__img${i === active ? " active" : ""}`}
            loading="lazy"
            width={1400}
            height={900}
          />
        ))}
        <span className="services__counter">
          {SERVICES[active].number} / 0{SERVICES.length}
        </span>
      </div>

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
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: '12px',
                color: 'hsl(var(--gem-gold))',
                display: 'block',
                marginTop: '8px',
                marginBottom: '12px',
              }}>
                from {format(s.priceUsd)}{s.priceSuffix}
              </span>
              <a
                href="/book"
                className="services__explore"
                onClick={(e) => { e.preventDefault(); navigateTo("/book", "crash"); }}
              >
                Explore <span className="services__arrow">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      <WaveDivider variant="sand" height={120} />
    </section>
  );
};

export default Services;
