import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Diamond } from 'lucide-react';

// Resets to false ONLY on hard-refresh or first visit.
// Internal navigation won't reset it.
export let hasPlayedIntro = false;

const WaveSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,122.7C672,96,768,96,864,117.3C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
  </svg>
);

export function WaveTransition() {
  const [isVisible, setIsVisible] = useState(!hasPlayedIntro);

  useEffect(() => {
    if (hasPlayedIntro) return;
    
    hasPlayedIntro = true;

    const timer = setTimeout(() => setIsVisible(false), 5500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const waveVariants = {
    initial: { y: "0%" },
    animate: { y: "-100%" }
  };

  const transitionEase = [0.45, 0, 0.55, 1] as [number, number, number, number];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Layer 1: Teal */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-[#0d9488]"
        variants={waveVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2.2, ease: transitionEase, delay: 2.0 }}
      >
        <WaveSVG className="absolute top-full left-0 w-full h-[15vh] text-[#0d9488]" />
      </motion.div>

      {/* Layer 2: Emerald */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-[#059669]"
        variants={waveVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2.2, ease: transitionEase, delay: 2.2 }}
      >
        <WaveSVG className="absolute top-full left-0 w-full h-[20vh] text-[#059669] scale-x-[-1]" />
      </motion.div>

      {/* Layer 3: Deep Gem/Black */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-[#022c22] flex items-center justify-center"
        variants={waveVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 2.2, ease: transitionEase, delay: 2.4 }}
      >
        {/* Logo Sequence */}
        <motion.div 
          className="flex flex-col items-center justify-center relative z-10"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center">
            <Diamond size={72} className="text-[#81e6d9] mb-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide mb-2" style={{ fontStyle: 'italic' }}>
              Gemscape
            </h1>
            <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#81e6d9] to-transparent my-2 opacity-50"></div>
            <p className="text-[#e2e8f0] tracking-[0.3em] text-sm md:text-base font-medium uppercase mt-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Travel and Tours
            </p>
          </div>
        </motion.div>

        <WaveSVG className="absolute top-full left-0 w-full h-[25vh] text-[#022c22]" />
      </motion.div>
    </div>
  );
}
