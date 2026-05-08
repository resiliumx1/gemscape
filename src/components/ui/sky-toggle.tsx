import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface SkyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Refined Sun ↔ Moon theme toggle.
 * Minimal, elegant, brand-aligned. The icon crossfades + rotates;
 * the orb container holds a subtle glow tinted to the active mode.
 */
const SkyToggle = ({ checked: isDark, onChange }: SkyToggleProps) => {
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!isDark)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      className="theme-orb"
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: "999px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border-color, rgba(255,255,255,0.18))",
        background: isDark
          ? "linear-gradient(135deg, rgba(8,28,38,0.85) 0%, rgba(12,47,58,0.85) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(246,241,234,0.95) 100%)",
        boxShadow: isDark
          ? "0 4px 18px rgba(184,150,90,0.18), inset 0 0 0 1px rgba(184,150,90,0.18)"
          : "0 4px 18px rgba(184,150,90,0.22), inset 0 0 0 1px rgba(184,150,90,0.20)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "background 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease",
      }}
    >
      {/* Subtle ambient glow behind icon */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "999px",
          background: isDark
            ? "radial-gradient(circle at 50% 50%, rgba(212,173,124,0.18) 0%, transparent 65%)"
            : "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.22) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "inline-flex", color: "hsl(var(--gem-gold-light, 40 44% 72%))" }}
          >
            <Moon size={18} strokeWidth={1.6} fill="currentColor" fillOpacity={0.12} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "inline-flex", color: "hsl(var(--gem-gold, 37 42% 56%))" }}
          >
            <Sun size={18} strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SkyToggle;
