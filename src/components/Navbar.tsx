import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

type NavItem = { label: string; href: string } | { label: string; to: string };

const NAV_LINKS: NavItem[] = [
  { label: "Experiences", href: "#experiences" },
  { label: "Rentals", to: "/rentals" },
  { label: "Circumnavigation", href: "#circumnavigation" },
  { label: "Concierge", href: "#concierge" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteLink = (link: NavItem): link is { label: string; to: string } => "to" in link;

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
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`gem-nav${scrolled ? " scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="/" className="gem-nav__logo" aria-label="Gemscape home">
          <span className="gem-nav__logo-text">GEMSCAPE</span>
        </a>

        {/* Desktop links */}
        <div className="gem-nav__links">
          {NAV_LINKS.map((link) =>
            isRouteLink(link) ? (
              <a
                key={link.label}
                href={link.to}
                className={`gem-nav__link${location.pathname === link.to ? " active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.to);
                }}
              >
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href} className="gem-nav__link">
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Book Now + Hamburger */}
        <div className="gem-nav__right">
          <a href="#book" className="gem-nav__book">
            Book Now
          </a>
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
              <a
                key={link.label}
                href={link.to}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  navigate(link.to);
                }}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="#book"
            className="gem-mobile-menu__book mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Book Now
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
