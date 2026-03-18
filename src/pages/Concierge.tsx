import { useEffect, useRef, useState } from "react";
import { Plane, ArrowLeft, Send, MessageCircle } from "lucide-react";
import { useWave } from "@/components/GemscapeWave";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

const Concierge = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = useWave();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    travelDates: "",
    specialRequests: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".concierge-icon", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.3 });
      gsap.fromTo(".concierge-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 });
      gsap.fromTo(".concierge-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.8 });
      gsap.fromTo(".concierge-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", delay: 1.0 });
      gsap.fromTo(".concierge-desc", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.1 });
      gsap.fromTo(".concierge-form-section", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.3 });
    }, contentRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--gem-navy))" }}>
      <Navbar />
      <div ref={contentRef} className="flex-1 flex flex-col items-center text-center px-6 py-32" style={{ minHeight: "80vh" }}>
        {/* Hero area */}
        <div className="concierge-icon" style={{ opacity: 0 }}>
          <div style={{
            width: 80, height: 80,
            border: "1px solid rgba(184,150,90,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            position: "relative",
          }}>
            <Plane size={32} style={{ color: "hsl(var(--gem-gold))" }} />
            <div style={{
              position: "absolute", inset: -6,
              border: "1px solid rgba(184,150,90,0.15)",
            }} />
          </div>
        </div>

        <h1 className="concierge-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300, fontSize: "clamp(40px, 8vw, 80px)",
          color: "#fff", lineHeight: 0.92, opacity: 0,
        }}>
          Coming <em style={{ fontStyle: "italic", color: "hsl(var(--gem-aqua))" }}>Soon</em>
        </h1>

        <p className="concierge-sub" style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em",
          color: "hsl(var(--gem-gold))", marginTop: 16, opacity: 0,
        }}>
          Flight Concierge Service
        </p>

        <div className="concierge-divider" style={{
          width: 60, height: 1,
          background: "linear-gradient(90deg, transparent, hsl(var(--gem-gold)), transparent)",
          margin: "32px auto", transformOrigin: "center",
        }} />

        <p className="concierge-desc" style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          fontSize: 17, lineHeight: 1.8, maxWidth: 520,
          color: "rgba(255,255,255,0.65)", opacity: 0,
        }}>
          Our flight concierge service is being crafted to perfection. 
          From VIP meet-and-greet at V.C. Bird International to private charter arrangements — 
          every detail of your arrival and departure will be effortless.
        </p>

        {/* Inquiry Form + WhatsApp CTA */}
        <div className="concierge-form-section" style={{ opacity: 0, width: "100%", maxWidth: 640, marginTop: 48 }}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="concierge-form">
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400, fontSize: 28, color: "#fff",
                marginBottom: 8, textAlign: "left",
              }}>
                Get Notified
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                fontSize: 14, color: "rgba(255,255,255,0.5)",
                marginBottom: 28, textAlign: "left",
              }}>
                Leave your details and we'll reach out when the service launches.
              </p>

              <div className="concierge-form__grid">
                <div className="concierge-form__field">
                  <label className="concierge-form__label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="concierge-form__input"
                    placeholder="Your full name"
                  />
                </div>
                <div className="concierge-form__field">
                  <label className="concierge-form__label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="concierge-form__input"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="concierge-form__field" style={{ marginTop: 16 }}>
                <label className="concierge-form__label">Travel Dates (approximate)</label>
                <input
                  type="text"
                  name="travelDates"
                  value={formData.travelDates}
                  onChange={handleChange}
                  className="concierge-form__input"
                  placeholder="e.g. December 15–22, 2026"
                />
              </div>

              <div className="concierge-form__field" style={{ marginTop: 16 }}>
                <label className="concierge-form__label">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="concierge-form__textarea"
                  placeholder="VIP meet-and-greet, private charter, wheelchair assistance..."
                  rows={3}
                />
              </div>

              <button type="submit" className="concierge-form__submit">
                <Send size={14} />
                Submit Inquiry
              </button>
            </form>
          ) : (
            <div style={{
              padding: 48,
              border: "1px solid rgba(184,150,90,0.25)",
              textAlign: "center",
            }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400, fontSize: 28, color: "#fff",
                marginBottom: 12,
              }}>
                Thank You!
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                fontSize: 15, color: "rgba(255,255,255,0.6)",
              }}>
                We've noted your interest. You'll be among the first to know when our Flight Concierge Service launches.
              </p>
            </div>
          )}

          {/* WhatsApp CTA Card */}
          <a
            href="https://wa.me/1268XXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="concierge-whatsapp-card"
          >
            <MessageCircle size={22} />
            <div style={{ textAlign: "left" }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                fontSize: 14, color: "#fff", display: "block",
              }}>
                Can't wait? Chat with us on WhatsApp
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                fontSize: 12, color: "rgba(255,255,255,0.6)",
              }}>
                We'll help plan your arrival manually while we build this feature.
              </span>
            </div>
            <ArrowLeft size={16} style={{ transform: "rotate(180deg)", opacity: 0.5, flexShrink: 0 }} />
          </a>

          {/* Back to home */}
          <div style={{ marginTop: 32 }}>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigateTo("/", "dual"); }}
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400, fontSize: 12,
                textTransform: "uppercase", letterSpacing: "0.12em",
                textDecoration: "none", display: "inline-flex",
                alignItems: "center", gap: 6,
                transition: "color 0.3s ease",
              }}
            >
              <ArrowLeft size={12} /> Back to Home
            </a>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
};

export default Concierge;
