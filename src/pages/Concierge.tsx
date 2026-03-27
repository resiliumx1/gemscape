import { useState } from "react";
import { Plane, Star, Car, KeyRound, Send, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICES = [
  {
    icon: Plane,
    title: "VIP Airport Meet & Greet",
    desc: "Our team greets you on the airbridge — no queues, no confusion. A seamless start to your Antiguan experience.",
  },
  {
    icon: Star,
    title: "Private Charter Coordination",
    desc: "We source and book your private charter or commercial upgrade, handling every detail from departure to arrival.",
  },
  {
    icon: Car,
    title: "Hotel & Villa Transfer",
    desc: "Door-to-door from aircraft to property in premium vehicles. Your luggage handled, your route planned.",
  },
  {
    icon: KeyRound,
    title: "Full Itinerary Management",
    desc: "Pre-arrival planning, restaurant reservations, activity bookings — your entire trip, orchestrated.",
  },
];

const STEPS = [
  { num: "01", title: "Tell us your arrival details", desc: "Share your flights, dates, and preferences through our simple enquiry form." },
  { num: "02", title: "We prepare everything in advance", desc: "Our Antigua team arranges transfers, meet-and-greet, and any special requests." },
  { num: "03", title: "You arrive to a seamless experience", desc: "Step off the plane into a curated arrival — no stress, no waiting, no surprises." },
];

const Concierge = () => {
  const [form, setForm] = useState({
    name: "", email: "", whatsapp: "", arrival_date: "", departure_date: "",
    flight_number: "", guests: "", requirements: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("concierge_enquiries" as any).insert({
      name: form.name.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim() || null,
      arrival_date: form.arrival_date || null,
      departure_date: form.departure_date || null,
      flight_number: form.flight_number.trim() || null,
      guests: form.guests ? parseInt(form.guests) : null,
      requirements: form.requirements.trim() || null,
    } as any);
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  const scrollToEnquiry = () => {
    document.getElementById("concierge-enquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#05181e" }}>
      <Navbar />

      {/* SECTION 1 — Hero */}
      <section style={{
        position: "relative", width: "100vw", minHeight: "85vh",
        display: "flex", alignItems: "center", overflow: "hidden",
      }}>
        <img
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1800&q=85"
          alt="Luxury private jet on Caribbean tarmac"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to right, rgba(4,20,28,0.92) 0%, rgba(4,20,28,0.7) 50%, transparent 100%)",
        }} />
        <div className="concierge-hero-content" style={{
          position: "relative", zIndex: 2,
          paddingLeft: "clamp(40px, 6vw, 96px)", maxWidth: 600,
        }}>
          <img src="/images/gemscape-logo.png" alt="Gemscape" className="bg-transparent" style={{ height: 56, width: "auto", marginBottom: 24, opacity: 0.95, background: "none", backgroundColor: "transparent" }} />
          <span style={{
            fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)",
            textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            FLIGHT CONCIERGE
          </span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 400, lineHeight: 1.1, color: "#fff", margin: "16px 0 0",
          }}>
            Your Arrival,<br />Handled <em style={{ fontStyle: "italic", color: "#5ec8e0" }}>Perfectly.</em>
          </h1>
          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
            fontFamily: "'DM Sans', sans-serif", marginTop: 20, maxWidth: 460,
          }}>
            From the moment you land at V.C. Bird International to your first Antiguan sunset — every detail arranged.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <button onClick={scrollToEnquiry} style={{
              background: "#C9A84C", color: "#05181e", fontSize: 11, fontWeight: 600,
              letterSpacing: ".12em", padding: "14px 28px", border: "none", borderRadius: 3,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
            }}>
              Enquire Now
            </button>
            <a href="https://wa.me/1268XXXXXXX" target="_blank" rel="noopener noreferrer" style={{
              background: "transparent", border: "1px solid rgba(201,168,76,0.6)", color: "#C9A84C",
              fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "14px 28px",
              borderRadius: 3, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <MessageCircle size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2 — What's Included */}
      <section style={{ background: "#061418", padding: "100px clamp(24px, 5vw, 80px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)",
            textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            What's Included
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 400, color: "#fff", marginTop: 12,
          }}>
            Every Detail, Arranged.
          </h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 24, maxWidth: 1100, margin: "0 auto",
        }}>
          {SERVICES.map(s => (
            <div key={s.title} className="concierge-service-card" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 10, padding: "32px 24px", transition: "all 0.3s ease",
            }}>
              <s.icon size={28} style={{ color: "#C9A84C", marginBottom: 16 }} />
              <h3 style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16,
                color: "#fff", marginBottom: 8,
              }}>{s.title}</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14,
                color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — How It Works */}
      <section style={{ background: "#071e28", padding: "100px clamp(24px, 5vw, 80px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)",
            textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            How It Works
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 400, color: "#fff", marginTop: 12,
          }}>
            Three Simple Steps.
          </h2>
        </div>
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          gap: 0, maxWidth: 900, margin: "0 auto", flexWrap: "wrap",
        }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 220 }}>
              <div style={{ textAlign: "center", flex: 1, padding: "0 16px" }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300,
                  color: "#C9A84C", display: "block", marginBottom: 12,
                }}>{step.num}</span>
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15,
                  color: "#fff", marginBottom: 8,
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 13,
                  color: "rgba(255,255,255,0.45)", lineHeight: 1.7,
                }}>{step.desc}</p>
              </div>
              {i < 2 && (
                <div style={{
                  width: 60, borderTop: "1px dashed rgba(201,168,76,0.4)",
                  marginTop: 24, flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — Enquiry Form */}
      <section id="concierge-enquiry" style={{
        background: "#05181e", padding: "100px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
          maxWidth: 1000, margin: "0 auto",
        }} className="concierge-enquiry-grid">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400, color: "#fff", lineHeight: 1.15, marginBottom: 16,
            }}>
              Ready to Arrive<br />in <em style={{ fontStyle: "italic", color: "#5ec8e0" }}>Style?</em>
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15,
              color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 24,
            }}>
              Our concierge team responds within 2 hours. All enquiries are personally handled by our Antigua team.
            </p>
            <a href="tel:+1268XXXXXXX" style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
              color: "#C9A84C", textDecoration: "none",
            }}>
              Call us directly: +1 (268) XXX-XXXX
            </a>
          </div>

          {/* Right — Form */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" className="concierge-input" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="concierge-input" />
                </div>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp Number" className="concierge-input" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="concierge-label">Arrival Date</label>
                    <input name="arrival_date" type="date" value={form.arrival_date} onChange={handleChange} className="concierge-input" />
                  </div>
                  <div>
                    <label className="concierge-label">Departure Date</label>
                    <input name="departure_date" type="date" value={form.departure_date} onChange={handleChange} className="concierge-input" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input name="flight_number" value={form.flight_number} onChange={handleChange} placeholder="Flight Number (optional)" className="concierge-input" />
                  <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} placeholder="Number of Guests" className="concierge-input" />
                </div>
                <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="Special Requirements" className="concierge-input" rows={3} style={{ resize: "vertical" }} />
                <button type="submit" disabled={loading} style={{
                  background: "#C9A84C", color: "#05181e", fontSize: 11, fontWeight: 600,
                  letterSpacing: ".12em", padding: "14px 28px", border: "none", borderRadius: 3,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: loading ? 0.6 : 1,
                }}>
                  <Send size={14} /> {loading ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            ) : (
              <div style={{
                padding: 48, border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, textAlign: "center",
              }}>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: "#fff", marginBottom: 12,
                }}>Thank You!</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7,
                }}>
                  We'll WhatsApp you within 2 hours. Our Antigua team is already on it.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .concierge-service-card:hover {
          border-color: rgba(201,168,76,0.5) !important;
          background: rgba(201,168,76,0.04) !important;
        }
        .concierge-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 4px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
          width: 100%;
        }
        .concierge-input:focus {
          border-color: rgba(201,168,76,0.6);
        }
        .concierge-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .concierge-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 6px;
        }
        @media (max-width: 768px) {
          .concierge-enquiry-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Concierge;
