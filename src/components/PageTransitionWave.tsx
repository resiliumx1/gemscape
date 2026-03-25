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
  // Strip hash/query, try exact then fallback
  const clean = path.split("?")[0].split("#")[0];
  return PALETTES[clean] || PALETTES["/"];
}

// ─── Wave math ────────────────────────────────────────────────────────────────
const LAYER_CONFIG = [
  { amp: 32, speed: 0.55, offset: 0 },
  { amp: 25, speed: 0.82, offset: 1.4 },
  { amp: 19, speed: 1.18, offset: 2.9 },
  { amp: 14, speed: 1.55, offset: 0.7 },
  { amp: 9, speed: 2.1, offset: 3.3 },
];

const FREQ = 0.004;

function waveY(
  x: number,
  t: number,
  amp: number,
  speed: number,
  offset: number
): number {
  return (
    Math.sin(x * FREQ + t * speed + offset) * amp +
    Math.sin(x * FREQ * 1.65 - t * speed * 0.68 + offset * 1.3) * amp * 0.38 +
    Math.sin(x * FREQ * 2.9 + t * speed * 1.25) * amp * 0.15
  );
}

// ─── Foam ─────────────────────────────────────────────────────────────────────
const FOAM_COUNT = 30;
const foamXs = Array.from({ length: FOAM_COUNT }, () => Math.random());
const foamRadii = Array.from(
  { length: FOAM_COUNT },
  () => 1 + Math.random() * 2
);
const foamPhases = Array.from(
  { length: FOAM_COUNT },
  () => Math.random() * Math.PI * 2
);

// ─── Context ──────────────────────────────────────────────────────────────────
interface WaveNavContextValue {
  navigateTo: (path: string) => void;
}

const WaveNavContext = createContext<WaveNavContextValue>({
  navigateTo: () => {},
});

export const useWaveNav = () => useContext(WaveNavContext);

// ─── Easing ───────────────────────────────────────────────────────────────────
function cubicBezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number
): number {
  // Simple approximation via binary search
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const bx =
      3 * p1x * mid * (1 - mid) ** 2 +
      3 * p2x * mid ** 2 * (1 - mid) +
      mid ** 3;
    if (bx < t) lo = mid;
    else hi = mid;
  }
  const mt = (lo + hi) / 2;
  return (
    3 * p1y * mt * (1 - mt) ** 2 +
    3 * p2y * mt ** 2 * (1 - mt) +
    mt ** 3
  );
}

function easeInOut(t: number): number {
  return cubicBezier(0.76, 0, 0.24, 1, t);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [transitioning, setTransitioning] = useState(false);
  const transRef = useRef<{
    path: string;
    palette: PaletteEntry[];
    startTime: number;
    phase: 1 | 2 | 3;
    routeFired: boolean;
  } | null>(null);

  // Handle popstate (back/forward)
  useEffect(() => {
    const handlePop = () => {
      // location already updated by react-router, trigger reveal wave
      const palette = getPalette(window.location.pathname);
      startTransition(window.location.pathname, palette, true);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const startTransition = useCallback(
    (path: string, palette: PaletteEntry[], isPopState = false) => {
      if (transitioning) return;
      setTransitioning(true);

      transRef.current = {
        path,
        palette,
        startTime: performance.now(),
        phase: 1,
        routeFired: isPopState, // popstate already changed the route
      };

      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;
      cvs.width = W * dpr;
      cvs.height = H * dpr;
      cvs.style.width = `${W}px`;
      cvs.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let t = 0;

      function tick() {
        const tr = transRef.current;
        if (!tr) return;

        const elapsed = performance.now() - tr.startTime;
        t += 0.016;

        // Phase timing
        if (elapsed < 650) {
          // Phase 1: Cover — wave rises from bottom
          tr.phase = 1;
          const progress = easeInOut(elapsed / 650);
          const offsetY = H * (1 - progress); // H → 0
          paintWave(ctx, W, H, tr.palette, t, offsetY);
        } else if (elapsed < 850) {
          // Phase 2: Hold — fully covered, fire route
          tr.phase = 2;
          if (!tr.routeFired) {
            tr.routeFired = true;
            navigate(tr.path);
          }
          paintWave(ctx, W, H, tr.palette, t, 0);
          // No RAF during hold, just schedule the next check
        } else if (elapsed < 1500) {
          // Phase 3: Reveal — wave lifts off upward
          tr.phase = 3;
          const revealProgress = easeInOut((elapsed - 850) / 650);
          const offsetY = -H * revealProgress; // 0 → -H
          paintWave(ctx, W, H, tr.palette, t, offsetY);
        } else {
          // Done
          ctx.clearRect(0, 0, W, H);
          transRef.current = null;
          setTransitioning(false);
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [transitioning, navigate]
  );

  const navigateTo = useCallback(
    (path: string) => {
      if (path === location.pathname) return;
      const palette = getPalette(path);
      startTransition(path, palette);
    },
    [location.pathname, startTransition]
  );

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <WaveNavContext.Provider value={{ navigateTo }}>
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
          display: transitioning ? "block" : "none",
        }}
      />
    </WaveNavContext.Provider>
  );
}

// ─── Paint function ───────────────────────────────────────────────────────────
function paintWave(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  palette: PaletteEntry[],
  t: number,
  offsetY: number
) {
  ctx.clearRect(0, 0, W, H);

  // 5 layers
  for (let li = 0; li < 5; li++) {
    const cfg = LAYER_CONFIG[li];
    const color = palette[li];
    // Each layer's base y distributes across 50%-88% of H
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
    const fy =
      foamBaseY +
      waveY(fx, t, foamCfg.amp, foamCfg.speed, foamCfg.offset);
    const pulse =
      0.12 + 0.16 * (0.5 + 0.5 * Math.sin(t * 3.5 + foamPhases[fi]));
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(fx, fy - 2, foamRadii[fi], 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
