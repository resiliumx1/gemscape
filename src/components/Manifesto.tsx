import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WaveDivider from "@/components/WaveDivider";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  { text: "We're not a booking engine.", highlight: false },
  { text: "We're a small, proudly Antiguan team", highlight: false },
  { text: "who knows every hidden bay,", highlight: false },
  { text: "every back road, every pilot by name.", highlight: false },
  { text: "When you travel with Gemscape,", highlight: true },
  { text: "you don't get a package —", highlight: false },
  { text: "you get an insider.", highlight: true },
];

const Manifesto = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!linesRef.current) return;
      const lines = linesRef.current.querySelectorAll(".manifesto__line");

      lines.forEach((line, i) => {
        gsap.fromTo(
          line,
          { opacity: 0.08, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              end: "top 55%",
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="manifesto" style={{ background: '#0B2A3B' }}>
      <div className="manifesto__watermark" aria-hidden="true">ANTIGUA</div>
      <div className="manifesto__content" style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <span className="manifesto__mark">{"\u201C"}</span>
        <div ref={linesRef} className="manifesto__quote" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LINES.map((line, i) => (
            <span
              key={i}
              className="manifesto__line"
              style={{
                display: "block",
                opacity: 0.08,
                color: line.highlight ? "#b8956a" : "white",
                fontWeight: line.highlight ? 500 : 300,
              }}
            >
              {line.text}
            </span>
          ))}
        </div>
        <p className="manifesto__attr">— Gemscape Travel &amp; Tours, St. John's, Antigua</p>
      </div>
      <WaveDivider variant="ocean" height={120} />
    </section>
  );
};

export default Manifesto;
