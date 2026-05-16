import { useEffect, useState, FormEvent } from "react";
import { useWave } from "@/components/WavePageTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Map,
  Plane,
  Compass,
  Ship,
  Car,
  Leaf,
  MessageCircle,
} from "lucide-react";

/* ────────────────────────────────────────────────
 * Shared tokens
 * ──────────────────────────────────────────────── */
const NAVY = "#0d1b2a";
const NAVY_DEEP = "#0a1622";
const TEAL = "#2a9d8f";
const TEAL_BRIGHT = "#3dbcad";
const GOLD = "#e9c46a";
const CREAM = "#f6f1e7";
const CREAM_2 = "#efe7d6";

/* ────────────────────────────────────────────────
 * 1. Experiences Preview
 * ──────────────────────────────────────────────── */
const EXPERIENCES = [
  {
    slug: "romantic-tropical-escape",
    name: "Romantic Tropical Escape",
    desc: "Sunset sails, candlelit beach dinners, and private island moments for two.",
    gradient: "linear-gradient(135deg,#1a4a6b,#2a9d8f)",
    tag: "2–3 Days",
  },
  {
    slug: "nature-wellness-retreat",
    name: "Nature & Wellness Retreat",
    desc: "Rainforest hikes, sound baths, and quiet mornings by the sea.",
    gradient: "linear-gradient(135deg,#1e4d40,#4a7c59)",
    tag: "4–5 Days",
  },
  {
    slug: "cruise-stop-vip",
    name: "Cruise Stop VIP",
    desc: "Skip the chaos. A curated half-day designed for limited port time.",
    gradient: "linear-gradient(135deg,#3d1f5e,#6b4fac)",
    tag: "Half Day",
  },
  {
    slug: "girls-island-getaway",
    name: "Girls Island Getaway",
    desc: "Catamaran days, beach lounges, and the kind of nights you talk about for years.",
    gradient: "linear-gradient(135deg,#4a1a2a,#9e3d6e)",
    tag: "3–4 Days",
  },
];

