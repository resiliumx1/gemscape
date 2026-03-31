import { motion } from 'framer-motion';
import { ReactNode, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';

// --- PALETTES ---
export type WavePalette = {
  layer1: string;
  layer2: string;
  layer3: string;
};

export const palettes: Record<string, WavePalette> = {
  teal: {
    layer1: '#2cb8a8',
    layer2: '#1a8a9e',
    layer3: '#05181e',
  },
  gold: {
    layer1: '#E8C96A',
    layer2: '#C9A84C',
    layer3: '#2a1a04',
  },
  blue: {
    layer1: '#5ec8e0',
    layer2: '#1a8a9e',
    layer3: '#030e18',
  },
  green: {
    layer1: '#4ade80',
    layer2: '#16a34a',
    layer3: '#052010',
  },
};

// Route-to-palette mapping
export const routePalettes: Record<string, string> = {
  '/': 'teal',
  '/rentals': 'gold',
  '/concierge': 'blue',
  '/book': 'green',
  '/contact': 'coral',
  '/experiences': 'green',
};

// --- ANIMATION CONFIG ---
const waveEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

// --- PARTICLES COMPONENT ---
const Particles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1.5,
      tx: (Math.random() - 0.5) * 40,
      ty: -Math.random() * 60 - 20,
      duration: Math.random() * 2 + 2.5,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-overlay">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 4px 1px rgba(255,255,255,0.4)"
          }}
          animate={{
            x: [0, p.tx],
            y: [0, p.ty],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// --- WAVES COMPONENT ---
const LoopingWaves = ({ palette, isTop }: { palette: WavePalette, isTop?: boolean }) => {
  return (
    <div className={clsx("relative w-full h-[15vh] md:h-[25vh] shrink-0 overflow-hidden", isTop && "rotate-180")}>
      {/* Layer 0 (Deep Back) */}
      <motion.div
        className="absolute top-0 left-0 h-full w-full"
        animate={{ y: ["0%", "-3%", "0%"] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-[200%]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          <motion.svg 
            className="w-full h-full origin-bottom" 
            viewBox="0 0 1200 140" 
            preserveAspectRatio="none"
            overflow="visible"
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          >
            <path fill={palette.layer1} fillOpacity="0.4" d="M 0 90 C 75 90, 75 10, 150 10 C 350 10, 350 90, 600 90 C 675 90, 675 10, 750 10 C 950 10, 950 90, 1200 90 L 1200 250 L 0 250 Z" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Layer 1 (Back) */}
      <motion.div
        className="absolute top-0 left-0 h-full w-full"
        animate={{ y: ["0%", "-5%", "0%"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-[200%]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          <motion.svg 
            className="w-full h-full origin-bottom" 
            viewBox="0 0 1800 140" 
            preserveAspectRatio="none"
            overflow="visible"
            animate={{ scaleY: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          >
            <path fill={palette.layer1} fillOpacity="0.6" d="M 0 100 C 100 100, 100 20, 200 20 C 500 20, 500 100, 900 100 C 1000 100, 1000 20, 1100 20 C 1400 20, 1400 100, 1800 100 L 1800 250 L 0 250 Z" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Layer 2 (Middle) */}
      <motion.div
        className="absolute top-0 left-0 h-full w-full"
        animate={{ y: ["0%", "-8%", "0%"] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-[200%]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          <motion.svg 
            className="w-full h-full origin-bottom" 
            viewBox="0 0 2400 140" 
            preserveAspectRatio="none"
            overflow="visible"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          >
            <path fill={palette.layer2} fillOpacity="0.8" d="M 0 110 C 150 110, 150 40, 300 40 C 700 40, 700 110, 1200 110 C 1350 110, 1350 40, 1500 40 C 1900 40, 1900 110, 2400 110 L 2400 250 L 0 250 Z" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Layer 3 (Front) */}
      <motion.div
        className="absolute top-0 left-0 h-full w-full"
        animate={{ y: ["0%", "-3%", "0%"] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full w-[200%]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          <motion.svg 
            className="w-full h-full origin-bottom" 
            viewBox="0 0 3200 140" 
            preserveAspectRatio="none"
            overflow="visible"
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          >
            <path fill={palette.layer3} fillOpacity="1" d="M 0 120 C 200 120, 200 60, 400 60 C 900 60, 900 120, 1600 120 C 1800 120, 1800 60, 2000 60 C 2500 60, 2500 120, 3200 120 L 3200 250 L 0 250 Z" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Floating Particles */}
      <Particles />
    </div>
  );
};

// --- MAIN TRANSITION WRAPPER ---
export default function WaveTransition({ 
  children, 
  color = 'teal' 
}: { 
  children: ReactNode;
  color?: string;
}) {
  const palette = palettes[color] || palettes.teal;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Page Content */}
      <motion.div
        variants={{
          initial: { opacity: 0, y: 30, scale: 0.98 },
          animate: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] } 
          },
          exit: { 
            opacity: 0, 
            y: -20, 
            scale: 0.95,
            transition: { duration: 0.5, ease: waveEase } 
          }
        }}
      >
        {children}
      </motion.div>

      {/* Entrance Wave (Reveals the new page) */}
      <motion.div
        className="fixed left-0 right-0 pointer-events-none flex flex-col"
        style={{ zIndex: 9999, height: '150vh', top: 0 }}
        variants={{
          initial: { y: "0%" },
          animate: { 
            y: "-100%", 
            transition: { duration: 0.9, ease: waveEase } 
          },
          exit: { y: "-100%" }
        }}
      >
        <div className="w-full flex-grow -mb-[1px] z-10" style={{ backgroundColor: palette.layer3 }} />
        <LoopingWaves palette={palette} isTop={true} />
      </motion.div>

      {/* Exit Wave (Covers the current page) */}
      <motion.div
        className="fixed left-0 right-0 pointer-events-none flex flex-col"
        style={{ zIndex: 9999, height: '150vh', top: 0 }}
        variants={{
          initial: { y: "100%" },
          animate: { y: "100%" },
          exit: { 
            y: "0%", 
            transition: { duration: 0.9, ease: waveEase } 
          }
        }}
      >
        <LoopingWaves palette={palette} />
        <div className="w-full flex-grow -mt-[1px] z-10" style={{ backgroundColor: palette.layer3 }} />
      </motion.div>
    </motion.div>
  );
}

// ─── Navigation hooks ─────────────────────────────────────────────────────────
export function useWave() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    (path: string, _variant?: string) => {
      if (path === location.pathname) return;
      navigate(path);
    },
    [navigate, location.pathname]
  );

  return { navigateTo };
}

export function useWaveNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    (path: string) => {
      if (path === location.pathname) return;
      navigate(path);
    },
    [navigate, location.pathname]
  );

  return { navigateTo };
}
