import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaveDivider from "./WaveDivider";

gsap.registerPlugin(ScrollTrigger);

const QUOTE =
  "We're not a booking engine. We're a small, proudly Antiguan team who knows every bay, every pilot, every road. When you travel with Gemscape, you're not getting a package — you're getting an insider.";

const Manifesto = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!wordsRef.current) return;
      const words = wordsRef.current.querySelectorAll(".manifesto__word");
      gsap.fromTo(
        words,
        { opacity: 0.12, color: "rgba(255,255,255,0.12)" },
        {
          opacity: 1,
          color: "white",
          stagger: 0.05,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1.5,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="manifesto">
      <div className="manifesto__watermark" aria-hidden="true">ANTIGUA</div>
      <div className="manifesto__content">
        <span className="manifesto__mark">{"\u201C"}</span>
        <div ref={wordsRef} className="manifesto__quote">
          {QUOTE.split(" ").map((word, i) => (
            <span key={i} className="manifesto__word">
              {word}{" "}
            </span>
          ))}
        </div>
        <p className="manifesto__attr">— Gemscape Travel &amp; Tours, St. John's, Antigua</p>
      </div>
      <WaveDivider fillColor="hsl(37, 47%, 92%)" />
    </section>
  );
};

export default Manifesto;
