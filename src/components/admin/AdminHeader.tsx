import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Search, Plus, Bell, X, Clock, Menu, Globe, User, Camera, Settings,
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
        display: "inline-flex", alignItems: "center", gap: hovered ? 8 : 0,
        background: "var(--aura-glass)", backdropFilter: "var(--aura-blur)",
        border: "1px solid var(--aura-glass-border)", borderRadius: "var(--aura-radius-btn)",
        padding: hovered ? "8px 16px 8px 10px" : "8px 10px",
        color: "var(--aura-text-dim)", cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)", whiteSpace: "nowrap", overflow: "hidden",
      }}
    >
      <Home size={16} />
      <span style={{
        fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 400,
        maxWidth: hovered ? 120 : 0, opacity: hovered ? 1 : 0,
        transition: "max-width 0.35s ease, opacity 0.25s ease", overflow: "hidden",
      }}>Back to Home</span>
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
      <button onClick={() => setOpen(!open)} style={{
        width: 36, height: 36, borderRadius: "var(--aura-radius-btn)",
        background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--aura-text-dim)", position: "relative",
        transition: "all 0.2s", minWidth: 36, minHeight: 36,
      }}>
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4, width: 8, height: 8,
            borderRadius: "50%", background: "var(--aura-danger)",
            boxShadow: "0 0 6px rgba(232,96,96,0.6)",
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
            className="aura-notification-dropdown"
            style={{
              position: isMobile ? "fixed" : "absolute",
              top: isMobile ? 60 : "calc(100% + 8px)",
              right: isMobile ? 16 : 0, left: isMobile ? 16 : "auto",
              width: isMobile ? "auto" : 320,
              background: "var(--aura-notification-bg, rgba(6,22,28,0.95))",
              backdropFilter: "var(--aura-blur)", border: "1px solid var(--aura-glass-border)",
              borderRadius: "var(--aura-radius-card)", overflow: "hidden", zIndex: 9999,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid var(--aura-glass-border)",
            }}>
              <span style={{ fontFamily: "var(--aura-font-heading)", fontSize: 18, color: "var(--aura-text)" }}>Notifications</span>
              <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-teal)",
              }}>Mark all read</button>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: "12px 16px", borderBottom: "1px solid var(--aura-border-light)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: n.read ? "transparent" : "rgba(44,184,168,0.04)", cursor: "pointer",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                    background: n.read ? "transparent" : "var(--aura-teal)",
                    boxShadow: n.read ? "none" : "0 0 6px rgba(44,184,168,0.5)",
                  }} />
                  <div>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text)", lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 10, color: "var(--aura-text-muted)", marginTop: 2 }}>{n.time}</p>
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

/* ── Profile Avatar with Dropdown ── */
interface ProfileAvatarProps {
  profilePic: string | null;
  onUpload: () => void;
  onRemove: () => void;
  onNavigateSettings?: () => void;
  size?: number;
}

const ProfileAvatar = ({ profilePic, onUpload, onRemove, onNavigateSettings, size = 36 }: ProfileAvatarProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setShowMenu(!showMenu)} style={{
        width: size, height: size, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
        overflow: "hidden", border: profilePic ? "2px solid var(--aura-teal)" : "none",
        minWidth: size, minHeight: size,
        ...(profilePic ? {} : {
          background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }),
      }}>
        {profilePic ? (
          <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "var(--aura-font-body)", fontSize: size * 0.36, fontWeight: 700, color: "#fff" }}>GA</span>
        )}
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="aura-notification-dropdown"
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 180,
              background: "var(--aura-notification-bg, rgba(6,22,28,0.95))",
              backdropFilter: "var(--aura-blur)", border: "1px solid var(--aura-glass-border)",
              borderRadius: 12, overflow: "hidden", zIndex: 9999,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
          >
            <button onClick={() => { onUpload(); setShowMenu(false); }} style={{
              width: "100%", padding: "10px 14px", background: "none", border: "none",
              borderBottom: "1px solid var(--aura-border-light)",
              fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)",
              cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
            }}>
              <Camera size={14} /> Upload Photo
            </button>
            {profilePic && (
              <button onClick={() => { onRemove(); setShowMenu(false); }} style={{
                width: "100%", padding: "10px 14px", background: "none", border: "none",
                borderBottom: "1px solid var(--aura-border-light)",
                fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-danger)",
                cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
              }}>
                <X size={14} /> Remove Photo
              </button>
            )}
            {onNavigateSettings && (
              <button onClick={() => { onNavigateSettings(); setShowMenu(false); }} style={{
                width: "100%", padding: "10px 14px", background: "none", border: "none",
                fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)",
                cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
              }}>
                <Settings size={14} /> Settings
              </button>
            )}
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
  onNavigateDashboard?: () => void;
  profilePic?: string | null;
  onProfileUpload?: () => void;
  onProfileRemove?: () => void;
}

