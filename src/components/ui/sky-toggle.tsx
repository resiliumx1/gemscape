import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface SkyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Premium Sun ↔ Moon theme toggle.
 * - Compact circular orb (36px), brand-aligned
 * - Smooth crossfade + rotation + scale (~320ms)
 * - Soft hover and tap states
 * - Respects prefers-reduced-motion
 * - Accessible: role="switch" + aria-checked + aria-label
 */
const SkyToggle = ({ checked: isDark, onChange }: SkyToggleProps) => {
  const reduce = useReducedMotion();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  const iconAnim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, rotate: isDark ? -55 : 55, scale: 0.7 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: isDark ? 55 : -55, scale: 0.7 },
      };

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!isDark)}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      className="theme-orb group relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gem-gold/50 focus-visible:ring-offset-0"
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        border: `1px solid ${isDark ? "rgba(212,173,124,0.28)" : "rgba(184,149,106,0.32)"}`,
        background: isDark
          ? "radial-gradient(circle at 30% 30%, rgba(20,52,68,0.95), rgba(6,22,30,0.95))"
          : "radial-gradient(circle at 30% 30%, rgba(255,250,240,0.96), rgba(244,235,220,0.96))",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(212,173,124,0.06)"
          : "0 4px 16px rgba(184,149,106,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "background 350ms ease, border-color 350ms ease, box-shadow 350ms ease",
      }}
    >
      {/* Ambient glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 opacity-70 group-hover:opacity-100"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, rgba(212,173,124,0.18) 0%, transparent 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.20) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            {...iconAnim}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-flex"
            style={{ color: "#e6cfa8" }}
          >
            <Moon size={16} strokeWidth={1.6} fill="currentColor" fillOpacity={0.15} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            {...iconAnim}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-flex"
            style={{ color: "#b8956a" }}
          >
            <Sun size={16} strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SkyToggle;
