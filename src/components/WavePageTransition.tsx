import { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Context ──────────────────────────────────────────────────────────────────
interface WaveNavCtx {
  navigateWithWave: (path: string) => void;
  isAnimating: boolean;
}

const WaveNavContext = createContext<WaveNavCtx>({
  navigateWithWave: () => {},
  isAnimating: false,
});

export const useWaveNavigation = () => useContext(WaveNavContext);

// ─── SVG paths (unique wave crests per layer) ─────────────────────────────────
const PATHS = [
  'M0,40 C150,100 350,0 500,40 C650,80 800,0 1000,40 L1000,1000 L0,1000 Z',
  'M0,60 C200,0 300,80 500,60 C700,40 850,100 1000,60 L1000,1000 L0,1000 Z',
  'M0,30 C100,80 400,0 500,50 C600,100 900,20 1000,30 L1000,1000 L0,1000 Z',
];

const COLORS = ['#0a2e2e', '#1a8a7d', '#2cb8a8'];
const STAGGER = 80; // ms between each layer

// ─── Overlay ──────────────────────────────────────────────────────────────────
function WaveOverlay({ phase }: { phase: 'idle' | 'enter' | 'exit' }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    >
      {PATHS.map((d, i) => {
        const delay = `${i * STAGGER}ms`;
        let className = 'wave-layer';
        if (phase === 'enter') className += ' wave-layer--enter';
        else if (phase === 'exit') className += ' wave-layer--exit';

        return (
          <svg
            key={i}
            className={className}
            style={{
              animationDelay: delay,
              position: 'absolute',
              inset: 0,
              width: '100vw',
              height: '100vh',
            }}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <path d={d} fill={COLORS[i]} />
          </svg>
        );
      })}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WavePageTransition({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<'idle' | 'enter' | 'exit'>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const navigateWithWave = useCallback(
    (path: string) => {
      if (path === location.pathname || isAnimating) return;

      setIsAnimating(true);
      setPhase('enter');

      // At 700ms — route changes while fully covered
      timerRef.current = setTimeout(() => {
        navigate(path);
        window.scrollTo(0, 0);

        // At 800ms — start reveal
        setTimeout(() => {
          setPhase('exit');

          // At 1400ms — reset
          setTimeout(() => {
            setPhase('idle');
            setIsAnimating(false);
          }, 600);
        }, 100);
      }, 700);
    },
    [navigate, location.pathname, isAnimating],
  );

  return (
    <WaveNavContext.Provider value={{ navigateWithWave, isAnimating }}>
      <WaveOverlay phase={phase} />
      {children}
    </WaveNavContext.Provider>
  );
}
