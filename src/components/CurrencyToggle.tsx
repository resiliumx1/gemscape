import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocation } from "react-router-dom";

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const isXCD = currency === "XCD";
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <motion.div
      onClick={() => setCurrency(isXCD ? "USD" : "XCD")}
      whileHover={{
        scale: 1.05,
        borderColor: "rgba(44, 184, 168, 0.6)",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        boxShadow: "0 0 20px rgba(44, 184, 168, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center bg-black/40 border border-gem-teal/20 rounded-full p-1 cursor-pointer w-28 h-10 transition-all duration-300 overflow-hidden"
      data-admin={isAdmin ? "true" : undefined}
    >
      <motion.div
        className="absolute w-[52px] h-8 bg-gem-teal/20 border border-gem-teal/30 rounded-full shadow-[0_0_15px_rgba(44,184,168,0.2)]"
        animate={{ x: isXCD ? 52 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      <div className="flex justify-between w-full px-3 z-10">
        <motion.span
          animate={{
            x: !isXCD ? 4 : 0,
            opacity: !isXCD ? 1 : 0.4,
            color: !isXCD ? "#81e6d9" : "#ffffff",
            scale: !isXCD ? 1.1 : 0.9,
            textShadow: !isXCD ? "0 0 10px rgba(129, 230, 217, 0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-[11px] font-body font-bold tracking-widest"
        >
          USD
        </motion.span>
        <motion.span
          animate={{
            x: isXCD ? -4 : 0,
            opacity: isXCD ? 1 : 0.4,
            color: isXCD ? "#81e6d9" : "#ffffff",
            scale: isXCD ? 1.1 : 0.9,
            textShadow: isXCD ? "0 0 10px rgba(129, 230, 217, 0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-[11px] font-body font-bold tracking-widest"
        >
          XCD
        </motion.span>
      </div>
    </motion.div>
  );
};

export default CurrencyToggle;
