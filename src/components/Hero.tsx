import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wave } from "./Wave";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current && heroRef.current) {
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

      // Page load sequence — exact timing
      gsap.fromTo(eyebrowRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out", delay: 0.4 });
      gsap.fromTo(line1Ref.current, { opacity: 0, y: 64 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.7 });
      gsap.fromTo(line2Ref.current, { opacity: 0, y: 64 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.95 });
      gsap.fromTo(line3Ref.current, { opacity: 0, y: 64 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 1.15 });
      gsap.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 1.4 });
      gsap.fromTo(trustRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 1.55 });
      gsap.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 1.7 });
      gsap.fromTo(scrollIndRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power3.out", delay: 2.1 });

      if (scrollIndRef.current) {
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: "200px top",
          onUpdate: (self) => {
            if (scrollIndRef.current) {
              scrollIndRef.current.style.opacity = String(1 - self.progress);
            }
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <section ref={heroRef} className="hero">
        {/* Background image with parallax */}
        <div
          ref={bgRef}
          className="hero__bg"
          role="img"
          aria-label="Aerial view of Antigua's turquoise Caribbean coastline"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=2000&q=85')`,
          }}
        />

        {/* Gradient overlays */}
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-top" />

        {/* Content */}
        <div className="hero__content">
          <span ref={eyebrowRef} className="eyebrow" style={{ opacity: 0 }}>
            Antigua · Caribbean
          </span>

          <h1 className="hero__headline">
            <div ref={line1Ref} style={{ opacity: 0 }}>Where Every Journey</div>
            <div ref={line2Ref} style={{ opacity: 0 }}>Becomes a</div>
            <div ref={line3Ref} className="hero__gem" style={{ opacity: 0 }}>Gem.</div>
          </h1>

          <p ref={subRef} className="hero__sub" style={{ opacity: 0 }}>
            Private rentals, island circumnavigation, and flight concierge — crafted for those who demand the extraordinary.
          </p>

          <div ref={ctaRef} className="hero__cta" style={{ opacity: 0 }}>
            <a href="#experiences" className="hero__btn-primary">
              <span className="hero__btn-shimmer" />
              Explore Experiences
            </a>
            <a href="#contact" className="hero__btn-secondary">
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndRef} className="hero__scroll" style={{ opacity: 0 }}>
          <span>scroll</span>
          <div className="hero__scroll-line" />
        </div>

        {/* Vertical side text (desktop) */}
        <div className="hero__side-text">
          Antigua · Est. 2024 · Travel &amp; Tours
        </div>
      </section>

      {/* Waves sit OUTSIDE hero overflow:hidden */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "120px", zIndex: 10 }}>
        <Wave color="#D6EAE9" height={120} speed={0.3} offset={0} />
        <Wave color="#F5EFE0" height={100} speed={0.5} offset={300} />
      </div>
    </div>
  );
};

export default Hero;
