import { Helmet } from "react-helmet-async";
import { Anchor, Map, Sailboat, Clock, Users, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";

const EXPERIENCES = [
  {
    icon: Anchor,
    category: "WATER & SEA",
    title: "Island Circumnavigation",
    description: "Full-island private tour — every cove, every beach, every hidden bay. Our guides know Antigua's coastline like no tourist map ever could.",
    duration: "Full Day — 8 hours",
    group: "Up to 12 guests",
    price: "From $280 per group",
  },
  {
    icon: Map,
    category: "LAND & CULTURE",
    title: "Heritage & Discovery",
    description: "History, local rum, and roads no tourist map would ever show you. English Harbour, Shirley Heights, and the real Antigua.",
    duration: "Half Day — 4 hours",
    group: "Up to 8 guests",
    price: "From $180 per group",
  },
  {
    icon: Sailboat,
    category: "WATER & SEA",
    title: "Private Charter",
    description: "Your vessel, your route, your crew. Half or full-day private sailing or motor charter around Antigua's 365 beaches.",
    duration: "Half or Full Day",
    group: "Up to 10 guests",
    price: "From $480 per charter",
  },
];

const Experiences = () => {
  const { navigateTo } = useWaveNav();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Helmet>
        <title>Curated Experiences in Antigua &amp; Barbuda | Gemscape Travel &amp; Tours</title>
        <meta name="description" content="Discover Antigua differently with private island tours, heritage explorations, and luxury charters by Gemscape Travel & Tours." />
      </Helmet>
      <Navbar />

      {/* Header */}
      <section style={{ padding: "160px 24px 60px", textAlign: "center" }}>
        <span style={{ fontSize: 13, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          CURATED EXPERIENCES
        </span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 400, color: "var(--text-primary)", marginTop: 12 }}>
          Antigua &amp; Barbuda Seen Differently.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560, margin: "16px auto 0" }}>
          Every journey we design is a private, unhurried encounter with the most beautiful islands in the Caribbean.
        </p>
      </section>

      {/* Cards grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          {EXPERIENCES.map(exp => (
            <div key={exp.title} className="exp-card" style={{
              background: "var(--card-bg)", border: "1px solid var(--border-color)",
              borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 16,
              transition: "all 0.3s ease", cursor: "default",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, letterSpacing: ".15em", color: "#2cb8a8", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>
                  {exp.category}
                </span>
                <exp.icon size={24} style={{ color: "#C9A84C" }} />
              </div>

              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: "var(--text-primary)" }}>
                {exp.title}
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, flex: 1 }}>
                {exp.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={13} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-secondary)" }}>{exp.duration}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={13} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-secondary)" }}>{exp.group}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DollarSign size={13} style={{ color: "rgba(201,168,76,0.6)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#C9A84C", fontWeight: 500 }}>{exp.price}</span>
                </div>
              </div>

              <button
                onClick={() => navigateTo("/book")}
                style={{
                  background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                  color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: ".12em",
                  padding: "14px 24px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                  transition: "opacity 0.3s", marginTop: 4,
                }}
              >
                Book This Experience →
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .exp-card:hover {
          border-color: rgba(44,184,168,0.4) !important;
          background: rgba(44,184,168,0.04) !important;
        }
      `}</style>
    </div>
  );
};

export default Experiences;
