import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Palettes per route ───────────────────────────────────────────────────────
type PaletteEntry = { r: number; g: number; b: number; a: number };

const PALETTES: Record<string, PaletteEntry[]> = {
  "/": [
    { r: 4, g: 20, b: 28, a: 0.98 },
    { r: 18, g: 62, b: 78, a: 0.85 },
    { r: 30, g: 105, b: 125, a: 0.68 },
    { r: 42, g: 148, b: 168, a: 0.52 },
    { r: 60, g: 185, b: 200, a: 0.4 },
  ],
  "/rentals": [
    { r: 25, g: 14, b: 0, a: 0.98 },
    { r: 80, g: 52, b: 8, a: 0.84 },
    { r: 140, g: 100, b: 30, a: 0.66 },
    { r: 185, g: 145, b: 55, a: 0.5 },
    { r: 220, g: 178, b: 90, a: 0.38 },
  ],
  "/concierge": [
    { r: 8, g: 12, b: 22, a: 0.98 },
    { r: 35, g: 55, b: 95, a: 0.82 },
    { r: 70, g: 100, b: 155, a: 0.62 },
    { r: 105, g: 140, b: 195, a: 0.46 },
    { r: 140, g: 175, b: 235, a: 0.32 },
  ],
  "/about": [
    { r: 4, g: 14, b: 7, a: 0.98 },
    { r: 15, g: 60, b: 28, a: 0.82 },
    { r: 30, g: 105, b: 52, a: 0.62 },
    { r: 42, g: 140, b: 72, a: 0.46 },
    { r: 55, g: 170, b: 95, a: 0.32 },
  ],
  "/contact": [
    { r: 22, g: 8, b: 3, a: 0.98 },
    { r: 95, g: 40, b: 15, a: 0.82 },
    { r: 160, g: 80, b: 38, a: 0.62 },
    { r: 200, g: 112, b: 58, a: 0.46 },
    { r: 235, g: 140, b: 80, a: 0.34 },
  ],
  "/book": [
    { r: 4, g: 20, b: 28, a: 0.98 },
    { r: 18, g: 62, b: 78, a: 0.85 },
    { r: 30, g: 105, b: 125, a: 0.68 },
    { r: 42, g: 148, b: 168, a: 0.52 },
    { r: 60, g: 185, b: 200, a: 0.4 },
  ],
};

function getPalette(path: string): PaletteEntry[] {
  const clean = path.split("?")[0].split("#")[0];
  return PALETTES[clean] || PALETTES["/"];
}

// ─── Wave math ────────────────────────────────────────────────────────────────
const LAYER_CONFIG = [
  { amp: 48, freq: 0.0028, speed: 0.38, offset: 0.0,  phase2: 0.8 },
  { amp: 36, freq: 0.0042, speed: 0.62, offset: 1.57, phase2: 2.1 },
  { amp: 26, freq: 0.0058, speed: 0.95, offset: 3.14, phase2: 0.5 },
  { amp: 18, freq: 0.0075, speed: 1.35, offset: 0.78, phase2: 3.8 },
  { amp: 11, freq: 0.0095, speed: 1.85, offset: 2.45, phase2: 1.2 },
];

const FREQ = 0.0032;

function waveY(x: number, t: number, amp: number, speed: number, offset: number, phase2: number): number {
  return (
    Math.sin(x * FREQ + t * speed + offset) * amp * 0.55 +
    Math.sin(x * FREQ * 1.42 - t * speed * 0.71 + phase2) * amp * 0.28 +
    Math.sin(x * FREQ * 2.37 + t * speed * 1.18 + offset * 0.5) * amp * 0.12 +
    Math.cos(x * FREQ * 0.61 + t * speed * 0.44 + phase2 * 0.7) * amp * 0.08 -
    amp * 0.03
  );
}

// ─── Foam ─────────────────────────────────────────────────────────────────────
const FOAM_COUNT = 45;
const foamXs = Array.from({ length: FOAM_COUNT }, () => Math.random());
const foamRadii = Array.from({ length: FOAM_COUNT }, () => 0.8 + Math.random() * 2.8);
const foamPhases = Array.from({ length: FOAM_COUNT }, () => Math.random() * Math.PI * 2);
const foamLayers = Array.from({ length: FOAM_COUNT }, () => Math.floor(Math.random() * 3));

// ─── Transition state ─────────────────────────────────────────────────────────
type TransitionState = "idle" | "covering" | "holding" | "revealing";

// ─── Context ──────────────────────────────────────────────────────────────────
interface WaveNavContextValue {
  navigateTo: (path: string) => void;
  transitionState: TransitionState;
}

const WaveNavContext = createContext<WaveNavContextValue>({
  navigateTo: () => {},
  transitionState: "idle",
});

export const useWaveNav = () => useContext(WaveNavContext);

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOut(t: number): number {
  // cubic-bezier(0.76, 0, 0.24, 1) approximation
  const clamped = Math.max(0, Math.min(1, t));
  let lo = 0, hi = 1;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const bx = 3 * 0.76 * mid * (1 - mid) ** 2 + 3 * 0.24 * mid ** 2 * (1 - mid) + mid ** 3;
    if (bx < clamped) lo = mid; else hi = mid;
  }
  const mt = (lo + hi) / 2;
  return 3 * 0 * mt * (1 - mt) ** 2 + 3 * 1 * mt ** 2 * (1 - mt) + mt ** 3;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Paint function ───────────────────────────────────────────────────────────
