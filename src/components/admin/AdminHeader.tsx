import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Search, Plus, Bell, X, Clock, Menu, Globe,
  CalendarDays as CalIcon, Users, Phone,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ── Expandable Home Button ── */
const HomeButton = () => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="aura-header-home"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: hovered ? 8 : 0,
        background: "var(--aura-glass)",
        backdropFilter: "var(--aura-blur)",
        border: "1px solid var(--aura-glass-border)",
        borderRadius: "var(--aura-radius-btn)",
        padding: hovered ? "8px 16px 8px 10px" : "8px 10px",
        color: "var(--aura-text-dim)",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <Home size={16} />
      <span
        style={{
          fontFamily: "var(--aura-font-body)",
          fontSize: 12,
          fontWeight: 400,
          maxWidth: hovered ? 120 : 0,
          opacity: hovered ? 1 : 0,
          transition: "max-width 0.35s ease, opacity 0.25s ease",
          overflow: "hidden",
        }}
      >
        Back to Home
      </span>
    </button>
  );
};

/* ── Notification Bell ── */
const MOCK_NOTIFICATIONS = [
  { id: "1", text: "New booking from Sarah Johnson", time: "2 min ago", read: false },
  { id: "2", text: "Payment received — $420", time: "15 min ago", read: false },
  { id: "3", text: "Review request sent to Marcus", time: "1 hr ago", read: true },
  { id: "4", text: "Fleet maintenance due: Suzuki Jimny", time: "3 hrs ago", read: true },
];

const NotificationBell = ({ isMobile }: { isMobile: boolean }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: "var(--aura-radius-btn)",
          background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--aura-text-dim)", position: "relative",
          transition: "all 0.2s", minWidth: 36, minHeight: 36,
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4, width: 8, height: 8,
            borderRadius: "50%", background: "#f06868",
            boxShadow: "0 0 6px rgba(240,104,104,0.6)",
          }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: isMobile ? "fixed" : "absolute",
              top: isMobile ? 60 : "calc(100% + 8px)",
              right: isMobile ? 16 : 0,
              left: isMobile ? 16 : "auto",
              width: isMobile ? "auto" : 320,
              background: "var(--aura-sidebar-bg)",
              backdropFilter: "var(--aura-blur)", border: "1px solid var(--aura-glass-border)",
              borderRadius: "var(--aura-radius-card)", overflow: "hidden", zIndex: 9999,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid var(--aura-glass-border)",
            }}>
              <span style={{ fontFamily: "var(--aura-font-heading)", fontSize: 18, color: "var(--aura-text)" }}>
                Notifications
              </span>
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-teal)",
                }}
              >
                Mark all read
              </button>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: n.read ? "transparent" : "rgba(60,200,184,0.04)",
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                    background: n.read ? "transparent" : "var(--aura-teal)",
                    boxShadow: n.read ? "none" : "0 0 6px rgba(60,200,184,0.5)",
                  }} />
                  <div>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text)", lineHeight: 1.4 }}>
                      {n.text}
                    </p>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 10, color: "var(--aura-text-muted)", marginTop: 2 }}>
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Admin Header Bar ── */
interface AdminHeaderProps {
  pageTitle: string;
  onNewBooking: () => void;
  isMobile?: boolean;
  onMenuToggle?: () => void;
  onNavigateSettings?: () => void;
}

const AdminHeader = ({ pageTitle, onNewBooking, isMobile = false, onMenuToggle, onNavigateSettings }: AdminHeaderProps) => {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  if (isMobile) {
    return (
      <div className="aura-topbar" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, padding: "10px 12px" }}>
        {/* Row 1: Hamburger + Title + Bell + Avatar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onMenuToggle} style={{
              width: 44, height: 44, borderRadius: "var(--aura-radius-btn)",
              background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--aura-text-dim)",
            }}>
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{
                fontFamily: "var(--aura-font-heading)", fontSize: 22, fontWeight: 400,
                color: "var(--aura-text)", lineHeight: 1.1, margin: 0,
              }}>
                {pageTitle}
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotificationBell isMobile={isMobile} />
            <div onClick={onNavigateSettings} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 700,
              color: "#fff", cursor: "pointer", flexShrink: 0, minWidth: 36, minHeight: 36,
            }}>
              GA
            </div>
          </div>
        </div>
        {/* Row 2: Search + New Booking */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "var(--aura-text-muted)",
            }} />
            <input
              className="aura-topbar__search"
              placeholder="Search..."
              style={{ width: "100%" }}
            />
          </div>
          <button
            onClick={onNewBooking}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, var(--aura-gold), #c49830)",
              border: "none", borderRadius: "var(--aura-radius-btn)",
              padding: "9px 16px", cursor: "pointer",
              fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
              color: "#fff", boxShadow: "0 4px 14px rgba(212,170,68,0.35)",
              whiteSpace: "nowrap", minHeight: 44,
            }}
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aura-topbar" style={{ height: 64, padding: "0 24px" }}>
      {/* Left: Home + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <HomeButton />
        <div>
          <h1 style={{
            fontFamily: "var(--aura-font-heading)", fontSize: 27, fontWeight: 400,
            color: "var(--aura-text)", lineHeight: 1.1, margin: 0,
          }}>
            {pageTitle}
          </h1>
          <p style={{
            fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 400,
            color: "var(--aura-text-muted)", marginTop: 2,
          }}>
            {today}
          </p>
        </div>
      </div>

      {/* Right: New Booking, Search, Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onNewBooking}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, var(--aura-gold), #c49830)",
            border: "none", borderRadius: "var(--aura-radius-btn)",
            padding: "9px 20px", cursor: "pointer",
            fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
            color: "#fff", boxShadow: "0 4px 14px rgba(212,170,68,0.35)",
            transition: "all 0.2s",
          }}
        >
          <Plus size={14} />
          New Booking
        </button>

        <div style={{ position: "relative" }}>
          <Search size={14} style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "var(--aura-text-muted)",
          }} />
          <input
            className="aura-topbar__search"
            placeholder="Search..."
            style={{ width: 180 }}
          />
        </div>

        <NotificationBell isMobile={false} />

        {/* Avatar */}
        <div
          onClick={onNavigateSettings}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 700,
            color: "#fff", cursor: "pointer", flexShrink: 0,
          }}
        >
          GA
        </div>
      </div>
    </div>
  );
};

