import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";

const NAVY = "#0d1b2a";
const NAVY_DEEP = "#0a1622";
const TEAL = "#2a9d8f";
const TEAL_BRIGHT = "#3dbcad";
const GOLD = "#e9c46a";
const CREAM = "#f6f1e7";

const SERVICES = [
  {
    icon: "🗺️",
    anchor: "itinerary",
    title: "Personalized Itinerary Planning",
    body:
      "Your personal Caribbean roadmap, built entirely around your pace, passions, and people.",
  },
  {
    icon: "✈️",
    anchor: "transfers",
    title: "Airport Transfers",
    body:
      "Seamless arrivals and departures — your driver is waiting, name on a sign, first moments begin stress-free.",
  },
  {
    icon: "🏝️",
    anchor: "excursions",
    title: "Island Excursions",
    body:
      "Hidden beaches the tour buses never visit, local villages full of culture, historical landmarks with stories to tell.",
  },
  {
    icon: "🚢",
    anchor: "cruise",
    title: "Cruise Passenger Experiences",
    body:
      "You have a few precious port hours. We transform them into the highlight of your entire cruise.",
  },
  {
    icon: "🌅",
    anchor: "getaways",
    title: "Caribbean Getaways",
    body:
      "A weekend or a full week — we’ll design a complete escape built around the Caribbean you want to discover.",
  },
  {
    icon: "💼",
    anchor: "business",
    title: "Business & Leisure",
    body:
      "Your professional commitments met, Caribbean moments waiting. We coordinate both with equal care.",
  },
  {
    icon: "🚗",
    anchor: "transport",
    title: "Transportation Coordination",
    body:
      "Reliable, comfortable, always on time. Every arrangement reflects the Gemscape standard of care.",
  },
  {
    icon: "🥂",
    anchor: "celebrations",
    title: "Group & Private Celebrations",
    body:
      "Birthday celebrations, anniversary escapes, corporate retreats — we create the experience, you bring the occasion.",
  },
  {
    icon: "🌿",
    anchor: "wellness",
    title: "Wellness Escapes",
    body:
      "Restoration, stillness, and curated wellness in one of the most beautiful places on earth.",
  },
];

const FAQS = [
  {
    q: "Do you only operate in Antigua & Barbuda?",
    a: "Antigua & Barbuda is our home and where our deepest local network lives. We also coordinate multi-island Caribbean journeys, partnering with trusted guides across the region to extend the same standard of care.",
  },
  {
    q: "How far in advance should I book?",
    a: "Most guests reach out 6–12 weeks before travel. For high season (December–April) or larger groups, earlier is better. Last-minute requests are welcome when our schedule allows.",
  },
  {
    q: "Can I modify my itinerary after planning?",
    a: "Absolutely. Itineraries are living documents — change a beach, swap a dinner, add a day. We expect (and welcome) adjustments before and during your trip.",
  },
  {
    q: "What is included in your coordination fee?",
    a: "Discovery calls, custom itinerary design, vendor coordination, transportation booking, on-island support, and a dedicated point of contact throughout your stay. Specific inclusions are confirmed in your quote.",
  },
  {
    q: "Do you offer group or corporate rates?",
    a: "Yes. Groups of 6+ and corporate retreats receive tailored pricing and dedicated logistics support. Share your group size and goals and we’ll respond with options.",
  },
  {
    q: "How do I reach you urgently while I'm traveling?",
    a: "Every confirmed guest receives a direct WhatsApp line to our coordination team — available throughout daylight hours and on-call for true emergencies, every day of your trip.",
  },
];

const Services = () => {
  const { navigateTo } = useWaveNav();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Helmet>
        <title>Services | Gemscape — Curated Caribbean Coordination</title>
        <meta
          name="description"
          content="Itinerary planning, airport transfers, excursions, cruise VIP, transportation, celebrations, and wellness — coordinated end-to-end across Antigua & the Caribbean."
        />
        <link rel="canonical" href="https://gemscapetours.com/services" />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section
        style={{
          background: NAVY,
          minHeight: 240,
          padding: "120px 40px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 44,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.005em",
              margin: 0,
            }}
            className="srv-hero-h1"
          >
            Everything Your Journey Needs.
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              marginTop: 16,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            From the moment you land to the moment you leave — coordinated with
            personal attention and genuine local knowledge.
          </p>
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section
        style={{ background: CREAM, padding: "56px 40px" }}
        className="srv-grid-section"
      >
        <div
          style={{ maxWidth: 1200, margin: "0 auto" }}
          className="srv-grid"
        >
          {SERVICES.map((s) => (
            <article
              key={s.anchor}
              id={s.anchor}
              className="srv-card"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(13,27,42,0.08)",
                borderRadius: 14,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                transition: "transform .2s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(13,27,42,0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: "rgba(42,157,143,0.12)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 14,
                }}
                aria-hidden="true"
              >
                {s.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontSize: 19,
                  color: NAVY,
                  margin: "0 0 10px",
                  lineHeight: 1.25,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: 13.5,
                  color: "rgba(13,27,42,0.66)",
                  lineHeight: 1.65,
                  margin: 0,
                  flex: 1,
                }}
              >
                {s.body}
              </p>
              <button
                onClick={() => navigateTo("/experiences")}
                style={{
                  marginTop: 16,
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "none",
                  color: TEAL,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Included in most itineraries →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{ background: CREAM, padding: "16px 40px 72px" }}
        className="srv-faq-section"
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: 32,
              color: NAVY,
              margin: "0 0 28px",
              textAlign: "center",
            }}
            className="srv-faq-h2"
          >
            Common Questions
          </h2>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(13,27,42,0.08)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {FAQS.map((item, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={i}
                  style={{
                    borderTop:
                      i === 0
                        ? "none"
                        : "1px solid rgba(13,27,42,0.06)",
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-expanded={open}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: 15,
                      color: NAVY,
                    }}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      color={TEAL}
                      style={{
                        transform: open ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform .3s ease",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: open ? "1fr" : "0fr",
                      transition: "grid-template-rows .3s ease",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          margin: 0,
                          padding: "0 22px 20px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          color: "rgba(13,27,42,0.7)",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section
        style={{
          background: NAVY_DEEP,
          padding: "56px 40px",
          textAlign: "center",
        }}
        className="srv-bottom-cta"
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 32,
              color: "#ffffff",
              margin: "0 0 24px",
              lineHeight: 1.2,
            }}
            className="srv-bottom-h2"
          >
            Ready to start?
          </h2>
          <button
            onClick={() => navigateTo("/build-itinerary")}
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_BRIGHT} 100%)`,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "16px 32px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 0 28px rgba(44,184,168,0.55), 0 8px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Build My Itinerary
          </button>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .srv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .srv-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .srv-grid { grid-template-columns: 1fr; gap: 14px; }
          .srv-hero-h1 { font-size: 32px !important; }
          .srv-grid-section { padding: 40px 20px !important; }
          .srv-faq-section { padding: 8px 20px 56px !important; }
          .srv-faq-h2 { font-size: 26px !important; }
          .srv-bottom-cta { padding: 48px 20px !important; }
          .srv-bottom-h2 { font-size: 26px !important; }
        }
      `}</style>
    </div>
  );
};

export default Services;
