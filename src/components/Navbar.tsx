import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem, Diamond, Sparkles, Palmtree, Map, Compass,
  X, Menu, ChevronDown,
} from "lucide-react";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import SkyToggle from "@/components/ui/sky-toggle";
import { useWaveNav } from "@/components/PageTransitionWave";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isHash?: boolean;
  children?: NavChild[];
}

// ─── Nav Data ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "EXPERIENCES",
    href: "/book",
    icon: <Gem size={18} />,
    children: [
      { label: "ISLAND ADVENTURES", href: "/book", icon: <Palmtree size={13} /> },
      { label: "CULTURAL TOURS", href: "/book", icon: <Map size={13} /> },
      { label: "CIRCUMNAVIGATIONS", href: "/book", icon: <Compass size={13} /> },
    ],
  },
  { label: "RENTALS", href: "/rentals", icon: <Diamond size={18} /> },
  { label: "CONCIERGE", href: "/concierge", icon: <Sparkles size={18} /> },
  { label: "ABOUT", href: "#why-gemscape", icon: <Gem size={18} />, isHash: true },
  { label: "CONTACT", href: "#contact", icon: <Gem size={18} />, isHash: true },
];

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────

function DesktopDropdown({ item, onNavigate }: { item: NavItem; onNavigate: (href: string, isHash?: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = !item.isHash && location.pathname.startsWith(item.href);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => onNavigate(item.href, item.isHash)}
        className={`flex items-center gap-1.5 text-[11px] font-body font-bold tracking-[0.18em] transition-colors duration-200 py-2 ${
          isActive ? "text-gem-teal" : "text-foreground/80 hover:text-foreground"
        }`}
      >
        {item.label}
        {item.children && (
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {item.children && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl overflow-hidden z-50 border border-gem-teal/15"
              style={{
                background: "rgba(5, 24, 30, 0.97)",
                backdropFilter: "blur(20px)",
              }}
            >
              {item.children.map((child) => (
                <button
                  key={child.label}
                  onClick={() => { setOpen(false); onNavigate(child.href); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-body font-bold tracking-widest text-white/50 hover:text-gem-teal hover:bg-gem-teal/5 transition-colors"
                >
                  <span className="text-gem-teal/60">{child.icon}</span>
                  {child.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { navigateTo } = useWaveNav();

  const isHomepage = location.pathname === "/";
  const isLightPage = !isHomepage;

  // Dark mode init
  useEffect(() => {
    const saved = localStorage.getItem("gem-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setExpandedItem(null);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

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

  const navSolid = scrolled || isLightPage;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center px-4 md:px-8 transition-all duration-300"
        style={{
          height: "68px",
          backgroundColor: navSolid ? "rgba(5, 24, 30, 0.97)" : "transparent",
          backdropFilter: navSolid ? "blur(20px)" : "none",
          boxShadow: navSolid ? "0 1px 0 rgba(44, 184, 168, 0.1)" : "none",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigateTo("/")}
          className="flex items-center gap-3 mr-auto flex-shrink-0"
          aria-label="Gemscape home"
        >
          <img
            src="/images/gemscape-logo.png"
            alt="Gemscape Travel & Tours"
            className="h-[44px] w-auto"
            style={{ background: "transparent" }}
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 mx-auto">
          {NAV_ITEMS.map((item) => (
            <DesktopDropdown key={item.label} item={item} onNavigate={handleNav} />
          ))}
        </nav>

        {/* Desktop Right Controls */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          <CurrencyToggle />
          <button
            onClick={() => navigateTo("/book")}
            className="px-5 py-2.5 text-[11px] font-body font-bold tracking-[0.18em] text-white rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
            }}
          >
            BOOK NOW
          </button>
          <SkyToggle checked={isDark} onChange={toggleTheme} />
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden ml-auto flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
          style={{ color: "#b8956a" }}
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[110]"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 z-[120] flex flex-col"
              style={{
                width: "min(320px, 90vw)",
                background: "rgba(5, 24, 30, 0.99)",
                borderLeft: "1px solid rgba(44, 184, 168, 0.12)",
                backdropFilter: "blur(30px)",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gem-teal/10">
                <img src="/images/gemscape-logo.png" alt="Gemscape" className="h-8 w-auto" style={{ background: "transparent" }} />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/[0.08]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-body font-bold tracking-[0.3em] text-gem-teal/50 uppercase mb-4">
                    Navigation
                  </span>

                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                    >
                      {item.children ? (
                        <div>
                          <button
                            onClick={() =>
                              setExpandedItem(expandedItem === item.label ? null : item.label)
                            }
                            className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group"
                            style={{
                              backgroundColor:
                                expandedItem === item.label
                                  ? "rgba(44, 184, 168, 0.07)"
                                  : "transparent",
                            }}
                          >
                            <span className="text-gem-teal group-hover:text-gem-aqua transition-colors">
                              {item.icon}
                            </span>
                            <span className="text-[13px] font-body font-bold tracking-[0.2em] text-white/80 group-hover:text-white flex-1">
                              {item.label}
                            </span>
                            <motion.div
                              animate={{ rotate: expandedItem === item.label ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={14} className="text-white/30" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {expandedItem === item.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pl-9 flex flex-col gap-1 pb-2 pt-1">
                                  {item.children.map((child) => (
                                    <button
                                      key={child.label}
                                      onClick={() => { setDrawerOpen(false); handleNav(child.href); }}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-gem-teal transition-colors"
                                    >
                                      <span className="text-gem-teal/50">{child.icon}</span>
                                      <span className="text-[10px] font-body font-bold tracking-widest">
                                        {child.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setDrawerOpen(false); handleNav(item.href, item.isHash); }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl text-white/80 hover:text-white group transition-colors text-left"
                        >
                          <span className="text-gem-teal group-hover:text-gem-aqua transition-colors">
                            {item.icon}
                          </span>
                          <span className="text-[13px] font-body font-bold tracking-[0.2em]">
                            {item.label}
                          </span>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="h-px origin-left bg-gem-teal/15"
                />

                {/* Settings */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <span className="text-[10px] font-body font-bold tracking-[0.3em] text-gem-teal/50 uppercase">
                    Settings
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-body font-bold tracking-[0.2em] text-white/70">
                      CURRENCY
                    </span>
                    <CurrencyToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-body font-bold tracking-[0.2em] text-white/70">
                      THEME
                    </span>
                    <SkyToggle checked={isDark} onChange={toggleTheme} />
                  </div>
                </motion.div>
              </div>

              {/* Drawer Footer */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="px-6 pb-8 pt-4 border-t border-gem-teal/10"
              >
                <button
                  onClick={() => { setDrawerOpen(false); navigateTo("/book"); }}
                  className="flex items-center justify-center w-full py-4 rounded-xl text-[12px] font-body font-bold tracking-[0.2em] text-white transition-opacity hover:opacity-90 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                  }}
                >
                  BOOK NOW
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
