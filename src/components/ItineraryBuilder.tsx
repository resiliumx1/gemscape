import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Sparkles, Sun, Check, ArrowRight, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    icon: Compass,
    title: "Share Your Vision",
    desc: "Tell us where you're going, who you're traveling with, your travel dates, and the kind of experience you want.",
  },
  {
    icon: Sparkles,
    title: "We Curate the Details",
    desc: "Gemscape helps coordinate your itinerary, transportation, excursions, island experiences, and special requests.",
  },
  {
    icon: Sun,
    title: "Arrive Peacefully",
    desc: "Enjoy your trip knowing the details have been thoughtfully planned and support is available when you need it.",
  },
];

const EXPERIENCE_TYPES = [
  "Romantic Escape",
  "Girls Getaway",
  "Solo Retreat",
  "Cruise Stop Experience",
  "Wellness Experience",
  "Business & Leisure",
  "Custom Experience",
];

const SERVICES = [
  "Itinerary Planning",
  "Airport Transfer",
  "Transportation Coordination",
  "Excursions",
  "Restaurant / Experience Recommendations",
  "Group Coordination",
  "Wellness / Nature Experiences",
];

const BUDGETS = [
  "Under $1,000",
  "$1,000 – $3,000",
  "$3,000 – $7,500",
  "$7,500 – $15,000",
  "$15,000+",
  "Prefer not to say",
];

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  destination: z.string().trim().max(120).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(120).optional().or(z.literal("")),
  travelers: z.string().trim().max(10).optional().or(z.literal("")),
  experience_type: z.string().max(60).optional().or(z.literal("")),
  services_needed: z.array(z.string()).max(20),
  budget_range: z.string().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  padding: "12px 14px",
  outline: "none",
  transition: "border-color 0.25s ease, background 0.25s ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  marginBottom: 8,
  display: "block",
};

