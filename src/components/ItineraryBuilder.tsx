import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Sparkles,
  Sun,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CalendarIcon,
  Home,
  MessageCircle,
} from "lucide-react";
import { format as dateFormat, addDays, addYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────  CANONICAL TAXONOMY  ──────────────────────────── */

const EXPERIENCE_TYPES = [
  "Romantic Tropical Escape",
  "Girls Island Getaway",
  "Peaceful Solo Retreat",
  "Cruise Stop VIP Experience",
  "Nature & Wellness Experience",
  "Multi-Island Caribbean Journey",
  "Business & Leisure Escape",
  "Custom Caribbean Experience",
];

const SERVICES = [
  "Personalized Itinerary Planning",
  "Airport Transfers",
  "Transportation Coordination",
  "Island Excursions",
  "Cruise Passenger Experiences",
  "Caribbean Getaways",
  "Business & Leisure Travel",
  "Curated Group Experiences",
  "Peaceful Wellness Escapes",
  "Vehicle Rental / Rental Coordination",
];

const PACE_OPTIONS = [
  "Peaceful",
  "Balanced",
  "Adventure-focused",
  "Luxury-focused",
  "Family-friendly",
  "Custom",
];

const BUDGETS = [
  "Under $1,000",
  "$1,000 – $3,000",
  "$3,000 – $7,500",
  "$7,500 – $15,000",
  "$15,000+",
  "Prefer not to say",
];

/* ─────────────────────────  STEP META  ──────────────────────────── */

const STEPS = [
  { num: 1, title: "Your Trip", desc: "A few details so we can reach you." },
  { num: 2, title: "Your Experience", desc: "The kind of journey you envision." },
  { num: 3, title: "Services Needed", desc: "What we can thoughtfully coordinate." },
  { num: 4, title: "Preferences", desc: "Pace, budget, and personal touches." },
];

/* ─────────────────────────  VALIDATION  ──────────────────────────── */

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  destination: z.string().trim().max(120).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(120).optional().or(z.literal("")),
  travelers: z.string().trim().max(10).optional().or(z.literal("")),
  experience_type: z.string().max(80).optional().or(z.literal("")),
  services_needed: z.array(z.string()).max(20),
  pace: z.string().max(40).optional().or(z.literal("")),
  budget_range: z.string().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

/* ─────────────────────────  STYLES  ──────────────────────────── */

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  padding: "13px 14px",
  outline: "none",
  transition: "border-color 0.25s ease, background 0.25s ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  marginBottom: 8,
  display: "block",
};

/* ─────────────────────────  COMPONENT  ──────────────────────────── */

