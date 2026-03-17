import { useState, useEffect, useMemo } from "react";
import { format as dateFormat, differenceInDays } from "date-fns";
import { CalendarIcon, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Tables } from "@/integrations/supabase/types";
import { useCurrency } from "@/contexts/CurrencyContext";

const PICKUP_LOCATIONS = [
  { value: "airport", label: "Airport (V.C. Bird International)" },
  { value: "hotel", label: "Hotel — specify below" },
  { value: "english_harbour", label: "English Harbour Marina" },
  { value: "jolly_harbour", label: "Jolly Harbour" },
  { value: "other", label: "Other — specify below" },
];

const ADD_ONS = [
  { id: "gps", label: "GPS Navigation", perDay: 8 },
  { id: "child_seat", label: "Child Seat", perDay: 5 },
  { id: "extra_driver", label: "Extra Driver", perDay: 10 },
  { id: "insurance_upgrade", label: "Upgrade Insurance", perDay: 15 },
];

const COUNTRIES = [
  "Antigua and Barbuda", "United States", "United Kingdom", "Canada", "Germany",
  "France", "Italy", "Netherlands", "Australia", "Trinidad and Tobago",
  "Barbados", "Jamaica", "Saint Lucia", "Dominica", "Other",
];

interface RentalBookingFormProps {
  vehicles: Tables<"vehicles">[];
  preselectedVehicleId: string | null;
}

