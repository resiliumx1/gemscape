import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEAL = "#2a9d8f";
const NAVY = "#0d1b2a";
const CREAM = "#faf7f2";
const WHATSAPP = "12687640015";

export default function StartPlanning() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      toast.error("Name and WhatsApp number are required.");
      return;
    }
    setSubmitting(true);
    const composed = [
      `Travelers: ${travelers}`,
      dates ? `Dates: ${dates}` : "",
      whatsapp ? `WhatsApp: ${whatsapp}` : "",
      message ? `\n${message}` : "",
    ].filter(Boolean).join(" | ");

    const { error } = await supabase.from("contact_enquiries").insert({
      full_name: name,
      email: email || `${whatsapp}@whatsapp.placeholder`,
      phone: whatsapp,
      message: composed,
      service_interest: "Start Planning",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Helmet>
        <title>Start Planning | Gemscape</title>
        <meta name="description" content="Tell us what you're dreaming of. We'll handle the rest — from the first detail to the final sunset." />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section style={{ background: NAVY, color: "#fff", padding: "120px 40px 48px", minHeight: 220, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(28px, 4.6vw, 42px)", lineHeight: 1.15, margin: 0 }}>
            Your Caribbean Escape Starts With a <em style={{ color: "#d4ad7c" }}>Conversation</em>.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 18, lineHeight: 1.6 }}>
            Tell us what you're dreaming of. We'll handle the rest — from the first detail to the final sunset.
          </p>
        </div>
      </section>

      {/* BODY */}
      <section style={{ padding: "48px 40px" }}>
        <div className="sp-grid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "start" }}>
          {/* LEFT - Form */}
          <div>
            <div style={eyebrow}>Send Us a Message</div>
            {done ? (
              <div style={{ background: CREAM, border: `1px solid ${TEAL}33`, borderLeft: `4px solid ${TEAL}`, borderRadius: 12, padding: 28 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: NAVY, marginBottom: 10 }}>
                  Thank you — we got it.
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#3d4f61", margin: 0, lineHeight: 1.6 }}>
                  We'll be in touch on WhatsApp within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field label="Full Name *">
                  <input value={name} onChange={e => setName(e.target.value)} required style={input} placeholder="Your full name" />
                </Field>
                <Field label="WhatsApp Number *" hint="Your WhatsApp — how we'll send your itinerary">
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required style={input} placeholder="+1 268 ..." />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={input} placeholder="you@example.com" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }} className="sp-row">
                  <Field label="Approximate Travel Dates">
                    <input value={dates} onChange={e => setDates(e.target.value)} style={input} placeholder="e.g. March 12–16" />
                  </Field>
                  <Field label="Number of Travelers">
                    <div style={{ display: "flex", alignItems: "center", height: 48, border: "1px solid rgba(13,27,42,0.15)", borderRadius: 8, overflow: "hidden" }}>
                      <button type="button" onClick={() => setTravelers(Math.max(1, travelers - 1))} style={stepBtn}>−</button>
                      <div style={{ flex: 1, textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: NAVY, fontWeight: 500 }}>{travelers}</div>
                      <button type="button" onClick={() => setTravelers(Math.min(40, travelers + 1))} style={stepBtn}>+</button>
                    </div>
                  </Field>
                </div>
                <Field label="Tell us about your dream Caribbean experience">
                  <textarea value={message} onChange={e => setMessage(e.target.value)} style={{ ...input, minHeight: 120, resize: "vertical", padding: 14, height: "auto" }} placeholder="Occasion, vibe, must-haves, anyone celebrating..." />
                </Field>
                <button type="submit" disabled={submitting} style={{
                  padding: "16px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15,
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 4px 14px rgba(42,157,143,0.3)", opacity: submitting ? 0.7 : 1,
                  marginTop: 4,
                }}>{submitting ? "Sending..." : "Send My Request →"}</button>
              </form>
            )}
          </div>

          {/* RIGHT - Contact Options */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={eyebrow}>Or Reach Us Directly</div>

            {/* WhatsApp card */}
            <div style={{
              background: "rgba(37,211,102,0.06)",
              borderLeft: "4px solid #25D366",
              border: "1px solid rgba(37,211,102,0.2)",
              borderLeftWidth: 4,
              borderRadius: 12, padding: 22,
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: NAVY, marginBottom: 6 }}>Chat on WhatsApp</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#3d4f61", lineHeight: 1.6, margin: "0 0 16px" }}>
                This is how we prefer to connect. Send us a message any time.
              </p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener" style={{
                display: "inline-block", padding: "12px 22px", borderRadius: 8,
                background: "#25D366", color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
                textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.35)",
              }}>Open WhatsApp →</a>
            </div>

            {/* Email card */}
            <div style={{ border: "1px solid rgba(13,27,42,0.1)", borderRadius: 12, padding: 22 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: NAVY, marginBottom: 6 }}>Send an Email</div>
              <a href="mailto:hello@gemscape.com" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: TEAL, textDecoration: "none", fontWeight: 500 }}>
                hello@gemscape.com
              </a>
            </div>

            {/* Response promise */}
            <div style={{
              background: CREAM, borderLeft: `4px solid ${TEAL}`,
              borderRadius: 12, padding: 22,
            }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: NAVY, lineHeight: 1.6, margin: 0 }}>
                We respond to every inquiry within 2 hours during business hours. Evening and weekend requests are answered by the following morning. We never leave a traveler waiting.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .sp-grid { grid-template-columns: 1fr !important; }
          .sp-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
  color: TEAL, letterSpacing: "0.14em", textTransform: "uppercase",
  marginBottom: 16,
};

const input: React.CSSProperties = {
  width: "100%", height: 48, padding: "0 14px",
  border: "1px solid rgba(13,27,42,0.15)", borderRadius: 8,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  color: NAVY, background: "#fff", outline: "none",
};

const stepBtn: React.CSSProperties = {
  width: 48, height: "100%", border: "none", background: "transparent",
  color: TEAL, fontSize: 20, cursor: "pointer", fontWeight: 300,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: NAVY, marginBottom: 6 }}>{label}</label>
      {hint && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(13,27,42,0.55)", marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}
