import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";

const TEAL = "#2a9d8f";
const NAVY = "#0d1b2a";
const CREAM = "#faf7f2";

const AERIAL_IMG =
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1400&q=80";

export default function About() {
  const { navigateTo } = useWaveNav();

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Helmet>
        <title>About Gemscape | Caribbean Travel, Curated by Locals</title>
        <meta name="description" content="Gemscape was built on one idea — that the Caribbean is extraordinary, and most people never experience it the way it deserves to be." />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section style={{ background: NAVY, color: "#fff", padding: "120px 40px 56px", minHeight: 260, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.15,
            color: "#fff", margin: 0,
          }}>
            We Believe Travel Should Feel Like <em style={{ color: "#d4ad7c", fontStyle: "italic" }}>Liberation</em>, Not Logistics.
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: 16, color: "rgba(255,255,255,0.55)",
            marginTop: 22, lineHeight: 1.6, maxWidth: 680, margin: "22px auto 0",
          }}>
            Gemscape was built on one idea — that the Caribbean is extraordinary, and most people never experience it the way it deserves to be.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section style={{ background: CREAM, padding: "64px 40px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400,
            fontSize: 22, color: NAVY, lineHeight: 1.5,
            maxWidth: 680, margin: "0 auto 40px", textAlign: "center",
          }}>
            Gemscape specializes in curated Caribbean experiences designed around peace, beauty, culture, and seamless travel coordination.
          </p>

          <div className="about-philosophy-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: 16, color: "#3d4f61", lineHeight: 1.8,
          }}>
            <div>
              <p style={{ margin: "0 0 16px" }}>
                We started Gemscape because we noticed something: the Caribbean gets reduced.
              </p>
              <p style={{ margin: "0 0 16px" }}>
                Reduced to a beach and a buffet. To a rental car and a resort. To a cruise stop and a souvenir.
              </p>
              <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: NAVY }}>
                We wanted to change that.
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 16px" }}>
                Antigua has 365 beaches, two UNESCO World Heritage Sites, one of the world's finest sailing environments, a food culture rooted in generations of tradition, and corners of extraordinary beauty that most travelers never find.
              </p>
              <p style={{ margin: 0, color: NAVY, fontWeight: 500 }}>
                Our job is to take you there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PROMISE */}
      <section style={{ background: NAVY, padding: "64px 40px", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(26px, 4vw, 36px)", color: "#fff",
            textAlign: "center", margin: "0 0 48px",
          }}>What We Promise Every Traveler</h2>

          <div className="about-promise-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { icon: "☮", title: "Peace", body: "We eliminate every logistic stressor so your mind stays completely free to soak in every moment." },
              { icon: "✦", title: "True Personalization", body: "No two Gemscape itineraries are identical. Yours is built entirely around your pace, preferences, and people." },
              { icon: "🤝", title: "Genuine Partnership", body: "From your first message to your safe arrival home — every WhatsApp, every question, every last-minute change. We're here." },
            ].map((p) => (
              <div key={p.title} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 32, marginBottom: 16, color: "#3dbcad",
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(42,157,143,0.12)",
                  border: "1px solid rgba(61,188,173,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>{p.icon}</div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
                  fontSize: 22, color: "#fff", margin: "0 0 10px",
                }}>{p.title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                  fontSize: 15, color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65, margin: 0,
                }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL KNOWLEDGE */}
      <section style={{ background: CREAM, padding: "64px 40px" }}>
        <div className="about-local-grid" style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
              fontSize: "clamp(24px, 3.4vw, 32px)", color: NAVY,
              margin: "0 0 20px", lineHeight: 1.2,
            }}>We Live Here. We Know This Place.</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
              fontSize: 16, color: "#3d4f61", lineHeight: 1.8, margin: 0,
            }}>
              We know the beach that tour buses never find. The family kitchen serving the best pepperpot on the island. The exact cliff where the sunset turns the Caribbean into liquid gold. The quiet bay where the turtles nest. This local knowledge is the invisible ingredient in every Gemscape itinerary — and it can't be Googled.
            </p>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(13,27,42,0.15)", aspectRatio: "4/3" }}>
            <img src={AERIAL_IMG} alt="Aerial view of Antigua coastline" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: NAVY, padding: "72px 40px", textAlign: "center" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: "clamp(24px, 3.6vw, 34px)", color: "#fff",
          margin: "0 0 28px",
        }}>Ready to experience Antigua the right way?</h2>
        <button
          onClick={() => navigateTo("/build-my-itinerary")}
          style={{
            padding: "16px 36px", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`, color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15,
            letterSpacing: "0.04em", cursor: "pointer",
            boxShadow: "0 8px 28px rgba(42,157,143,0.4)",
          }}
        >Build My Itinerary →</button>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        @media (max-width: 900px) {
          .about-philosophy-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .about-promise-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-local-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}
