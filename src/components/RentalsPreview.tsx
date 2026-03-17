import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VEHICLES_DATA = [
  {
    name: "Toyota Land Cruiser",
    category: "SUV",
    rateUsd: 120,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=85",
    style: { transform: "rotate(-2deg) scale(0.92)", top: "0px", right: "0px", zIndex: 1 },
  },
  {
    name: "Jeep Wrangler",
    category: "Open-Air",
    rateUsd: 95,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=85",
    style: { transform: "rotate(1deg)", top: "40px", right: "40px", zIndex: 2 },
  },
  {
    name: "Hyundai Tucson",
    category: "Sedan / SUV",
    rateUsd: 75,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=85",
    style: { transform: "rotate(-0.5deg) translateY(-12px)", top: "80px", right: "80px", zIndex: 3 },
  },
];

const STATS = [
  { value: "12+", label: "Vehicles" },
  { value: "3", label: "Pickup Points" },
  { value: "24/7", label: "Support" },
];

const RentalsPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: leftRef.current,
              start: "top 72%",
            },
          }
        );
      }

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: i * 0.15,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rentals-preview"
      style={{
        background: "hsl(var(--gem-navy))",
        padding: "140px 80px",
      }}
      className="rentals-preview"
    >
      <div className="rentals-preview__grid">
        {/* Left column */}
        <div ref={leftRef} className="rentals-preview__left">
          <span className="eyebrow eyebrow--aqua">Private Rentals</span>

          <h2 className="rentals-preview__h2">
            Your Island.
            <br />
            Your Wheels.
          </h2>

          <p className="rentals-preview__body">
            From luxury SUVs built for Antigua's rugged interior to open-air Jeeps made for
            chasing the coast — our fleet is hand-curated for the kind of freedom that no
            tour bus can offer. Pick up from your hotel, the airport, or English Harbour marina.
          </p>

          <div className="rentals-preview__stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="rentals-preview__stat">
                <span className="rentals-preview__stat-value">{stat.value}</span>
                <span className="rentals-preview__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="rentals-preview__ctas">
            <Link to="/rentals" className="rentals-preview__btn rentals-preview__btn--primary">
              Browse the Fleet
            </Link>
            <Link to="/rentals#book" className="rentals-preview__btn rentals-preview__btn--ghost">
              Book a Rental
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="rentals-preview__right">
          <div className="rentals-preview__cards">
            {VEHICLES.map((v, i) => (
              <div
                key={v.name}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="rentals-preview__card"
                style={{
                  ...v.style,
                  position: "absolute",
                  width: i === 2 ? "340px" : i === 1 ? "320px" : "300px",
                  boxShadow: i === 2 ? "0 24px 64px rgba(11,42,59,0.40)" : "0 12px 40px rgba(11,42,59,0.20)",
                }}
              >
                <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                  <img
                    src={v.image}
                    alt={v.name}
                    loading="lazy"
                    width={800}
                    height={450}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: "20px",
                    color: "hsl(var(--gem-navy))",
                  }}>
                    {v.name}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "hsl(var(--gem-gold))",
                    marginTop: "4px",
                  }}>
                    {v.category}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "hsl(var(--gem-navy) / 0.6)",
                    marginTop: "4px",
                  }}>
                    from {v.rate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalsPreview;
