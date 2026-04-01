import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const rentalsHeroBg = "/images/rentals-hero.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import RentalBookingForm from "@/components/RentalBookingForm";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCurrency } from "@/contexts/CurrencyContext";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { num: "01", title: "Choose Your Vehicle", desc: "Browse our curated fleet and select the perfect match." },
  { num: "02", title: "Pick Your Dates", desc: "Select pickup and return dates that work for your itinerary." },
  { num: "03", title: "We Deliver to You", desc: "We bring the vehicle to your hotel, marina, or the airport." },
  { num: "04", title: "Drive and Explore", desc: "Your rental includes full insurance and 24/7 support." },
];

const INCLUSIONS = [
  { title: "Full Insurance", desc: "Comprehensive cover included on every rental — no surprises." },
  { title: "24/7 Support", desc: "Our team is always reachable by phone or WhatsApp." },
  { title: "Flexible Pickup", desc: "Airport, hotel, marina — we come to you." },
  { title: "Free Cancellation", desc: "Cancel up to 48 hours before without charge." },
];

const CATEGORIES = ["All", "SUV", "Jeep", "Sedan", "Van", "Convertible"];

const Rentals = () => {
  const location = useLocation();
  const { format: formatPrice } = useCurrency();
  const [vehicles, setVehicles] = useState<Tables<"vehicles">[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; name: string } | null>(null);

  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const howRef = useRef<HTMLDivElement>(null);
  const stepNumRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("available", true)
        .order("sort_order", { ascending: true });
      if (data) setVehicles(data);
    };
    fetchVehicles();
  }, []);

  // Hash scroll
  useEffect(() => {
    if (location.hash === "#fleet" || location.hash === "#book") {
      setTimeout(() => {
        const target = location.hash === "#book" ? "rental-booking" : "fleet";
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  }, [location]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax
      if (bgRef.current && heroRef.current) {
        gsap.set(bgRef.current, { scale: 1.06 });
        gsap.to(bgRef.current, {
          scale: 1.0,
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Entrance
      gsap.fromTo(eyebrowRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out", delay: 0.3 });
      gsap.fromTo(h1Ref.current, { opacity: 0, y: 64 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.6 });
      gsap.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 1.0 });
      gsap.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 1.3 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Step number animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      stepNumRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.3, y: 30 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.8, ease: "back.out(1.7)", delay: i * 0.15,
            scrollTrigger: { trigger: howRef.current, start: "top 78%" },
          }
        );
      });
    }, howRef);
    return () => ctx.revert();
  }, []);

  // Card reveal animations
  useEffect(() => {
    if (vehicles.length === 0) return;
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0 0 0)", opacity: 0 },
          {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            duration: 1.1,
            ease: "power4.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: el, start: "top 82%" },
          }
        );
      });
    }, fleetRef);
    return () => ctx.revert();
  }, [vehicles, activeFilter]);

  // Lightbox: close on Escape, lock body scroll
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setLightboxImage(null);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [lightboxImage]);

  const filteredVehicles = activeFilter === "All"
    ? vehicles
    : vehicles.filter((v) => v.category.toLowerCase() === activeFilter.toLowerCase());

  const handleBookVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    document.getElementById("rental-booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Car Rental Antigua & Barbuda | Premium Fleet — Gemscape Travel & Tours</title>
        <meta name="description" content="Browse Gemscape's premium rental fleet in Antigua. SUVs, Jeeps, sedans delivered to your hotel, airport or marina. Full insurance & 24/7 support included." />
      </Helmet>
      <Navbar />

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="rentals-hero">
        <div
          ref={bgRef}
          className="rentals-hero__bg"
          style={{
            backgroundImage: `url('${rentalsHeroBg}')`,
          }}
        />
        <div className="rentals-hero__gradient-bottom" />
        <div className="rentals-hero__gradient-top" />

        <div className="rentals-hero__content">
          <span ref={eyebrowRef} className="eyebrow" style={{ opacity: 0 }}>
            Private Rentals · Antigua &amp; Barbuda
          </span>
          <h1 ref={h1Ref} className="rentals-hero__h1" style={{ opacity: 0 }}>
            Drive Antigua &amp; Barbuda
            <br />
            <em>Your Way.</em>
          </h1>
          <p ref={subRef} className="rentals-hero__sub" style={{ opacity: 0 }}>
            Premium vehicles delivered to your hotel, the airport, or English Harbour.
            <br />
            No queues. No compromises.
          </p>
          <div ref={ctaRef} style={{ opacity: 0 }}>
            <a
              href="#fleet"
              className="rentals-hero__cta"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse the Fleet ↓
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section ref={howRef} className="rentals-how">
        <div className="rentals-how__grid">
          {STEPS.map((step, i) => (
            <div key={step.num} className="rentals-how__step">
              <span
                ref={(el) => { stepNumRefs.current[i] = el; }}
                className="rentals-how__num"
                style={{ opacity: 0 }}
              >
                {step.num}
              </span>
              <span className="rentals-how__title">{step.title}</span>
              <span className="rentals-how__desc">{step.desc}</span>
              {i < STEPS.length - 1 && <div className="rentals-how__divider" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── FLEET GRID ─── */}
      <section ref={fleetRef} id="fleet" className="rentals-fleet">
        <div className="rentals-fleet__filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`rentals-fleet__pill ${activeFilter === cat ? "rentals-fleet__pill--active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="rentals-fleet__grid">
          {filteredVehicles.map((v, i) => (
            <div
              key={v.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="r-card"
            >
              <div
                className="r-card__img-wrap"
                onClick={() => setLightboxImage({
                  src: v.image_url || "/images/experiences/jeep-beach-palms.webp",
                  name: v.name,
                })}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <div className="r-card__img-overlay" style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(5,24,30,0.0)", transition: "background 0.3s ease", zIndex: 2, borderRadius: "inherit",
                }}>
                  <span className="r-card__zoom-icon" style={{
                    opacity: 0, transition: "opacity 0.3s ease", background: "rgba(5,24,30,0.6)", backdropFilter: "blur(4px)",
                    borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 18,
                  }}>⤢</span>
                </div>
                <img
                  src={v.image_url || "/images/experiences/jeep-beach-palms.webp"}
                  alt={`${v.name} available for rental in Antigua & Barbuda, Gemscape Travel`}
                  loading="lazy"
                  width={800}
                  height={500}
                  className="r-card__img"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallbackUsed) {
                      target.dataset.fallbackUsed = "true";
                      target.src = "/images/experiences/jeep-beach-palms.webp";
                    }
                  }}
                />
              </div>
              <div className="r-card__body">
                <span className="r-card__cat">{v.category}</span>
                <h3 className="r-card__name">{v.name}</h3>
                <div className="r-card__specs">
                  <span className="r-card__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {v.seats} seats
                  </span>
                  <span className="r-card__spec">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {v.transmission}
                  </span>
                  {v.ac && (
                    <span className="r-card__spec">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 16a4 4 0 0 1-4-4 4 4 0 0 1 4-4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4"/><path d="M12 8v8"/></svg>
                      AC
                    </span>
                  )}
                  {v.luggage_capacity && (
                    <span className="r-card__spec">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      {v.luggage_capacity} bags
                    </span>
                  )}
                </div>
                <div className="r-card__divider" />
                <div className="r-card__rate-row">
                  <div>
                    <span className="r-card__from">From</span>
                    <span className="r-card__price">{formatPrice(v.daily_rate)}</span>
                    <span className="r-card__per">/ day</span>
                  </div>
                  <button
                    className="r-card__book-link"
                    onClick={() => handleBookVehicle(v.id)}
                  >
                    Book This Vehicle <span className="r-card__arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INCLUSIONS BANNER ─── */}
      <section className="rentals-inclusions">
        <div className="rentals-inclusions__grid">
          {INCLUSIONS.map((inc) => (
            <div key={inc.title} className="rentals-inclusions__item">
              <span className="rentals-inclusions__diamond">◆</span>
              <h4 className="rentals-inclusions__title">{inc.title}</h4>
              <p className="rentals-inclusions__desc">{inc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOOKING FORM ─── */}
      <RentalBookingForm vehicles={vehicles} preselectedVehicleId={selectedVehicleId} />

      <Footer />
      <WhatsAppFab />

      {/* ─── Vehicle Lightbox ─── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(5, 24, 30, 0.92)", backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 20, padding: 24,
            animation: "lightboxFadeIn 0.3s ease forwards", cursor: "pointer",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
            aria-label="Close lightbox"
            style={{
              position: "absolute", top: 24, right: 24,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 48, height: 48,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", fontSize: 22, fontWeight: 400,
              transition: "all 0.3s ease", zIndex: 10001,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(44,184,168,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          >✕</button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "72vh", width: "auto", height: "auto",
              objectFit: "contain", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              animation: "lightboxZoomIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards", cursor: "default",
            }}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackUsed) {
                target.dataset.fallbackUsed = "true";
                target.src = "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=85";
              }
            }}
          />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: "#fff", opacity: 0.85, animation: "lightboxFadeIn 0.4s ease 0.15s both" }}>
            {lightboxImage.name}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
            Click anywhere or press Esc to close
          </span>
        </div>
      )}
    </>
  );
};

export default Rentals;
