import { useEffect, useRef, useState, useMemo } from "react";

const LOGO_SRC = "/images/gemscape-logo.png";

const B = {
  navy: "#05181e", navyDeep: "#030f13", navyMid: "#0a2a35",
  teal: "#1a8a9e", tealLight: "#5ec8e0",
  gold: "#C9A84C", goldLight: "#E8C96A",
};

function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: (Math.random() * 100).toFixed(1),
      y: (Math.random() * 100).toFixed(1),
      sz: (Math.random() * 2.2 + 0.4).toFixed(1),
      dl: (Math.random() * 6).toFixed(2),
      dur: (Math.random() * 3 + 2).toFixed(2),
      op: (Math.random() * 0.45 + 0.12).toFixed(2),
    })), []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.sz}px`, height: `${s.sz}px`, borderRadius: "50%",
          background: "white", opacity: s.op,
          animation: `gs-twinkle ${s.dur}s ${s.dl}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

export default function CinematicIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [phase, setPhase] = useState("hidden");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("reveal"), 200),
      setTimeout(() => setPhase("shimmer"), 2000),
      setTimeout(() => setPhase("wave"), 4500),
      setTimeout(() => { setPhase("done"); onComplete?.(); }, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "wave") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const DURATION = 1500;
    let startTime = null, t = 0;
    const layers = [
      { amp: 42, freq: 0.006, spd: 0.9, ph: 0.0, color: B.navyMid, alpha: 1.0 },
      { amp: 30, freq: 0.012, spd: 1.7, ph: 1.4, color: B.teal, alpha: 0.28 },
      { amp: 24, freq: 0.008, spd: 0.65, ph: 2.9, color: B.navyDeep, alpha: 1.0 },
    ];
    const ease = x => x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
    function frame(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / DURATION, 1);
      const eased = ease(progress);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      [...layers].reverse().forEach(layer => {
        const baseY = canvas.height * (1 - eased);
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = baseY
            + Math.sin(x * layer.freq + t * layer.spd + layer.ph) * layer.amp
            + Math.sin(x * layer.freq * 2.1 + t * layer.spd * 0.6 + layer.ph + 1.2) * layer.amp * 0.35;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height);
        ctx.closePath(); ctx.globalAlpha = layer.alpha; ctx.fillStyle = layer.color; ctx.fill();
      });
      ctx.globalAlpha = 1; t += 0.030;
      if (progress < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [phase]);

  if (phase === "done") return null;
  const isVisible = phase !== "hidden";
  const hasShimmer = phase === "shimmer" || phase === "wave";
  const isWaving = phase === "wave";

  return (
    <>
      <style>{`
        @keyframes gs-twinkle{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.85;transform:scale(1.7)}}
        @keyframes gs-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}
        @keyframes gs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
        @keyframes gs-glow{
          0%,100%{filter:drop-shadow(0 0 22px rgba(201,168,76,.6)) drop-shadow(0 0 55px rgba(26,138,158,.3)) drop-shadow(0 4px 40px rgba(0,0,0,.6))}
          50%{filter:drop-shadow(0 0 45px rgba(201,168,76,.95)) drop-shadow(0 0 95px rgba(94,200,224,.5)) drop-shadow(0 4px 40px rgba(0,0,0,.6))}
        }
        @keyframes gs-sweep{0%{transform:translateX(-150%) skewX(-14deg);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(280%) skewX(-14deg);opacity:0}}
        @keyframes gs-slogan{from{opacity:0;letter-spacing:18px}to{opacity:1;letter-spacing:7px}}
        @keyframes gs-rule{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: `radial-gradient(ellipse 85% 65% at 50% 32%, #0e3b4a 0%, ${B.navyDeep} 70%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Edge vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 38%, rgba(0,0,0,.72) 100%)",
          zIndex: 0,
        }} />

        {/* Ambient gold bloom */}
        <div style={{
          position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
          width: "60vmin", height: "60vmin", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,.09) 0%, transparent 70%)",
          animation: "gs-pulse 5s ease-in-out infinite", pointerEvents: "none", zIndex: 1,
        }} />

        <StarField />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(56px) scale(0.95)",
          transition: "opacity 2s cubic-bezier(.16,1,.3,1), transform 2s cubic-bezier(.16,1,.3,1)",
        }}>

          {/* Shimmer sweep overlay */}
          {hasShimmer && (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 5, pointerEvents: "none" }}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "35%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.04), rgba(232,201,106,.14), rgba(255,255,255,.22), rgba(94,200,224,.10), transparent)",
                animation: "gs-sweep 2.9s ease-in-out infinite .4s",
              }} />
            </div>
          )}

          {/* Logo */}
          <img
            src={LOGO_SRC}
            alt="Gemscape Travel and Tours"
            className="bg-transparent"
            style={{
              width: "clamp(260px, 46vw, 580px)", maxWidth: "86vw",
              height: "auto", display: "block",
              background: "none", backgroundColor: "transparent",
              position: "relative", zIndex: 3,
              animation: isVisible
                ? "gs-float 5s ease-in-out infinite 1s, gs-glow 4s ease-in-out infinite"
                : "none",
              userSelect: "none", WebkitUserDrag: "none",
            }}
          />

          {/* Gold divider rule */}
          <div style={{
            width: hasShimmer ? "min(380px, 70vw)" : 0,
            height: "1px", marginTop: 4,
            background: `linear-gradient(90deg, transparent, ${B.teal}, ${B.gold}, ${B.tealLight}, ${B.gold}, transparent)`,
            transition: "width 1.5s cubic-bezier(.16,1,.3,1) .1s",
            transformOrigin: "center",
            animation: hasShimmer ? "gs-rule 1.5s ease forwards" : "none",
          }} />

          {/* Slogan */}
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontWeight: 300,
            fontSize: "clamp(11px, 1.75vw, 15px)",
            color: B.tealLight, letterSpacing: "7px",
            textTransform: "uppercase", margin: "16px 0 0",
            opacity: 0,
            animation: hasShimmer ? "gs-slogan 1.6s cubic-bezier(.16,1,.3,1) .45s forwards" : "none",
            userSelect: "none",
          }}>
            Where Every Journey Becomes a Gem
          </p>

          {/* Gem-light ping dots */}
          {hasShimmer && (
            <div style={{
              display: "flex", gap: 10, marginTop: 18, opacity: 0,
              animation: "gs-slogan .8s ease .9s forwards",
            }}>
              {[B.gold, B.tealLight, B.gold].map((c, i) => (
                <div key={i} style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: c, boxShadow: `0 0 8px ${c}`,
                  animation: `gs-pulse ${1.8 + i * 0.3}s ease-in-out infinite ${i * 0.4}s`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Wave canvas */}
        <canvas ref={canvasRef} style={{
          position: "absolute", inset: 0, zIndex: 4,
          pointerEvents: "none", display: isWaving ? "block" : "none",
        }} />
      </div>
    </>
  );
}
