import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Map, Car, Briefcase, PenTool,
  CalendarDays as CalIcon, ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ── Booking type definitions ── */
type BookingType = "tour" | "rental" | "concierge" | "custom" | null;

const BOOKING_TYPES = [
  { key: "tour" as const, label: "Tour Booking", icon: Map, desc: "Island tours & excursions", color: "var(--aura-teal)" },
  { key: "rental" as const, label: "Vehicle Rental", icon: Car, desc: "Car & vehicle rentals", color: "var(--aura-gold)" },
  { key: "concierge" as const, label: "Concierge", icon: Briefcase, desc: "Airport & custom services", color: "#a78bfa" },
  { key: "custom" as const, label: "Custom", icon: PenTool, desc: "Create a custom service", color: "#f472b6" },
];

const TOUR_OPTIONS = [
  { value: "Circumnavigation Tour", label: "Circumnavigation Tour", price: 350 },
  { value: "Half-Day Tour", label: "Half-Day Tour", price: 180 },
  { value: "Private Charter", label: "Private Charter", price: 600 },
  { value: "Flight Concierge", label: "Flight Concierge", price: 120 },
];

interface NewBookingModalProps {
  onClose: () => void;
  isMobile?: boolean;
}

const NewBookingModal = ({ onClose, isMobile = false }: NewBookingModalProps) => {
  const [bookingType, setBookingType] = useState<BookingType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();

  const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleBack = () => {
    setBookingType(null);
    setFormData({});
    setDate(undefined);
    setReturnDate(undefined);
  };

  const canSubmit = () => {
    if (!formData.client_name || !formData.email) return false;
    switch (bookingType) {
      case "tour": return !!formData.tour && !!date;
      case "rental": return !!date && !!returnDate;
      case "concierge": return true;
      case "custom": return !!formData.custom_service && !!formData.custom_price;
      default: return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setSubmitting(true);
    try {
      if (bookingType === "tour" || bookingType === "custom") {
        const serviceName = bookingType === "custom" ? formData.custom_service : formData.tour;
        const price = bookingType === "custom"
          ? Number(formData.custom_price) || 0
          : TOUR_OPTIONS.find(t => t.value === formData.tour)?.price || 0;
        const { error } = await supabase.from("bookings").insert({
          full_name: formData.client_name,
          email: formData.email,
          phone: formData.phone || "",
          service_type: serviceName || "Custom Service",
          tour_date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          party_size: Number(formData.guests) || 1,
          adults: Number(formData.adults) || Number(formData.guests) || 1,
          children: Number(formData.children) || 0,
          pickup_location: formData.pickup || null,
          special_requests: formData.notes || null,
          total_estimate: price,
          status: "confirmed",
        });
        if (error) throw error;
      } else if (bookingType === "rental") {
        const { error } = await supabase.from("rental_bookings").insert({
          full_name: formData.client_name,
          email: formData.email,
          phone: formData.phone || "",
          pickup_date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          pickup_location: formData.pickup || "Hotel",
          dropoff_location: formData.dropoff || null,
          daily_rate: Number(formData.daily_rate) || 0,
          total_days: date && returnDate ? Math.max(1, Math.ceil((returnDate.getTime() - date.getTime()) / 86400000)) : 1,
          total_estimate: Number(formData.rental_total) || 0,
          special_requests: formData.notes || null,
          status: "confirmed",
        });
        if (error) throw error;
      } else if (bookingType === "concierge") {
        const { error } = await supabase.from("concierge_enquiries").insert({
          name: formData.client_name,
          email: formData.email,
          whatsapp: formData.phone || null,
          arrival_date: date ? format(date, "yyyy-MM-dd") : null,
          departure_date: returnDate ? format(returnDate, "yyyy-MM-dd") : null,
          guests: Number(formData.guests) || 1,
          flight_number: formData.flight || null,
          requirements: formData.notes || null,
          status: "new",
        });
        if (error) throw error;
      }
      toast.success(`${BOOKING_TYPES.find(t => t.key === bookingType)?.label || "Booking"} created successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    background: "var(--aura-input-bg)", border: "1px solid var(--aura-glass-border)",
    color: "var(--aura-text)", fontFamily: "var(--aura-font-body)", fontSize: 13,
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500,
    color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 6, display: "block",
  };

  /* ── Type selection cards ── */
  const renderTypeSelection = () => (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
      {BOOKING_TYPES.map(type => {
        const Icon = type.icon;
        return (
          <motion.button
            key={type.key}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBookingType(type.key)}
            style={{
              padding: "20px 18px", borderRadius: 16, cursor: "pointer",
              border: "1px solid var(--aura-glass-border)",
              background: "var(--aura-input-bg)",
              textAlign: "left", transition: "all 0.25s",
              display: "flex", alignItems: "center", gap: 14,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${type.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={20} style={{ color: type.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 600, color: "var(--aura-text)", margin: 0 }}>{type.label}</p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", margin: "2px 0 0" }}>{type.desc}</p>
            </div>
            <ChevronRight size={16} style={{ color: "var(--aura-text-muted)", flexShrink: 0 }} />
          </motion.button>
        );
      })}
    </div>
  );

  /* ── Common contact fields ── */
  const renderContactFields = () => (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
      <div>
        <label style={labelStyle}>Client Name *</label>
        <input style={inputStyle} required value={formData.client_name || ""} onChange={e => set("client_name", e.target.value)} placeholder="Full name" />
      </div>
      <div>
        <label style={labelStyle}>Email *</label>
        <input style={inputStyle} type="email" required value={formData.email || ""} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
      </div>
      <div style={{ gridColumn: isMobile ? undefined : "1 / -1" }}>
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} value={formData.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+1 268..." />
      </div>
    </div>
  );

  /* ── Tour-specific fields ── */
  const renderTourFields = () => (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tour / Service *</label>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
          {TOUR_OPTIONS.map(tour => (
            <button key={tour.value} type="button" onClick={() => set("tour", tour.value)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              border: `1px solid ${formData.tour === tour.value ? "var(--aura-teal)" : "var(--aura-glass-border)"}`,
              background: formData.tour === tour.value ? "var(--aura-teal-dim)" : "var(--aura-input-bg)",
              color: "var(--aura-text)",
              fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 500,
              textAlign: "left", transition: "all 0.2s",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>{tour.label}</span>
              <span style={{ fontFamily: "var(--aura-font-mono)", fontSize: 11, color: "var(--aura-gold)" }}>${tour.price}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Tour Date *</label>
          <DatePicker date={date} onSelect={setDate} />
        </div>
        <div>
          <label style={labelStyle}>Guests</label>
          <input style={inputStyle} type="number" min="1" max="50" value={formData.guests || "1"} onChange={e => set("guests", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Pickup Location</label>
          <input style={inputStyle} value={formData.pickup || ""} onChange={e => set("pickup", e.target.value)} placeholder="Hotel name or address" />
        </div>
      </div>
    </>
  );

  /* ── Rental-specific fields ── */
  const renderRentalFields = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Pickup Date *</label>
          <DatePicker date={date} onSelect={setDate} />
        </div>
        <div>
          <label style={labelStyle}>Return Date *</label>
          <DatePicker date={returnDate} onSelect={setReturnDate} />
        </div>
        <div>
          <label style={labelStyle}>Pickup Location</label>
          <input style={inputStyle} value={formData.pickup || ""} onChange={e => set("pickup", e.target.value)} placeholder="Airport / Hotel" />
        </div>
        <div>
          <label style={labelStyle}>Drop-off Location</label>
          <input style={inputStyle} value={formData.dropoff || ""} onChange={e => set("dropoff", e.target.value)} placeholder="Same as pickup" />
        </div>
        <div>
          <label style={labelStyle}>Daily Rate ($)</label>
          <input style={inputStyle} type="number" min="0" value={formData.daily_rate || ""} onChange={e => set("daily_rate", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Total Estimate ($)</label>
          <input style={inputStyle} type="number" min="0" value={formData.rental_total || ""} onChange={e => set("rental_total", e.target.value)} placeholder="0" />
        </div>
      </div>
    </>
  );

  /* ── Concierge-specific fields ── */
  const renderConciergeFields = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Arrival Date</label>
          <DatePicker date={date} onSelect={setDate} />
        </div>
        <div>
          <label style={labelStyle}>Departure Date</label>
          <DatePicker date={returnDate} onSelect={setReturnDate} />
        </div>
        <div>
          <label style={labelStyle}>Number of Guests</label>
          <input style={inputStyle} type="number" min="1" value={formData.guests || "1"} onChange={e => set("guests", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Flight Number</label>
          <input style={inputStyle} value={formData.flight || ""} onChange={e => set("flight", e.target.value)} placeholder="e.g. AA 2134" />
        </div>
      </div>
    </>
  );

  /* ── Custom service fields ── */
  const renderCustomFields = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Service Name *</label>
          <input style={inputStyle} value={formData.custom_service || ""} onChange={e => set("custom_service", e.target.value)} placeholder="e.g. Private Dinner Setup" />
        </div>
        <div>
          <label style={labelStyle}>Price ($) *</label>
          <input style={inputStyle} type="number" min="0" value={formData.custom_price || ""} onChange={e => set("custom_price", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <DatePicker date={date} onSelect={setDate} />
        </div>
        <div>
          <label style={labelStyle}>Guests</label>
          <input style={inputStyle} type="number" min="1" value={formData.guests || "1"} onChange={e => set("guests", e.target.value)} />
        </div>
        <div style={{ gridColumn: isMobile ? undefined : "1 / -1" }}>
          <label style={labelStyle}>Pickup / Location</label>
          <input style={inputStyle} value={formData.pickup || ""} onChange={e => set("pickup", e.target.value)} placeholder="Location details" />
        </div>
      </div>
    </>
  );

  /* ── Notes field (shared) ── */
  const renderNotesField = () => (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>Notes / Special Requests</label>
      <textarea
        value={formData.notes || ""}
        onChange={e => set("notes", e.target.value)}
        placeholder="Any additional details..."
        rows={3}
        style={{
          ...inputStyle, resize: "vertical", minHeight: 72,
        }}
      />
    </div>
  );

  const activeType = BOOKING_TYPES.find(t => t.key === bookingType);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(4,16,20,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="aura-modal-panel"
        style={{
          width: isMobile ? "96%" : 580, maxWidth: "96vw", maxHeight: "90vh", overflowY: "auto",
          background: "var(--aura-modal-bg, rgba(8,32,38,0.96))",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--aura-glass-border)",
          borderRadius: 24, padding: isMobile ? 20 : 32,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {bookingType && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                type="button"
                onClick={handleBack}
                style={{
                  background: "var(--aura-highlight)", border: "1px solid var(--aura-glass-border)",
                  borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: "var(--aura-text-secondary)",
                  transition: "all 0.15s",
                }}
              >
                <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
              </motion.button>
            )}
            <div>
              <h2 style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, fontWeight: 600, color: "var(--aura-text)", margin: 0, letterSpacing: "-0.02em" }}>
                {bookingType ? activeType?.label : "New Booking"}
              </h2>
              {!bookingType && (
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", margin: "4px 0 0" }}>
                  Choose a booking type to get started
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--aura-highlight)", border: "1px solid var(--aura-glass-border)",
            borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "var(--aura-text-secondary)",
            transition: "all 0.15s",
          }}><X size={16} /></button>
        </div>

        <AnimatePresence mode="wait">
          {!bookingType ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTypeSelection()}
            </motion.div>
          ) : (
            <motion.div
              key={bookingType}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Type badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 8, marginBottom: 18,
                background: `${activeType?.color}15`, border: `1px solid ${activeType?.color}30`,
              }}>
                {activeType && <activeType.icon size={13} style={{ color: activeType.color }} />}
                <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: activeType?.color }}>{activeType?.label}</span>
              </div>

              <form onSubmit={handleSubmit}>
                {renderContactFields()}

                {bookingType === "tour" && renderTourFields()}
                {bookingType === "rental" && renderRentalFields()}
                {bookingType === "concierge" && renderConciergeFields()}
                {bookingType === "custom" && renderCustomFields()}

                {renderNotesField()}

                <button type="submit" disabled={!canSubmit() || submitting} style={{
                  width: "100%", height: 48, borderRadius: 12, border: "none",
                  background: canSubmit() ? "linear-gradient(135deg, #2cb8a8, #48dac8)" : "var(--aura-highlight)",
                  color: canSubmit() ? "#ffffff" : "var(--aura-text-muted)",
                  fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 700,
                  cursor: canSubmit() ? "pointer" : "not-allowed", transition: "all 0.2s", letterSpacing: "0.02em",
                }}>
                  {submitting ? "Creating…" : `Create ${activeType?.label || "Booking"}`}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ── Reusable Date Picker ── */
const DatePicker = ({ date, onSelect }: { date: Date | undefined; onSelect: (d: Date | undefined) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button type="button" className={cn("aura-input")} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        color: date ? "var(--aura-text)" : "var(--aura-text-muted)", cursor: "pointer", textAlign: "left",
      }}>
        <CalIcon size={14} />
        {date ? format(date, "MMM d, yyyy") : "Select date"}
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 300 }}>
      <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className="pointer-events-auto" />
    </PopoverContent>
  </Popover>
);

export default NewBookingModal;
