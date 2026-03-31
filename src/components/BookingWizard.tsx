import { useState, useMemo } from "react";
import { format as dateFormat, addDays, addYears } from "date-fns";
import { Anchor, Map, Plane, Sailboat, CalendarIcon, Check, Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrency } from "@/contexts/CurrencyContext";

const SERVICES = [
  { id: "circumnavigation", icon: Anchor, title: "Island Circumnavigation", desc: "Full-day private tour of Antigua's coastline — every hidden cove, beach, and bay.", price: "From $280 per group", basePrice: 280, badge: "Full Day" },
  { id: "heritage", icon: Map, title: "Heritage & Discovery", desc: "Shirley Heights, English Harbour, local rum, and roads no tourist map shows.", price: "From $180 per group", basePrice: 180, badge: "Half Day" },
  { id: "concierge", icon: Plane, title: "Flight Concierge", desc: "VIP airport arrivals, private charter booking, and seamless transfer coordination.", price: "From $150 per person", basePrice: 150, badge: "Arrival / Departure" },
  { id: "charter", icon: Sailboat, title: "Private Charter", desc: "Your vessel, your route, your crew. Half or full-day on the Caribbean Sea.", price: "From $480 per charter", basePrice: 480, badge: "Half or Full Day" },
];

const COUNTRIES = ["Antigua and Barbuda","Australia","Barbados","Canada","Dominica","France","Germany","Italy","Jamaica","Netherlands","Saint Lucia","Trinidad and Tobago","United Kingdom","United States","Other"];
const REFERRALS = ["Google","Instagram","TripAdvisor","Friend / Referral","Other"];
const STEP_LABELS = ["Service", "Details", "Your Info", "Review"];

interface Props { initialService?: string; }

