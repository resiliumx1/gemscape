import { useState, useMemo } from "react";
import { format as dateFormat, differenceInDays, addDays, addYears } from "date-fns";
import { CalendarIcon, Loader2, Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrency } from "@/contexts/CurrencyContext";

/* ── constants ── */
const SERVICES = [
  {
    id: "circumnavigation",
    name: "Island Circumnavigation",
    desc: "Full-day private guided tour of Antigua's 365 beaches, hidden coves, and historic landmarks.",
    price: "From $280 per group",
    basePrice: 280,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=85",
  },
  {
    id: "concierge",
    name: "Flight Concierge",
    desc: "VIP airport arrivals, private charter booking, and seamless inter-island transfer coordination.",
    price: "From $150 per person",
    basePrice: 150,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=85",
  },
  {
    id: "charter",
    name: "Private Charter",
    desc: "Half or full-day private vessel charter — your route, your pace, your crew.",
    price: "From $480 per charter",
    basePrice: 480,
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&q=85",
  },
];

const COUNTRIES = [
  "Antigua and Barbuda","Australia","Barbados","Canada","Dominica","France",
  "Germany","Italy","Jamaica","Netherlands","Saint Lucia","Trinidad and Tobago",
  "United Kingdom","United States","Other",
];

const REFERRAL_SOURCES = [
  "Instagram","Google","TripAdvisor","Hotel Concierge","Friend/Family","Other",
];

interface BookingWizardProps {
  initialService?: string;
}