export default function ItineraryBuilder() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Preselect from query params (?service=... or ?experience=...)
  const preselect = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return {
      experience: sp.get("experience") || "",
      service: sp.get("service") || "",
    };
  }, [location.search]);

  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    destination: "",
    travel_dates: "",
    travelers: "",
    experience_type: "",
    services_needed: [] as string[],
    pace: "",
    budget_range: "",
    message: "",
  });

  // Apply preselects once
  useEffect(() => {
    if (!preselect.experience && !preselect.service) return;
    setForm((f) => {
      const next = { ...f };
      if (preselect.experience && EXPERIENCE_TYPES.includes(preselect.experience)) {
        next.experience_type = preselect.experience;
      }
      if (preselect.service) {
        const svcMap: Record<string, string> = {
          itinerary: "Personalized Itinerary Planning",
          airport: "Airport Transfers",
          transport: "Transportation Coordination",
          excursions: "Island Excursions",
          cruise: "Cruise Passenger Experiences",
          getaways: "Caribbean Getaways",
          business: "Business & Leisure Travel",
          group: "Curated Group Experiences",
          wellness: "Peaceful Wellness Escapes",
          rental: "Vehicle Rental / Rental Coordination",
        };
        const matched = svcMap[preselect.service] ?? preselect.service;
        if (SERVICES.includes(matched) && !f.services_needed.includes(matched)) {
          next.services_needed = [...f.services_needed, matched];
        }
      }
      return next;
    });
  }, [preselect]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".itin-header > *",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: ".itin-header", start: "top 85%" },
        }
      );
      gsap.fromTo(
        ".itin-form-wrap",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ".itin-form-wrap", start: "top 88%" },
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

  const validateStep = (n: number): string | null => {
    if (n === 1) {
      if (!form.full_name.trim()) return "Please share your name to continue.";
      if (!form.email.trim() || !/.+@.+\..+/.test(form.email)) return "Please enter a valid email.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please review the form");
      return;
    }
    setSubmitting(true);
    const composedMessage = [
      parsed.data.pace ? `Preferred pace: ${parsed.data.pace}` : "",
      parsed.data.message,
    ].filter(Boolean).join("\n\n");

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
      message: composedMessage || null,
    };
    const { error } = await supabase.from("itinerary_requests").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again or WhatsApp us directly.");
      return;
    }
    setSubmitted(true);
  };

  /* ─────────────────────────  RENDER  ──────────────────────────── */

  return (
    <section
      ref={sectionRef}
      id="build-itinerary"
      style={{
        background: "linear-gradient(180deg, #05181e 0%, #0a2530 100%)",
        padding: "clamp(72px, 9vw, 120px) clamp(20px, 5vw, 32px)",
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

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="itin-header" style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 56px" }}>
          <span style={{
            fontSize: 13, letterSpacing: ".28em", color: "#2cb8a8",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            textTransform: "uppercase", display: "block", marginBottom: 18,
          }}>
            Build My Itinerary
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(30px, 4.4vw, 50px)",
            fontWeight: 400, color: "#fff", lineHeight: 1.2,
            margin: "0 0 20px", paddingBottom: "0.1em",
          }}>
            Your Caribbean Journey,{" "}
            <span style={{ fontStyle: "italic", color: "#C9A84C" }}>Thoughtfully Curated.</span>
          </h2>
          <p style={{
            fontSize: 16, lineHeight: 1.85,
            color: "rgba(255,255,255,0.62)",
            fontFamily: "'DM Sans', sans-serif", margin: 0,
          }}>
            Share a few details and we'll personally shape an elevated Caribbean experience around your pace, preferences, and purpose.
          </p>
        </div>

        {/* Form / Success */}
        <div className="itin-form-wrap" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 20,
          padding: "clamp(24px, 4.5vw, 48px)",
          backdropFilter: "blur(12px)",
        }}>
          {submitted ? (
            <SuccessPanel />
          ) : (
            <>
              {/* Progress */}
              <ProgressBar step={step} />

              <form onSubmit={(e) => e.preventDefault()} noValidate style={{ marginTop: 36 }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && <StepOne form={form} setForm={setForm} />}
                    {step === 2 && <StepTwo form={form} setForm={setForm} />}
                    {step === 3 && <StepThree form={form} toggleService={toggleService} />}
                    {step === 4 && <StepFour form={form} setForm={setForm} />}
                  </motion.div>
                </AnimatePresence>

                {/* Nav */}
                <div className="itin-nav-row">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className="itin-btn-back"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>

                  {step < STEPS.length ? (
                    <button type="button" onClick={goNext} className="itin-btn-next">
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="itin-btn-next"
                      style={{ opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      {submitting ? "Sending…" : "Send My Request"}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        {/* tiny reassurance line */}
        {!submitted && (
          <p style={{
            textAlign: "center",
            marginTop: 24,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.45)",
            letterSpacing: ".05em",
          }}>
            A real human writes back within 2 hours.
          </p>
        )}
      </div>

      <StyleBlock />
    </section>
  );
}

/* ─────────────────────────  SUB COMPONENTS  ──────────────────────────── */

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ width: "100%" }}>
      <div className="itin-steps-row">
        {STEPS.map((s, i) => {
          const active = step === s.num;
          const done = step > s.num;
          return (
            <div key={s.num} className="itin-step-pill">
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  background: done
                    ? "linear-gradient(135deg, #1a8a9e, #2cb8a8)"
                    : active
                      ? "rgba(44,184,168,0.18)"
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${done || active ? "rgba(44,184,168,0.55)" : "rgba(255,255,255,0.12)"}`,
                  color: done ? "#fff" : active ? "#2cb8a8" : "rgba(255,255,255,0.45)",
                  transition: "all 0.4s ease",
                  flexShrink: 0,
                }}
              >
                {done ? <Check size={14} /> : s.num}
              </div>
              <div className="itin-step-label">
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, fontWeight: 600,
                  letterSpacing: ".14em", textTransform: "uppercase",
                  color: active || done ? "#fff" : "rgba(255,255,255,0.45)",
                  transition: "color 0.3s ease",
                }}>{s.title}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="itin-step-line"
                  style={{
                    background: done
                      ? "linear-gradient(90deg, rgba(44,184,168,0.5), rgba(44,184,168,0.15))"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <p style={{
        marginTop: 18,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 18, fontStyle: "italic",
        color: "rgba(255,255,255,0.65)", textAlign: "left",
      }}>
        Step {step} of {STEPS.length} — {STEPS[step - 1].desc}
      </p>
    </div>
  );
}

function StepOne({ form, setForm }: any) {
  return (
    <div className="itin-grid">
      <Field label="Full Name *">
        <input required maxLength={100} style={inputBase} value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </Field>
      <Field label="Email *">
        <input type="email" required maxLength={255} style={inputBase} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="WhatsApp / Phone">
        <input type="tel" maxLength={40} style={inputBase} value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      <Field label="Destination or Island">
        <input maxLength={120} placeholder="Antigua, Barbuda, both…" style={inputBase} value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })} />
      </Field>
      <Field label="Travel Dates">
        <input maxLength={120} placeholder="e.g. March 12–19, 2026" style={inputBase} value={form.travel_dates}
          onChange={(e) => setForm({ ...form, travel_dates: e.target.value })} />
      </Field>
      <Field label="Number of Travelers">
        <input type="number" min={1} max={999} style={inputBase} value={form.travelers}
          onChange={(e) => setForm({ ...form, travelers: e.target.value })} />
      </Field>
    </div>
  );
}

function StepTwo({ form, setForm }: any) {
  return (
    <div>
      <span style={labelStyle}>Choose Your Experience</span>
      <div className="itin-options-grid">
        {EXPERIENCE_TYPES.map((t) => {
          const selected = form.experience_type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, experience_type: t })}
              className="itin-option-card"
              style={{
                background: selected ? "rgba(44,184,168,0.10)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected ? "rgba(44,184,168,0.55)" : "rgba(255,255,255,0.10)"}`,
                color: selected ? "#fff" : "rgba(255,255,255,0.78)",
              }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18, fontWeight: 500, lineHeight: 1.25,
              }}>{t}</span>
              {selected && (
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Check size={12} color="#fff" strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepThree({ form, toggleService }: any) {
  return (
    <div>
      <span style={labelStyle}>Select Any Services You'd Like Coordinated</span>
      <div className="itin-options-grid">
        {SERVICES.map((s) => {
          const checked = form.services_needed.includes(s);
          return (
            <label key={s} className="itin-option-card" style={{
              background: checked ? "rgba(44,184,168,0.10)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${checked ? "rgba(44,184,168,0.55)" : "rgba(255,255,255,0.10)"}`,
              color: checked ? "#fff" : "rgba(255,255,255,0.78)",
              cursor: "pointer",
            }}>
              <input
                type="checkbox" checked={checked} onChange={() => toggleService(s)}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14.5, fontWeight: 500, lineHeight: 1.4,
              }}>{s}</span>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: checked ? "linear-gradient(135deg, #1a8a9e, #2cb8a8)" : "transparent",
                border: checked ? "none" : "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.25s ease",
              }}>
                {checked && <Check size={12} color="#fff" strokeWidth={2.5} />}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function StepFour({ form, setForm }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Field label="Preferred Travel Pace">
        <div className="itin-pace-row">
          {PACE_OPTIONS.map((p) => {
            const selected = form.pace === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, pace: selected ? "" : p })}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: selected ? "rgba(44,184,168,0.14)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected ? "rgba(44,184,168,0.55)" : "rgba(255,255,255,0.10)"}`,
                  color: selected ? "#fff" : "rgba(255,255,255,0.7)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13.5, fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  letterSpacing: ".02em",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Budget Range (optional)">
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
      </Field>
      <Field label="Message / Special Requests">
        <textarea
          rows={4}
          maxLength={2000}
          placeholder="Tell us how you want to feel, who's traveling, anything special on your mind…"
          style={{ ...inputBase, resize: "vertical", minHeight: 120 }}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SuccessPanel() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(44,184,168,0.14)",
        border: "1px solid rgba(44,184,168,0.45)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 26,
      }}>
        <Check size={30} color="#2cb8a8" />
      </div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(28px, 3.6vw, 40px)",
        fontWeight: 400, color: "#fff", margin: "0 0 18px", lineHeight: 1.25,
      }}>
        Thank you.
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16, lineHeight: 1.85,
        color: "rgba(255,255,255,0.7)",
        maxWidth: 540, margin: "0 auto",
      }}>
        Your Gemscape request has been received. We'll review your details and follow up with personalized support.
      </p>
    </div>
  );
}

