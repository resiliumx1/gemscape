// ============================================================
// FILE: src/components/WavePageTransition.tsx
// ============================================================
// 3-layer SVG wave page transition overlay.
// Supports 3 directions: up, left-to-right, right-to-left.
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

// ── Types ────────────────────────────────────────────────────
type WaveDirection = "up" | "left" | "right";

interface RouteWaveConfig {
  direction: WaveDirection;
  colors: string[];
}

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

// ── Per-route configuration ─────────────────────────────────
const ROUTE_WAVE_CONFIG: Record<string, RouteWaveConfig> = {
  "/": {
    direction: "up",
    colors: ["#05181e", "#0d4a44", "#2cb8a8"],
  },
  "/experiences": {
    direction: "left",
    colors: ["#0a2a3c", "#1565a0", "#4fc3f7"],
  },
  "/rentals": {
    direction: "up",
    colors: ["#1a1a1a", "#8a6914", "#c9a84c"],
  },
  "/book": {
    direction: "right",
    colors: ["#05181e", "#0d6b5e", "#6ee7c2"],
  },
  "/concierge": {
    direction: "up",
    colors: ["#1a0a2e", "#6b2fa0", "#c4a8e8"],
  },
  "/contact": {
    direction: "left",
    colors: ["#3d1008", "#c0533a", "#f4a68e"],
  },
};

const DEFAULT_CONFIG: RouteWaveConfig = {
  direction: "up",
  colors: ["#05181e", "#0d4a44", "#2cb8a8"],
};

const getRouteConfig = (path: string): RouteWaveConfig => {
  return ROUTE_WAVE_CONFIG[path] || DEFAULT_CONFIG;
};

// ── SVG wave paths per direction ────────────────────────────
// VERTICAL (up) — wave crests at the VERY TOP (y ≈ 0-20)
const WAVE_PATHS_UP = [
  "M0,0 C80,160 200,0 350,120 C500,0 650,180 800,20 C900,150 970,0 1000,0 L1000,1000 L0,1000 Z",
  "M0,10 C100,180 250,0 400,150 C550,10 700,190 850,0 C950,140 990,20 1000,0 L1000,1000 L0,1000 Z",
  "M0,0 C60,140 180,0 300,120 C420,0 540,160 660,10 C780,170 900,0 1000,10 L1000,1000 L0,1000 Z",
];

// HORIZONTAL LEFT→RIGHT — wave crests on RIGHT edge (x ≈ 980-1000)
const WAVE_PATHS_LEFT = [
  "M0,0 L0,1000 L980,1000 C960,880 1000,760 970,640 C940,520 1000,400 960,280 C930,160 1000,40 980,0 Z",
  "M0,0 L0,1000 L970,1000 C1000,860 950,740 990,620 C960,500 1000,380 950,260 C990,140 960,20 970,0 Z",
  "M0,0 L0,1000 L960,1000 C990,900 940,780 980,660 C950,540 1000,420 960,300 C920,180 980,60 960,0 Z",
];

// HORIZONTAL RIGHT→LEFT — wave crests on LEFT edge (x ≈ 0-20)
const WAVE_PATHS_RIGHT = [
  "M20,0 C40,120 0,240 30,360 C60,480 0,600 40,720 C0,840 30,960 20,1000 L1000,1000 L1000,0 Z",
  "M30,0 C0,140 40,260 10,380 C40,500 0,620 50,740 C10,860 40,980 30,1000 L1000,1000 L1000,0 Z",
  "M40,0 C10,100 50,220 20,340 C0,460 40,580 10,700 C50,820 0,940 40,1000 L1000,1000 L1000,0 Z",
];

const WAVE_PATHS_BY_DIRECTION: Record<WaveDirection, string[]> = {
  up: WAVE_PATHS_UP,
  left: WAVE_PATHS_LEFT,
  right: WAVE_PATHS_RIGHT,
};

// ── Timing constants (ms) ───────────────────────────────────
const COVER_DURATION = 600;
const STAGGER_DELAY = 180;
const HOLD_DURATION = 200;
const REVEAL_DURATION = 600;
const ROUTE_CHANGE_DELAY = COVER_DURATION + 300;
const TOTAL_DURATION =
  COVER_DURATION + HOLD_DURATION + REVEAL_DURATION + STAGGER_DELAY * 2 + 100;

// ── Particle positions ──────────────────────────────────────
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
  const [activeDirection, setActiveDirection] = useState<WaveDirection>("up");
  const [activeColors, setActiveColors] = useState<string[]>(DEFAULT_CONFIG.colors);
  const [activePaths, setActivePaths] = useState<string[]>(WAVE_PATHS_UP);
  const pendingPath = useRef<string | null>(null);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, []);

  const navigateWithWave = useCallback(
    (to: string) => {
      if (to === location.pathname || isAnimating) return;

      const config = getRouteConfig(to);
      pendingPath.current = to;
      setActiveDirection(config.direction);
      setActiveColors(config.colors);
      setActivePaths(WAVE_PATHS_BY_DIRECTION[config.direction]);
      setIsAnimating(true);
      setPhase("cover");

      animationTimeout.current = setTimeout(() => {
        if (pendingPath.current) {
          navigate(pendingPath.current);
          pendingPath.current = null;
        }

        setPhase("reveal");

        animationTimeout.current = setTimeout(() => {
          setPhase("idle");
          setIsAnimating(false);
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }, REVEAL_DURATION + STAGGER_DELAY * 2 + 100);
      }, ROUTE_CHANGE_DELAY);
    },
    [navigate, location.pathname, isAnimating]
  );

  return (
    <WaveNavigationContext.Provider value={{ navigateWithWave, isAnimating }}>
      {children}

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
        {activePaths.map((path, index) => {
          let animClass = `wave-layer-idle-${activeDirection}`;
          if (phase === "cover") animClass = `wave-layer-cover-${activeDirection}`;
          if (phase === "reveal") animClass = `wave-layer-reveal-${activeDirection}`;

          return (
            <div
              key={index}
              className={animClass}
              style={{
                position: "absolute",
                inset: 0,
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
                <path d={path} fill={activeColors[index]} />
              </svg>
            </div>
          );
        })}

        {phase !== "idle" && (
          <div
            className={
              phase === "cover"
                ? `wave-particles-cover-${activeDirection}`
                : `wave-particles-reveal-${activeDirection}`
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

// ── Compatibility hooks ─────────────────────────────────────
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