function paintWave(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  palette: PaletteEntry[],
  t: number,
  offsetY: number
) {
  ctx.clearRect(0, 0, W, H);

  for (let li = 0; li < 5; li++) {
    const cfg = LAYER_CONFIG[li];
    const color = palette[li];
    const baseY = H * (0.5 + li * 0.095) + offsetY;

    ctx.save();
    ctx.globalAlpha = color.a;
    ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
    ctx.beginPath();
    ctx.moveTo(0, H + offsetY + 2);

    for (let x = 0; x <= W; x += 2) {
      const y = baseY + waveY(x, t, cfg.amp, cfg.speed, cfg.offset);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H + offsetY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Foam on layer 3 crest
  const foamCfg = LAYER_CONFIG[2];
  const foamBaseY = H * (0.5 + 2 * 0.095) + offsetY;
  for (let fi = 0; fi < FOAM_COUNT; fi++) {
    const fx = foamXs[fi] * W;
    const fy = foamBaseY + waveY(fx, t, foamCfg.amp, foamCfg.speed, foamCfg.offset);
    const pulse = 0.12 + 0.16 * (0.5 + 0.5 * Math.sin(t * 3.5 + foamPhases[fi]));
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(fx, fy - 2, foamRadii[fi], 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");
  const busyRef = useRef(false);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Canvas sizing
  const sizeCanvas = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
    cvs.style.width = `${W}px`;
    cvs.style.height = `${H}px`;
    const ctx = cvs.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    return () => window.removeEventListener("resize", sizeCanvas);
  }, [sizeCanvas]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const runCoverAnimation = useCallback((palette: PaletteEntry[]): Promise<void> => {
    return new Promise((resolve) => {
      const cvs = canvasRef.current;
      if (!cvs) { resolve(); return; }
      const ctx = cvs.getContext("2d")!;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const startTime = performance.now();
      const DURATION = 650;

      function loop(now: number) {
        const elapsed = now - startTime;
        const t = (now - startTime) / 1000; // live time for sine
        const progress = easeInOut(Math.min(elapsed / DURATION, 1));
        const offsetY = H * (1 - progress); // H → 0

        paintWave(ctx, W, H, palette, t, offsetY);

        if (elapsed < DURATION) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafRef.current);
          resolve();
        }
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    });
  }, []);

  const runRevealAnimation = useCallback((palette: PaletteEntry[]): Promise<void> => {
    return new Promise((resolve) => {
      const cvs = canvasRef.current;
      if (!cvs) { resolve(); return; }
      const ctx = cvs.getContext("2d")!;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const startTime = performance.now();
      const DURATION = 700;

      function loop(now: number) {
        const elapsed = now - startTime;
        const t = (now - startTime) / 1000;
        const progress = easeInOut(Math.min(elapsed / DURATION, 1));
        const offsetY = -H * progress; // 0 → -H

        paintWave(ctx, W, H, palette, t, offsetY);

        if (elapsed < DURATION) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafRef.current);
          ctx.clearRect(0, 0, W, H);
          resolve();
        }
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    });
  }, []);

  const handleNav = useCallback(async (destination: string) => {
    if (busyRef.current) return;
    busyRef.current = true;

    const palette = getPalette(destination);
    sizeCanvas();

    // 1. Cover
    setTransitionState("covering");
    await runCoverAnimation(palette);

    // 2. Hold — paint a static fully-covered frame while route mounts
    setTransitionState("holding");
    const cvs = canvasRef.current;
    if (cvs) {
      const ctx = cvs.getContext("2d")!;
      const W = window.innerWidth;
      const H = window.innerHeight;
      paintWave(ctx, W, H, palette, performance.now() / 1000, 0);
    }

    // 3. Navigate — new page mounts behind wave
    navigateRef.current(destination);
    await wait(80);

    // 4. Reveal
    setTransitionState("revealing");
    await runRevealAnimation(palette);

    // 5. Done
    setTransitionState("idle");
    busyRef.current = false;
  }, [sizeCanvas, runCoverAnimation, runRevealAnimation]);

  const navigateTo = useCallback((path: string) => {
    if (path === location.pathname) return;
    handleNav(path);
  }, [location.pathname, handleNav]);

  // Handle popstate (back/forward)
  useEffect(() => {
    const handlePop = () => {
      const palette = getPalette(window.location.pathname);
      sizeCanvas();
      setTransitionState("revealing");
      runRevealAnimation(palette).then(() => {
        setTransitionState("idle");
        busyRef.current = false;
      });
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [sizeCanvas, runRevealAnimation]);

  return (
    <WaveNavContext.Provider value={{ navigateTo, transitionState }}>
      {children}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9000,
          pointerEvents: "none",
          display: transitionState !== "idle" ? "block" : "none",
        }}
      />
    </WaveNavContext.Provider>
  );
}

// ─── PageWrapper ──────────────────────────────────────────────────────────────
export function PageWrapper({ children }: { children: React.ReactNode }) {
  const { transitionState } = useWaveNav();
  const visible = transitionState === "revealing" || transitionState === "idle";

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
