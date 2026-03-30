import { useEffect, useRef } from "react";
import { useWaveNav } from "@/components/PageTransitionWave";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CtaBanner = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWaveNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (imgRef.current && sectionRef.current) {
        gsap.to(imgRef.current, {
          yPercent: -20, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="cta-banner">
      <img
        ref={imgRef}
        src="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=2000&q=85"
        alt="Aerial view of turquoise Caribbean waters meeting white sand beach"
        className="cta-banner__bg"
        loading="lazy"
        width={2000}
        height={1333}
      />
      <div className="cta-banner__overlay" />

      <div ref={contentRef} className="cta-banner__content" style={{ opacity: 0 }}>
        <span className="eyebrow cta-banner__eyebrow">Start Your Journey</span>
        <h2 className="cta-banner__h2">Ready to Discover Antigua?</h2>
        <p className="cta-banner__sub">
          Tell us what you're dreaming of. We'll make it happen.
        </p>
        <div className="cta-banner__buttons">
          <button
            className="cta-banner__btn-primary shimmer-button"
            onClick={() => navigateTo("/book")}
          >
            <span className="cta-banner__btn-shimmer" />
            Start Planning
          </button>
          <a
            href="https://wa.me/12687644367"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-banner__btn-whatsapp"
          >
            WhatsApp Us Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
