import { useEffect, useRef } from "react";

type WaveDividerVariant = "teal" | "sand" | "flip" | "ocean";

interface WaveDividerProps {
  variant?: WaveDividerVariant;
  height?: number;
}

const PALETTES: Record<"teal" | "sand" | "ocean", { colors: string[]; opacities: number[] }> = {
  teal: {
    colors: ["#0d2a35", "#114050", "#15606e", "#187a8e", "#1a8a9e"],
    opacities: [0.95, 0.75, 0.55, 0.4, 0.25],
  },
  sand: {
    colors: ["#dcc8a5", "#e4d4b5", "#eaddc4", "#f2e8d5", "#fff8eb"],
    opacities: [0.95, 0.78, 0.6, 0.42, 0.28],
  },
  ocean: {
    colors: ["rgba(3,14,20,1)", "rgba(5,22,32,1)", "rgba(8,40,55,1)", "rgba(13,72,88,1)", "rgba(26,138,158,1)"],
    opacities: [0.97, 0.92, 0.82, 0.65, 0.35],
  },
};

const LAYERS = [
  { amp: 28, speed: 0.6, offset: 0, yPct: 0.58 },
  { amp: 22, speed: 0.9, offset: 1.2, yPct: 0.66 },
  { amp: 18, speed: 1.3, offset: 2.4, yPct: 0.73 },
  { amp: 14, speed: 1.7, offset: 0.8, yPct: 0.80 },
  { amp: 10, speed: 2.2, offset: 3.1, yPct: 0.87 },
];

const FOAM_COUNT = 40;
const FREQ = 0.004;

function waveY(x: number, t: number, amp: number, speed: number, offset: number): number {
  return (
    Math.sin(x * FREQ + t * speed * 0.012 + offset) * amp +
    Math.sin(x * FREQ * 1.6 - t * speed * 0.012 * 0.7 + offset) * amp * 0.4 +
    Math.sin(x * FREQ * 2.8 + t * speed * 0.012 * 1.2 + offset) * amp * 0.2
  );
}

const WaveDivider = ({ variant = "sand", height = 120 }: WaveDividerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const paletteKey = variant === "flip" ? "teal" : variant === "ocean" ? "ocean" : variant;

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;

    let W = 0;
    let H = 0;
    const dpr = window.devicePixelRatio || 1;

    // Pre-generate foam x-positions
    const foamXs = Array.from({ length: FOAM_COUNT }, () => Math.random());
    const foamPhases = Array.from({ length: FOAM_COUNT }, () => Math.random() * Math.PI * 2);

    function resize() {
      const rect = cvs!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      cvs!.width = W * dpr;
      cvs!.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const palette = PALETTES[paletteKey];
    let t = 0;

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Draw 5 layers
      for (let li = 0; li < 5; li++) {
        const layer = LAYERS[li];
        const baseY = H * layer.yPct;

        ctx.save();
        ctx.globalAlpha = palette.opacities[li];
        ctx.fillStyle = palette.colors[li];
        ctx.beginPath();
        ctx.moveTo(0, H);

        for (let x = 0; x <= W; x += 2) {
          const y = baseY + waveY(x, t, layer.amp, layer.speed, layer.offset);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Foam dots on layer 2 crest
      const foamLayer = LAYERS[1];
      const foamBaseY = H * foamLayer.yPct;
      for (let fi = 0; fi < FOAM_COUNT; fi++) {
        const fx = foamXs[fi] * W;
        const fy = foamBaseY + waveY(fx, t, foamLayer.amp, foamLayer.speed, foamLayer.offset);
        const pulse = 0.1 + 0.25 * (0.5 + 0.5 * Math.sin(t * 0.04 + foamPhases[fi]));
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fx, fy - 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [paletteKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: `${height}px`,
        zIndex: 10,
        pointerEvents: "none",
        ...(variant === "flip" ? { transform: "scaleY(-1)", bottom: "auto", top: 0 } : {}),
      }}
    />
  );
};

export default WaveDivider;
