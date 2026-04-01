import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Map, Car, X, Phone, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = ["pending", "confirmed", "active", "completed"] as const;
const STAGE_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", active: "Active", completed: "Completed",
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
  const initials = (b.full_name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "confirmation", bookingId: b.id, email: b.email, name: b.full_name }),
      });
    } catch (e) { console.error(e); }
    setUpdating(null);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end",
      background: "rgba(4,16,20,0.6)", backdropFilter: "blur(8px)",
    }}>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "96vw", height: "100%", overflowY: "auto",
          background: "var(--aura-sidebar-bg, rgba(6,22,28,0.98))", backdropFilter: "var(--aura-blur)",
          border: "none", borderLeft: "1px solid var(--aura-glass-border)",
          padding: "28px 24px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))", fontSize: 14, fontWeight: 700, color: "#fff",
            }}>{initials}</div>
            <div>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 16, fontWeight: 600, color: "var(--aura-text)" }}>{b.full_name}</p>
              <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 12, color: "var(--aura-text-muted)" }}>{b.booking_ref || "—"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aura-text-muted)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, padding: "14px 0", borderTop: "1px solid var(--aura-glass-border)", borderBottom: "1px solid var(--aura-glass-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={13} style={{ color: "var(--aura-text-muted)" }} />
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-dim)" }}>{b.email}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Phone size={13} style={{ color: "var(--aura-text-muted)" }} />
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-dim)" }}>{b.phone}</span>
          </div>
          {b.country && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} style={{ color: "var(--aura-text-muted)" }} />
              <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-dim)" }}>{b.country}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            {type === "tour" ? <Map size={14} style={{ color: "var(--aura-teal)" }} /> : <Car size={14} style={{ color: "var(--aura-teal)" }} />}
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 500, color: "var(--aura-text)" }}>
              {type === "tour" ? b.service_type : (b.vehicles?.name || "Vehicle Rental")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {type === "tour" ? (
              <>
                <DetailRow label="Tour Date" value={b.tour_date ? format(new Date(b.tour_date), "MMM d, yyyy") : "—"} />
                <DetailRow label="Party Size" value={`${b.adults || b.party_size || 0} guests`} />
                {b.adults != null && <DetailRow label="Adults / Children" value={`${b.adults} adults, ${b.children || 0} children`} />}
                <DetailRow label="Pickup Location" value={b.pickup_location || "—"} />
                <DetailRow label="Country" value={b.country || "—"} />
                <DetailRow label="Flight Details" value={b.flight_details || "—"} />
              </>
            ) : (
              <>
                <DetailRow label="Pickup Date" value={b.pickup_date ? format(new Date(b.pickup_date), "MMM d, yyyy") : "—"} />
                <DetailRow label="Return Date" value={b.return_date ? format(new Date(b.return_date), "MMM d, yyyy") : "—"} />
                <DetailRow label="Pickup Location" value={b.pickup_location || "—"} />
                <DetailRow label="Dropoff Location" value={b.dropoff_location || "—"} />
                <DetailRow label="Total Days" value={String(b.total_days || 0)} />
                <DetailRow label="Daily Rate" value={`$${b.daily_rate || 0}`} />
                <DetailRow label="Driver License" value={b.driver_license || "—"} />
                <DetailRow label="License Country" value={b.license_country || "—"} />
              </>
            )}
            <DetailRow label="Add-ons" value={(b.add_ons || []).join(", ") || "None"} />
            {b.special_requests && <DetailRow label="Special Requests" value={b.special_requests} />}
            {b.notes && <DetailRow label="Notes" value={b.notes} />}
            <DetailRow label="Created" value={b.created_at ? format(new Date(b.created_at), "MMM d, yyyy · h:mm a") : "—"} />
          </div>
        </div>

        {/* Total */}
        <div style={{ padding: "16px 0", borderTop: "1px solid var(--aura-glass-border)", borderBottom: "1px solid var(--aura-glass-border)", marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--aura-text-muted)", marginBottom: 4 }}>Total Amount</p>
          <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 28, fontWeight: 600, color: "var(--aura-text)" }}>${b.total_estimate || 0}</p>
        </div>

        {/* Status Timeline */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--aura-text-muted)", marginBottom: 12 }}>Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STAGES.map((stage, i) => {
              const isPast = currentStage >= 0 && i <= currentStage;
              const isCancelled = b.status === "cancelled";
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: isCancelled ? "rgba(239,68,68,0.1)" : isPast ? "var(--aura-teal)" : "var(--aura-highlight)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {isPast && !isCancelled && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" /></svg>
                    )}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: isPast && currentStage > i ? "var(--aura-teal)" : "var(--aura-highlight)" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {STAGES.map(stage => (
              <span key={stage} style={{
                fontFamily: "var(--aura-font-body)", fontSize: 10, textAlign: "center", flex: 1,
                color: b.status === stage ? "var(--aura-teal)" : "var(--aura-text-muted)",
                fontWeight: b.status === stage ? 600 : 400,
              }}>{STAGE_LABELS[stage]}</span>
            ))}
          </div>
          {b.status === "cancelled" && (
            <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 6, display: "inline-block" }}>
              <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 500, color: "var(--aura-danger)" }}>Cancelled</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {b.status === "pending" && (
            <ActionBtn onClick={() => handleAction("confirmed")} disabled={!!updating} primary>
              {updating === "confirmed" ? "Confirming…" : "Confirm Booking"}
            </ActionBtn>
          )}
          {(b.status === "pending" || b.status === "confirmed") && (
            <ActionBtn onClick={handleSendEmail} disabled={!!updating}>
              {updating === "email" ? "Sending…" : "Send Confirmation Email"}
            </ActionBtn>
          )}
          {b.status === "confirmed" && (
            <ActionBtn onClick={() => handleAction("active")} disabled={!!updating}>
              {updating === "active" ? "Updating…" : "Mark as Active"}
            </ActionBtn>
          )}
          {(b.status === "active" || b.status === "confirmed") && (
            <ActionBtn onClick={() => handleAction("completed")} disabled={!!updating}>
              {updating === "completed" ? "Updating…" : "Mark as Completed"}
            </ActionBtn>
          )}
          {b.status !== "cancelled" && b.status !== "completed" && (
            <button onClick={() => handleAction("cancelled")} disabled={!!updating} style={{
              width: "100%", fontFamily: "var(--aura-font-body)", fontWeight: 500, fontSize: 12,
              padding: "10px 20px", cursor: "pointer", borderRadius: "var(--aura-radius-btn)",
              background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "var(--aura-danger)",
              transition: "all 0.2s", minHeight: 44,
            }}>
              {updating === "cancelled" ? "Cancelling…" : "Cancel Booking"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ActionBtn = ({ onClick, disabled, primary, children }: { onClick: () => void; disabled: boolean; primary?: boolean; children: React.ReactNode }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
    padding: "10px 20px", borderRadius: "var(--aura-radius-btn)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44,
    transition: "all 0.2s",
    ...(primary
      ? { background: "linear-gradient(135deg, var(--aura-teal), #1a9a8a)", color: "#fff", border: "none" }
      : { background: "transparent", color: "var(--aura-text-dim)", border: "1px solid var(--aura-glass-border)" }
    ),
  }}>{children}</button>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{
      fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600,
      color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
    }}>{label}</span>
    <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text)", lineHeight: 1.5 }}>{value}</span>
  </div>
);

export default BookingDrawer;