/* ─────────────────────────  STYLES (scoped)  ──────────────────────────── */

function StyleBlock() {
  return (
    <style>{`
      .itin-steps-row {
        display: flex; align-items: center; gap: 8px; width: 100%;
      }
      .itin-step-pill {
        display: flex; align-items: center; gap: 12px; flex: 1;
      }
      .itin-step-line {
        flex: 1; height: 1px; transition: background 0.5s ease;
      }
      .itin-step-label { display: block; }
      @media (max-width: 720px) {
        .itin-step-label { display: none; }
        .itin-step-pill { gap: 8px; }
      }

      .itin-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 22px;
      }
      @media (max-width: 720px) {
        .itin-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
      }

      .itin-options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 6px;
      }
      @media (max-width: 720px) {
        .itin-options-grid { grid-template-columns: 1fr !important; }
      }
      .itin-option-card {
        position: relative;
        display: flex; align-items: center; justify-content: space-between;
        gap: 14px;
        padding: 16px 18px;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
        font-family: 'DM Sans', sans-serif;
      }
      .itin-option-card:hover {
        border-color: rgba(44,184,168,0.4) !important;
        transform: translateY(-1px);
      }

      .itin-pace-row {
        display: flex; flex-wrap: wrap; gap: 10px;
      }

      .itin-nav-row {
        margin-top: 36px;
        display: flex; justify-content: space-between; align-items: center;
        gap: 12px;
      }
      .itin-btn-back {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 12px 22px;
        background: transparent;
        color: rgba(255,255,255,0.65);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 999px;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px; font-weight: 600;
        letterSpacing: .14em; text-transform: uppercase;
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .itin-btn-back:hover:not(:disabled) {
        border-color: rgba(255,255,255,0.3);
        color: #fff;
      }
      .itin-btn-back:disabled {
        opacity: 0.35; cursor: not-allowed;
      }
      .itin-btn-next {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 14px 30px;
        background: linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%);
        color: #fff; border: none; border-radius: 999px;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px; font-weight: 700;
        letter-spacing: .16em; text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 14px 36px -14px rgba(44,184,168,0.55);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .itin-btn-next:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 44px -14px rgba(44,184,168,0.7);
      }

      #build-itinerary input:focus,
      #build-itinerary select:focus,
      #build-itinerary textarea:focus {
        border-color: rgba(44,184,168,0.6) !important;
        background: rgba(44,184,168,0.04) !important;
      }
      #build-itinerary input::placeholder,
      #build-itinerary textarea::placeholder {
        color: rgba(255,255,255,0.32);
      }
    `}</style>
  );
}
