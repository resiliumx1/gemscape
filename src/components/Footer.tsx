import { useCurrency } from "@/contexts/CurrencyContext";

const Footer = () => {
  const { currency } = useCurrency();

  return (
    <footer className="gem-footer">
      <div className="gem-footer__grid">
        {/* Left — Brand */}
        <div className="gem-footer__brand">
          <span className="gem-footer__logo">GEMSCAPE</span>
          <p className="gem-footer__tagline">Antigua's premier travel experience</p>
          <div className="gem-footer__socials">
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="gem-footer__social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="gem-footer__social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" aria-label="TikTok" className="gem-footer__social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.37 6.37 0 0 0 0 12.74 6.37 6.37 0 0 0 6.38-6.38V9.42a8.16 8.16 0 0 0 4.72 1.5v-3.4a4.85 4.85 0 0 1-1-.83z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Center — Services */}
        <div className="gem-footer__col">
          <span className="gem-footer__label">Services</span>
          <nav className="gem-footer__links">
            <a href="#services">Private Rentals</a>
            <a href="#services">Island Circumnavigation</a>
            <a href="#services">Flight Concierge</a>
          </nav>
        </div>

        {/* Right — Contact */}
        <div className="gem-footer__col">
          <span className="gem-footer__label">Contact</span>
          <div className="gem-footer__contact">
            <span>St. John's, Antigua, W.I.</span>
            <span>WhatsApp: +1 (268) 000-0000</span>
            <a href="mailto:info@gemscapetours.com">info@gemscapetours.com</a>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="gem-footer__bottom">
        <span>© 2025 Gemscape Travel and Tours. All rights reserved.</span>
        <span>Built with pride in Antigua</span>
      </div>
      <div style={{
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 300,
        fontSize: '11px',
        color: 'rgba(255,255,255,0.28)',
        paddingBottom: '24px',
      }}>
        {currency === 'XCD'
          ? 'Prices shown in Eastern Caribbean Dollars (EC$). 1 USD = 2.70 XCD.'
          : 'Prices shown in US Dollars (USD). Toggle to EC$ above.'}
      </div>
    </footer>
  );
};

export default Footer;