const AdminHeader = ({
  pageTitle, onNewBooking, isMobile = false, onMenuToggle,
  onNavigateSettings, onNavigateDashboard,
  profilePic = null, onProfileUpload, onProfileRemove,
}: AdminHeaderProps) => {
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  if (isMobile) {
    return (
      <div className="aura-topbar" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={onMenuToggle} style={{
              width: 40, height: 40, borderRadius: "var(--aura-radius-btn)",
              background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--aura-text-dim)", flexShrink: 0,
            }}><Menu size={18} /></button>
            <button onClick={onNavigateDashboard} title="Dashboard" style={{
              width: 40, height: 40, borderRadius: "var(--aura-radius-btn)",
              background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--aura-text-dim)", flexShrink: 0,
            }}><Home size={16} /></button>
            <button onClick={() => navigate("/")} title="Back to Site" style={{
              width: 40, height: 40, borderRadius: "var(--aura-radius-btn)",
              background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--aura-text-dim)", flexShrink: 0,
            }}><Globe size={16} /></button>
            <h1 style={{
              fontFamily: "var(--aura-font-heading)", fontSize: 20, fontWeight: 400,
              color: "var(--aura-text)", lineHeight: 1.1, margin: 0, marginLeft: 4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{pageTitle}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotificationBell isMobile={isMobile} />
            <ProfileAvatar
              profilePic={profilePic}
              onUpload={onProfileUpload || (() => {})}
              onRemove={onProfileRemove || (() => {})}
              onNavigateSettings={onNavigateSettings}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
            <input className="aura-topbar__search" placeholder="Search..." style={{ width: "100%" }} />
          </div>
          <button onClick={onNewBooking} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))",
            border: "none", borderRadius: "var(--aura-radius-btn)",
            padding: "9px 16px", cursor: "pointer",
            fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
            color: "#0c2e32", boxShadow: "0 4px 14px rgba(184,149,106,0.35)",
            whiteSpace: "nowrap", minHeight: 44,
          }}><Plus size={14} /> New</button>
        </div>
      </div>
    );
  }

  return (
    <div className="aura-topbar" style={{ height: 64, padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <HomeButton />
        <div>
          <h1 style={{
            fontFamily: "var(--aura-font-heading)", fontSize: 32, fontWeight: 600,
            color: "var(--aura-text)", lineHeight: 1.2, margin: 0, letterSpacing: "-0.02em",
          }}>{pageTitle}</h1>
          <p style={{
            fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 400,
            color: "var(--aura-text-muted)", marginTop: 2,
          }}>{today}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onNewBooking} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))",
          border: "none", borderRadius: "var(--aura-radius-btn)",
          padding: "9px 20px", cursor: "pointer",
          fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
          color: "#0c2e32", boxShadow: "0 4px 14px rgba(184,149,106,0.35)",
          transition: "all 0.2s",
        }}><Plus size={14} /> New Booking</button>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
          <input className="aura-topbar__search" placeholder="Search..." style={{ width: 180 }} />
        </div>
        <NotificationBell isMobile={false} />
        <ProfileAvatar
          profilePic={profilePic}
          onUpload={onProfileUpload || (() => {})}
          onRemove={onProfileRemove || (() => {})}
          onNavigateSettings={onNavigateSettings}
        />
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
        full_name: formData.client_name, email: formData.email,
        phone: formData.phone || "", service_type: formData.tour || "Circumnavigation Tour",
        tour_date: date ? format(date, "yyyy-MM-dd") : formData.date,
        party_size: Number(formData.guests) || 1, status: "confirmed",
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
          width: isMobile ? "96%" : 520, maxWidth: "96vw", maxHeight: "90vh", overflowY: "auto",
          background: "var(--aura-modal-bg, rgba(8,32,38,0.96))",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--aura-glass-border)",
          borderRadius: 24, padding: isMobile ? 24 : 32,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "var(--aura-font-heading)", fontSize: 24, fontWeight: 600, color: "var(--aura-text)", margin: 0, letterSpacing: "-0.02em" }}>New Booking</h2>
          <button onClick={onClose} style={{
            background: "var(--aura-highlight)", border: "1px solid var(--aura-glass-border)",
            borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "var(--aura-text-secondary)",
            transition: "all 0.15s",
          }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label className="aura-input-label">Client Name *</label>
              <input className="aura-input" required value={formData.client_name || ""} onChange={e => set("client_name", e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="aura-input-label">Email *</label>
              <input className="aura-input" type="email" required value={formData.email || ""} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="aura-input-label">Phone</label>
            <input className="aura-input" value={formData.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+1 268..." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="aura-input-label">Tour / Service *</label>
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
                  <span style={{ fontFamily: "var(--aura-font-mono)", fontSize: 11, color: "var(--aura-gold)" }}>{tour.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label className="aura-input-label">Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className={cn("aura-input")} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    color: date ? "var(--aura-text)" : "var(--aura-text-muted)", cursor: "pointer", textAlign: "left",
                  }}>
                    <CalIcon size={14} />
                    {date ? format(date, "MMM d, yyyy") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 300 }}>
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="aura-input-label">Guests</label>
              <input className="aura-input" type="number" min="1" max="50" value={formData.guests || "1"} onChange={e => set("guests", e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={!canSubmit || submitting} style={{
            width: "100%", height: 48, borderRadius: 12, border: "none",
          background: canSubmit ? "linear-gradient(135deg, #2cb8a8, #48dac8)" : "var(--aura-highlight)",
            color: canSubmit ? "#ffffff" : "var(--aura-text-muted)",
            fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s", letterSpacing: "0.02em",
          }}>
            {submitting ? "Creating…" : "Create Booking"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export { AdminHeader, NewBookingModal };
