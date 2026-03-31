import { useCurrency } from "@/contexts/CurrencyContext";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  const { currency } = useCurrency();

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, hsl(200 70% 10%) 0%, hsl(200 70% 8%) 100%)",
        borderTop: "1px solid rgba(184,150,90,0.15)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Gold accent line */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "72px 40px 40px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: 48,
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <img
            src="/images/gemscape-logo.png"
            alt="Gemscape Travel and Tours"
            style={{
              height: 56,
              width: "auto",
              objectFit: "contain",
              marginBottom: 20,
              background: "none",
            }}
            className="bg-transparent"
          />
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 260,
              marginBottom: 24,
            }}
          >
            Premium travel experiences in Antigua &amp; Barbuda — private rentals, island tours, and flight concierge for discerning travellers.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            {[
              { icon: Instagram, label: "Instagram", href: "#" },
              { icon: Facebook, label: "Facebook", href: "#" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.6)",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                  e.currentTarget.style.color = "#C9A84C";
                  e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={16} />
              </a>
            ))}
            {/* TikTok custom */}
            <a
              href="#"
              aria-label="TikTok"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.6)",
                transition: "all 0.3s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                e.currentTarget.style.color = "#C9A84C";
                e.currentTarget.style.background = "rgba(201,168,76,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.37 6.37 0 0 0 0 12.74 6.37 6.37 0 0 0 6.38-6.38V9.42a8.16 8.16 0 0 0 4.72 1.5v-3.4a4.85 4.85 0 0 1-1-.83z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Services column */}
        <div>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".18em",
              color: "rgba(201,168,76,0.8)",
              marginBottom: 20,
              display: "block",
            }}
          >
            Services
          </span>
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Private Rentals", "Island Circumnavigation", "Cultural Tours", "Flight Concierge"].map((s) => (
              <a
                key={s}
                href="#services"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {s}
              </a>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".18em",
              color: "rgba(201,168,76,0.8)",
              marginBottom: 20,
              display: "block",
            }}
          >
            Quick Links
          </span>
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Book a Tour", href: "/book" },
              { label: "Vehicle Rentals", href: "/rentals" },
              { label: "Concierge", href: "/concierge" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Contact column */}
        <div>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".18em",
              color: "rgba(201,168,76,0.8)",
              marginBottom: 20,
              display: "block",
            }}
          >
            Contact
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <MapPin size={14} style={{ color: "rgba(201,168,76,0.6)", marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                St. John's, Antigua &amp; Barbuda, W.I.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Phone size={14} style={{ color: "rgba(201,168,76,0.6)", marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                <a href="tel:+12687805510" style={{ color: "inherit", textDecoration: "none" }}>+1 (268) 780-5510</a>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Mail size={14} style={{ color: "rgba(201,168,76,0.6)", marginTop: 3, flexShrink: 0 }} />
              <a
                href="mailto:info@gemscapetours.com"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                info@gemscapetours.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 40px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © 2026 Gemscape Travel and Tours. All rights reserved.
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Built with pride in Antigua &amp; Barbuda
        </span>
      </div>

      {/* Currency note */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          paddingBottom: 24,
        }}
      >
        {currency === "XCD"
          ? "Prices shown in Eastern Caribbean Dollars (EC$). 1 USD = 2.70 XCD."
          : "Prices shown in US Dollars (USD). Toggle to EC$ above."}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            padding: 48px 24px 32px !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
