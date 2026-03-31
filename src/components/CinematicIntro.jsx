import { useEffect, useRef, useState, useMemo } from "react";

const LOGO_SRC = "/images/gemscape-logo.png";

const C = {
  navy:     "#05181e",
  deep:     "#030f13",
  mid:      "#0a2a35",
  teal:     "#1a8a9e",
  tealLt:   "#2cb8a8",
  tealGlow: "#5ec8e0",
  gold:     "#C9A84C",
  goldLt:   "#E8C96A",
};

/* ── Particle field ── */
function Particles() {
  const list = useMemo(() =>
    Array.from({ length: 140 }, (_, i) => ({
      id: i,
      x: +(Math.random() * 100).toFixed(2),
      y: +(Math.random() * 100).toFixed(2),
      sz: +(Math.random() * 2.2 + 0.3).toFixed(2),
      dl: +(Math.random() * 7).toFixed(2),
      dur: +(Math.random() * 3.5 + 2).toFixed(2),
      op: +(Math.random() * 0.45 + 0.08).toFixed(2),
      col: Math.random() > 0.85 ? C.goldLt :
           Math.random() > 0.7  ? C.tealGlow : "#fff",
    })), []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {list.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.sz}px`,
          height: `${p.sz}px`,
          borderRadius: "50%",
          background: p.col,
          opacity: p.op,
          animation: `ci-twinkle ${p.dur}s ${p.dl}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Orbiting gem shards ── */
function GemShards({ visible }) {
  const shards = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: i * 45,
      dist: 190 + Math.random() * 50,
      size: 3 + Math.random() * 5,
      delay: i * 0.15,
      col: i % 2 === 0 ? C.tealGlow : C.gold,
    })), []);

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.8s ease",
    }}>
      {shards.map(s => {
        const rad = (s.angle * Math.PI) / 180;
        const x = Math.cos(rad) * s.dist;
        const y = Math.sin(rad) * s.dist;
        return (
          <div key={s.id} style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: s.col,
            boxShadow: `0 0 ${s.size * 3}px ${s.col}`,
            transform: visible
              ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              : `translate(-50%, -50%)`,
            transition: `transform 1.2s cubic-bezier(.16,1,.3,1) ${s.delay}s`,
            animation: visible ? `ci-dot ${(1.8 + s.delay)}s ease-in-out infinite ${s.delay + 1}s` : "none",
          }} />
        );
      })}
    </div>
  );
}

/* ── Radial light rays ── */
function LightRays({ visible }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
      opacity: visible ? 1 : 0,
      transition: "opacity 1s ease 0.3s",
    }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "2px",
          height: "35vh",
          background: `linear-gradient(to top, transparent, ${i % 3 === 0 ? C.gold : C.tealGlow}44, transparent)`,
          transformOrigin: "bottom center",
          transform: `translateX(-50%) rotate(${i * 30}deg)`,
          animation: visible ? `ci-ray ${2 + (i % 3) * 0.5}s ease-in-out infinite ${i * 0.15}s` : "none",
        }} />
      ))}
    </div>
  );
}

/* ── Canvas wave wipe ── */
function WaveCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DURATION = 700;
    let start = null;
    let t = 0;

    const layers = [
      { amp: 52, freq: 0.005, spd: 1.1, ph: 0.0, color: C.mid,    alpha: 1.0 },
      { amp: 32, freq: 0.010, spd: 2.0, ph: 1.6, color: C.teal,   alpha: 0.22 },
      { amp: 26, freq: 0.007, spd: 0.7, ph: 3.1, color: C.deep,   alpha: 1.0 },
      { amp: 16, freq: 0.014, spd: 1.5, ph: 0.8, color: C.tealLt, alpha: 0.12 },
    ];

    const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    function frame(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / DURATION, 1);
      const ep = ease(prog);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      [...layers].reverse().forEach(l => {
        const baseY = canvas.height * (1 - ep);
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = baseY
            + Math.sin(x * l.freq + t * l.spd + l.ph) * l.amp
            + Math.sin(x * l.freq * 1.8 + t * l.spd * 0.7 + l.ph + 1) * l.amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.globalAlpha = l.alpha;
        ctx.fillStyle = l.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      t += 0.025;
      if (prog < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, zIndex: 10,
      pointerEvents: "none",
      display: active ? "block" : "none",
    }} />
  );
}

