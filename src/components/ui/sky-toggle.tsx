import { motion } from "framer-motion";
import { useMemo } from "react";

interface SkyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SkyToggle = ({ checked: isDark, onChange }: SkyToggleProps) => {
  const isDay = !isDark;

  const stars = useMemo(
    () =>
      Array.from({ length: 5 }, () => ({
        w: Math.random() * 2 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        dur: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <motion.div
      onClick={() => onChange(!isDark)}
      whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.3)" }}
      className="relative flex items-center border border-white/10 rounded-full p-1 cursor-pointer w-16 h-8 sm:w-20 sm:h-10 overflow-hidden transition-all duration-300"
      role="switch"
      aria-checked={isDark}
      aria-label={isDay ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDay
            ? "linear-gradient(to right, #0891b2, #0e7490)"
            : "linear-gradient(to right, #0f172a, #1e1b4b)",
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Clouds (Day) */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ opacity: isDay ? 0.3 : 0, y: isDay ? 0 : 10 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1 left-2 w-4 h-2 bg-white rounded-full blur-[1px]"
        />
        <motion.div
          animate={{ x: [2, -2, 2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-2 right-4 w-6 h-3 bg-white rounded-full blur-[1px]"
        />
      </motion.div>

      {/* Stars (Night) */}
      {!isDay && (
        <div className="absolute inset-0">
          {stars.map((s, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{ width: s.w, height: s.w, top: `${s.top}%`, left: `${s.left}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
            />
          ))}
        </div>
      )}

      {/* Sun / Moon orb */}
      <motion.div
        className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-20"
        animate={{ x: isDay ? (typeof window !== "undefined" && window.innerWidth < 640 ? 24 : 40) : 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden"
          animate={{
            backgroundColor: isDay ? "#facc15" : "#e2e8f0",
            boxShadow: isDay
              ? "0 0 25px rgba(250,204,21,0.9)"
              : "0 0 15px rgba(226,232,240,0.4)",
            rotate: isDay ? 360 : -360,
            scale: isDay ? [1, 1.1, 1] : 1,
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.5 },
            boxShadow: { duration: 0.5 },
          }}
        >
          {isDay ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1 left-1 w-2 h-2 bg-slate-400/30 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-2 right-2 w-1 h-1 bg-slate-400/30 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 right-1 w-1.5 h-1.5 bg-slate-400/30 rounded-full"
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SkyToggle;
