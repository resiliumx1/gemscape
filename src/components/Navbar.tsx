import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Sparkles, Diamond, Gem, Menu, X, Palmtree, Map, Compass, Mail } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import { useWaveNav } from "@/components/WavePageTransition";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DropdownChild {
  label: string;
  icon: any;
  href: string;
  isHash?: boolean;
}

interface NavItemProps {
  icon: any;
  label: string;
  href: string;
  isHash?: boolean;
  dropdownItems?: DropdownChild[];
  pulse?: boolean;
  onNavigate: (href: string, isHash?: boolean) => void;
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

const NavItem = ({ icon: Icon, label, href, isHash, dropdownItems, pulse = true, onNavigate }: NavItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex items-center gap-3 cursor-pointer group relative px-4 py-2 rounded-xl transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gem-teal/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHovered(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setIsHovered(false);
          e.currentTarget.blur();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!dropdownItems) onNavigate(href, isHash);
          else setIsHovered(!isHovered);
        }
      }}
      onClick={() => { if (!dropdownItems) onNavigate(href, isHash); }}
      tabIndex={0}
      role="button"
      aria-haspopup={dropdownItems ? "menu" : undefined}
      aria-expanded={dropdownItems ? isHovered : undefined}
      whileHover={{
        backgroundColor: "rgba(184, 149, 106, 0.03)",
        y: -0.5,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 30 }}
    >
      {isHovered && <div className="absolute top-full left-0 w-full h-6 z-50" />}

      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gem-gold/20 blur-2xl rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 0.4 : 0,
            scale: isHovered ? 1.2 : 0.8,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <motion.div
          animate={
            isHovered
              ? { scale: [1.05, 1.1, 1.05], color: "#b8956a", opacity: 1 }
              : pulse
              ? { opacity: [0.6, 1, 0.6], scale: 1, color: "#2cb8a8" }
              : { opacity: 1, scale: 1, color: "#2cb8a8" }
          }
          transition={{
            duration: isHovered ? 3 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 transition-all duration-700"
        >
          <Icon size={20} strokeWidth={1} className="absolute inset-0 opacity-30 blur-[3px] translate-x-[1px] translate-y-[1px]" />
          <Icon size={20} strokeWidth={1.1} className="relative drop-shadow-[0_0_10px_rgba(44,184,168,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(184,149,106,0.5)] transition-all duration-700" />
        </motion.div>
      </div>

      <span className="text-[12px] font-body font-bold tracking-[0.3em] text-[var(--nav-text)] group-hover:text-[var(--nav-text-hover)] transition-all duration-300 relative">
        {label}
        <motion.div
          className="absolute -bottom-1 left-0 h-[1px] bg-gem-teal/50"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </span>

      {/* Dropdown */}
      {dropdownItems && (
        <motion.div
          role="menu"
          aria-label={`${label} submenu`}
          initial={{ opacity: 0, y: 15, scale: 0.95, rotateX: -20 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 15,
            scale: isHovered ? 1 : 0.95,
            rotateX: isHovered ? 0 : -20,
            pointerEvents: isHovered ? ("auto" as const) : ("none" as const),
          }}
          style={{ originY: 0, perspective: 1000, background: "var(--nav-dropdown-bg)", borderColor: "var(--nav-dropdown-border)" }}
          transition={{
            duration: isHovered ? 0.6 : 0.5,
            delay: isHovered ? 0.2 : 0,
            ease: isHovered ? [0.23, 1, 0.32, 1] : [0.4, 0, 0.2, 1],
          }}
          className="absolute top-full left-0 mt-4 w-64 backdrop-blur-2xl border rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60]"
        >
          <div className="py-3">
            {dropdownItems.map((item, idx) => (
              <motion.div
                key={item.label}
                role="menuitem"
                tabIndex={isHovered ? 0 : -1}
                onClick={() => { setIsHovered(false); onNavigate(item.href, item.isHash); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsHovered(false);
                    onNavigate(item.href, item.isHash);
                  }
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -12 }}
                transition={{
                  delay: isHovered ? idx * 0.06 + 0.2 : 0,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ backgroundColor: "rgba(44, 184, 168, 0.1)" }}
                className="px-6 py-3.5 text-[12px] font-body font-bold tracking-[0.2em] text-[var(--nav-text)] hover:text-gem-teal transition-all cursor-pointer flex items-center gap-4 group/item focus:outline-none focus:bg-gem-teal/10 focus:text-gem-teal"
              >
                <item.icon size={16} className="text-gem-teal/60 group-hover/item:text-gem-teal transition-colors" />
                <span className="flex-1">{item.label.toUpperCase()}</span>
                <motion.div className="opacity-0 group-hover/item:opacity-100 transition-opacity" whileHover={{ x: 3 }}>
                  <Diamond size={10} className="text-gem-teal" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gem-teal/30 to-transparent" />
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── BookNow Button ──────────────────────────────────────────────────────────

const BookNowButton = ({ fullWidth = false, onClick }: { fullWidth?: boolean; onClick: () => void }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`relative overflow-hidden px-7 py-2.5 rounded-full group shadow-lg ${fullWidth ? "w-full" : ""}`}
      style={{
        border: "1px solid rgba(184,149,106,0.35)",
        background: "linear-gradient(135deg, rgba(26,138,158,0.25) 0%, rgba(44,184,168,0.15) 100%)",
        boxShadow: "0 4px 15px rgba(26,138,158,0.1)",
      }}
      variants={{
        initial: { scale: 1 },
        hover: {
          scale: 1.05,
          boxShadow: "0 0 40px rgba(44, 184, 168, 0.15)",
        },
        tap: { scale: 0.98 },
      }}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-25deg] pointer-events-none"
        variants={{
          initial: { x: "-150%" },
          hover: {
            x: "150%",
            transition: { duration: 1.2, repeat: Infinity, repeatDelay: 0.8, ease: "linear" },
          },
        }}
      />

      {/* Hover bg */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, rgba(26,138,158,0.35) 0%, rgba(44,184,168,0.2) 100%)" }} />

      {/* Ripples */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute rounded-full pointer-events-none z-0"
          style={{ left: ripple.x - 30, top: ripple.y - 30, width: 60, height: 60, background: "rgba(44,184,168,0.3)" }}
        />
      ))}

      <div className="relative z-10 flex items-center gap-3">
        <span className="text-[11px] font-body font-bold tracking-[0.3em] transition-colors" style={{ color: "#d4ad7c" }}>
          BOOK NOW
        </span>
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
          style={{ color: "#d4ad7c", filter: "drop-shadow(0 0 10px rgba(212,173,124,0.6))" }}
        >
          <Sparkles size={18} fill="currentColor" />
        </motion.div>
      </div>
    </motion.button>
  );
};

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const { navigateTo } = useWaveNav();

  const isHomepage = location.pathname === "/";


  // Dark mode init
  useEffect(() => {
    const saved = localStorage.getItem("gem-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll but allow drawer to scroll
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isMenuOpen]);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gem-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gem-theme", "light");
    }
  };

  const handleNav = (href: string, isHash?: boolean) => {
    setIsMenuOpen(false);
    if (isHash) {
      if (location.pathname !== "/") {
        navigateTo("/");
        setTimeout(() => {
          const id = href.replace("#", "");
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 1600);
      } else {
        const id = href.replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigateTo(href);
    }
  };

  const navSolid = isScrolled || !isHomepage;

  // Nav data
  const experiencesSubs: DropdownChild[] = [
    { label: "Island Adventures", icon: Palmtree, href: "/book" },
    { label: "Cultural Tours", icon: Map, href: "/book" },
    { label: "Circumnavigations", icon: Compass, href: "/book" },
    { label: "Signature Packages", icon: Sparkles, href: "/packages" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        navSolid
          ? "nav-solid backdrop-blur-2xl py-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
          : "nav-transparent bg-transparent py-2 sm:py-3"
      }`}
      style={{
        backgroundColor: navSolid ? "var(--nav-glass-bg)" : "transparent",
        borderBottom: navSolid ? "1px solid var(--nav-glass-border)" : "none",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        }}
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between pb-1.5 ${navSolid ? "border-b border-gem-teal/10" : ""}`}
      >
        {/* Logo */}
        <motion.button
          onClick={() => navigateTo("/")}
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 gem-logo-wrap"
          aria-label="Gemscape home"
        >
          <div className="gem-logo-aura">
            <img
              src="/images/gemscape-logo.png"
              alt="Gemscape Travel & Tours"
              className="h-[36px] sm:h-[42px] w-auto object-contain gem-logo-img"
              style={{ background: "transparent", minWidth: 100 }}
            />
            <div className="gem-logo-shimmer" />
          </div>
        </motion.button>

        {/* Desktop Nav */}
        <motion.nav
          
          variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:flex items-center gap-2 ml-auto mr-4"
        >
          <NavItem icon={Gem} label="EXPERIENCES" href="/book" dropdownItems={experiencesSubs} onNavigate={handleNav} />
          <NavItem icon={Diamond} label="RENTALS" href="/rentals" pulse={false} onNavigate={handleNav} />
          <NavItem icon={Sparkles} label="CONCIERGE" href="/concierge" pulse={false} onNavigate={handleNav} />
          <NavItem icon={Mail} label="CONTACT" href="/contact" pulse={false} onNavigate={handleNav} />
        </motion.nav>

        {/* Right controls */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3 sm:gap-4"
        >
          <div className="hidden sm:block">
            <CurrencyToggle />
          </div>
          <motion.div className="hidden md:block">
            <BookNowButton onClick={() => navigateTo("/book")} />
          </motion.div>
          <SkyToggle checked={isDark} onChange={toggleTheme} />

          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 rounded-full transition-all duration-300 active:scale-90"
            style={{ color: "#b8956a" }}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </motion.div>
      </motion.div>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#05181e] border-l border-gem-teal/10 shadow-2xl flex flex-col p-8"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between mb-12">
                <img src="/images/gemscape-logo.png" alt="Gemscape" className="h-8 w-auto" style={{ background: "transparent" }} />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gem-teal p-2 hover:bg-gem-teal/10 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                }}
                className="flex flex-col gap-8 flex-1"
              >
                {/* Nav section */}
                <div className="flex flex-col gap-4">
                  <motion.span
                    variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                    className="text-[12px] font-body font-bold tracking-[0.3em] text-gem-teal/60 uppercase"
                  >
                    Navigation
                  </motion.span>
                  <div className="flex flex-col gap-4">
                    {/* Experiences with sub-items */}
                    <motion.div
                      variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                      whileHover={{ x: 8, backgroundColor: "rgba(44, 184, 168, 0.05)" }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col gap-2 p-3 rounded-xl transition-colors cursor-pointer group"
                    >
                      <button onClick={() => handleNav("/book")} className="flex items-center gap-4 text-white/80 group-hover:text-white w-full text-left">
                        <Gem size={20} className="text-gem-teal group-hover:text-gem-aqua transition-colors" />
                        <span className="text-sm font-body font-bold tracking-[0.2em]">EXPERIENCES</span>
                      </button>
                      <div className="pl-9 flex flex-col gap-3 mt-2">
                        {experiencesSubs.map((sub) => (
                          <motion.button
                            key={sub.label}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNav(sub.href, sub.isHash)}
                            className="flex items-center gap-3 text-white/40 hover:text-gem-teal transition-colors text-left"
                          >
                            <sub.icon size={14} />
                            <span className="text-[12px] font-body font-bold tracking-widest">{sub.label.toUpperCase()}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Simple items */}
                    {[
                      { icon: Diamond, label: "RENTALS", href: "/rentals" },
                      { icon: Sparkles, label: "CONCIERGE", href: "/concierge" },
                      { icon: Mail, label: "CONTACT", href: "/contact" },
                    ].map((item) => (
                      <motion.button
                        key={item.label}
                        variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                        whileHover={{ x: 8, backgroundColor: "rgba(44, 184, 168, 0.05)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleNav(item.href)}
                        className="flex items-center gap-4 text-white/80 hover:text-white p-3 rounded-xl transition-colors cursor-pointer group w-full text-left"
                      >
                        <item.icon size={20} className="text-gem-teal group-hover:text-gem-aqua transition-colors" />
                        <span className="text-sm font-body font-bold tracking-[0.2em]">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <motion.div
                  variants={{ open: { opacity: 1, scaleX: 1 }, closed: { opacity: 0, scaleX: 0 } }}
                  className="h-[1px] w-full bg-gem-teal/15 origin-left"
                />

                {/* Settings */}
                <div className="flex flex-col gap-6">
                  <motion.span
                    variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                    className="text-[12px] font-body font-bold tracking-[0.3em] text-gem-teal/60 uppercase"
                  >
                    Settings
                  </motion.span>
                  <motion.div
                    variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-body font-bold tracking-[0.2em] text-white/80">CURRENCY</span>
                    <CurrencyToggle />
                  </motion.div>
                  <motion.div
                    variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 20 } }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-body font-bold tracking-[0.2em] text-white/80">THEME</span>
                    <SkyToggle checked={isDark} onChange={toggleTheme} />
                  </motion.div>
                </div>

                {/* Book Now */}
                <motion.div
                  variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
                  className="mt-auto pt-8"
                >
                  <BookNowButton fullWidth onClick={() => handleNav("/book")} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