/* ── Main CinematicIntro ── */
export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState("hidden");

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase("reveal"),   100),
      setTimeout(() => setPhase("glow"),      500),
      setTimeout(() => setPhase("shimmer"),  1400),
      setTimeout(() => setPhase("wave"),     2700),
      setTimeout(() => { setPhase("done"); onComplete?.(); }, 3500),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const isVisible  = phase !== "hidden";
  const hasGlow    = ["glow", "shimmer", "wave"].includes(phase);
  const hasShimmer = ["shimmer", "wave"].includes(phase);
  const isWave     = phase === "wave";

  return (
    <>
      <style>{`
        @keyframes ci-twinkle {
          0%,100%{opacity:.08;transform:scale(1)}
          50%{opacity:.9;transform:scale(1.8)}
        }
        @keyframes ci-float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-14px)}
        }
        @keyframes ci-glow {
          0%,100%{
            filter:
              drop-shadow(0 0 22px rgba(201,168,76,.6))
              drop-shadow(0 0 55px rgba(26,138,158,.28))
              drop-shadow(0 4px 35px rgba(0,0,0,.55));
          }
          50%{
            filter:
              drop-shadow(0 0 55px rgba(201,168,76,1))
              drop-shadow(0 0 110px rgba(94,200,224,.6))
              drop-shadow(0 0 170px rgba(44,184,168,.22))
              drop-shadow(0 4px 35px rgba(0,0,0,.55));
          }
        }
        @keyframes ci-shimmer {
          0%{transform:translateX(-160%) skewX(-14deg);opacity:0}
          12%{opacity:1}88%{opacity:1}
          100%{transform:translateX(300%) skewX(-14deg);opacity:0}
        }
        @keyframes ci-slogan {
          from{opacity:0;letter-spacing:20px}
          to{opacity:1;letter-spacing:7px}
        }
        @keyframes ci-rule {
          from{transform:scaleX(0);opacity:0}
          to{transform:scaleX(1);opacity:1}
        }
        @keyframes ci-dot {
          0%,100%{transform:scale(1);opacity:.7}
          50%{transform:scale(1.6);opacity:1}
        }
        @keyframes ci-ray {
          0%,100%{opacity:.4}50%{opacity:1}
        }
        @keyframes ci-breathe {
          0%,100%{transform:translateX(-50%) scale(1);opacity:.7}
          50%{transform:translateX(-50%) scale(1.15);opacity:1}
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: `radial-gradient(ellipse 85% 65% at 50% 32%, #0e3b4a 0%, ${C.deep} 70%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 38%, rgba(0,0,0,.72) 100%)",
          zIndex: 0,
        }} />

        {/* Teal bloom top */}
        <div style={{
          position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)",
          width: "55vmin", height: "55vmin", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,138,158,.12) 0%, transparent 70%)",
          animation: hasGlow ? "ci-breathe 4s ease-in-out infinite" : "none",
          pointerEvents: "none", zIndex: 1,
        }} />

        {/* Gold bloom bottom */}
        <div style={{
          position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)",
          width: "45vmin", height: "45vmin", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,.08) 0%, transparent 70%)",
          animation: hasGlow ? "ci-breathe 5s ease-in-out infinite 1s" : "none",
          pointerEvents: "none", zIndex: 1,
        }} />

        <Particles />
        <LightRays visible={hasShimmer} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 5,
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(56px) scale(0.95)",
          transition: "opacity 1.5s cubic-bezier(.16,1,.3,1), transform 1.5s cubic-bezier(.16,1,.3,1)",
        }}>
          <GemShards visible={hasGlow} />

          {/* Shimmer sweep */}
          {hasShimmer && (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 6, pointerEvents: "none" }}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "35%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.04), rgba(232,201,106,.14), rgba(255,255,255,.22), rgba(94,200,224,.10), transparent)",
                animation: "ci-shimmer 2.4s ease-in-out infinite .3s",
              }} />
            </div>
          )}

          {/* LOGO */}
          <img
            src={LOGO_SRC}
            alt="Gemscape Travel and Tours"
            style={{
              width: "clamp(280px, 50vw, 620px)",
              maxWidth: "88vw",
              height: "auto",
              display: "block",
              background: "transparent",
              position: "relative",
              zIndex: 3,
              animation: isVisible
                ? "ci-float 4.5s ease-in-out infinite 0.8s, ci-glow 3.5s ease-in-out infinite"
                : "none",
              userSelect: "none",
            }}
          />

          {/* Gold rule */}
          <div style={{
            width: hasShimmer ? "min(380px, 70vw)" : 0,
            height: "1px",
            marginTop: 4,
            background: `linear-gradient(90deg, transparent, ${C.teal}, ${C.gold}, ${C.tealGlow}, ${C.gold}, transparent)`,
            transition: "width 1.2s cubic-bezier(.16,1,.3,1) .1s",
            transformOrigin: "center",
            animation: hasShimmer ? "ci-rule 1.2s ease forwards" : "none",
          }} />

          {/* Slogan */}
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(11px, 1.75vw, 15px)",
            color: C.tealGlow,
            letterSpacing: "7px",
            textTransform: "uppercase",
            margin: "16px 0 0",
            opacity: 0,
            animation: hasShimmer ? "ci-slogan 1.2s cubic-bezier(.16,1,.3,1) .35s forwards" : "none",
            userSelect: "none",
          }}>
            Where Every Journey Becomes a Gem
          </p>

          {/* Pulsing dots */}
          {hasShimmer && (
            <div style={{
              display: "flex", gap: 10, marginTop: 18, opacity: 0,
              animation: "ci-slogan .7s ease .6s forwards",
            }}>
              {[C.gold, C.tealLt, C.gold].map((col, i) => (
                <div key={i} style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: col,
                  boxShadow: `0 0 8px ${col}`,
                  animation: `ci-dot ${1.8 + i * 0.3}s ease-in-out infinite ${i * 0.3}s`,
                }} />
              ))}
            </div>
          )}
        </div>

        <WaveCanvas active={isWave} />
      </div>
    </>
  );
}