export default function ItineraryBuilder() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    destination: "",
    travel_dates: "",
    travelers: "",
    experience_type: "",
    services_needed: [] as string[],
    budget_range: "",
    message: "",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".itin-step",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: ".itin-steps", start: "top 80%" },
        }
      );
      gsap.fromTo(
        ".itin-form-wrap",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ".itin-form-wrap", start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggleService = (s: string) => {
    setForm((f) => ({
      ...f,
      services_needed: f.services_needed.includes(s)
        ? f.services_needed.filter((x) => x !== s)
        : [...f.services_needed, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please review the form");
      return;
    }
    setSubmitting(true);
    const payload = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      destination: parsed.data.destination || null,
      travel_dates: parsed.data.travel_dates || null,
      travelers: parsed.data.travelers ? parseInt(parsed.data.travelers, 10) || null : null,
      experience_type: parsed.data.experience_type || null,
      services_needed: parsed.data.services_needed.length ? parsed.data.services_needed : null,
      budget_range: parsed.data.budget_range || null,
      message: parsed.data.message || null,
    };
    const { error } = await supabase.from("itinerary_requests").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again or WhatsApp us directly.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      id="build-itinerary"
      style={{
        background: "linear-gradient(180deg, #05181e 0%, #0a2530 100%)",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(44,184,168,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(201,168,76,0.06) 0%, transparent 50%)",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 64px" }}>
          <span style={{
            fontSize: 14, letterSpacing: ".25em", color: "#2cb8a8",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            textTransform: "uppercase", display: "block", marginBottom: 18,
          }}>
            Build My Itinerary
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 4.5vw, 52px)",
            fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 22px",
          }}>
            Your Caribbean Journey,{" "}
            <span style={{ fontStyle: "italic", color: "#C9A84C" }}>Thoughtfully Curated.</span>
          </h2>
          <p style={{
            fontSize: 16, lineHeight: 1.85,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'DM Sans', sans-serif", margin: 0,
          }}>
            Tell us the feeling you want from your trip — peaceful, romantic, adventurous, cultural,
            wellness-focused, or celebratory — and we'll help shape the details into a seamless Caribbean experience.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="itin-steps" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 80,
        }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="itin-step" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "32px 28px",
                position: "relative",
              }}>
                <span style={{
                  position: "absolute", top: 20, right: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 38, color: "rgba(201,168,76,0.25)",
                  fontStyle: "italic",
                }}>0{i + 1}</span>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "rgba(44,184,168,0.1)",
                  border: "1px solid rgba(44,184,168,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <Icon size={20} color="#2cb8a8" strokeWidth={1.6} />
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 500, color: "#fff",
                  margin: "0 0 10px",
                }}>{s.title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15, lineHeight: 1.75,
                  color: "rgba(255,255,255,0.55)", margin: 0,
                }}>{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Form / Success */}
        <div className="itin-form-wrap" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 20,
          padding: "clamp(28px, 5vw, 56px)",
          backdropFilter: "blur(12px)",
        }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(44,184,168,0.15)",
                border: "1px solid rgba(44,184,168,0.4)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
              }}>
                <Check size={28} color="#2cb8a8" />
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 400, color: "#fff", margin: "0 0 16px", lineHeight: 1.25,
              }}>
                Thank you.
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, lineHeight: 1.8,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 520, margin: "0 auto",
              }}>
                Your Gemscape experience request has been received. We'll review your details and follow up with personalized support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26, fontWeight: 400, color: "#fff",
                margin: "0 0 8px",
              }}>Start Planning My Experience</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: "rgba(255,255,255,0.5)",
                margin: "0 0 32px",
              }}>A real human writes back within 2 hours.</p>

              <div className="itin-grid">
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    required maxLength={100}
                    style={inputBase}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" required maxLength={255}
                    style={inputBase}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Phone</label>
                  <input
                    type="tel" maxLength={40}
                    style={inputBase}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Destination or Island</label>
                  <input
                    maxLength={120}
                    placeholder="Antigua, Barbuda, both…"
                    style={inputBase}
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Travel Dates</label>
                  <input
                    maxLength={120}
                    placeholder="e.g. March 12–19, 2026"
                    style={inputBase}
                    value={form.travel_dates}
                    onChange={(e) => setForm({ ...form, travel_dates: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Number of Travelers</label>
                  <input
                    type="number" min={1} max={999}
                    style={inputBase}
                    value={form.travelers}
                    onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type of Experience</label>
                  <select
                    style={{ ...inputBase, appearance: "none" }}
                    value={form.experience_type}
                    onChange={(e) => setForm({ ...form, experience_type: e.target.value })}
                  >
                    <option value="" style={{ background: "#0a2530" }}>Select…</option>
                    {EXPERIENCE_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: "#0a2530" }}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Budget Range (optional)</label>
                  <select
                    style={{ ...inputBase, appearance: "none" }}
                    value={form.budget_range}
                    onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                  >
                    <option value="" style={{ background: "#0a2530" }}>Select…</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b} style={{ background: "#0a2530" }}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services checkboxes */}
              <div style={{ marginTop: 28 }}>
                <label style={labelStyle}>Services Needed</label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 10,
                  marginTop: 4,
                }}>
                  {SERVICES.map((s) => {
                    const checked = form.services_needed.includes(s);
                    return (
                      <label
                        key={s}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          background: checked ? "rgba(44,184,168,0.08)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${checked ? "rgba(44,184,168,0.45)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          color: checked ? "#fff" : "rgba(255,255,255,0.7)",
                          transition: "all 0.25s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(s)}
                          style={{ accentColor: "#2cb8a8", width: 16, height: 16, flexShrink: 0 }}
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginTop: 28 }}>
                <label style={labelStyle}>Message / Special Requests</label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell us how you want to feel, who's traveling, anything special on your mind…"
                  style={{ ...inputBase, resize: "vertical", minHeight: 110 }}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              {/* Submit */}
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "16px 38px",
                    borderRadius: 4,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15, fontWeight: 700, letterSpacing: ".14em",
                    textTransform: "uppercase",
                    cursor: submitting ? "wait" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    boxShadow: "0 0 24px rgba(44,184,168,0.35)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {submitting ? "Sending…" : "Start Planning My Experience"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .itin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }
        @media (max-width: 768px) {
          .itin-steps { grid-template-columns: 1fr !important; gap: 16px !important; margin-bottom: 56px !important; }
          .itin-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
        }
        #build-itinerary input:focus,
        #build-itinerary select:focus,
        #build-itinerary textarea:focus {
          border-color: rgba(44,184,168,0.6) !important;
          background: rgba(44,184,168,0.04) !important;
        }
        #build-itinerary input::placeholder,
        #build-itinerary textarea::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </section>
  );
}