const RentalBookingForm = ({ vehicles, preselectedVehicleId }: RentalBookingFormProps) => {
  const { format: formatPrice } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [vehicleId, setVehicleId] = useState(preselectedVehicleId || "");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupSpecify, setPickupSpecify] = useState("");
  const [dropoffSpecify, setDropoffSpecify] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (preselectedVehicleId) setVehicleId(preselectedVehicleId);
  }, [preselectedVehicleId]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const dailyRate = selectedVehicle?.daily_rate || 0;

  const totalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const days = differenceInDays(returnDate, pickupDate);
    return days > 0 ? days : 0;
  }, [pickupDate, returnDate]);

  const addOnsCost = useMemo(() => {
    return selectedAddOns.reduce((sum, id) => {
      const addon = ADD_ONS.find((a) => a.id === id);
      return sum + (addon ? addon.perDay * totalDays : 0);
    }, 0);
  }, [selectedAddOns, totalDays]);

  const baseTotal = dailyRate * totalDays;
  const estimatedTotal = baseTotal + addOnsCost;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const needsPickupSpecify = pickupLocation === "hotel" || pickupLocation === "other";
  const needsDropoffSpecify = dropoffLocation === "hotel" || dropoffLocation === "other";

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vehicleId) e.vehicleId = "Please select a vehicle";
    if (!pickupDate) e.pickupDate = "Required";
    if (!returnDate) e.returnDate = "Required";
    if (pickupDate && returnDate && differenceInDays(returnDate, pickupDate) < 1)
      e.returnDate = "Must be after pickup date";
    if (!pickupLocation) e.pickupLocation = "Required";
    if (needsPickupSpecify && !pickupSpecify.trim()) e.pickupSpecify = "Please specify";
    if (!dropoffLocation) e.dropoffLocation = "Required";
    if (needsDropoffSpecify && !dropoffSpecify.trim()) e.dropoffSpecify = "Please specify";
    if (!fullName.trim()) e.fullName = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!phone.trim()) e.phone = "Required";
    if (!country) e.country = "Required";
    if (!driverLicense.trim()) e.driverLicense = "Required";
    if (!licenseCountry) e.licenseCountry = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const pickupLoc = needsPickupSpecify
      ? pickupSpecify.trim()
      : PICKUP_LOCATIONS.find((l) => l.value === pickupLocation)?.label || pickupLocation;
    const dropoffLoc = needsDropoffSpecify
      ? dropoffSpecify.trim()
      : PICKUP_LOCATIONS.find((l) => l.value === dropoffLocation)?.label || dropoffLocation;

    const { data, error } = await supabase
      .from("rental_bookings")
      .insert({
        vehicle_id: vehicleId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
        pickup_date: dateFormat(pickupDate!, "yyyy-MM-dd"),
        return_date: dateFormat(returnDate!, "yyyy-MM-dd"),
        pickup_location: pickupLoc,
        dropoff_location: dropoffLoc,
        driver_license: driverLicense.trim(),
        license_country: licenseCountry,
        add_ons: selectedAddOns.length > 0 ? selectedAddOns : null,
        special_requests: specialRequests.trim() || null,
        daily_rate: dailyRate,
        total_days: totalDays,
        total_estimate: estimatedTotal,
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

  if (submitted) {
    return (
      <section id="rental-booking" className="rb-section">
        <div className="rb-card" style={{ textAlign: "center", padding: "80px 64px" }}>
          <div className="rb-success-check">
            <Check size={40} strokeWidth={2} />
          </div>
          <h2 className="rb-success-title">Booking Request Received!</h2>
          <p className="rb-success-ref">Reference: {bookingRef}</p>
          <p className="rb-success-desc">
            We'll confirm your rental within 2 hours. Check your email for details.
          </p>
          <a
            href="https://wa.me/12681234567"
            target="_blank"
            rel="noopener noreferrer"
            className="rb-whatsapp-btn"
          >
            WhatsApp Us Now
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="rental-booking" className="rb-section">
      <div className="rb-header">
        <span className="eyebrow eyebrow--aqua">Reserve Your Vehicle</span>
        <h2 className="rb-h2">Ready to Explore?</h2>
        <p className="rb-sub">
          Complete the form below. We'll confirm availability within 2 hours and
          send your rental agreement directly to your inbox.
        </p>
      </div>

      <div className="rb-layout">
        <div className="rb-card">
          {errors.submit && (
            <p style={{ color: "hsl(var(--gem-coral))", marginBottom: "24px", textAlign: "center" }}>
              {errors.submit}
            </p>
          )}

          {/* Section 1 — Vehicle */}
          <fieldset className="rb-fieldset">
            <legend className="rb-legend">Your Vehicle</legend>
            <div className="rb-field">
              <label className="rb-label">Vehicle</label>
              <select
                className={cn("rb-select", errors.vehicleId && "rb-input--error")}
                value={vehicleId}
                onChange={(e) => { setVehicleId(e.target.value); setErrors((p) => ({ ...p, vehicleId: "" })); }}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.category} — from {formatPrice(v.daily_rate)}/day
                  </option>
                ))}
              </select>
              {errors.vehicleId && <span className="rb-error">{errors.vehicleId}</span>}
            </div>
          </fieldset>

          {/* Section 2 — Dates & Pickup */}
          <fieldset className="rb-fieldset">
            <legend className="rb-legend">Your Dates & Pickup</legend>
            <div className="rb-row">
              <div className="rb-field">
                <label className="rb-label">Pickup Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("rb-date-btn", errors.pickupDate && "rb-input--error")}>
                      <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                      {pickupDate ? dateFormat(pickupDate, "PPP") : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={(d) => { setPickupDate(d); setErrors((p) => ({ ...p, pickupDate: "" })); }}
                      disabled={(d) => d < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.pickupDate && <span className="rb-error">{errors.pickupDate}</span>}
              </div>
              <div className="rb-field">
                <label className="rb-label">Return Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("rb-date-btn", errors.returnDate && "rb-input--error")}>
                      <CalendarIcon size={14} style={{ opacity: 0.5 }} />
                      {returnDate ? dateFormat(returnDate, "PPP") : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(d) => { setReturnDate(d); setErrors((p) => ({ ...p, returnDate: "" })); }}
                      disabled={(d) => d < (pickupDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.returnDate && <span className="rb-error">{errors.returnDate}</span>}
              </div>
            </div>

            {totalDays > 0 && selectedVehicle && (
              <div className="rb-estimate-inline">
                Estimated Total: ${estimatedTotal}
              </div>
            )}

            <div className="rb-row">
              <div className="rb-field">
                <label className="rb-label">Pickup Location</label>
                <select
                  className={cn("rb-select", errors.pickupLocation && "rb-input--error")}
                  value={pickupLocation}
                  onChange={(e) => { setPickupLocation(e.target.value); setErrors((p) => ({ ...p, pickupLocation: "" })); }}
                >
                  <option value="">Select location</option>
                  {PICKUP_LOCATIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                {errors.pickupLocation && <span className="rb-error">{errors.pickupLocation}</span>}
              </div>
              <div className="rb-field">
                <label className="rb-label">Dropoff Location</label>
                <select
                  className={cn("rb-select", errors.dropoffLocation && "rb-input--error")}
                  value={dropoffLocation}
                  onChange={(e) => { setDropoffLocation(e.target.value); setErrors((p) => ({ ...p, dropoffLocation: "" })); }}
                >
                  <option value="">Select location</option>
                  {PICKUP_LOCATIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                {errors.dropoffLocation && <span className="rb-error">{errors.dropoffLocation}</span>}
              </div>
            </div>

            {needsPickupSpecify && (
              <div className="rb-field">
                <label className="rb-label">Specify Pickup Location</label>
                <input
                  type="text"
                  className={cn("rb-input", errors.pickupSpecify && "rb-input--error")}
                  value={pickupSpecify}
                  onChange={(e) => { setPickupSpecify(e.target.value); setErrors((p) => ({ ...p, pickupSpecify: "" })); }}
                  placeholder="Hotel name or address"
                />
                {errors.pickupSpecify && <span className="rb-error">{errors.pickupSpecify}</span>}
              </div>
            )}
            {needsDropoffSpecify && (
              <div className="rb-field">
                <label className="rb-label">Specify Dropoff Location</label>
                <input
                  type="text"
                  className={cn("rb-input", errors.dropoffSpecify && "rb-input--error")}
                  value={dropoffSpecify}
                  onChange={(e) => { setDropoffSpecify(e.target.value); setErrors((p) => ({ ...p, dropoffSpecify: "" })); }}
                  placeholder="Hotel name or address"
                />
                {errors.dropoffSpecify && <span className="rb-error">{errors.dropoffSpecify}</span>}
              </div>
            )}
          </fieldset>

          {/* Section 3 — Driver Information */}
          <fieldset className="rb-fieldset">
            <legend className="rb-legend">Driver Information</legend>
            <div className="rb-row">
              <div className="rb-field">
                <label className="rb-label">Full Name</label>
                <input
                  type="text"
                  className={cn("rb-input", errors.fullName && "rb-input--error")}
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                  maxLength={100}
                />
                {errors.fullName && <span className="rb-error">{errors.fullName}</span>}
              </div>
              <div className="rb-field">
                <label className="rb-label">Email Address</label>
                <input
                  type="email"
                  className={cn("rb-input", errors.email && "rb-input--error")}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  maxLength={255}
                />
                {errors.email && <span className="rb-error">{errors.email}</span>}
              </div>
            </div>
            <div className="rb-row">
              <div className="rb-field">
                <label className="rb-label">Phone Number</label>
                <input
                  type="tel"
                  className={cn("rb-input", errors.phone && "rb-input--error")}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                  placeholder="+1 268..."
                  maxLength={20}
                />
                {errors.phone && <span className="rb-error">{errors.phone}</span>}
              </div>
              <div className="rb-field">
                <label className="rb-label">Country of Residence</label>
                <select
                  className={cn("rb-select", errors.country && "rb-input--error")}
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: "" })); }}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <span className="rb-error">{errors.country}</span>}
              </div>
            </div>
            <div className="rb-row">
              <div className="rb-field">
                <label className="rb-label">Driver's License Number</label>
                <input
                  type="text"
                  className={cn("rb-input", errors.driverLicense && "rb-input--error")}
                  value={driverLicense}
                  onChange={(e) => { setDriverLicense(e.target.value); setErrors((p) => ({ ...p, driverLicense: "" })); }}
                  maxLength={50}
                />
                {errors.driverLicense && <span className="rb-error">{errors.driverLicense}</span>}
              </div>
              <div className="rb-field">
                <label className="rb-label">License Issuing Country</label>
                <select
                  className={cn("rb-select", errors.licenseCountry && "rb-input--error")}
                  value={licenseCountry}
                  onChange={(e) => { setLicenseCountry(e.target.value); setErrors((p) => ({ ...p, licenseCountry: "" })); }}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.licenseCountry && <span className="rb-error">{errors.licenseCountry}</span>}
              </div>
            </div>
          </fieldset>

          {/* Section 4 — Add-Ons */}
          <fieldset className="rb-fieldset">
            <legend className="rb-legend">Add-Ons</legend>
            <div className="rb-addons">
              {ADD_ONS.map((addon) => {
                const active = selectedAddOns.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    className={cn("rb-addon-chip", active && "rb-addon-chip--active")}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    {addon.label} — +${addon.perDay}/day
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Section 5 — Special Requests */}
          <fieldset className="rb-fieldset">
            <legend className="rb-legend">Anything Else?</legend>
            <div className="rb-field">
              <label className="rb-label">Special Requests</label>
              <textarea
                className="rb-textarea"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Special requests, allergies, road preferences..."
                maxLength={1000}
                rows={4}
              />
            </div>
          </fieldset>

          {/* Submit */}
          <button
            type="button"
            className="rb-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Rental Request"}
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="rb-summary">
          <div className="rb-summary__inner">
            <h4 className="rb-summary__title">Booking Summary</h4>
            <div className="rb-summary__row">
              <span>Vehicle</span>
              <span>{selectedVehicle?.name || "—"}</span>
            </div>
            <div className="rb-summary__row">
              <span>Duration</span>
              <span>{totalDays > 0 ? `${totalDays} day${totalDays > 1 ? "s" : ""}` : "—"}</span>
            </div>
            <div className="rb-summary__row">
              <span>Base rate</span>
              <span>
                {totalDays > 0 && selectedVehicle
                  ? `$${dailyRate}/day × ${totalDays} = $${baseTotal}`
                  : "—"}
              </span>
            </div>
            {addOnsCost > 0 && (
              <div className="rb-summary__row">
                <span>Add-ons</span>
                <span>+${addOnsCost}</span>
              </div>
            )}
            <div className="rb-summary__divider" />
            <div className="rb-summary__total-row">
              <span>Estimated Total</span>
              <span className="rb-summary__total">${estimatedTotal > 0 ? estimatedTotal : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalBookingForm;
