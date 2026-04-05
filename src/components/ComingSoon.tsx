export default function ComingSoon() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #022c22 0%, #05181e 40%, #0a2a1f 100%)",
        color: "#fff",
        fontFamily: "'Cormorant Garamond', serif",
        textAlign: "center",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <img
        src="/images/gemscape-logo.webp"
        alt="Gemscape Travel & Tours"
        width={160}
        height={67}
        style={{ marginBottom: 48, opacity: 0.9 }}
      />

      {/* Eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.5)" }} />
        <span
          style={{
            fontSize: 13,
            letterSpacing: ".3em",
            color: "#C9A84C",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Coming Soon
        </span>
        <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.5)" }} />
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: "clamp(36px, 7vw, 64px)",
          fontWeight: 400,
          lineHeight: 1.15,
          margin: "0 0 20px",
        }}
      >
        Something{" "}
        <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
          Extraordinary
        </span>
      </h1>

      {/* Sub copy */}
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 460,
          margin: "0 auto 40px",
        }}
      >
        Antigua & Barbuda's premier private travel experience is launching soon.
        Private tours, luxury rentals & VIP concierge — crafted for the extraordinary.
      </p>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/12687805510"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
          color: "#fff",
          padding: "16px 32px",
          border: "none",
          borderRadius: 4,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          textDecoration: "none",
          cursor: "pointer",
          boxShadow: "0 0 30px rgba(44,184,168,0.3), 0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        Get in Touch
      </a>
    </div>
  );
}
