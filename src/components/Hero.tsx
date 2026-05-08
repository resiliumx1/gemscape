import { useEffect, useRef } from "react";
import { useWave } from "@/components/WavePageTransition";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaveDivider from "./WaveDivider";
const heroImage = "/images/hero-antigua-sunset.webp";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current && heroRef.current) {
        gsap.to(bgRef.current, {
          scale: 1.0, y: -60, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
        });
      }

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
          start: "250px top",
          onEnter: () => {
            gsap.to(scrollIndRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.5 });
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <section ref={heroRef} className="hero">
        <div
          ref={bgRef}
          className="hero__bg"
          role="img"
          aria-label="Aerial view of Antigua's turquoise Caribbean coastline"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-top" />

        <div className="hero__content">
          <span ref={eyebrowRef} className="eyebrow" style={{ opacity: 0 }}>
            <span className="hero-country-shimmer">Antigua &amp; Barbuda</span> · Caribbean
          </span>

          <h1 className="hero__headline">
            <div ref={line1Ref} style={{ opacity: 0 }}>Where Every Journey</div>
            <div ref={line2Ref} style={{ opacity: 0 }}>Becomes a</div>
            <div ref={line3Ref} className="hero__gem" style={{ opacity: 0 }}><span className="gem-text-effect" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 }}>Gem.</span></div>
          </h1>

          <p ref={subRef} className="hero__sub" style={{ opacity: 0 }}>
            Curated Caribbean experiences designed around peace, beauty, and connection — shaped with care from inquiry to arrival.
          </p>

          <div ref={trustRef} style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8965A', display: 'inline-block' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>
              Personalized Caribbean coordination · Local insight · Trusted support
            </span>
          </div>

          <div ref={ctaRef} className="hero__cta" style={{ opacity: 0 }}>
            <a
              href="/book"
              className="hero__btn-primary shimmer-button"
              onClick={(e) => { e.preventDefault(); navigateTo("/book"); }}
            >
              <span className="hero__btn-shimmer" />
              Explore Experiences
            </a>
            <a
              href="/build-itinerary"
              className="hero__btn-secondary book-now-btn"
              onClick={(e) => { e.preventDefault(); navigateTo("/build-itinerary"); }}
              style={{ borderColor: 'hsl(var(--gem-gold))', color: 'hsl(var(--gem-gold))', background: 'rgba(184,150,90,0.1)' }}
            >
              Build My Itinerary
            </a>
          </div>
        </div>

        <div ref={scrollIndRef} className="hero__scroll" style={{ opacity: 0 }}>
          <span>scroll</span>
          <div className="hero__scroll-line" />
        </div>

        <div className="hero__side-text">
          Antigua &amp; Barbuda · Est. 2024 · Travel &amp; Tours
        </div>
      </section>

      <WaveDivider variant="sand" height={160} />
    </div>
  );
};

export default Hero;
