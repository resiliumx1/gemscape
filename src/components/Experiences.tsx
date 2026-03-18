import { useEffect, useRef } from "react";
import { useWave } from "@/components/GemscapeWave";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
    category: "Water & Sea",
    title: "Island Circumnavigation",
    desc: "Full-island private tour — every cove, every beach, every hidden bay.",
    alt: "Private sailing catamaran on Antigua waters",
  },
  {
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=85",
    category: "Land & Culture",
    title: "Heritage & Discovery",
    desc: "History, local rum, and roads no tourist map would ever show you.",
    alt: "Aerial island coastline view from Gemscape circumnavigation tour",
  },
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85",
    category: "Arrival & Departure",
    title: "Flight Concierge",
    desc: "From wheels down to your first sunset drink. We handle everything.",
    alt: "Golden hour flight view — Gemscape flight concierge Antigua",
  },
];

const Experiences = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.1,
            ease: "power4.out",
            delay: i * 0.18,
            scrollTrigger: { trigger: el, start: "top 82%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experiences" className="experiences">
      <div className="experiences__header">
        <span className="eyebrow">Curated Experiences</span>
        <h2 className="experiences__h2">
          Antigua Seen Differently<span className="experiences__dot">.</span>
        </h2>
        <p className="experiences__intro">
          Every journey we design is a private, unhurried encounter with the most beautiful island in the Caribbean.
        </p>
      </div>

      <div className="experiences__grid">
        {CARDS.map((card, i) => (
          <div key={card.title} className="exp-card">
            <div
              ref={(el) => { wrapperRefs.current[i] = el; }}
              className="exp-card__img-wrap"
            >
              <img
                src={card.image}
                alt={card.alt}
                className="exp-card__img"
                loading="lazy"
                width={800}
                height={1200}
              />
            </div>
            <div className="exp-card__body">
              <span className="exp-card__cat">{card.category}</span>
              <h3 className="exp-card__title">{card.title}</h3>
              <p className="exp-card__desc">{card.desc}</p>
              <a
                href="/book"
                className="exp-card__link"
                onClick={(e) => { e.preventDefault(); navigate("/book"); }}
              >
                Discover <span className="exp-card__arrow">→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experiences;
