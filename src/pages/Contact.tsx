import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Check, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_OPTIONS = [
  "Island Circumnavigation",
  "Private Rentals",
  "Flight Concierge",
  "Private Charter",
  "Other",
];

const Contact = () => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", serviceInterest: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.message.trim()) errs.message = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const { error } = await supabase.from("contact_enquiries" as any).insert({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      service_interest: form.serviceInterest || null,
      message: form.message.trim(),
    } as any);
    setLoading(false);
    if (error) { setErrors({ submit: "Something went wrong. Please try again." }); return; }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Helmet>
        <title>Contact Gemscape Travel & Tours | Get In Touch</title>
        <meta name="description" content="Reach out to Gemscape Travel & Tours. We respond personally within 2 hours. Call, WhatsApp, or send us a message." />
      </Helmet>
      <Navbar />

      {/* Hero header */}
      <section style={{ padding: "160px 24px 60px", textAlign: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: ".18em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          GET IN TOUCH
        </span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 400, color: "#fff", marginTop: 12 }}>
          Get In Touch
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 500, margin: "16px auto 0" }}>
          We respond to every enquiry personally, usually within 2 hours.
        </p>
      </section>

      {/* Two-column content */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }} className="contact-grid">
        {/* Left — Contact Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 8 }}>
            Reach Us Directly
          </h2>

          {[
            { icon: Phone, label: "CALL OR WHATSAPP", value: "+1 (268) 780-5510", sub: "Available 7 days, 7am – 9pm AST", href: "tel:+12687805510" },
            { icon: Mail, label: "EMAIL", value: "info@gemscapetours.com", sub: null, href: "mailto:info@gemscapetours.com" },
            { icon: MapPin, label: "BASED IN", value: "St. John's, Antigua, W.I.", sub: null, href: null },
          ].map(item => (
            <div key={item.label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 16,
            }}>
              <item.icon size={20} style={{ color: "#C9A84C", flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 10, letterSpacing: ".15em", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {item.label}
                </span>
                {item.href ? (
                  <a href={item.href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#fff", textDecoration: "none", fontWeight: 400 }}>
                    {item.value}
                  </a>
                ) : (
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#fff", fontWeight: 400 }}>{item.value}</span>
                )}
                {item.sub && <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{item.sub}</span>}
              </div>
            </div>
          ))}

          <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)",
            borderRadius: 8, padding: "14px 24px", color: "#25D366",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
            transition: "all 0.3s ease",
          }}>
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
        </div>

        {/* Right — Form */}
        <div>
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {errors.submit && <p style={{ color: "#e05a5a", fontSize: 13, textAlign: "center" }}>{errors.submit}</p>}

              <div className="contact-form-field">
                <label className="gem-form-label">YOUR NAME</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your name" className="gem-form-input" maxLength={100} />
                {errors.fullName && <span className="gem-form-error">{errors.fullName}</span>}
              </div>

              <div className="contact-form-field">
                <label className="gem-form-label">EMAIL ADDRESS</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="gem-form-input" maxLength={255} />
                {errors.email && <span className="gem-form-error">{errors.email}</span>}
              </div>

              <div className="contact-form-field">
                <label className="gem-form-label">PHONE / WHATSAPP</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (000) 000-0000" className="gem-form-input" maxLength={20} />
              </div>

              <div className="contact-form-field">
                <label className="gem-form-label">SERVICE INTEREST</label>
                <select name="serviceInterest" value={form.serviceInterest} onChange={handleChange} className="gem-form-input contact-select">
                  <option value="">Select a service (optional)</option>
                  {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="contact-form-field">
                <label className="gem-form-label">MESSAGE</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell us about your trip — dates, group size, or anything you have in mind." className="gem-form-input" style={{ resize: "vertical" }} maxLength={2000} />
                {errors.message && <span className="gem-form-error">{errors.message}</span>}
              </div>

              <button type="submit" disabled={loading} style={{
                background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: ".15em",
                padding: "16px 28px", border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.6 : 1, width: "100%", transition: "opacity 0.3s",
              }}>
                <Send size={14} /> {loading ? "Sending..." : "Send Message →"}
              </button>
            </form>
          ) : (
            <div style={{
              padding: 56, border: "1px solid rgba(44,184,168,0.25)", borderRadius: 12, textAlign: "center",
            }}>
              <Check size={48} style={{ color: "#2cb8a8", margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: "#fff", marginBottom: 12 }}>
                Message Sent
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
                We'll be in touch within 2 hours. Check your inbox.
              </p>
              <a href="/" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2cb8a8",
                textDecoration: "none", fontWeight: 500,
              }}>
                ← Back to Home
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFab />

      <style>{`
        .gem-form-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          display: block; margin-bottom: 8px;
        }
        .gem-form-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 14px 16px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none; width: 100%;
          transition: border-color 0.25s ease;
        }
        .gem-form-input:focus {
          border-color: rgba(44,184,168,0.6);
          box-shadow: 0 0 0 3px rgba(44,184,168,0.08);
        }
        .gem-form-input::placeholder { color: rgba(255,255,255,0.25); }
        .gem-form-error { font-size: 11px; color: #e05a5a; margin-top: 4px; display: block; }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
