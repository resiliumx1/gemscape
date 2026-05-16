import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWaveNav } from "@/components/WavePageTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEAL = "#2a9d8f";
const NAVY = "#0d1b2a";

const EXPERIENCE_TYPES = [
  { icon: "💑", label: "Romantic Escape", sub: "Couples & honeymoons" },
  { icon: "👯", label: "Girls Trip", sub: "Friends & celebration" },
  { icon: "🧘", label: "Solo Retreat", sub: "Your pace, your way" },
  { icon: "🚢", label: "Cruise Stop", sub: "VIP port experience" },
  { icon: "🌿", label: "Nature & Wellness", sub: "Restore & reconnect" },
  { icon: "🏝", label: "Island Hopping", sub: "Multi-island journey" },
  { icon: "💼", label: "Business & Leisure", sub: "Work meets escape" },
  { icon: "✨", label: "Surprise Me", sub: "We'll curate everything" },
];

const OCCASIONS = ["Honeymoon", "Birthday", "Anniversary", "Girls Trip", "Family", "Corporate", "Just Because", "Other"];

const INTERESTS = [
  { icon: "🏖", label: "Beaches" }, { icon: "🌺", label: "Culture" }, { icon: "🍽", label: "Dining" },
  { icon: "🐠", label: "Water Activities" }, { icon: "🧖", label: "Spa & Wellness" }, { icon: "🎵", label: "Nightlife" },
  { icon: "🌿", label: "Nature" }, { icon: "📸", label: "Photography" }, { icon: "🚤", label: "Sailing" },
  { icon: "🛍", label: "Markets" }, { icon: "🌅", label: "Sunsets" }, { icon: "🎭", label: "Local Life" },
];

const BUDGETS = [
  { icon: "💚", label: "Comfortable", range: "$500–1,000 / person", desc: "Thoughtfully planned, great value" },
  { icon: "✨", label: "Premium", range: "$1,000–2,500 / person", desc: "Elevated with premium inclusions" },
  { icon: "🌟", label: "Luxury", range: "$2,500–5,000 / person", desc: "Private, curated, fully bespoke" },
  { icon: "👑", label: "Ultra", range: "$5,000+ / person", desc: "Nothing off the table" },
];

const STEPS = ["Experience", "Dates", "Group", "Interests", "Budget", "Contact"];

