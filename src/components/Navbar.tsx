import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { Sparkles, Diamond, Gem } from "lucide-react";
import { useWaveNav } from "@/components/PageTransitionWave";
import SkyToggle from "@/components/ui/sky-toggle";

type NavItem = { label: string; href: string; icon: React.ReactNode } | { label: string; to: string; icon: React.ReactNode };

const iconClass = "text-[#2dd4bf] opacity-60 group-hover:opacity-100 group-hover:text-[#81e6d9] transition-all duration-300";

const NAV_LINKS: NavItem[] = [
  { label: "Experiences", href: "#experiences", icon: <Sparkles size={12} className={iconClass} /> },
  { label: "Rentals", to: "/rentals", icon: <Diamond size={12} className={iconClass} /> },
  { label: "Concierge", to: "/concierge", icon: <Gem size={12} className={iconClass} /> },
  { label: "About", href: "#why-gemscape", icon: <Sparkles size={12} className={iconClass} /> },
  { label: "Contact", href: "#contact", icon: <Sparkles size={12} className={iconClass} /> },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { navigateTo } = useWaveNav();

  const isRouteLink = (link: NavItem): link is { label: string; to: string; icon: React.ReactNode } => "to" in link;

  // Dark mode init
  useEffect(() => {
    const saved = localStorage.getItem('gem-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP stagger for mobile links
  useEffect(() => {
    if (mobileOpen && mobileLinksRef.current) {
      const links = mobileLinksRef.current.querySelectorAll(".mobile-nav-link");
      gsap.fromTo(
        links,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: "power3.out", delay: 0.2 }
      );
    }
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
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
  };

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gem-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gem-theme', 'light');
    }
  };

  return (
    <>
      <nav
        className={`gem-nav${scrolled ? " scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <button
          className="gem-nav__logo"
          aria-label="Gemscape home"
          onClick={() => navigateTo("/")}
        >
          <img src="/images/gemscape-logo.png" alt="Gemscape Travel and Tours" style={{ height: 52, width: "auto", objectFit: "contain" }} />
        </button>

        {/* Desktop links */}
        <div className="gem-nav__links">
          {NAV_LINKS.map((link) =>
            isRouteLink(link) ? (
              <button
                key={link.label}
                className={`group flex items-center gap-1.5 gem-nav__link${location.pathname === link.to ? " active" : ""}`}
                onClick={() => navigateTo(link.to)}
              >
                {link.icon}
                <span className="nav-link text-xs font-semibold tracking-widest uppercase">{link.label}</span>
              </button>
            ) : (
              <button
                key={link.label}
                className="group flex items-center gap-1.5 gem-nav__link"
                onClick={() => handleNavClick(link.href)}
              >
                {link.icon}
                <span className="nav-link text-xs font-semibold tracking-widest uppercase">{link.label}</span>
              </button>
            )
          )}
        </div>

        {/* Right side — desktop only toggles */}
        <div className="gem-nav__right">
          <div className="gem-nav__desktop-toggles">
            <CurrencyToggle />
          </div>
          <button
            className="gem-nav__book-btn"
            onClick={() => navigateTo("/book")}
          >
            Book Now
          </button>
          <div className="gem-nav__desktop-toggles">
            <SkyToggle checked={isDark} onChange={toggleTheme} />
          </div>
          <button
            className="gem-nav__hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        ref={mobileMenuRef}
        className={`gem-mobile-menu${mobileOpen ? " open" : ""}`}
      >
        <button
          className="gem-mobile-menu__close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>
        <div ref={mobileLinksRef} className="gem-mobile-menu__links">
          {NAV_LINKS.map((link) =>
            isRouteLink(link) ? (
              <button
                key={link.label}
                className="mobile-nav-link"
                onClick={() => {
                  setMobileOpen(false);
                  navigateTo(link.to);
                }}
              >
                {link.label}
              </button>
            ) : (
              <button
                key={link.label}
                className="mobile-nav-link"
                onClick={() => {
                  setMobileOpen(false);
                  handleNavClick(link.href);
                }}
              >
                {link.label}
              </button>
            )
          )}
          <button
            className="gem-mobile-menu__book mobile-nav-link"
            onClick={() => { setMobileOpen(false); navigateTo("/book"); }}
          >
            Book Now
          </button>
          <div className="gem-mobile-menu__controls">
            <CurrencyToggle />
            <SkyToggle checked={isDark} onChange={toggleTheme} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
