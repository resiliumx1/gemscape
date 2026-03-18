import { useEffect, useRef } from 'react';
import { Diamond } from 'lucide-react';

const WaveSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,122.7C672,96,768,96,864,117.3C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
  </svg>
);

export function WaveTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    // Force GPU layer promotion to prevent repaint stall
    el.style.willChange = 'transform';
    el.style.transform = 'translateY(0)';

    // Use requestAnimationFrame to ensure paint is complete before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)';
        el.style.transform = 'translateY(-100%)';

        // Remove from DOM after animation — don't use display:none early
        setTimeout(() => {
          el.style.display = 'none';
          el.style.willChange = 'auto';
        }, 1150);
      });
    });
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Deep Gem/Black base layer with branding */}
      <div className="absolute inset-0 w-full h-full bg-[#022c22] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex flex-col items-center">
            <Diamond size={64} className="text-[#81e6d9] mb-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide mb-2" style={{ fontStyle: 'italic' }}>
              Gemscape
            </h1>
            <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#81e6d9] to-transparent my-2 opacity-50"></div>
            <p className="text-[#e2e8f0] tracking-[0.3em] text-sm md:text-base font-medium uppercase mt-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Travel and Tours
            </p>
          </div>
        </div>

        <WaveSVG className="absolute top-full left-0 w-full h-[25vh] text-[#022c22]" />
      </div>

      {/* Emerald accent layer */}
      <div className="absolute inset-0 w-full h-full bg-[#059669]" style={{ zIndex: -1 }}>
        <WaveSVG className="absolute top-full left-0 w-full h-[20vh] text-[#059669] scale-x-[-1]" />
      </div>

      {/* Teal accent layer */}
      <div className="absolute inset-0 w-full h-full bg-[#0d9488]" style={{ zIndex: -2 }}>
        <WaveSVG className="absolute top-full left-0 w-full h-[15vh] text-[#0d9488]" />
      </div>
    </div>
  );
}
