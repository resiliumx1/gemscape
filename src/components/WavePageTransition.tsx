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
    colors: ["#061e28", "#147a7a", "#68d4c0"],
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
  "/packages": {
    direction: "up",
    colors: ["#0a0a1a", "#3d2a6b", "#C9A84C"],
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
  "M0,90 C40,90 80,25 180,25 C280,25 320,155 420,155 C520,155 560,25 660,25 C760,25 800,155 900,155 C950,155 970,90 1000,90 L1000,1000 L0,1000 Z",
  "M0,130 C30,130 70,165 140,165 C210,165 250,20 330,20 C410,20 450,165 530,165 C610,165 650,20 730,20 C810,20 850,165 930,165 C970,165 990,100 1000,80 L1000,1000 L0,1000 Z",
  "M0,60 C30,60 50,15 120,15 C190,15 210,170 280,170 C350,170 370,15 440,15 C510,15 530,170 600,170 C670,170 690,15 760,15 C830,15 850,170 920,170 C960,170 980,60 1000,60 L1000,1000 L0,1000 Z",
];

// HORIZONTAL LEFT→RIGHT — smooth wave along the RIGHT edge
const WAVE_PATHS_LEFT = [
  "M0,0 L0,1000 L920,1000 C920,920 850,880 850,790 C850,700 980,660 980,570 C980,480 850,440 850,350 C850,260 980,220 980,130 C980,50 920,20 920,0 Z",
  "M0,0 L0,1000 L900,1000 C900,930 980,900 980,820 C980,740 860,700 860,620 C860,540 980,500 980,420 C980,340 860,300 860,220 C860,140 980,100 980,50 C980,10 940,0 940,0 Z",
  "M0,0 L0,1000 L940,1000 C940,950 870,920 870,860 C870,800 1000,770 1000,710 C1000,650 870,620 870,560 C870,500 1000,470 1000,410 C1000,350 870,320 870,260 C870,200 1000,170 1000,110 C1000,50 940,20 940,0 Z",
];

// HORIZONTAL RIGHT→LEFT — smooth wave along the LEFT edge
const WAVE_PATHS_RIGHT = [
  "M80,0 C80,80 150,120 150,210 C150,300 20,340 20,430 C20,520 150,560 150,650 C150,740 20,780 20,870 C20,950 80,980 80,1000 L1000,1000 L1000,0 Z",
  "M100,0 C100,70 20,100 20,180 C20,260 140,300 140,380 C140,460 20,500 20,580 C20,660 140,700 140,780 C140,860 20,900 20,950 C20,990 60,1000 60,1000 L1000,1000 L1000,0 Z",
  "M60,0 C60,50 130,80 130,140 C130,200 0,230 0,290 C0,350 130,380 130,440 C130,500 0,530 0,590 C0,650 130,680 130,740 C130,800 0,830 0,890 C0,950 60,980 60,1000 L1000,1000 L1000,0 Z",
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
                animationFillMode: "both",
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
              animationFillMode: "both",
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
