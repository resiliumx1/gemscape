import { useEffect, useRef } from 'react';

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

        // Remove from DOM after animation
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
      <div className="absolute inset-0 w-full h-full bg-[#022c22]" />
    </div>
  );
}
