import { useState, useEffect, useMemo } from "react";
import { format as dateFormat, differenceInDays } from "date-fns";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { useCurrency } from "@/contexts/CurrencyContext";

const PICKUP_LOCATIONS = [
  "VC Bird International Airport",
  "Your Hotel (St. John's)",
  "English Harbour Marina",
  "Jolly Harbour",
  "Other — we'll arrange",
];

const ADD_ONS = [
  { id: "gps", label: "GPS", perDay: 8 },
  { id: "child_seat", label: "Child Seat", perDay: 5 },
  { id: "extra_driver", label: "Extra Driver", perDay: 10 },
  { id: "insurance", label: "Premium Insurance", perDay: 15 },
];

interface Props {
  vehicles: Tables<"vehicles">[];
  preselectedVehicleId: string | null;
}

const RentalBookingForm = ({ vehicles, preselectedVehicleId }: Props) => {
  const { format: formatPrice } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [vehicleId, setVehicleId] = useState(preselectedVehicleId || "");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pickupLocation, setPickupLocation] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (preselectedVehicleId) setVehicleId(preselectedVehicleId);
  }, [preselectedVehicleId]);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const dailyRate = selectedVehicle?.daily_rate || 0;

  const totalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const d = differenceInDays(returnDate, pickupDate);
    return d > 0 ? d : 0;
  }, [pickupDate, returnDate]);

  const addOnsCost = useMemo(() =>
    selectedAddOns.reduce((sum, id) => {
      const a = ADD_ONS.find(x => x.id === id);
      return sum + (a ? a.perDay * totalDays : 0);
    }, 0), [selectedAddOns, totalDays]);

  const baseTotal = dailyRate * totalDays;
  const estimatedTotal = baseTotal + addOnsCost;
  const datesSelected = !!pickupDate && !!returnDate && totalDays > 0;

  const toggleAddOn = (id: string) =>
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicleId = "Please select a vehicle";
    if (!pickupDate) e.pickupDate = "Required";
    if (!returnDate) e.returnDate = "Required";
    if (totalDays < 1) e.returnDate = "Must be after pickup date";
    if (!pickupLocation) e.pickupLocation = "Required";
    if (!fullName.trim()) e.fullName = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await supabase.from("rental_bookings").insert({
      vehicle_id: vehicleId,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      pickup_date: dateFormat(pickupDate!, "yyyy-MM-dd"),
      return_date: dateFormat(returnDate!, "yyyy-MM-dd"),
      pickup_location: pickupLocation,
      dropoff_location: pickupLocation,
      driver_license: "",
      license_country: "",
      add_ons: selectedAddOns.length > 0 ? selectedAddOns : null,
      special_requests: specialRequests.trim() || null,
      daily_rate: dailyRate,
      total_days: totalDays,
      total_estimate: estimatedTotal,
    }).select("booking_ref").single();
    setLoading(false);
    if (error) { setErrors({ submit: "Something went wrong. Please try again." }); return; }
    setBookingRef(data?.booking_ref || "");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="rental-booking" className="rb-section">
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "80px 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(44,184,168,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check size={28} style={{ color: "#2cb8a8" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 12 }}>Rental Request Sent!</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 28 }}>
            We'll confirm your vehicle and dates within 2 hours. Check your email for next steps.
          </p>
          <a href="https://wa.me/12687805510" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8,
            padding: "14px 28px", color: "#25D366", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
          }}>Message Us on WhatsApp →</a>
        </div>
      </section>
    );
  }

  return (
    <section id="rental-booking" className="rb-section">
      <div className="rb-header">
        <span className="eyebrow eyebrow--aqua">Reserve Your Vehicle</span>
        <h2 className="rb-h2">Ready to Explore?</h2>
        <p className="rb-sub">Tell us what you need. We'll confirm availability within 2 hours and send your rental agreement.</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "40px 48px" }} className="rb-main-card">
          {errors.submit && <p style={{ color: "#e05a5a", textAlign: "center", marginBottom: 20, fontSize: 14 }}>{errors.submit}</p>}

          {/* Vehicle */}
          <div style={{ marginBottom: 24 }}>
            <label className="gem-form-label">SELECTED VEHICLE</label>
            <Select value={vehicleId} onValueChange={val => { setVehicleId(val); setErrors(p => ({ ...p, vehicleId: "" })); }}>
              <SelectTrigger className={cn("rb-shadcn-select", errors.vehicleId && "rb-input--error")}>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name} — from {formatPrice(v.daily_rate)}/day</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicleId && <span className="gem-form-error">{errors.vehicleId}</span>}
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="rb-dates-grid">
            <div>
              <label className="gem-form-label">PICKUP DATE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("gem-form-input", errors.pickupDate && "gem-form-input--error")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: "100%" }}>
                    <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                    {pickupDate ? dateFormat(pickupDate, "PPP") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={pickupDate} onSelect={d => { setPickupDate(d); setErrors(p => ({ ...p, pickupDate: "" })); }}
                    disabled={d => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.pickupDate && <span className="gem-form-error">{errors.pickupDate}</span>}
            </div>
            <div>
              <label className="gem-form-label">RETURN DATE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("gem-form-input", errors.returnDate && "gem-form-input--error")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: "100%" }}>
                    <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                    {returnDate ? dateFormat(returnDate, "PPP") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={returnDate} onSelect={d => { setReturnDate(d); setErrors(p => ({ ...p, returnDate: "" })); }}
                    disabled={d => d < (pickupDate || new Date())} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.returnDate && <span className="gem-form-error">{errors.returnDate}</span>}
            </div>
          </div>

          {/* Pickup location */}
          <div style={{ marginBottom: 24 }}>
            <label className="gem-form-label">PICKUP LOCATION</label>
            <select className={cn("gem-form-input", errors.pickupLocation && "gem-form-input--error")} value={pickupLocation}
              onChange={e => { setPickupLocation(e.target.value); setErrors(p => ({ ...p, pickupLocation: "" })); }}>
              <option value="">Select location</option>
              {PICKUP_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.pickupLocation && <span className="gem-form-error">{errors.pickupLocation}</span>}
          </div>

          {/* Add-ons */}
          <div style={{ marginBottom: 24 }}>
            <label className="gem-form-label">ADD-ONS (OPTIONAL)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {ADD_ONS.map(addon => {
                const isSelected = selectedAddOns.includes(addon.id);
                return (
                  <button key={addon.id} onClick={() => toggleAddOn(addon.id)} style={{
                    background: isSelected ? "rgba(44,184,168,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? "#2cb8a8" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 999, padding: "8px 16px", fontSize: 12,
                    color: isSelected ? "#2cb8a8" : "rgba(255,255,255,0.6)",
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {addon.label} +${addon.perDay}/day
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing summary */}
          {datesSelected && selectedVehicle && (
            <div style={{
              background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 8, padding: 16, marginBottom: 24,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Vehicle: {formatPrice(dailyRate)}/day × {totalDays} days</span>
                  <span>{formatPrice(baseTotal)}</span>
                </div>
                {addOnsCost > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Add-ons</span><span>{formatPrice(addOnsCost)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(201,168,76,0.15)", paddingTop: 8, marginTop: 4, color: "#C9A84C", fontWeight: 600 }}>
                  <span>Estimated Total</span><span>{formatPrice(estimatedTotal)}</span>
                </div>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                Final price confirmed on booking — no card required now.
              </p>
            </div>
          )}

          {/* Step 2 — Your Details (reveals when dates selected) */}
          <div style={{
            maxHeight: datesSelected ? 600 : 0, overflow: "hidden",
            transition: "max-height 0.5s ease", opacity: datesSelected ? 1 : 0,
          }}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }} className="rb-details-grid">
                <div>
                  <label className="gem-form-label">FULL NAME</label>
                  <input className={cn("gem-form-input", errors.fullName && "gem-form-input--error")} value={fullName}
                    onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: "" })); }} maxLength={100} />
                  {errors.fullName && <span className="gem-form-error">{errors.fullName}</span>}
                </div>
                <div>
                  <label className="gem-form-label">EMAIL ADDRESS</label>
                  <input type="email" className={cn("gem-form-input", errors.email && "gem-form-input--error")} value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} maxLength={255} />
                  {errors.email && <span className="gem-form-error">{errors.email}</span>}
                </div>
                <div>
                  <label className="gem-form-label">WHATSAPP / PHONE</label>
                  <input type="tel" className={cn("gem-form-input", errors.phone && "gem-form-input--error")} value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }} placeholder="+1 (000) 000-0000" maxLength={20} />
                  {errors.phone && <span className="gem-form-error">{errors.phone}</span>}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="gem-form-label">SPECIAL REQUESTS</label>
                <textarea className="gem-form-input" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
                  rows={2} placeholder="Any special requirements? Baby seat sizes, accessibility needs, etc." style={{ resize: "vertical" }} maxLength={1000} />
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{
                background: "linear-gradient(135deg, #1a8a9e, #2cb8a8)", color: "#fff",
                border: "none", borderRadius: 8, padding: "18px", fontSize: 13, fontWeight: 600,
                letterSpacing: ".15em", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer", width: "100%", height: 56,
                opacity: loading ? 0.6 : 1, transition: "opacity 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Submitting..." : "Request This Rental →"}
              </button>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 10 }}>
                No payment now. We confirm within 2 hours and send your rental agreement by email.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gem-form-label { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); text-transform: uppercase; display: block; margin-bottom: 8px; }
        .gem-form-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px 16px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; width: 100%; transition: border-color 0.25s ease; }
        .gem-form-input:focus { border-color: rgba(44,184,168,0.6); box-shadow: 0 0 0 3px rgba(44,184,168,0.08); }
        .gem-form-input::placeholder { color: rgba(255,255,255,0.25); }
        .gem-form-input--error { border-color: #e05a5a !important; }
        .gem-form-error { font-size: 11px; color: #e05a5a; margin-top: 4px; display: block; }
        @media (max-width: 640px) {
          .rb-main-card { padding: 24px 20px !important; }
          .rb-dates-grid, .rb-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default RentalBookingForm;
