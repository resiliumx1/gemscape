import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  { title: "Locally Owned", desc: "Born and raised in Antigua — we know every corner of this island." },
  { title: "Fully Bespoke", desc: "No fixed packages. Only your preferences, your pace, your way." },
  { title: "End-to-End", desc: "From landing to departure, we coordinate every single detail." },
  { title: "Premium Partners", desc: "Access to Antigua's finest vendors, venues, and vessels." },
];

const WhyGemscape = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.0, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
      );
      pillarRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: i * 0.15, scrollTrigger: { trigger: el, start: "top 85%" } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="why-gemscape">
      <div className="why-gemscape__inner">
        <div ref={headerRef}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>Why Gemscape</span>
          <h2 className="why-gemscape__h2">
            Antigua is Our Home.<br />Your Experience is Our Craft.
          </h2>
          <p className="why-gemscape__body">
            We're not a booking engine. We're a small, proudly Antiguan team who knows every bay, every pilot, every road. When you travel with Gemscape, you're not getting a package — you're getting an insider.
          </p>
        </div>

        <div className="why-gemscape__pillars">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              ref={(el) => { pillarRefs.current[i] = el; }}
              className="pillar"
            >
              <span className="pillar__mark">◆</span>
              <h3 className="pillar__title">{p.title}</h3>
              <p className="pillar__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGemscape;
