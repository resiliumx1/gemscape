import { useState } from "react";
import { Plane, Star, Car, KeyRound, Send, MessageCircle, Phone, Mail, Check, Minus, Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICES_LIST = [
  { icon: Plane, title: "VIP Airport Meet & Greet", desc: "Our team greets you on the airbridge — no queues, no confusion. A seamless start to your Antiguan experience." },
  { icon: Star, title: "Private Charter Coordination", desc: "We source and book your private charter or commercial upgrade, handling every detail from departure to arrival." },
  { icon: Car, title: "Hotel & Villa Transfer", desc: "Door-to-door from aircraft to property in premium vehicles. Your luggage handled, your route planned." },
  { icon: KeyRound, title: "Full Itinerary Management", desc: "Pre-arrival planning, restaurant reservations, activity bookings — your entire trip, orchestrated." },
];

const STEPS = [
  { num: "01", title: "Tell us your arrival details", desc: "Share your flights, dates, and preferences through our simple enquiry form." },
  { num: "02", title: "We prepare everything in advance", desc: "Our Antigua team arranges transfers, meet-and-greet, and any special requests." },
  { num: "03", title: "You arrive to a seamless experience", desc: "Step off the plane into a curated arrival — no stress, no waiting, no surprises." },
];

const SERVICE_CHIPS = [
  "Airport Meet & Greet", "Private Transfer", "Private Charter Booking",
  "Hotel / Villa Booking", "Full Itinerary Planning", "Restaurant Reservations",
];

const Concierge = () => {
  const [form, setForm] = useState({
    name: "", email: "", whatsapp: "", arrival_date: "", departure_date: "",
    guests: 1, requirements: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const toggleService = (s: string) =>
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.whatsapp.trim()) errs.whatsapp = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const requirements = [
      selectedServices.length > 0 ? `Services: ${selectedServices.join(", ")}` : "",
      form.requirements.trim(),
    ].filter(Boolean).join("\n\n");

    const { error } = await supabase.from("concierge_enquiries").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim() || null,
      arrival_date: form.arrival_date || null,
      departure_date: form.departure_date || null,
      flight_number: null,
      guests: form.guests || null,
      requirements: requirements || null,
    });
    setLoading(false);
    if (error) { toast.error("Something went wrong. Please try again."); }
    else { setSubmitted(true); }
  };

  const scrollToEnquiry = () => {
    document.getElementById("concierge-enquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Helmet>
        <title>Flight Concierge in Antigua | Gemscape Travel & Tours</title>
        <meta name="description" content="VIP airport arrivals, private charter booking, and seamless transfer coordination in Antigua by Gemscape Travel & Tours." />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section style={{ position: "relative", width: "100vw", minHeight: "85vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1800&q=85" alt="Luxury private jet on Caribbean tarmac"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to right, rgba(4,20,28,0.92) 0%, rgba(4,20,28,0.7) 50%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, paddingLeft: "clamp(40px, 6vw, 96px)", maxWidth: 600 }}>
          <span style={{ fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>FLIGHT CONCIERGE</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, lineHeight: 1.1, color: "#fff", margin: "16px 0 0" }}>
            Your Arrival,<br />Handled <em style={{ fontStyle: "italic", color: "#5ec8e0" }}>Perfectly.</em>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", marginTop: 20, maxWidth: 460 }}>
            From the moment you land at V.C. Bird International to your first Antiguan sunset — every detail arranged.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <button onClick={scrollToEnquiry} style={{
              background: "#C9A84C", color: "#05181e", fontSize: 11, fontWeight: 600,
              letterSpacing: ".12em", padding: "14px 28px", border: "none", borderRadius: 3,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
            }}>Enquire Now</button>
            <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
              background: "transparent", border: "1px solid rgba(201,168,76,0.6)", color: "#C9A84C",
              fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "14px 28px",
              borderRadius: 3, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            }}><MessageCircle size={14} /> WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section style={{ background: "var(--bg-secondary)", padding: "100px clamp(24px, 5vw, 80px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>What's Included</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: "var(--text-primary)", marginTop: 12 }}>Every Detail, Arranged.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {SERVICES_LIST.map(s => (
            <div key={s.title} className="concierge-service-card" style={{
              background: "var(--card-bg)", border: "1px solid var(--border-color)",
              borderRadius: 10, padding: "32px 24px", transition: "all 0.3s ease",
            }}>
              <s.icon size={28} style={{ color: "#C9A84C", marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--text-primary)", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: "var(--bg-tertiary)", padding: "100px clamp(24px, 5vw, 80px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>How It Works</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: "var(--text-primary)", marginTop: 12 }}>Three Simple Steps.</h2>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 0, maxWidth: 900, margin: "0 auto", flexWrap: "wrap" }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 220 }}>
              <div style={{ textAlign: "center", flex: 1, padding: "0 16px" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#C9A84C", display: "block", marginBottom: 12 }}>{step.num}</span>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
              {i < 2 && <div style={{ width: 60, borderTop: "1px dashed rgba(201,168,76,0.4)", marginTop: 24, flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="concierge-enquiry" style={{ background: "var(--bg-primary)", padding: "100px clamp(24px, 5vw, 80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 64, maxWidth: 1000, margin: "0 auto" }} className="concierge-enquiry-grid">
          {/* Left sidebar */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.15 }}>
              We Respond<br /><em style={{ fontStyle: "italic", color: "#5ec8e0" }}>Personally.</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75 }}>
              Every concierge enquiry is handled by our Antigua team — not an automated system. We'll reach you within 2 hours.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={16} style={{ color: "rgba(201,168,76,0.6)" }} />
                <div>
                  <a href="tel:+12687805510" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text-primary)", textDecoration: "none" }}>+1 (268) 780-5510</a>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'DM Sans', sans-serif" }}>Call or WhatsApp, 7am–9pm AST</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={16} style={{ color: "rgba(201,168,76,0.6)" }} />
                <a href="mailto:info@gemscapetours.com" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text-primary)", textDecoration: "none" }}>info@gemscapetours.com</a>
              </div>
            </div>

            <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              border: "1px solid rgba(201,168,76,0.4)", borderRadius: 8, padding: 14,
              color: "#d4ad7c", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
              transition: "all 0.3s ease",
            }}>
              <MessageCircle size={14} /> Chat on WhatsApp →
            </a>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              All enquiries are confidential and handled with complete discretion.
            </p>
          </div>

          {/* Right form */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="gem-form-label">YOUR NAME</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="gem-form-input" maxLength={100} />
                  {errors.name && <span className="gem-form-error">{errors.name}</span>}
                </div>
                <div>
                  <label className="gem-form-label">EMAIL</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="gem-form-input" maxLength={255} />
                  {errors.email && <span className="gem-form-error">{errors.email}</span>}
                </div>
                <div>
                  <label className="gem-form-label">PHONE / WHATSAPP</label>
                  <input name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} required placeholder="+1 (000) 000-0000" className="gem-form-input" maxLength={20} />
                  {errors.whatsapp && <span className="gem-form-error">{errors.whatsapp}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="gem-form-label">ARRIVAL DATE</label>
                    <input name="arrival_date" type="date" value={form.arrival_date} onChange={handleChange} className="gem-form-input" />
                  </div>
                  <div>
                    <label className="gem-form-label">DEPARTURE DATE</label>
                    <input name="departure_date" type="date" value={form.departure_date} onChange={handleChange} className="gem-form-input" />
                  </div>
                </div>

                <div>
                  <label className="gem-form-label">PASSENGERS</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button type="button" onClick={() => setForm(p => ({ ...p, guests: Math.max(1, p.guests - 1) }))} className="gem-stepper-btn"><Minus size={14} /></button>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#fff", minWidth: 28, textAlign: "center" }}>{form.guests}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, guests: Math.min(20, p.guests + 1) }))} className="gem-stepper-btn"><Plus size={14} /></button>
                  </div>
                </div>

                <div>
                  <label className="gem-form-label">WHAT DO YOU NEED?</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {SERVICE_CHIPS.map(chip => {
                      const isSelected = selectedServices.includes(chip);
                      return (
                        <button key={chip} type="button" onClick={() => toggleService(chip)} style={{
                          background: isSelected ? "rgba(44,184,168,0.12)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isSelected ? "#2cb8a8" : "rgba(255,255,255,0.12)"}`,
                          borderRadius: 999, padding: "8px 16px", fontSize: 12,
                          color: isSelected ? "#2cb8a8" : "rgba(255,255,255,0.6)",
                          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
                        }}>{chip}</button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="gem-form-label">ANYTHING ELSE?</label>
                  <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3}
                    placeholder="Flight numbers, special requests, or anything you'd like us to know in advance."
                    className="gem-form-input" style={{ resize: "vertical" }} maxLength={1000} />
                </div>

                <button type="submit" disabled={loading} style={{
                  background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)", color: "#fff", fontSize: 12,
                  fontWeight: 600, letterSpacing: ".15em", padding: "16px 28px", border: "none",
                  borderRadius: 8, cursor: loading ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, opacity: loading ? 0.6 : 1, width: "100%", height: 54, transition: "opacity 0.3s",
                }}>
                  <Send size={14} /> {loading ? "Sending..." : "Send Concierge Enquiry →"}
                </button>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.6 }}>
                  We respond to every enquiry within 2 hours, personally. No automated responses.
                </p>
              </form>
            ) : (
              <div style={{ padding: 56, border: "1px solid rgba(44,184,168,0.25)", borderRadius: 12, textAlign: "center" }}>
                <Check size={48} style={{ color: "#2cb8a8", margin: "0 auto 16px" }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: "#fff", marginBottom: 12 }}>
                  Enquiry Received.
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
                  Our concierge team will contact you personally within 2 hours. Check your email and WhatsApp.
                </p>
                <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8,
                  padding: "14px 28px", color: "#25D366", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
                }}>WhatsApp Us Now →</a>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .concierge-service-card:hover { border-color: rgba(201,168,76,0.5) !important; background: rgba(201,168,76,0.04) !important; }
        .gem-form-label { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); text-transform: uppercase; display: block; margin-bottom: 8px; }
        .gem-form-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px 16px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; width: 100%; transition: border-color 0.25s ease; }
        .gem-form-input:focus { border-color: rgba(44,184,168,0.6); box-shadow: 0 0 0 3px rgba(44,184,168,0.08); }
        .gem-form-input::placeholder { color: rgba(255,255,255,0.25); }
        .gem-form-input--error { border-color: #e05a5a !important; }
        .gem-form-error { font-size: 11px; color: #e05a5a; margin-top: 4px; display: block; }
        .gem-stepper-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.3); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .gem-stepper-btn:hover { border-color: rgba(201,168,76,0.6); color: #fff; }
        @media (max-width: 768px) { .concierge-enquiry-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </div>
  );
};

export default Concierge;