export const HomeExperiencesPreview = () => {
  const { navigateTo } = useWave();

  return (
    <section
      style={{
        background: CREAM,
        padding: "64px 40px",
      }}
      className="home-exp-section"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <span
          style={{
            color: TEAL,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Signature Experiences
        </span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 40,
            color: NAVY,
            margin: "10px 0 14px",
            lineHeight: 1.15,
          }}
          className="home-exp-heading"
        >
          Your Caribbean,{" "}
          <em style={{ color: TEAL, fontStyle: "italic", fontWeight: 400 }}>
            Curated
          </em>
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 15,
            color: "rgba(13,27,42,0.65)",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Thoughtfully planned escapes for every kind of traveler. Each is fully
          customizable.
        </p>

        <div className="home-exp-grid">
          {EXPERIENCES.map((exp) => (
            <button
              key={exp.slug}
              onClick={() => navigateTo(`/experiences/${exp.slug}`)}
              className="home-exp-card"
              style={{
                textAlign: "left",
                background: "#ffffff",
                border: "1px solid rgba(13,27,42,0.06)",
                borderRadius: 10,
                padding: 0,
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition: "transform .3s ease, box-shadow .3s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(13,27,42,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 130,
                  background: exp.gradient,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: GOLD,
                    color: NAVY,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "4px 9px",
                    borderRadius: 4,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {exp.tag}
                </span>
              </div>
              <div style={{ padding: "16px 18px 20px" }}>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    fontSize: 17,
                    color: NAVY,
                    margin: "0 0 8px",
                    lineHeight: 1.25,
                  }}
                >
                  {exp.name}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: 13,
                    color: "rgba(13,27,42,0.6)",
                    lineHeight: 1.55,
                    margin: "0 0 14px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {exp.desc}
                </p>
                <span
                  style={{
                    color: TEAL,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    letterSpacing: "0.06em",
                  }}
                >
                  Customize This →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <button
            onClick={() => navigateTo("/experiences")}
            style={{
              background: "transparent",
              border: "none",
              color: TEAL,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            View All 8 Experiences →
          </button>
        </div>
      </div>

      <style>{`
        .home-exp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .home-exp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .home-exp-section { padding: 48px 20px !important; }
          .home-exp-heading { font-size: 30px !important; }
        }
      `}</style>
    </section>
  );
};

/* ────────────────────────────────────────────────
 * 2. Services Grid
 * ──────────────────────────────────────────────── */
const SERVICES = [
  { name: "Itinerary Planning", anchor: "itinerary", Icon: Map },
  { name: "Airport Transfers", anchor: "transfers", Icon: Plane },
  { name: "Excursions", anchor: "excursions", Icon: Compass },
  { name: "Cruise VIP", anchor: "cruise", Icon: Ship },
  { name: "Transportation", anchor: "transport", Icon: Car },
  { name: "Wellness", anchor: "wellness", Icon: Leaf },
];

export const HomeServicesGrid = () => {
  const { navigateTo } = useWave();
  return (
    <section
      style={{ background: "#ffffff", padding: "56px 40px" }}
      className="home-srv-section"
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 36,
            color: NAVY,
            margin: "0 0 36px",
            lineHeight: 1.18,
          }}
          className="home-srv-heading"
        >
          Everything Your Journey Needs
        </h2>
        <div className="home-srv-grid">
          {SERVICES.map(({ name, anchor, Icon }) => (
            <button
              key={anchor}
              onClick={() => navigateTo(`/services#${anchor}`)}
              className="home-srv-card"
              style={{
                background: "#fbfaf6",
                border: "1px solid rgba(13,27,42,0.06)",
                borderRadius: 10,
                padding: "26px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all .3s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "rgba(42,157,143,0.4)";
                e.currentTarget.style.boxShadow =
                  "0 10px 24px rgba(13,27,42,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(13,27,42,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: "rgba(42,157,143,0.12)",
                  color: TEAL,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={22} />
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: NAVY,
                  letterSpacing: "0.02em",
                }}
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .home-srv-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        @media (max-width: 1024px) {
          .home-srv-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 560px) {
          .home-srv-grid { grid-template-columns: repeat(2, 1fr); }
          .home-srv-section { padding: 44px 20px !important; }
          .home-srv-heading { font-size: 28px !important; }
        }
      `}</style>
    </section>
  );
};

/* ────────────────────────────────────────────────
 * 3. Why Gemscape
 * ──────────────────────────────────────────────── */
const PILLARS = [
  {
    glyph: "☮",
    title: "Peace",
    text: "We eliminate every logistic stressor so your mind stays free.",
  },
  {
    glyph: "✦",
    title: "Personalization",
    text: "No two itineraries alike. Yours built entirely around you.",
  },
  {
    glyph: "🤝",
    title: "Partnership",
    text: "From first message to safe arrival — we’re present.",
  },
];

export const HomeWhyGemscape = () => {
  return (
    <section
      style={{ background: NAVY, padding: "64px 40px" }}
      className="home-why-section"
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 36,
            color: "#ffffff",
            margin: "0 auto 44px",
            lineHeight: 1.2,
            maxWidth: 720,
            letterSpacing: "-0.005em",
          }}
          className="home-why-heading"
        >
          We Handle the Details. You Experience Everything.
        </h2>
        <div className="home-why-grid">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "30px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: GOLD,
                  marginBottom: 12,
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {p.glyph}
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontSize: 22,
                  color: "#fff",
                  margin: "0 0 10px",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .home-why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 768px) {
          .home-why-grid { grid-template-columns: 1fr; }
          .home-why-section { padding: 48px 20px !important; }
          .home-why-heading { font-size: 28px !important; }
        }
      `}</style>
    </section>
  );
};

/* ────────────────────────────────────────────────
 * 4. Testimonials (auto-rotating)
 * ──────────────────────────────────────────────── */
const QUOTES = [
  {
    quote:
      "We arrived not knowing what to expect, and left feeling like we’d been held by the island itself.",
    author: "Michelle D., Toronto",
    context: "Romantic Escape",
  },
  {
    quote:
      "Gemscape turned our cruise stop into the absolute highlight of the trip.",
    author: "James & Karen L., London",
    context: "Cruise VIP",
  },
  {
    quote: "I traveled alone and never once felt that way.",
    author: "Priya M., Toronto",
    context: "Solo Retreat",
  },
];

export const HomeTestimonials = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[idx];

  return (
    <section
      style={{
        background: NAVY_DEEP,
        padding: "56px 40px",
        textAlign: "center",
      }}
      className="home-tst-section"
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p
          key={idx}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: 22,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.55,
            margin: "0 0 22px",
            animation: "homeTstFade .6s ease",
          }}
          className="home-tst-quote"
        >
          “{q.quote}”
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: GOLD,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {q.author}
          <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 8px" }}>
            ·
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{q.context}</span>
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 26,
          }}
        >
          {QUOTES.map((_, i) => (
            <button
              key={i}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background:
                  i === idx ? GOLD : "rgba(255,255,255,0.25)",
                cursor: "pointer",
                transition: "all .3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes homeTstFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .home-tst-section { padding: 44px 20px !important; }
          .home-tst-quote { font-size: 18px !important; }
        }
      `}</style>
    </section>
  );
};

/* ────────────────────────────────────────────────
 * 5. Footer CTA (form → contact_enquiries)
 * ──────────────────────────────────────────────── */
export const HomeFooterCta = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dates, setDates] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMsg) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    if (trimmedName.length > 100 || trimmedEmail.length > 255 || trimmedMsg.length > 2000) {
      toast.error("One of your fields is too long.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmedEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      const composedMessage = dates.trim()
        ? `Travel dates: ${dates.trim()}\n\n${trimmedMsg}`
        : trimmedMsg;
      const { error } = await supabase.from("contact_enquiries").insert({
        full_name: trimmedName,
        email: trimmedEmail,
        message: composedMessage,
        service_interest: "Homepage CTA",
      });
      if (error) throw error;
      toast.success("Request sent. We’ll be in touch shortly.");
      setName("");
      setEmail("");
      setDates("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{ background: CREAM_2, padding: "64px 40px" }}
      className="home-cta-section"
    >
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 36,
            color: NAVY,
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
          className="home-cta-heading"
        >
          Your Caribbean Escape Starts With a Conversation.
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 15,
            color: "rgba(13,27,42,0.65)",
            margin: "0 auto 30px",
            lineHeight: 1.7,
            maxWidth: 480,
          }}
        >
          Tell us what you’re dreaming of. We’ll handle the rest.
        </p>

        <form onSubmit={onSubmit} style={{ textAlign: "left" }}>
          <div className="home-cta-row">
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="home-cta-input"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="home-cta-input"
            />
          </div>
          <input
            type="text"
            placeholder="Travel dates (e.g. Mar 12–19)"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            maxLength={120}
            className="home-cta-input"
            style={{ marginTop: 10, width: "100%" }}
          />
          <textarea
            required
            rows={5}
            placeholder="Tell us about your dream Caribbean experience..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            className="home-cta-input home-cta-textarea"
            style={{ marginTop: 10, width: "100%", resize: "vertical" }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="home-cta-submit"
            style={{
              marginTop: 16,
              background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_BRIGHT} 100%)`,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "14px 28px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "all .3s ease",
            }}
          >
            {submitting ? "Sending…" : "Send My Request →"}
          </button>
        </form>

        <p style={{ marginTop: 22 }}>
          <a
            href="https://wa.me/12687640000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: TEAL,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.02em",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageCircle size={16} />
            Prefer to chat? We’re on WhatsApp.
          </a>
        </p>
      </div>

      <style>{`
        .home-cta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .home-cta-input {
          width: 100%;
          padding: 13px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: ${NAVY};
          background: #ffffff;
          border: 1px solid rgba(13,27,42,0.12);
          border-radius: 6px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .home-cta-input:focus {
          border-color: ${TEAL};
          box-shadow: 0 0 0 3px rgba(42,157,143,0.15);
        }
        .home-cta-textarea { line-height: 1.55; }
        @media (max-width: 560px) {
          .home-cta-row { grid-template-columns: 1fr; }
          .home-cta-section { padding: 48px 20px !important; }
          .home-cta-heading { font-size: 28px !important; }
          .home-cta-submit { width: 100%; }
        }
      `}</style>
    </section>
  );
};
