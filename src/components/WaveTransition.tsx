// WaveTransition.tsx
// Drop this file into src/components/WaveTransition.tsx in your Lovable project.
// Then wrap your router pages with <WaveTransitionProvider> and trigger via useWave().

import { useRef, useCallback, createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type WaveVariant = "tidal" | "crash" | "dual";

interface WaveContextValue {
  navigateTo: (path: string, variant?: WaveVariant) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const WaveContext = createContext<WaveContextValue>({ navigateTo: () => {} });
export const useWave = () => useContext(WaveContext);

// ─── Canvas wave painters ─────────────────────────────────────────────────────

function paintTidal(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  waveX: number, t: number
) {
  ctx.clearRect(0, 0, W, H);

  // Deep layer
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, H + 2);
  for (let y = H; y >= 0; y--) {
    const x = waveX + Math.sin(y * 0.02 + t * 0.1) * 32;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#0f5e72";
  ctx.fill();
  ctx.restore();

  // Mid layer
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, H + 2);
  for (let y = H; y >= 0; y--) {
    const x = waveX + 10 + Math.sin(y * 0.028 + t * 0.12) * 22;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#1a9aaa";
  ctx.fill();
  ctx.restore();

  // Foam crest
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, H + 2);
  for (let y = H; y >= 0; y--) {
    const x = waveX + 28 + Math.sin(y * 0.036 + t * 0.15) * 14;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#8ae8f0";
  ctx.fill();
  ctx.restore();
}

function paintCrash(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  frame: number, total: number
) {
  ctx.clearRect(0, 0, W, H);
  const p = frame / total;
  let riseY: number, alpha = 1;

  if (p < 0.55) {
    riseY = H * (1 - p / 0.55);
  } else {
    const rp = (p - 0.55) / 0.45;
    riseY = H * rp;
    alpha = 1 - rp * 0.7;
  }

  // Base
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, H + 2);
  for (let x = 0; x <= W; x++) {
    ctx.lineTo(x, riseY + Math.sin(x * 0.018 + frame * 0.15) * 26);
  }
  ctx.lineTo(W, H + 2);
  ctx.closePath();
  ctx.fillStyle = "#0e7890";
  ctx.fill();
  ctx.restore();

  // Foam
  const foamY = riseY - 14;
  if (foamY > -30) {
    ctx.save();
    ctx.globalAlpha = 0.6 * alpha;
    ctx.beginPath();
    ctx.moveTo(0, H + 2);
    for (let x = 0; x <= W; x++) {
      ctx.lineTo(x, foamY + Math.sin(x * 0.026 + frame * 0.18) * 16);
    }
    ctx.lineTo(W, H + 2);
    ctx.closePath();
    ctx.fillStyle = "#5de0f0";
    ctx.fill();
    ctx.restore();
  }
}

function paintDual(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  waveX: number, t: number
) {
  ctx.clearRect(0, 0, W, H);

  const layers = [
    { color: "#0a3d4a", offset: 0,   amp: 38, freq: 0.018, alpha: 1.0   },
    { color: "#1a8fa0", offset: 14,  amp: 26, freq: 0.024, alpha: 0.80  },
    { color: "#3dd0e0", offset: 32,  amp: 16, freq: 0.032, alpha: 0.55  },
    { color: "#a0eef5", offset: 48,  amp: 10, freq: 0.042, alpha: 0.30  },
  ];

  for (const l of layers) {
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, H + 2);
    for (let y = H; y >= 0; y--) {
      const x = waveX + l.offset + Math.sin(y * l.freq + t * 0.1) * l.amp;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = l.color;
    ctx.fill();
    ctx.restore();
  }
}

// ─── Main canvas overlay ──────────────────────────────────────────────────────
interface WaveOverlayProps {
  variant: WaveVariant;
  onMidpoint: () => void;
  onComplete: () => void;
}

export function WaveOverlay({ variant, onMidpoint, onComplete }: WaveOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const midFired  = useRef(false);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    cvs.width  = W;
    cvs.height = H;

    let waveX = -(W * 0.35);
    let frame = 0;
    const CRASH_TOTAL = 80;
    let t = 0;

    function tick() {
      t++;
      if (variant === "tidal") {
        waveX += 18;
        paintTidal(ctx, W, H, waveX, t);
        if (!midFired.current && waveX > W * 0.4) {
          midFired.current = true;
          onMidpoint();
        }
        if (waveX < W + 160) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, W, H);
          onComplete();
        }
      } else if (variant === "crash") {
        frame++;
        paintCrash(ctx, W, H, frame, CRASH_TOTAL);
        if (!midFired.current && frame === Math.floor(CRASH_TOTAL * 0.45)) {
          midFired.current = true;
          onMidpoint();
        }
        if (frame < CRASH_TOTAL) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, W, H);
          onComplete();
        }
      } else {
        // dual
        waveX += 16;
        paintDual(ctx, W, H, waveX, t);
        if (!midFired.current && waveX > W * 0.4) {
          midFired.current = true;
          onMidpoint();
        }
        if (waveX < W + 200) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, W, H);
          onComplete();
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WaveTransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [overlay, setOverlay] = useState<{ path: string; variant: WaveVariant } | null>(null);

  const navigateTo = useCallback((path: string, variant: WaveVariant = "dual") => {
    setOverlay({ path, variant });
  }, []);

  const handleMidpoint = useCallback(() => {
    if (overlay) navigate(overlay.path);
  }, [overlay, navigate]);

  const handleComplete = useCallback(() => {
    setOverlay(null);
  }, []);

  return (
    <WaveContext.Provider value={{ navigateTo }}>
      {children}
      {overlay && (
        <WaveOverlay
          variant={overlay.variant}
          onMidpoint={handleMidpoint}
          onComplete={handleComplete}
        />
      )}
    </WaveContext.Provider>
  );
}
