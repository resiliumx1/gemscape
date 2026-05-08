import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mail, Shield, MessageCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import { useWaveNav } from "@/components/WavePageTransition";

// ─── NavLink (minimal) ───────────────────────────────────────────────────────

const NavLink = ({
  label,
  href,
  isHash,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  isHash?: boolean;
  active?: boolean;
  onNavigate: (href: string, isHash?: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onNavigate(href, isHash)}
      className="group relative px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gem-teal/40 rounded-md"
    >
      <span
        className={`text-[11px] font-body tracking-[0.22em] uppercase transition-colors duration-300 ${
          active ? "text-[var(--nav-text-hover)]" : "text-[var(--nav-text)] group-hover:text-[var(--nav-text-hover)]"
        }`}
      >
        {label}
      </span>
      <motion.span
        className="absolute left-3 right-3 -bottom-0.5 h-px bg-gem-gold/60 origin-center"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformOrigin: "center" }}
      />
    </button>
  );
};

// ─── Primary CTA ─────────────────────────────────────────────────────────────

const PrimaryCta = ({ fullWidth = false, onClick }: { fullWidth?: boolean; onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04, y: -1 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 320, damping: 22 }}
    className={`relative overflow-hidden px-6 py-2.5 rounded-full group nav-primary-cta ${fullWidth ? "w-full" : ""}`}
    style={{
      border: "1px solid rgba(184,149,106,0.55)",
      background:
        "linear-gradient(135deg, rgba(26,138,158,0.22) 0%, rgba(184,149,106,0.18) 100%)",
      boxShadow:
        "0 0 0 rgba(184,149,106,0), inset 0 1px 0 rgba(255,255,255,0.08)",
      transition: "box-shadow 350ms ease, background 350ms ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow =
        "0 8px 24px rgba(26,138,158,0.28), 0 0 22px rgba(212,173,124,0.30), inset 0 1px 0 rgba(255,255,255,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow =
        "0 0 0 rgba(184,149,106,0), inset 0 1px 0 rgba(255,255,255,0.08)";
    }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
      initial={{ x: "-150%" }}
      whileHover={{ x: "150%" }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    <span className="relative z-10 flex items-center justify-center">
      <span
        className="text-[12.5px] font-body font-semibold tracking-[0.22em] whitespace-nowrap"
        style={{ color: "#e2bd8a" }}
      >
        Build My Itinerary
      </span>
    </span>
  </motion.button>
);

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { navigateTo } = useWaveNav();

  const isHomepage = location.pathname === "/";

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
          const id = href.replace("/#", "").replace("#", "");
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 1600);
      } else {
        const id = href.replace("/#", "").replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigateTo(href);
    }
  };

  const navSolid = isScrolled || !isHomepage;

  const navItems = [
    { label: "Experiences", href: "/experiences" },
    { label: "Itineraries", href: "/build-itinerary" },
    { label: "Services", href: "/#services", isHash: true },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string, isHash?: boolean) => {
    if (isHash) return false;
    return location.pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-out ${
        navSolid ? "backdrop-blur-xl" : "bg-transparent"
      }`}
      style={{
        backgroundColor: navSolid ? "var(--nav-glass-bg)" : "transparent",
        paddingTop: isScrolled ? "0.4rem" : "0.85rem",
        paddingBottom: isScrolled ? "0.4rem" : "0.85rem",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-6">
        {/* Logo (left) */}
        <motion.button
          onClick={() => navigateTo("/")}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center shrink-0 gem-logo-wrap"
          aria-label="Gemscape home"
        >
          <div className="gem-logo-aura">
            <img
              src="/images/gemscape-logo.webp"
              alt="Gemscape Travel & Tours"
              width={100}
              height={42}
              className={`w-auto object-contain gem-logo-img transition-all duration-500 ${
                isScrolled ? "h-[28px] sm:h-[32px]" : "h-[34px] sm:h-[38px]"
              }`}
              style={{ background: "transparent" }}
            />
            <div className="gem-logo-shimmer" />
          </div>
        </motion.button>

        {/* Center nav (desktop) */}
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              href={item.href}
              isHash={item.isHash}
              active={isActive(item.href, item.isHash)}
              onNavigate={handleNav}
            />
          ))}
        </motion.nav>

        {/* Right controls */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center gap-3 sm:gap-4 shrink-0"
        >
          <SkyToggle checked={isDark} onChange={toggleTheme} />

          <div className="hidden md:block">
            <PrimaryCta onClick={() => navigateTo("/build-itinerary")} />
          </div>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 rounded-full transition-all duration-300 active:scale-90"
            style={{ color: "#b8956a" }}
            aria-label="Open navigation menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </motion.div>
      </div>

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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-[#05181e] shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-10">
                <img
                  src="/images/gemscape-logo.webp"
                  alt="Gemscape"
                  className="h-8 w-auto"
                  style={{ background: "transparent" }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gem-teal p-2 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={1.5} />
                </motion.button>
              </div>

              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
                }}
                className="flex flex-col flex-1 px-7 pb-8"
              >
                {/* Nav links */}
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.label}
                      variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 16 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNav(item.href, item.isHash)}
                      className="text-left py-4 border-b border-white/5 group"
                    >
                      <span className="text-white/85 group-hover:text-white text-base font-display tracking-wide transition-colors">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 12 } }}
                  className="mt-10"
                >
                  <PrimaryCta fullWidth onClick={() => handleNav("/build-itinerary")} />
                </motion.div>

                {/* Contact options */}
                <motion.div
                  variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 12 } }}
                  className="mt-8 flex flex-col gap-3"
                >
                  <a
                    href="https://wa.me/17675200000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-gem-teal/30 transition-colors"
                  >
                    <MessageCircle size={18} className="text-gem-teal" strokeWidth={1.5} />
                    <span className="text-white/80 text-sm tracking-wide">WhatsApp Concierge</span>
                  </a>
                  <button
                    onClick={() => handleNav("/contact")}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-gem-teal/30 transition-colors text-left"
                  >
                    <Mail size={18} className="text-gem-teal" strokeWidth={1.5} />
                    <span className="text-white/80 text-sm tracking-wide">Email Us</span>
                  </button>
                </motion.div>

                {/* Settings */}
                <motion.div
                  variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 12 } }}
                  className="mt-10 pt-6 border-t border-white/5 flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Currency</span>
                    <CurrencyToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Theme</span>
                    <SkyToggle checked={isDark} onChange={toggleTheme} />
                  </div>
                  {!location.pathname.startsWith("/admin") && (
                    <button
                      onClick={() => handleNav("/admin")}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Admin</span>
                      <Shield size={16} style={{ color: "#b8956a" }} strokeWidth={1.5} />
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