/* ── New Booking Glass Modal ── */
interface NewBookingModalProps {
  onClose: () => void;
  isMobile?: boolean;
}

const TOUR_OPTIONS = [
  { value: "Circumnavigation Tour", label: "Circumnavigation Tour", price: "$350" },
  { value: "Half-Day Tour", label: "Half-Day Tour", price: "$180" },
  { value: "Private Charter", label: "Private Charter", price: "$600" },
  { value: "Flight Concierge", label: "Flight Concierge", price: "$120" },
];

const NewBookingModal = ({ onClose, isMobile = false }: NewBookingModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const canSubmit = formData.client_name && formData.tour && date;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        full_name: formData.client_name,
        email: formData.email,
        phone: formData.phone || "",
        service_type: formData.tour || "Circumnavigation Tour",
        tour_date: date ? format(date, "yyyy-MM-dd") : formData.date,
        party_size: Number(formData.guests) || 1,
        status: "confirmed",
      });
      if (error) throw error;
      toast.success("Booking created successfully.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(6,14,26,0.5)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? "96%" : 520,
          maxWidth: "96vw", maxHeight: "90vh", overflowY: "auto",
          background: "var(--aura-sidebar-bg)",
          backdropFilter: "var(--aura-blur)", WebkitBackdropFilter: "var(--aura-blur)",
          border: "1px solid var(--aura-glass-border)",
          borderRadius: isMobile ? 14 : "var(--aura-radius-card)", padding: isMobile ? 20 : 28,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, color: "var(--aura-text)", margin: 0 }}>
            New Booking
          </h2>
          <button onClick={onClose} style={{
            background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
            borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "var(--aura-text-muted)",
          }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Client Name + Email */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="aura-input-label">Client Name *</label>
              <input className="aura-input" required value={formData.client_name || ""} onChange={e => set("client_name", e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="aura-input-label">Email *</label>
              <input type="email" className="aura-input" required value={formData.email || ""} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 14 }}>
            <label className="aura-input-label">Phone</label>
            <div style={{ position: "relative" }}>
              <Phone size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
              <input className="aura-input" style={{ paddingLeft: 34 }} value={formData.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+1 (268) 000-0000" />
            </div>
          </div>

          {/* Tour Select */}
          <div style={{ marginBottom: 14 }}>
            <label className="aura-input-label">Tour *</label>
            <select className="aura-input" required value={formData.tour || ""} onChange={e => set("tour", e.target.value)}>
              <option value="">Select a tour…</option>
              {TOUR_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label} — {t.price}</option>
              ))}
            </select>
          </div>

          {/* Date + Time + Guests */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="aura-input-label">Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="aura-input"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      textAlign: "left", color: date ? "var(--aura-text)" : "var(--aura-text-muted)",
                      minHeight: 44,
                    }}
                  >
                    <CalIcon size={14} />
                    {date ? format(date, "MMM d, yyyy") : "Pick date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 300 }}>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="aura-input-label">Time</label>
              <div style={{ position: "relative" }}>
                <Clock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
                <input type="time" className="aura-input" style={{ paddingLeft: 34, minHeight: 44 }} value={formData.time || ""} onChange={e => set("time", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="aura-input-label">Guests</label>
              <div style={{ position: "relative" }}>
                <Users size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
                <input type="number" min="1" className="aura-input" style={{ paddingLeft: 34, minHeight: 44 }} value={formData.guests || ""} onChange={e => set("guests", e.target.value)} placeholder="1" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 24px", borderRadius: "var(--aura-radius-btn)",
                background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
                color: "var(--aura-text-dim)", fontFamily: "var(--aura-font-body)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", minHeight: 44,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              style={{
                padding: "10px 28px", borderRadius: "var(--aura-radius-btn)",
                background: "linear-gradient(135deg, var(--aura-gold), #c49830)",
                border: "none", color: "#fff",
                fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
                cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
                opacity: submitting || !canSubmit ? 0.5 : 1,
                boxShadow: "0 4px 14px rgba(212,170,68,0.35)",
                transition: "all 0.2s", minHeight: 44,
              }}
            >
              {submitting ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export { AdminHeader, NewBookingModal };