/* ── Stepper component ── */
const NumStepper = ({ value, onChange, min = 1, max = 20, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) => (
  <div>
    <label className="gem-form-label">{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="gem-stepper-btn"><Minus size={14} /></button>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "var(--text-primary)", minWidth: 28, textAlign: "center" }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="gem-stepper-btn"><Plus size={14} /></button>
    </div>
  </div>
);

const BookingWizard = ({ initialService }: Props) => {
  const { format: formatPrice } = useCurrency();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [serviceType, setServiceType] = useState(initialService || "");
  // Step 2
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [startTime, setStartTime] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [charterDuration, setCharterDuration] = useState("");
  const [departureMarina, setDepartureMarina] = useState("");
  // Step 3
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [referral, setReferral] = useState("");
  const [consent, setConsent] = useState(false);

  const selectedService = SERVICES.find(s => s.id === serviceType);

  const estimate = useMemo(() => {
    if (!selectedService) return 0;
    if (serviceType === "concierge") return selectedService.basePrice * guests;
    return selectedService.basePrice;
  }, [serviceType, guests, selectedService]);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !serviceType) e.serviceType = "Please select a service";
    if (s === 2 && !tourDate) e.tourDate = "Please select a date";
    if (s === 3) {
      if (!fullName.trim()) e.fullName = "Required";
      if (!email.trim()) e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
      if (!phone.trim()) e.phone = "Required";
      if (!consent) e.consent = "Please agree to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, 4)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) { setStep(3); return; }
    setLoading(true);
    const addOns: string[] = [];
    if (startTime) addOns.push(`start:${startTime}`);
    if (charterDuration) addOns.push(`duration:${charterDuration}`);
    if (departureMarina) addOns.push(`marina:${departureMarina}`);
    if (airline) addOns.push(`airline:${airline}`);

    const { data, error } = await supabase.from("bookings").insert({
      service_type: serviceType,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country || null,
      tour_date: dateFormat(tourDate!, "yyyy-MM-dd"),
      party_size: guests,
      adults: guests,
      pickup_location: hotelName.trim() || null,
      flight_details: flightNumber.trim() || null,
      special_requests: specialRequests.trim() || null,
      add_ons: addOns.length > 0 ? addOns : null,
      total_estimate: estimate > 0 ? estimate : null,
    }).select("booking_ref").single();

    setLoading(false);
    if (error) { setErrors({ submit: "Something went wrong. Please try again." }); return; }
    setBookingRef(data?.booking_ref || "");
    setSubmitted(true);
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ margin: "0 auto 24px" }}>
          <circle cx="32" cy="32" r="30" fill="none" stroke="#2cb8a8" strokeWidth="2" />
          <path d="M20 32 L28 40 L44 24" fill="none" stroke="#2cb8a8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" from="0 100" to="50 100" dur="0.6s" fill="freeze" />
          </path>
        </svg>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: "#fff", marginBottom: 12 }}>
          Booking Request Received.
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
          We'll be in touch within 2 hours to confirm your experience and send your detailed itinerary.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
            background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8,
            padding: "14px 28px", color: "#25D366", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
          }}>WhatsApp Us Now</a>
          <a href="/" style={{
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "14px 28px",
            color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
          }}>Back to Home</a>
        </div>
      </div>
    );
  }

  const isTour = serviceType === "circumnavigation" || serviceType === "heritage";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 100px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isComplete = num < step;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: isComplete ? "pointer" : "default" }}
                onClick={() => { if (isComplete) setStep(num); }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  background: isComplete ? "#b8956a" : isActive ? "#2cb8a8" : "var(--card-bg)",
                  color: isComplete || isActive ? "#fff" : "var(--text-tertiary)",
                  transition: "all 0.3s ease",
                }}>
                  {isComplete ? <Check size={14} /> : num}
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                }}>{label}</span>
              </div>
              {i < 3 && (
                <div style={{
                  width: 48, height: 2, margin: "0 8px", marginBottom: 24,
                  background: isComplete ? "#b8956a" : "var(--border-color)",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {errors.submit && <p style={{ color: "#e05a5a", textAlign: "center", marginBottom: 24, fontSize: 14 }}>{errors.submit}</p>}

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", textAlign: "center", marginBottom: 8 }}>
            What would you like to experience?
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text-tertiary)", textAlign: "center", marginBottom: 32 }}>
            Select one to continue.
          </p>
          {errors.serviceType && <p className="gem-form-error" style={{ textAlign: "center", marginBottom: 16 }}>{errors.serviceType}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="bw-svc-grid">
            {SERVICES.map(svc => (
              <button key={svc.id} onClick={() => { setServiceType(svc.id); setErrors({}); }} style={{
                background: serviceType === svc.id ? "rgba(44,184,168,0.08)" : "var(--card-bg)",
                border: serviceType === svc.id ? "2px solid #2cb8a8" : "1px solid var(--border-color)",
                boxShadow: serviceType === svc.id ? "0 0 0 4px rgba(44,184,168,0.1)" : "none",
                borderRadius: 12, padding: "28px 24px", cursor: "pointer", textAlign: "left",
                transition: "all 0.25s ease", display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <svc.icon size={24} style={{ color: "#2cb8a8" }} />
                  <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--text-tertiary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", background: "var(--card-bg)", padding: "4px 10px", borderRadius: 999 }}>
                    {svc.badge}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{svc.title}</h4>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{svc.desc}</p>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#C9A84C", fontWeight: 500 }}>{svc.price}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <button onClick={next} disabled={!serviceType} style={{
              background: serviceType ? "linear-gradient(135deg, #1a8a9e, #2cb8a8)" : "var(--card-bg)",
              color: serviceType ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: 8, padding: "16px 40px", fontSize: 13, fontWeight: 600,
              letterSpacing: ".12em", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
              cursor: serviceType ? "pointer" : "not-allowed", transition: "all 0.3s",
            }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", textAlign: "center", marginBottom: 32 }}>
            Experience Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label className="gem-form-label">{serviceType === "concierge" ? "ARRIVAL DATE" : serviceType === "charter" ? "CHARTER DATE" : "TOUR DATE"}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("gem-form-input", errors.tourDate && "gem-form-input--error")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                    {tourDate ? dateFormat(tourDate, "PPP") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={tourDate} onSelect={d => { setTourDate(d); setErrors(p => ({ ...p, tourDate: "" })); }}
                    disabled={d => d < addDays(new Date(), 1) || d > addYears(new Date(), 2)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.tourDate && <span className="gem-form-error">{errors.tourDate}</span>}
            </div>

            <NumStepper value={guests} onChange={setGuests} min={1} max={isTour ? 20 : serviceType === "charter" ? 10 : 12}
              label={serviceType === "concierge" ? "PASSENGERS" : "NUMBER OF GUESTS"} />

            {isTour && (
              <div>
                <label className="gem-form-label">PREFERRED START TIME</label>
                <select className="gem-form-input" value={startTime} onChange={e => setStartTime(e.target.value)}>
                  <option value="">Select time</option>
                  <option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option><option>Flexible</option>
                </select>
              </div>
            )}

            {serviceType === "concierge" && (
              <>
                <div>
                  <label className="gem-form-label">FLIGHT NUMBER</label>
                  <input className="gem-form-input" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g. AA 1234" maxLength={20} />
                </div>
                <div>
                  <label className="gem-form-label">AIRLINE</label>
                  <input className="gem-form-input" value={airline} onChange={e => setAirline(e.target.value)} placeholder="e.g. American Airlines" maxLength={100} />
                </div>
                <div>
                  <label className="gem-form-label">HOTEL / VILLA NAME</label>
                  <input className="gem-form-input" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="Where should we take you?" maxLength={200} />
                </div>
              </>
            )}

            {serviceType === "charter" && (
              <>
                <div>
                  <label className="gem-form-label">DURATION</label>
                  <select className="gem-form-input" value={charterDuration} onChange={e => setCharterDuration(e.target.value)}>
                    <option value="">Select duration</option>
                    <option>Half Day (4 hours)</option><option>Full Day (8 hours)</option>
                  </select>
                </div>
                <div>
                  <label className="gem-form-label">DEPARTURE MARINA</label>
                  <select className="gem-form-input" value={departureMarina} onChange={e => setDepartureMarina(e.target.value)}>
                    <option value="">Select marina</option>
                    <option>English Harbour</option><option>Jolly Harbour</option><option>Heritage Quay</option><option>Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="gem-form-label">ANYTHING SPECIAL?</label>
              <textarea className="gem-form-input" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={3}
                placeholder="Dietary needs, accessibility, celebrations, or anything you'd like us to know." style={{ resize: "vertical" }} maxLength={1000} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={prev} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>← Back</button>
            <button onClick={next} style={{
              background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)", color: "#fff", border: "none",
              borderRadius: 8, padding: "16px 40px", fontSize: 13, fontWeight: 600, letterSpacing: ".12em",
              fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", cursor: "pointer",
            }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", textAlign: "center", marginBottom: 32 }}>
            Your Information
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="bw-info-grid">
            <div>
              <label className="gem-form-label">FULL NAME</label>
              <input className={cn("gem-form-input", errors.fullName && "gem-form-input--error")} value={fullName} onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: "" })); }} maxLength={100} />
              {errors.fullName && <span className="gem-form-error">{errors.fullName}</span>}
            </div>
            <div>
              <label className="gem-form-label">EMAIL ADDRESS</label>
              <input type="email" className={cn("gem-form-input", errors.email && "gem-form-input--error")} value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} maxLength={255} />
              {errors.email && <span className="gem-form-error">{errors.email}</span>}
            </div>
            <div>
              <label className="gem-form-label">PHONE / WHATSAPP</label>
              <input type="tel" className={cn("gem-form-input", errors.phone && "gem-form-input--error")} value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }} placeholder="+1 (000) 000-0000" maxLength={20} />
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginTop: 4 }}>We'll send your confirmation here</span>
              {errors.phone && <span className="gem-form-error">{errors.phone}</span>}
            </div>
            <div>
              <label className="gem-form-label">COUNTRY OF RESIDENCE</label>
              <select className="gem-form-input" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="gem-form-label">HOW DID YOU HEAR ABOUT US?</label>
              <select className="gem-form-input" value={referral} onChange={e => setReferral(e.target.value)}>
                <option value="">Select (optional)</option>
                {REFERRALS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 24, cursor: "pointer" }}>
            <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setErrors(p => ({ ...p, consent: "" })); }}
              style={{ marginTop: 3, accentColor: "#2cb8a8" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              I agree to receive my booking confirmation and trip details by email.
            </span>
          </label>
          {errors.consent && <span className="gem-form-error">{errors.consent}</span>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={prev} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>← Back</button>
            <button onClick={next} style={{
              background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)", color: "#fff", border: "none",
              borderRadius: 8, padding: "16px 40px", fontSize: 13, fontWeight: 600, letterSpacing: ".12em",
              fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", cursor: "pointer",
            }}>Review Booking →</button>
          </div>
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 4 && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#fff", textAlign: "center", marginBottom: 32 }}>
            Review Your Booking
          </h3>

          {/* Experience summary */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: ".15em", color: "#C9A84C", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>YOUR EXPERIENCE</span>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#2cb8a8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>Edit</button>
            </div>
            {selectedService && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <selectedService.icon size={20} style={{ color: "#2cb8a8" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "#fff" }}>{selectedService.title}</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
              {tourDate && <span>Date: {dateFormat(tourDate, "PPP")}</span>}
              <span>Guests: {guests}</span>
              {startTime && <span>Start: {startTime}</span>}
              {charterDuration && <span>Duration: {charterDuration}</span>}
              {flightNumber && <span>Flight: {flightNumber}</span>}
              {estimate > 0 && <span style={{ color: "#C9A84C", fontWeight: 500 }}>Estimated: {formatPrice(estimate)}</span>}
            </div>
          </div>

          {/* Contact summary */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: ".15em", color: "#C9A84C", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>YOUR DETAILS</span>
              <button onClick={() => setStep(3)} style={{ background: "none", border: "none", color: "#2cb8a8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer" }}>Edit</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
              <span>{fullName}</span>
              <span>{email.replace(/(.{2}).*(@.*)/, "$1***$2")}</span>
              {phone && <span>{phone}</span>}
            </div>
          </div>

          {/* What happens next */}
          <div style={{ background: "rgba(44,184,168,0.04)", border: "1px solid rgba(44,184,168,0.15)", borderRadius: 12, padding: 28, marginBottom: 32 }}>
            <span style={{ fontSize: 10, letterSpacing: ".15em", color: "#2cb8a8", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 16 }}>WHAT HAPPENS NEXT</span>
            {[
              "We'll confirm availability within 2 hours",
              "You'll receive a detailed itinerary by email",
              "Full payment is only taken on the day — no charge now",
            ].map(text => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Check size={14} style={{ color: "#2cb8a8", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{text}</span>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)", color: "#fff", border: "none",
            borderRadius: 8, padding: "18px 40px", fontSize: 14, fontWeight: 600, letterSpacing: ".15em",
            fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
            width: "100%", opacity: loading ? 0.6 : 1, transition: "opacity 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Submitting..." : "Send Booking Request →"}
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            By submitting you agree to our booking terms. No payment is taken at this stage.
          </p>
        </div>
      )}

      <style>{`
        .gem-form-label {
          font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; color: var(--text-tertiary);
          text-transform: uppercase; display: block; margin-bottom: 8px;
        }
        .gem-form-input {
          background: var(--input-bg); border: 1px solid var(--input-border);
          border-radius: 8px; padding: 14px 16px; color: var(--input-text);
          font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
          width: 100%; transition: border-color 0.25s ease;
        }
        .gem-form-input:focus { border-color: rgba(44,184,168,0.6); box-shadow: 0 0 0 3px rgba(44,184,168,0.08); }
        .gem-form-input::placeholder { color: var(--text-tertiary); }
        .gem-form-input--error { border-color: #e05a5a !important; }
        .gem-form-error { font-size: 11px; color: #e05a5a; margin-top: 4px; display: block; }
        .gem-stepper-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3); background: transparent;
          color: var(--text-secondary); cursor: pointer; display: flex;
          align-items: center; justify-content: center; transition: all 0.2s;
        }
        .gem-stepper-btn:hover { border-color: rgba(201,168,76,0.6); color: var(--text-primary); }
        @media (max-width: 640px) {
          .bw-svc-grid { grid-template-columns: 1fr !important; }
          .bw-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingWizard;