export default function BuildItinerary() {
  const { navigateTo } = useWaveNav();
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form data
  const [experience, setExperience] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [flexibleMonth, setFlexibleMonth] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [budgetSkipped, setBudgetSkipped] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const nights = useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const d = (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  }, [dateFrom, dateTo]);

  const stepValid = (s: number): boolean => {
    if (s === 1) return !!experience;
    if (s === 2) return (!!dateFrom && !!dateTo) || !!flexibleMonth;
    if (s === 3) return travelers >= 1;
    if (s === 4) return interests.length > 0;
    if (s === 5) return !!budget || budgetSkipped;
    if (s === 6) return !!name && !!whatsapp;
    return false;
  };

  const goTo = (s: number) => {
    if (s <= maxReached) setStep(s);
  };

  const next = () => {
    if (!stepValid(step)) return;
    if (step === 6) {
      setShowSummary(true);
      return;
    }
    const ns = step + 1;
    setStep(ns);
    setMaxReached(Math.max(maxReached, ns));
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, showSummary, success]);

  const submit = async () => {
    setSubmitting(true);
    const travel_dates = dateFrom && dateTo
      ? `${dateFrom} to ${dateTo} (${nights} nights)`
      : flexibleMonth ? `Flexible: ${flexibleMonth}` : "";
    const services_needed = interests;
    const message = [
      occasions.length ? `Occasions: ${occasions.join(", ")}` : "",
      notes ? `Notes: ${notes}` : "",
      whatsapp ? `WhatsApp: ${whatsapp}` : "",
    ].filter(Boolean).join(" | ");

    const { error } = await supabase.from("itinerary_requests").insert({
      full_name: name,
      email: email || `${whatsapp}@whatsapp.placeholder`,
      phone: whatsapp,
      travel_dates,
      travelers,
      experience_type: experience,
      services_needed,
      budget_range: budgetSkipped ? "Not specified" : budget,
      message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSuccess(true);
  };

  const progress = (step / 6) * 100;

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Helmet>
        <title>Build My Itinerary | Gemscape</title>
        <meta name="description" content="Design your custom Caribbean experience in 6 simple steps. Personalized itinerary within 2 hours." />
      </Helmet>
      <Navbar />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px 80px" }}>
        {success ? (
          <SuccessScreen onExplore={() => navigateTo("/experiences")} />
        ) : showSummary ? (
          <Summary
            data={{ experience, dateFrom, dateTo, flexibleMonth, nights, travelers, occasions, interests, budget: budgetSkipped ? "Not specified" : budget, name, whatsapp, email, notes }}
            onEdit={(s) => { setShowSummary(false); setStep(s); }}
            onConfirm={submit}
            submitting={submitting}
          />
        ) : (
          <>
            {/* Progress */}
            <div style={{ height: 3, background: "rgba(13,27,42,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: TEAL, transition: "width 0.4s ease" }} />
            </div>

            {/* Step pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
              {STEPS.map((label, i) => {
                const n = i + 1;
                const reached = n <= maxReached;
                const active = n === step;
                return (
                  <button
                    key={label}
                    onClick={() => goTo(n)}
                    disabled={!reached}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: `1px solid ${active ? TEAL : "rgba(13,27,42,0.12)"}`,
                      background: active ? TEAL : reached ? "rgba(42,157,143,0.06)" : "transparent",
                      color: active ? "#fff" : reached ? NAVY : "rgba(13,27,42,0.4)",
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      cursor: reached ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                  >
                    {n}. {label}
                  </button>
                );
              })}
            </div>

            {/* Step content */}
            <div key={step} style={{ animation: "fadeInUp 0.4s ease" }}>
              {step === 1 && (
                <StepBlock heading="What kind of Caribbean experience are you dreaming of?" sub="Choose the one that feels closest — we'll customize every detail around you.">
                  <div className="bi-grid-4">
                    {EXPERIENCE_TYPES.map(t => (
                      <OptionCard
                        key={t.label}
                        selected={experience === t.label}
                        onClick={() => setExperience(t.label)}
                        icon={t.icon}
                        title={t.label}
                        sub={t.sub}
                      />
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 2 && (
                <StepBlock heading="When are you planning to travel?">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="From">
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label="To">
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
                    </Field>
                  </div>
                  {nights > 0 && (
                    <p style={{ marginTop: 16, color: TEAL, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                      That's {nights} night{nights > 1 ? "s" : ""} — perfect for a {nights >= 5 ? "full island" : "focused"} experience.
                    </p>
                  )}
                  <div style={{ marginTop: 24 }}>
                    <Field label="Flexible on exact dates? Just choose an approximate month.">
                      <input
                        type="month"
                        value={flexibleMonth}
                        onChange={e => setFlexibleMonth(e.target.value)}
                        style={inputStyle}
                      />
                    </Field>
                  </div>
                </StepBlock>
              )}

              {step === 3 && (
                <StepBlock heading="Tell us about your group.">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, padding: "24px 0" }}>
                    <StepperBtn onClick={() => setTravelers(Math.max(1, travelers - 1))}>−</StepperBtn>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 400, color: NAVY, minWidth: 80, textAlign: "center" }}>
                      {travelers}{travelers >= 20 ? "+" : ""}
                    </div>
                    <StepperBtn onClick={() => setTravelers(Math.min(20, travelers + 1))}>+</StepperBtn>
                  </div>
                  <p style={{ textAlign: "center", color: "rgba(13,27,42,0.55)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 32 }}>
                    {travelers === 1 ? "traveler" : "travelers"}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
                    What's the occasion? (select all that apply)
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {OCCASIONS.map(o => (
                      <Pill key={o} active={occasions.includes(o)} onClick={() => toggle(occasions, o, setOccasions)}>{o}</Pill>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 4 && (
                <StepBlock heading="What does your perfect Caribbean day look like?" sub="Select all that interest you.">
                  <div className="bi-grid-4">
                    {INTERESTS.map(i => {
                      const sel = interests.includes(i.label);
                      return (
                        <button
                          key={i.label}
                          onClick={() => toggle(interests, i.label, setInterests)}
                          style={{
                            position: "relative",
                            padding: "20px 12px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? TEAL : "rgba(13,27,42,0.12)"}`,
                            background: sel ? "rgba(42,157,143,0.06)" : "#fff",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.2s",
                          }}
                        >
                          {sel && <span style={{ position: "absolute", top: 8, right: 8, color: TEAL, fontSize: 14, fontWeight: 700 }}>✓</span>}
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{i.icon}</div>
                          <div style={{ fontSize: 12, color: NAVY, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{i.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </StepBlock>
              )}

              {step === 5 && (
                <StepBlock heading="What budget are you working with?">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="bi-budget-grid">
                    {BUDGETS.map(b => {
                      const sel = budget === b.label && !budgetSkipped;
                      return (
                        <button
                          key={b.label}
                          onClick={() => { setBudget(b.label); setBudgetSkipped(false); }}
                          style={{
                            padding: 20,
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? TEAL : "rgba(13,27,42,0.12)"}`,
                            background: sel ? "rgba(42,157,143,0.06)" : "#fff",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 8 }}>{b.icon}</div>
                          <div style={{ fontWeight: 600, color: NAVY, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>{b.label}</div>
                          <div style={{ color: TEAL, fontSize: 13, margin: "4px 0", fontFamily: "'DM Sans', sans-serif" }}>{b.range}</div>
                          <div style={{ color: "rgba(13,27,42,0.55)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{b.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setBudgetSkipped(true); setBudget(""); }}
                    style={{
                      marginTop: 20,
                      background: "none",
                      border: "none",
                      color: budgetSkipped ? TEAL : "rgba(13,27,42,0.6)",
                      fontSize: 13,
                      fontStyle: "italic",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      textDecoration: budgetSkipped ? "underline" : "none",
                    }}
                  >
                    Prefer not to share — that's completely fine.
                  </button>
                </StepBlock>
              )}

              {step === 6 && (
                <StepBlock heading="Almost there — how do we reach you?">
                  <Field label="Full Name *">
                    <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your full name" />
                  </Field>
                  <Field label="WhatsApp Number *" hint="We'll send your itinerary here">
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inputStyle} placeholder="+1 268 ..." />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
                  </Field>
                  <Field label="Anything specific we should know? (optional)">
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Dietary needs, accessibility, must-haves..." />
                  </Field>
                  <p style={{ background: "rgba(42,157,143,0.08)", border: `1px solid rgba(42,157,143,0.2)`, color: NAVY, padding: 14, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
                    💬 We'll respond within 2 hours on WhatsApp with a personalized itinerary.
                  </p>
                </StepBlock>
              )}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "space-between" }}>
              <button onClick={back} disabled={step === 1} style={{
                padding: "12px 24px",
                background: "transparent",
                border: "1px solid rgba(13,27,42,0.15)",
                borderRadius: 8,
                color: step === 1 ? "rgba(13,27,42,0.3)" : NAVY,
                cursor: step === 1 ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}>← Back</button>
              <button onClick={next} disabled={!stepValid(step)} style={{
                padding: "14px 28px",
                background: stepValid(step) ? `linear-gradient(135deg, ${TEAL}, #3dbcad)` : "rgba(13,27,42,0.1)",
                border: "none",
                borderRadius: 8,
                color: stepValid(step) ? "#fff" : "rgba(13,27,42,0.4)",
                cursor: stepValid(step) ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: stepValid(step) ? "0 4px 14px rgba(42,157,143,0.3)" : "none",
                transition: "all 0.2s",
              }}>
                {step === 6 ? "Review Summary →" : "Continue →"}
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .bi-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 640px) {
          .bi-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .bi-budget-grid { grid-template-columns: 1fr !important; }
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

function StepBlock({ heading, sub, children }: { heading: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 28, color: NAVY, marginBottom: 8, lineHeight: 1.25 }}>{heading}</h2>
      {sub && <p style={{ color: "rgba(13,27,42,0.6)", fontSize: 14, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>}
      {!sub && <div style={{ height: 16 }} />}
      {children}
    </div>
  );
}

function OptionCard({ selected, onClick, icon, title, sub }: { selected: boolean; onClick: () => void; icon: string; title: string; sub: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "18px 12px",
      borderRadius: 10,
      border: `1.5px solid ${selected ? TEAL : "rgba(13,27,42,0.12)"}`,
      background: selected ? "rgba(42,157,143,0.06)" : "#fff",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.2s",
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
      <div style={{ fontSize: 11, color: "rgba(13,27,42,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{sub}</div>
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "rgba(13,27,42,0.55)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{hint}</p>}
      {children}
    </div>
  );
}

function StepperBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 52, height: 52, borderRadius: "50%",
      border: `1.5px solid ${TEAL}`, background: "#fff", color: TEAL,
      fontSize: 24, cursor: "pointer", fontWeight: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.2s",
    }}>{children}</button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px",
      borderRadius: 999,
      border: `1px solid ${active ? TEAL : "rgba(13,27,42,0.15)"}`,
      background: active ? TEAL : "#fff",
      color: active ? "#fff" : NAVY,
      fontSize: 12,
      fontFamily: "'DM Sans', sans-serif",
      cursor: "pointer",
      transition: "all 0.2s",
    }}>{children}</button>
  );
}

function Summary({ data, onEdit, onConfirm, submitting }: any) {
  const rows = [
    { step: 1, label: "Experience", value: data.experience },
    { step: 2, label: "Dates", value: data.dateFrom && data.dateTo ? `${data.dateFrom} → ${data.dateTo} (${data.nights} nights)` : data.flexibleMonth ? `Flexible: ${data.flexibleMonth}` : "—" },
    { step: 3, label: "Group", value: `${data.travelers} ${data.travelers === 1 ? "traveler" : "travelers"}${data.occasions.length ? ` · ${data.occasions.join(", ")}` : ""}` },
    { step: 4, label: "Interests", value: data.interests.join(", ") || "—" },
    { step: 5, label: "Budget", value: data.budget || "—" },
    { step: 6, label: "Contact", value: `${data.name} · ${data.whatsapp}${data.email ? ` · ${data.email}` : ""}` },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 26, color: NAVY, marginBottom: 24 }}>
        Here's What We're Building For You
      </h2>
      <div style={{ border: "1px solid rgba(13,27,42,0.1)", borderRadius: 12, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid rgba(13,27,42,0.08)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "rgba(13,27,42,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{r.label}</div>
              <div style={{ fontSize: 14, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{r.value}</div>
            </div>
            <button onClick={() => onEdit(r.step)} style={{ background: "none", border: "none", color: TEAL, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Edit</button>
          </div>
        ))}
      </div>
      {data.notes && (
        <div style={{ marginTop: 16, padding: 16, background: "rgba(13,27,42,0.03)", borderRadius: 8, fontSize: 13, color: "rgba(13,27,42,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
          <strong style={{ color: NAVY }}>Notes:</strong> {data.notes}
        </div>
      )}
      <button onClick={onConfirm} disabled={submitting} style={{
        width: "100%", marginTop: 28,
        padding: "16px 28px",
        background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`,
        border: "none", borderRadius: 8, color: "#fff",
        fontSize: 15, fontWeight: 600, cursor: submitting ? "wait" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 4px 14px rgba(42,157,143,0.3)",
        opacity: submitting ? 0.7 : 1,
      }}>
        {submitting ? "Sending..." : "Confirm & Send →"}
      </button>
    </div>
  );
}

function SuccessScreen({ onExplore }: { onExplore: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        background: `linear-gradient(135deg, ${TEAL}, #3dbcad)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 32px",
        boxShadow: "0 12px 40px rgba(42,157,143,0.35)",
        animation: "checkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 36, color: NAVY, marginBottom: 14 }}>
        Your Request Is On Its Way.
      </h2>
      <p style={{ color: "rgba(13,27,42,0.65)", fontSize: 15, fontFamily: "'DM Sans', sans-serif", maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.6 }}>
        We'll reach out within 2 hours on WhatsApp with your personalized itinerary draft.
      </p>
      <button onClick={onExplore} style={{
        background: "none", border: "none", color: TEAL,
        fontSize: 14, fontWeight: 500, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        textDecoration: "underline", textUnderlineOffset: 4,
      }}>
        Explore experiences while you wait →
      </button>
    </div>
  );
}
