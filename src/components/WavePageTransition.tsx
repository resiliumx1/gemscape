// ============================================================
// FILE: src/components/WavePageTransition.tsx
// ============================================================
// 3-layer SVG wave page transition overlay.
// Waves sweep UP from bottom → cover screen → exit through top.
// Uses pure CSS keyframes — no framer-motion dependency.
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Context ──────────────────────────────────────────────────
interface WaveNavigationContextType {
  navigateWithWave: (to: string) => void;
  isAnimating: boolean;
}

const WaveNavigationContext = createContext<WaveNavigationContextType>({
  navigateWithWave: () => {},
  isAnimating: false,
});

export const useWaveNavigation = () => useContext(WaveNavigationContext);

// ── SVG wave paths (each layer has a unique crest shape) ────
const WAVE_PATHS = [
  // Layer 1 (back) — wide, deep swells
  "M0,350 C120,150 280,450 500,300 C720,150 880,400 1000,250 L1000,1000 L0,1000 Z",
  // Layer 2 (mid) — medium frequency
  "M0,280 C180,420 350,120 500,320 C650,520 820,180 1000,350 L1000,1000 L0,1000 Z",
  // Layer 3 (front) — tight, dynamic crests
  "M0,200 C100,380 250,100 400,300 C550,500 700,150 850,350 C920,450 960,280 1000,300 L1000,1000 L0,1000 Z",
];

// ── Route-based color palettes for the 3 layers ─────────────
const WAVE_COLOR_PALETTES: Record<string, string[]> = {
  default: [
    "#05181e",   // navy (back)
    "#0d4a44",   // dark teal (mid)
    "#2cb8a8",   // brand teal (front)
  ],
  "/experiences": [
    "#0a2a3c",   // deep ocean blue (back)
    "#1565a0",   // medium blue (mid)
    "#4fc3f7",   // light blue (front)
  ],
};

const getWaveColors = (path: string): string[] => {
  return WAVE_COLOR_PALETTES[path] || WAVE_COLOR_PALETTES.default;
};

// ── Timing constants (ms) ───────────────────────────────────
const COVER_DURATION = 600;
const STAGGER_DELAY = 180; // delay between each layer
const HOLD_DURATION = 200;
const REVEAL_DURATION = 600;
const ROUTE_CHANGE_DELAY = COVER_DURATION + 300; // change route just after cover
const TOTAL_DURATION =
  COVER_DURATION + HOLD_DURATION + REVEAL_DURATION + STAGGER_DELAY * 2 + 100;

// ── Particle positions (small floating dots) ────────────────
const PARTICLES = [
  { cx: "10%", cy: "25%", r: 3, delay: 0 },
  { cx: "25%", cy: "45%", r: 2, delay: 50 },
  { cx: "40%", cy: "15%", r: 4, delay: 100 },
  { cx: "55%", cy: "55%", r: 2.5, delay: 30 },
  { cx: "70%", cy: "30%", r: 3, delay: 80 },
  { cx: "85%", cy: "50%", r: 2, delay: 120 },
  { cx: "15%", cy: "65%", r: 3.5, delay: 60 },
  { cx: "60%", cy: "75%", r: 2, delay: 90 },
  { cx: "90%", cy: "20%", r: 3, delay: 40 },
  { cx: "35%", cy: "80%", r: 2.5, delay: 110 },
];

// ── Component ───────────────────────────────────────────────
interface WavePageTransitionProps {
  children: React.ReactNode;
}

const WavePageTransition: React.FC<WavePageTransitionProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const pendingPath = useRef<string | null>(null);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, []);

  const navigateWithWave = useCallback(
    (to: string) => {
      // Don't animate if already on the same page or mid-animation
      if (to === location.pathname || isAnimating) return;

      pendingPath.current = to;
      setIsAnimating(true);
      setPhase("cover");

      // After cover animation completes, change route
      animationTimeout.current = setTimeout(() => {
        if (pendingPath.current) {
          navigate(pendingPath.current);
          pendingPath.current = null;
        }

        // Start reveal phase
        setPhase("reveal");

        // After reveal completes, reset
        animationTimeout.current = setTimeout(() => {
          setPhase("idle");
          setIsAnimating(false);
          // Scroll to top of new page
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }, REVEAL_DURATION + STAGGER_DELAY * 2 + 100);
      }, ROUTE_CHANGE_DELAY);
    },
    [navigate, location.pathname, isAnimating]
  );

  return (
    <WaveNavigationContext.Provider value={{ navigateWithWave, isAnimating }}>
      {children}

      {/* Wave overlay — always mounted, animated via CSS classes */}
      <div
        className="wave-transition-container"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: isAnimating ? "all" : "none",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {WAVE_PATHS.map((path, index) => {
          // Compute animation class based on phase
          let animClass = "wave-layer-idle";
          if (phase === "cover") animClass = "wave-layer-cover";
          if (phase === "reveal") animClass = "wave-layer-reveal";

          return (
            <div
              key={index}
              className={animClass}
              style={{
                position: "absolute",
                inset: 0,
                // Stagger delay: back layer first, front layer last
                animationDelay: `${index * STAGGER_DELAY}ms`,
                animationDuration:
                  phase === "cover"
                    ? `${COVER_DURATION}ms`
                    : `${REVEAL_DURATION}ms`,
                animationFillMode: "forwards",
                animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                willChange: "transform",
              }}
            >
              <svg
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              >
                <path d={path} fill={WAVE_COLORS[index]} />
              </svg>
            </div>
          );
        })}

        {/* Floating particles */}
        {phase !== "idle" && (
          <div
            className={
              phase === "cover"
                ? "wave-particles-cover"
                : "wave-particles-reveal"
            }
            style={{
              position: "absolute",
              inset: 0,
              animationDuration:
                phase === "cover"
                  ? `${COVER_DURATION}ms`
                  : `${REVEAL_DURATION}ms`,
              animationFillMode: "forwards",
              animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          >
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: p.cx,
                  top: p.cy,
                  width: p.r * 2,
                  height: p.r * 2,
                  borderRadius: "50%",
                  backgroundColor: "rgba(60, 200, 184, 0.5)",
                  animationDelay: `${p.delay}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </WaveNavigationContext.Provider>
  );
};

export default WavePageTransition;

// ── Compatibility hooks (drop-in replacements for old wave files) ───
export function useWave() {
  const { navigateWithWave } = useWaveNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const navigateTo = React.useCallback(
    (path: string) => {
      if (path === location.pathname) return;
      navigateWithWave(path);
    },
    [location.pathname, navigateWithWave]
  );
  return { navigateTo };
}

export function useWaveNav() {
  return useWave();
}

export function usePageNav() {
  return useWave();
}
