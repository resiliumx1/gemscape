import { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWaveNav } from "@/components/WavePageTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EXPERIENCE_DETAILS } from "@/data/experienceDetails";

const TEAL = "#2a9d8f";
const TEAL_LT = "rgba(42,157,143,0.15)";
const NAVY = "#0d1b2a";
const CREAM = "#faf7f2";

export default function ExperienceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { navigateTo } = useWaveNav();
  const exp = slug ? EXPERIENCE_DETAILS[slug] : undefined;

  const related = useMemo(
    () => (exp ? exp.related.map(s => EXPERIENCE_DETAILS[s]).filter(Boolean) : []),
    [exp]
  );

  // inline inquiry form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dates, setDates] = useState("");
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!exp) return <Navigate to="/experiences" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please add your name and email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("itinerary_requests").insert({
      full_name: name,
      email,
      travel_dates: dates,
      experience_type: exp.name,
      message: requests,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Request received — we'll be in touch within 2 hours.");
    setName(""); setEmail(""); setDates(""); setRequests("");
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Helmet>
        <title>{exp.name} | Gemscape Experiences</title>
        <meta name="description" content={exp.desc} />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section style={{ position: "relative", background: NAVY, color: "#fff", paddingTop: 96, paddingBottom: 56, overflow: "hidden" }}>
        {/* Right mood image desktop only */}
        <div className="exp-hero-img" style={{
          position: "absolute", top: 0, right: 0, width: "40%", height: "100%",
          backgroundImage: `url('${exp.heroImage}')`, backgroundSize: "cover", backgroundPosition: "center",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to left, transparent 0%, ${NAVY} 95%)`,
          }} />
        </div>

        <div className="exp-hero-content" style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 40px", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>
            <Link to="/experiences" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Experiences</Link>
            <span style={{ margin: "0 8px" }}>→</span>
            <span>{exp.name}</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {exp.tags.map(t => (
              <span key={t} style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 11,
                background: TEAL_LT, border: "1px solid rgba(61,188,173,0.32)",
                color: "#3dbcad", fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, letterSpacing: "0.04em",
              }}>{t}</span>
            ))}
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.1,
            color: "#fff", margin: 0, maxWidth: 620,
          }}>{exp.name}</h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: 15, color: "rgba(255,255,255,0.52)",
            marginTop: 16, maxWidth: 540, lineHeight: 1.6,
          }}>{exp.longDesc}</p>
        </div>
      </section>

      {/* BODY */}
      <section style={{ padding: "48px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="exp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          {/* LEFT */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: NAVY, marginBottom: 24 }}>Your Sample Itinerary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {exp.itinerary.map((day, idx) => (
                <div key={idx} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                    background: TEAL, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15, color: NAVY, marginBottom: 8 }}>
                      {day.title}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "#3d4f61", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: 4 }}>
                      {day.morning && <div><strong style={{ color: NAVY, fontWeight: 500 }}>Morning · </strong>{day.morning}</div>}
                      {day.afternoon && <div><strong style={{ color: NAVY, fontWeight: 500 }}>Afternoon · </strong>{day.afternoon}</div>}
                      {day.evening && <div><strong style={{ color: NAVY, fontWeight: 500 }}>Evening · </strong>{day.evening}</div>}
                      {day.summary && <div>{day.summary}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery strip */}
            <div style={{ marginTop: 40, display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" }}>
              {exp.gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${exp.name} ${i + 1}`}
                  loading="lazy"
                  style={{
                    height: 180, minWidth: 260, objectFit: "cover",
                    borderRadius: 10, scrollSnapAlign: "start",
                    boxShadow: "0 4px 16px rgba(13,27,42,0.08)",
                  }}
                />
              ))}
            </div>

            {/* Who This Is For */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, color: NAVY, marginBottom: 10 }}>Who This Is For</h3>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "#3d4f61", lineHeight: 1.55, margin: 0 }}>
                {exp.whoFor}
              </p>
            </div>

            {/* Good to Know */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, color: NAVY, marginBottom: 14 }}>Good to Know</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {exp.goodToKnow.map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#3d4f61" }}>
                    <span style={{ color: TEAL, fontWeight: 600 }}>·</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="exp-sidebar" style={{ position: "sticky", top: 96 }}>
            <div style={{ background: CREAM, border: "1px solid rgba(13,27,42,0.08)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 26, color: NAVY }}>
                From {exp.priceFrom}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(13,27,42,0.55)", marginBottom: 16 }}>
                per person · fully customizable
              </div>

              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: TEAL, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                What's Included
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 8 }}>
                {exp.included.map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#3d4f61", lineHeight: 1.5 }}>
                    <span style={{ color: TEAL, fontWeight: 700 }}>✓</span>{t}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigateTo(`/build-my-itinerary?experience=${exp.slug}`)}
                style={{
                  width: "100%", padding: "14px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(42,157,143,0.3)",
                  marginBottom: 10,
                }}
              >Request This Experience →</button>

              <button
                onClick={() => navigateTo(`/build-my-itinerary?type=${exp.slug}`)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 8,
                  border: `1px solid rgba(13,27,42,0.15)`, background: "transparent",
                  color: NAVY, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13,
                  cursor: "pointer",
                }}
              >Customize Dates & Details</button>
            </div>
          </aside>
        </div>

        {/* Mobile sticky CTA */}
        <button
          className="exp-mobile-cta"
          onClick={() => navigateTo(`/build-my-itinerary?experience=${exp.slug}`)}
          style={{
            position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 50,
            padding: "14px", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`, color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
            cursor: "pointer", boxShadow: "0 8px 24px rgba(13,27,42,0.25)",
            display: "none",
          }}
        >Request This Experience →</button>
      </section>

      {/* RELATED */}
      <section style={{ background: CREAM, padding: "56px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: NAVY, marginBottom: 24, textAlign: "center" }}>
            You Might Also Love
          </h2>
          <div className="exp-related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {related.map(r => (
              <div key={r.slug} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(13,27,42,0.06)" }}>
                <div style={{ height: 140, background: r.gradient }} />
                <div style={{ padding: 18 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 19, color: NAVY, marginBottom: 6 }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(13,27,42,0.55)", marginBottom: 12 }}>
                    {r.duration}
                  </div>
                  <button
                    onClick={() => navigateTo(`/experiences/${r.slug}`)}
                    style={{ background: "none", border: "none", color: TEAL, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >Discover →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INLINE INQUIRY FORM */}
      <section style={{ padding: "56px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: NAVY, textAlign: "center", marginBottom: 6 }}>
            Request {exp.name}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(13,27,42,0.6)", textAlign: "center", marginBottom: 28 }}>
            Tell us a few details — we'll respond within 2 hours.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="exp-form-row">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" required style={inputStyle} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" required style={inputStyle} />
            </div>
            <input value={dates} onChange={e => setDates(e.target.value)} placeholder="Preferred dates (e.g. March 12–16)" style={inputStyle} />
            <textarea value={requests} onChange={e => setRequests(e.target.value)} placeholder="Any specific requests?" style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} />
            <button type="submit" disabled={submitting} style={{
              padding: "14px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`, color: "#fff",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
              cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(42,157,143,0.3)",
              opacity: submitting ? 0.7 : 1,
            }}>{submitting ? "Sending..." : "Request This Experience →"}</button>
          </form>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .exp-hero-img { display: none; }
          .exp-grid { grid-template-columns: 1fr !important; }
          .exp-sidebar { position: static !important; }
        }
        @media (max-width: 640px) {
          .exp-related-grid { grid-template-columns: 1fr !important; }
          .exp-form-row { grid-template-columns: 1fr !important; }
          .exp-mobile-cta { display: block !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(13,27,42,0.15)",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  color: NAVY,
  background: "#fff",
  outline: "none",
};
