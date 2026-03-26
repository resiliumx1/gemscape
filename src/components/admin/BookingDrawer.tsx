import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Map, Car, X, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = ["pending", "confirmed", "active", "completed"] as const;
const STAGE_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
};

interface BookingDrawerProps {
  booking: any;
  type: "tour" | "rental";
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

const BookingDrawer = ({ booking, type, onClose, onStatusChange }: BookingDrawerProps) => {
  const [updating, setUpdating] = useState<string | null>(null);

  const b = booking;
  const initials = (b.full_name || "")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentStage = STAGES.indexOf(b.status as any);

  const handleAction = async (status: string) => {
    setUpdating(status);
    const table = type === "tour" ? "bookings" : "rental_bookings";
    await supabase.from(table).update({ status }).eq("id", b.id);
    onStatusChange(b.id, status);
    setUpdating(null);
  };

  const handleSendEmail = async () => {
    setUpdating("email");
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/send-booking-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "confirmation",
          bookingId: b.id,
          email: b.email,
          name: b.full_name,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    setUpdating(null);
  };

  return (
    <div className="admin-detail-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="admin-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="admin-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                {b.full_name}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8" }}>
                {b.booking_ref}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <X size={18} />
          </button>
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, padding: "12px 0", borderTop: "0.5px solid #f1f5f9", borderBottom: "0.5px solid #f1f5f9" }}>
          <div className="flex items-center gap-2">
            <Mail size={13} style={{ color: "#94a3b8" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#475569" }}>{b.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={13} style={{ color: "#94a3b8" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#475569" }}>{b.phone}</span>
          </div>
        </div>

        {/* Booking details */}
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2 mb-3">
            {type === "tour" ? <Map size={14} style={{ color: "#1a8a9e" }} /> : <Car size={14} style={{ color: "#1a8a9e" }} />}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
              {type === "tour" ? b.service_type : (b.vehicles?.name || "Vehicle Rental")}
            </span>
          </div>

          <div className="admin-detail-grid">
            {type === "tour" ? (
              <>
                <DetailRow label="Tour Date" value={b.tour_date ? format(new Date(b.tour_date), "MMM d, yyyy") : "—"} />
                <DetailRow label="Party Size" value={`${b.adults || 0} adults, ${b.children || 0} children`} />
                <DetailRow label="Pickup" value={b.pickup_location || "—"} />
                <DetailRow label="Country" value={b.country || "—"} />
                <DetailRow label="Flight" value={b.flight_details || "—"} />
              </>
            ) : (
              <>
                <DetailRow label="Dates" value={`${format(new Date(b.pickup_date), "MMM d")} – ${format(new Date(b.return_date), "MMM d, yyyy")}`} />
                <DetailRow label="Pickup" value={b.pickup_location} />
                <DetailRow label="Return" value={b.dropoff_location} />
                <DetailRow label="Days" value={String(b.total_days || 0)} />
                <DetailRow label="Daily Rate" value={`$${b.daily_rate || 0}`} />
                <DetailRow label="License" value={`${b.driver_license} (${b.license_country})`} />
              </>
            )}
            <DetailRow label="Add-ons" value={(b.add_ons || []).join(", ") || "None"} />
            {b.special_requests && <DetailRow label="Requests" value={b.special_requests} />}
          </div>
        </div>

        {/* Total */}
        <div style={{ padding: "16px 0", borderTop: "0.5px solid #f1f5f9", borderBottom: "0.5px solid #f1f5f9", marginBottom: 24 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 4 }}>Total Amount</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#0f172a" }}>${b.total_estimate || 0}</p>
        </div>

        {/* Status Timeline */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 12 }}>Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STAGES.map((stage, i) => {
              const isActive = b.status === stage;
              const isPast = currentStage >= 0 && i <= currentStage;
              const isCancelled = b.status === "cancelled";
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: isCancelled ? "#fef2f2" : isPast ? "#1a8a9e" : "#f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isPast && !isCancelled && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" /></svg>
                    )}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: isPast && currentStage > i ? "#1a8a9e" : "#f1f5f9" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {STAGES.map((stage) => (
              <span key={stage} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: b.status === stage ? "#1a8a9e" : "#94a3b8", fontWeight: b.status === stage ? 600 : 400, textAlign: "center", flex: 1 }}>
                {STAGE_LABELS[stage]}
              </span>
            ))}
          </div>
          {b.status === "cancelled" && (
            <div style={{ marginTop: 8, padding: "6px 12px", background: "#fef2f2", display: "inline-block" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: "#991b1b" }}>Cancelled</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {b.status === "pending" && (
            <button onClick={() => handleAction("confirmed")} disabled={!!updating} className="admin-btn-teal" style={{ width: "100%", justifyContent: "center" }}>
              {updating === "confirmed" ? "Confirming…" : "Confirm Booking"}
            </button>
          )}
          {(b.status === "pending" || b.status === "confirmed") && (
            <button onClick={handleSendEmail} disabled={!!updating} className="admin-btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              {updating === "email" ? "Sending…" : "Send Confirmation Email"}
            </button>
          )}
          {b.status === "confirmed" && (
            <button onClick={() => handleAction("active")} disabled={!!updating} className="admin-btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              {updating === "active" ? "Updating…" : "Mark as Active"}
            </button>
          )}
          {(b.status === "active" || b.status === "confirmed") && (
            <button onClick={() => handleAction("completed")} disabled={!!updating} className="admin-btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              {updating === "completed" ? "Updating…" : "Mark as Completed"}
            </button>
          )}
          {b.status !== "cancelled" && b.status !== "completed" && (
            <button onClick={() => handleAction("cancelled")} disabled={!!updating} style={{
              width: "100%", justifyContent: "center", background: "none",
              border: "0.5px solid #fecaca", color: "#991b1b",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12,
              padding: "10px 20px", cursor: "pointer", borderRadius: "6px",
              transition: "all 0.2s",
            }}>
              {updating === "cancelled" ? "Cancelling…" : "Cancel Booking"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="admin-detail-row">
    <span className="admin-detail-label">{label}</span>
    <span className="admin-detail-value">{value}</span>
  </div>
);

export default BookingDrawer;
