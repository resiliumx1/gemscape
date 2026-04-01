import { useEffect, useRef, useState, useCallback } from "react";
import { useWaveNav } from "@/components/WavePageTransition";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_VEHICLES = [
  {
    name: "Toyota Land Cruiser",
    category: "SUV",
    daily_rate: 120,
    image_url: "/images/experiences/jeep-beach-palms.webp",
    seats: 7,
    transmission: "Automatic",
  },
  {
    name: "Jeep Wrangler",
    category: "Open-Air",
    daily_rate: 95,
    image_url: "/images/experiences/catamaran-white-beach.webp",
    seats: 4,
    transmission: "Manual",
  },
  {
    name: "Hyundai Tucson",
    category: "Sedan / SUV",
    daily_rate: 75,
    image_url: "/images/experiences/airport-vip-greeting.webp",
    seats: 5,
    transmission: "Automatic",
  },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=85",
  "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=85",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=85",
];

const STATS = [
  { value: "12+", label: "Vehicles" },
  { value: "3", label: "Pickup Points" },
  { value: "24/7", label: "Support" },
];

type Vehicle = {
  name: string;
  category: string;
  daily_rate: number;
  image_url: string | null;
  seats: number;
  transmission: string;
};

const RentalsPreview = () => {
  const { format: formatPrice } = useCurrency();
  const { navigateTo } = useWaveNav();
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(FALLBACK_VEHICLES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch vehicles from DB
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("name, category, daily_rate, image_url, seats, transmission")
        .eq("available", true)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        setVehicles(data);
      }
    };
    fetchVehicles();
  }, []);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(leftRef.current, { opacity: 0, x: -40 }, {
          opacity: 1, x: 0, duration: 1.0, ease: "power3.out",
          scrollTrigger: { trigger: leftRef.current, start: "top 72%" },
        });
      }
      if (carouselRef.current) {
        gsap.fromTo(carouselRef.current, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: carouselRef.current, start: "top 80%" },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const goTo = useCallback((newIndex: number, dir: number) => {
    if (isAnimating || vehicles.length <= 1) return;
    setIsAnimating(true);
    setDirection(dir);
    setActiveIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, vehicles.length]);

  const prev = () => {
    const newIdx = activeIndex === 0 ? vehicles.length - 1 : activeIndex - 1;
    goTo(newIdx, -1);
  };

  const next = () => {
    const newIdx = activeIndex === vehicles.length - 1 ? 0 : activeIndex + 1;
    goTo(newIdx, 1);
  };

  // Auto-advance every 4s
  useEffect(() => {
    if (vehicles.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex(prev => prev === vehicles.length - 1 ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [vehicles.length]);

  const getCardStyle = (index: number): React.CSSProperties => {
    const total = vehicles.length;
    let offset = index - activeIndex;
    // Wrap around
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const isActive = offset === 0;
    const absOffset = Math.abs(offset);

    if (absOffset > 2) {
      return { opacity: 0, transform: "scale(0.7) translateX(0px)", zIndex: 0, pointerEvents: "none" };
    }

    return {
      opacity: isActive ? 1 : absOffset === 1 ? 0.6 : 0.3,
      transform: `translateX(${offset * 110}px) scale(${isActive ? 1 : 1 - absOffset * 0.12}) rotateY(${offset * -5}deg)`,
      zIndex: 10 - absOffset,
      pointerEvents: isActive ? "auto" : "none",
      filter: isActive ? "none" : `blur(${absOffset}px)`,
    } as React.CSSProperties;
  };

  const active = vehicles[activeIndex];
  const activeImg = active?.image_url || FALLBACK_IMAGES[activeIndex % FALLBACK_IMAGES.length];

  return (
    <section
      ref={sectionRef}
      id="rentals-preview"
      style={{ background: "hsl(var(--gem-navy))", padding: "100px 40px" }}
      className="rentals-preview"
    >
      <div className="rentals-preview__grid">
        {/* Left column */}
        <div ref={leftRef} className="rentals-preview__left">
          <span className="eyebrow eyebrow--aqua">Private Rentals</span>
          <h2 className="rentals-preview__h2">Your Island.<br />Your Wheels.</h2>
          <p className="rentals-preview__body">
            From luxury SUVs built for Antigua's rugged interior to open-air Jeeps made for
            chasing the coast — our fleet is hand-curated for the kind of freedom that no
            tour bus can offer.
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
            <button className="rentals-preview__btn rentals-preview__btn--primary" onClick={() => navigateTo("/rentals#fleet")}>
              Browse the Fleet
            </button>
            <button className="rentals-preview__btn rentals-preview__btn--ghost" onClick={() => navigateTo("/rentals")}>
              Book a Rental
            </button>
          </div>
        </div>

        {/* Right column — Carousel */}
        <div ref={carouselRef} className="rentals-preview__right" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          {/* Cards stack */}
          <div style={{
            position: "relative",
            width: "360px",
            height: "340px",
            perspective: "1200px",
          }}>
            {vehicles.map((v, i) => {
              const img = v.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              return (
                <div
                  key={`${v.name}-${i}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "hsl(var(--gem-white))",
                    boxShadow: i === activeIndex
                      ? "0 24px 64px rgba(11,42,59,0.45), 0 0 0 1px rgba(44,184,168,0.15)"
                      : "0 8px 32px rgba(11,42,59,0.2)",
                    transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    ...getCardStyle(i),
                  }}
                >
                  <div style={{ aspectRatio: "16/10", overflow: "hidden" }}>
                    <img
                      src={img}
                      alt={`${v.name} available for rental in Antigua & Barbuda`}
                      loading="lazy"
                      width={800}
                      height={500}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackUsed) {
                          target.dataset.fallbackUsed = "true";
                          target.src = "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=85";
                        }
                      }}
                    />
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: "22px",
                      color: "hsl(var(--gem-navy))",
                    }}>
                      {v.name}
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "6px",
                    }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        color: "hsl(var(--gem-gold))",
                      }}>
                        {v.category} · {v.seats} seats · {v.transmission}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "hsl(var(--gem-navy) / 0.7)",
                      }}>
                        {formatPrice(v.daily_rate)}<span style={{ fontSize: "11px", fontWeight: 300 }}>/day</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={prev}
              aria-label="Previous vehicle"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(44,184,168,0.3)",
                background: "rgba(44,184,168,0.08)",
                color: "hsl(var(--gem-aqua))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,184,168,0.2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,184,168,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,184,168,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,184,168,0.3)";
              }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: "8px" }}>
              {vehicles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
                  aria-label={`Go to vehicle ${i + 1}`}
                  style={{
                    width: i === activeIndex ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    border: "none",
                    background: i === activeIndex ? "hsl(var(--gem-aqua))" : "rgba(255,255,255,0.2)",
                    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next vehicle"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(44,184,168,0.3)",
                background: "rgba(44,184,168,0.08)",
                color: "hsl(var(--gem-aqua))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,184,168,0.2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,184,168,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(44,184,168,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,184,168,0.3)";
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Counter */}
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.1em",
          }}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(vehicles.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalsPreview;