const BookingWizard = ({ initialService }: BookingWizardProps) => {
  const { format: formatPrice } = useCurrency();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [serviceType, setServiceType] = useState(initialService || "");

  // Step 2 — common
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Step 2 — circumnavigation
  const [startTime, setStartTime] = useState("");
  const [pace, setPace] = useState("");
  const [lunch, setLunch] = useState("");

  // Step 2 — concierge
  const [conciergeType, setConciergeType] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [airport, setAirport] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [transferRequired, setTransferRequired] = useState(false);

  // Step 2 — charter
  const [charterDuration, setCharterDuration] = useState("");
  const [departurePoint, setDeparturePoint] = useState("");
  const [activityPref, setActivityPref] = useState("");

  // Step 3
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [referral, setReferral] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const selectedService = SERVICES.find((s) => s.id === serviceType);
  const partySize = adults + children;

  const estimate = useMemo(() => {
    if (!selectedService) return 0;
    if (serviceType === "concierge") return selectedService.basePrice * adults;
    return selectedService.basePrice;
  }, [serviceType, adults, selectedService]);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !serviceType) e.serviceType = "Please select a service";
    if (s === 2) {
      if (!tourDate) e.tourDate = "Required";
      if (adults < 1) e.adults = "At least 1 adult";
    }
    if (s === 3) {
      if (!fullName.trim()) e.fullName = "Required";
      if (!email.trim()) e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
      if (!phone.trim()) e.phone = "Required";
      if (!country) e.country = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const buildAddOns = (): string[] => {
    const addOns: string[] = [];
    if (serviceType === "circumnavigation") {
      if (startTime) addOns.push(`start:${startTime}`);
      if (pace) addOns.push(`pace:${pace}`);
      if (lunch) addOns.push(`lunch:${lunch}`);
    }
    if (serviceType === "concierge") {
      if (conciergeType) addOns.push(`type:${conciergeType}`);
      if (airport) addOns.push(`airport:${airport}`);
      if (transferRequired) addOns.push("transfer:yes");
    }
    if (serviceType === "charter") {
      if (charterDuration) addOns.push(`duration:${charterDuration}`);
      if (departurePoint) addOns.push(`departure:${departurePoint}`);
      if (activityPref) addOns.push(`activity:${activityPref}`);
    }
    return addOns;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) { setStep(3); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_type: serviceType,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
        tour_date: dateFormat(tourDate!, "yyyy-MM-dd"),
        party_size: partySize,
        adults,
        children: children > 0 ? children : null,
        pickup_location: accommodation.trim() || null,
        flight_details: flightNumber.trim() || null,
        special_requests: specialRequests.trim() || null,
        add_ons: buildAddOns().length > 0 ? buildAddOns() : null,
        total_estimate: estimate > 0 ? estimate : null,
      })
      .select("booking_ref")
      .single();

    setLoading(false);
    if (error) {
      setErrors({ submit: "Something went wrong. Please try again." });
      return;
    }
    setBookingRef(data?.booking_ref || "");
    setSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setSubmitted(false);
    setServiceType("");
    setTourDate(undefined);
    setAdults(2);
    setChildren(0);
    setStartTime("");
    setPace("");
    setLunch("");
    setConciergeType("");
    setFlightNumber("");
    setAirport("");
    setHotelName("");
    setTransferRequired(false);
    setCharterDuration("");
    setDeparturePoint("");
    setActivityPref("");
    setFullName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setAccommodation("");
    setReferral("");
    setSpecialRequests("");
    setErrors({});
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div className="bw-success">
        <div className="bw-success__diamond">◆</div>
        <h1 className="bw-success__h1">Booking Confirmed.</h1>
        <p className="bw-success__ref">{bookingRef}</p>
        <p className="bw-success__desc">
          We've sent a confirmation to {email}. Our team will contact you within
          24 hours to finalise your experience.
        </p>
        <div className="bw-success__actions">
          <button className="bw-btn bw-btn--navy" onClick={reset}>
            Book Another Experience
          </button>
          <a
            href="https://wa.me/12681234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bw-btn bw-btn--ghost"
          >
            WhatsApp Us Now
          </a>
        </div>
      </div>
    );
  }

  const STEP_LABELS = ["Service", "Details", "Your Info", "Review"];

  return (
    <>
      {/* Step indicator */}
      <div className="bw-stepper">
        <div className="bw-stepper__inner">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isActive = num === step;
            const isComplete = num < step;
            return (
              <button
                key={label}
                className={cn(
                  "bw-stepper__step",
                  isActive && "bw-stepper__step--active",
                  isComplete && "bw-stepper__step--complete",
                )}
                onClick={() => { if (isComplete) setStep(num); }}
                disabled={num > step}
              >
                {isComplete && <Check size={12} strokeWidth={2.5} />}
                {label}
              </button>
            );
          })}
          <div className="bw-stepper__line">
            <div className="bw-stepper__fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bw-body">
        {step === 1 && (
          <div className="bw-step">
            <p className="bw-instruction">What would you like to experience?</p>
            {errors.serviceType && <p className="rb-error" style={{ textAlign: "center" }}>{errors.serviceType}</p>}
            <div className="bw-services-grid">
              {SERVICES.map((svc) => (
                <button
                  key={svc.id}
                  className={cn("bw-svc-card", serviceType === svc.id && "bw-svc-card--selected")}
                  onClick={() => { setServiceType(svc.id); setErrors({}); }}
                >
                  {serviceType === svc.id && <span className="bw-svc-card__check">◆</span>}
                  <div className="bw-svc-card__img-wrap">
                    <img src={svc.image} alt={svc.name} loading="lazy" width={600} height={338} />
                  </div>
                  <div className="bw-svc-card__body">
                    <h3 className="bw-svc-card__name">{svc.name}</h3>
                    <p className="bw-svc-card__desc">{svc.desc}</p>
                    <span className="bw-svc-card__price">{`From ${formatPrice(svc.basePrice)}${svc.id === 'concierge' ? ' per person' : svc.id === 'charter' ? ' per charter' : ' per group'}`}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="bw-nav">
              <button className="bw-btn bw-btn--navy" onClick={next} disabled={!serviceType}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bw-step bw-step--narrow">
            <fieldset className="rb-fieldset">
              <legend className="rb-legend">Date & Party Size</legend>
              <div className="rb-field">
                <label className="rb-label">Tour Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("rb-date-btn", errors.tourDate && "rb-input--error")}>
                      <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                      {tourDate ? dateFormat(tourDate, "PPP") : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tourDate}
                      onSelect={(d) => { setTourDate(d); setErrors((p) => ({ ...p, tourDate: "" })); }}
                      disabled={(d) => d < addDays(new Date(), 1) || d > addYears(new Date(), 2)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.tourDate && <span className="rb-error">{errors.tourDate}</span>}
              </div>

              <div className="rb-row">
                <div className="rb-field">
                  <label className="rb-label">Adults</label>
                  <div className="bw-stepper-input">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="bw-stepper-btn"><Minus size={14} /></button>
                    <span className="bw-stepper-value">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(20, adults + 1))} className="bw-stepper-btn"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Children (0–12)</label>
                  <div className="bw-stepper-input">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="bw-stepper-btn"><Minus size={14} /></button>
                    <span className="bw-stepper-value">{children}</span>
                    <button type="button" onClick={() => setChildren(Math.min(15, children + 1))} className="bw-stepper-btn"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              <p className="bw-guests-total">{partySize} guest{partySize !== 1 ? "s" : ""} total</p>
            </fieldset>

            {serviceType === "circumnavigation" && (
              <fieldset className="rb-fieldset">
                <legend className="rb-legend">Circumnavigation Options</legend>
                <div className="rb-field">
                  <label className="rb-label">Preferred Start Time</label>
                  <select className="rb-select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                    <option value="">Select time</option>
                    <option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option>
                  </select>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Pace Preference</label>
                  <select className="rb-select" value={pace} onChange={(e) => setPace(e.target.value)}>
                    <option value="">Select pace</option>
                    <option>Leisurely (more stops)</option><option>Active (full island)</option><option>Custom — tell us</option>
                  </select>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Lunch Preference</label>
                  <select className="rb-select" value={lunch} onChange={(e) => setLunch(e.target.value)}>
                    <option value="">Select option</option>
                    <option>Include beachside lunch</option><option>I'll arrange my own</option>
                  </select>
                </div>
              </fieldset>
            )}

            {serviceType === "concierge" && (
              <fieldset className="rb-fieldset">
                <legend className="rb-legend">Concierge Details</legend>
                <div className="rb-field">
                  <label className="rb-label">Service Type</label>
                  <select className="rb-select" value={conciergeType} onChange={(e) => setConciergeType(e.target.value)}>
                    <option value="">Select type</option>
                    <option>Airport Arrival</option><option>Airport Departure</option>
                    <option>Full Trip Coordination</option><option>Private Charter Booking</option>
                  </select>
                </div>
                <div className="rb-row">
                  <div className="rb-field">
                    <label className="rb-label">Flight Number (if known)</label>
                    <input type="text" className="rb-input" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} maxLength={20} />
                  </div>
                  <div className="rb-field">
                    <label className="rb-label">Airport</label>
                    <select className="rb-select" value={airport} onChange={(e) => setAirport(e.target.value)}>
                      <option value="">Select airport</option>
                      <option>V.C. Bird International (ANU)</option><option>Other — specify</option>
                    </select>
                  </div>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Hotel / Accommodation</label>
                  <input type="text" className="rb-input" value={hotelName} onChange={(e) => setHotelName(e.target.value)} maxLength={200} />
                </div>
                <label className="bw-checkbox">
                  <input type="checkbox" checked={transferRequired} onChange={(e) => setTransferRequired(e.target.checked)} />
                  <span>Yes, include ground transfer to/from hotel</span>
                </label>
              </fieldset>
            )}

            {serviceType === "charter" && (
              <fieldset className="rb-fieldset">
                <legend className="rb-legend">Charter Details</legend>
                <div className="rb-field">
                  <label className="rb-label">Duration</label>
                  <select className="rb-select" value={charterDuration} onChange={(e) => setCharterDuration(e.target.value)}>
                    <option value="">Select duration</option>
                    <option>Half Day (4 hours)</option><option>Full Day (8 hours)</option><option>Sunset (3 hours)</option>
                  </select>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Departure Point</label>
                  <select className="rb-select" value={departurePoint} onChange={(e) => setDeparturePoint(e.target.value)}>
                    <option value="">Select point</option>
                    <option>English Harbour</option><option>Jolly Harbour</option><option>Dickenson Bay</option>
                  </select>
                </div>
                <div className="rb-field">
                  <label className="rb-label">Activity Preference</label>
                  <select className="rb-select" value={activityPref} onChange={(e) => setActivityPref(e.target.value)}>
                    <option value="">Select activity</option>
                    <option>Snorkelling + beaches</option><option>Scenic coastal cruise</option>
                    <option>Fishing</option><option>Custom</option>
                  </select>
                </div>
              </fieldset>
            )}

            <div className="bw-nav bw-nav--between">
              <button className="bw-btn bw-btn--ghost" onClick={prev}>← Back</button>
              <button className="bw-btn bw-btn--navy" onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bw-step bw-step--narrow">
            <fieldset className="rb-fieldset">
              <legend className="rb-legend">Your Information</legend>
              <div className="rb-row">
                <div className="rb-field">
                  <label className="rb-label">Full Name</label>
                  <input type="text" className={cn("rb-input", errors.fullName && "rb-input--error")} value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }} maxLength={100} />
                  {errors.fullName && <span className="rb-error">{errors.fullName}</span>}
                </div>
                <div className="rb-field">
                  <label className="rb-label">Email Address</label>
                  <input type="email" className={cn("rb-input", errors.email && "rb-input--error")} value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} maxLength={255} />
                  {errors.email && <span className="rb-error">{errors.email}</span>}
                </div>
              </div>
              <div className="rb-row">
                <div className="rb-field">
                  <label className="rb-label">Phone Number</label>
                  <input type="tel" className={cn("rb-input", errors.phone && "rb-input--error")} value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }} placeholder="+1 268..." maxLength={20} />
                  {errors.phone && <span className="rb-error">{errors.phone}</span>}
                </div>
                <div className="rb-field">
                  <label className="rb-label">Country of Residence</label>
                  <select className={cn("rb-select", errors.country && "rb-input--error")} value={country}
                    onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <span className="rb-error">{errors.country}</span>}
                </div>
              </div>
              <div className="rb-field">
                <label className="rb-label">Hotel / Accommodation in Antigua</label>
                <input type="text" className="rb-input" value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)} placeholder="Where are you staying?" maxLength={200} />
              </div>
              <div className="rb-field">
                <label className="rb-label">How Did You Hear About Us?</label>
                <select className="rb-select" value={referral} onChange={(e) => setReferral(e.target.value)}>
                  <option value="">Select one</option>
                  {REFERRAL_SOURCES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="rb-field">
                <label className="rb-label">Special Requests or Notes</label>
                <textarea className="rb-textarea" value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Dietary requirements, mobility considerations, anniversary celebration..."
                  maxLength={1000} rows={5} />
              </div>
            </fieldset>
            <div className="bw-nav bw-nav--between">
              <button className="bw-btn bw-btn--ghost" onClick={prev}>← Back</button>
              <button className="bw-btn bw-btn--navy" onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bw-step bw-step--narrow">
            <div className="bw-review-card">
              {selectedService && (
                <div className="bw-review-header">
                  <img src={selectedService.image} alt={selectedService.name} className="bw-review-thumb" />
                  <span className="bw-review-badge">{selectedService.name}</span>
                </div>
              )}

              <div className="bw-review-rows">
                <div className="bw-review-row"><span>Date</span><span>{tourDate ? dateFormat(tourDate, "PPP") : "—"}</span></div>
                <div className="bw-review-row"><span>Party Size</span><span>{adults} adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}</span></div>
                <div className="bw-review-row"><span>Guest</span><span>{fullName}</span></div>
                <div className="bw-review-row"><span>Email</span><span>{email}</span></div>
                <div className="bw-review-row"><span>Phone</span><span>{phone}</span></div>
                <div className="bw-review-row"><span>Country</span><span>{country}</span></div>
                {accommodation && <div className="bw-review-row"><span>Accommodation</span><span>{accommodation}</span></div>}
                {specialRequests && <div className="bw-review-row"><span>Notes</span><span>{specialRequests}</span></div>}
              </div>

              <div className="bw-review-estimate">
                <span className="bw-review-estimate__label">Estimated starting from:</span>
                <span className="bw-review-estimate__value">${estimate}</span>
              </div>
              <p className="bw-review-note">
                Final pricing confirmed within 24 hours. No payment required now — we'll invoice you after confirmation.
              </p>
              <p className="bw-review-cancel">
                Free cancellation up to 48 hours before your tour date.
              </p>

              {errors.submit && <p className="rb-error" style={{ textAlign: "center", marginTop: "16px" }}>{errors.submit}</p>}

              <button className="bw-confirm-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Booking"}
              </button>
            </div>
            <div className="bw-nav">
              <button className="bw-btn bw-btn--ghost" onClick={prev}>← Back</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingWizard;
