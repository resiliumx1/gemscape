import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, DollarSign, TrendingUp, FileText, Briefcase,
  Star, Truck, CalendarDays, MessageSquare, Mail, Settings,
  Search, Plus, Download, X, Sun, Moon, PanelLeftClose, PanelLeft,
  ArrowLeft,
} from "lucide-react";
import "@/styles/admin-aura.css";

const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminTourBookings = lazy(() => import("@/components/admin/AdminTourBookings"));
const AdminRentalBookings = lazy(() => import("@/components/admin/AdminRentalBookings"));
const AdminAllBookings = lazy(() => import("@/components/admin/AdminAllBookings"));
const AdminCustomerDirectory = lazy(() => import("@/components/admin/AdminCustomerDirectory"));
const AdminLoyalty = lazy(() => import("@/components/admin/AdminLoyalty"));
const AdminRevenue = lazy(() => import("@/components/admin/AdminRevenue"));
const AdminForecasting = lazy(() => import("@/components/admin/AdminForecasting"));
const AdminReviewRequests = lazy(() => import("@/components/admin/AdminReviewRequests"));
const AdminFleetManager = lazy(() => import("@/components/admin/AdminFleetManager"));
const AdminCalendar = lazy(() => import("@/components/admin/AdminCalendar"));
const AdminEmailHistory = lazy(() => import("@/components/admin/AdminEmailHistory"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminReports = lazy(() => import("@/components/admin/AdminReports"));

/* ── Nav config ── */
interface NavItem { key: string; label: string; icon: React.ReactNode }
interface NavSection { label: string; items: NavItem[] }

const IC = { size: 18, strokeWidth: 1.5 };

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: <LayoutDashboard {...IC} /> }],
  },
  {
    label: "Finance",
    items: [
      { key: "revenue", label: "Revenue Analytics", icon: <DollarSign {...IC} /> },
      { key: "forecasting", label: "Forecasting", icon: <TrendingUp {...IC} /> },
      { key: "reports", label: "Reports", icon: <FileText {...IC} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { key: "all-bookings", label: "Operations", icon: <Briefcase {...IC} /> },
      { key: "reviews", label: "Review Requests", icon: <Star {...IC} /> },
      { key: "fleet", label: "Fleet Manager", icon: <Truck {...IC} /> },
      { key: "calendar", label: "Calendar", icon: <CalendarDays {...IC} /> },
    ],
  },
  {
    label: "Communications",
    items: [
      { key: "comms", label: "Communications", icon: <MessageSquare {...IC} /> },
      { key: "email-history", label: "Email / SMS History", icon: <Mail {...IC} /> },
    ],
  },
  {
    label: "System",
    items: [
      { key: "settings", label: "Settings", icon: <Settings {...IC} /> },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  revenue: "Revenue Analytics",
  forecasting: "Forecasting",
  reports: "Reports",
  "all-bookings": "Operations",
  reviews: "Review Requests",
  fleet: "Fleet Manager",
  calendar: "Calendar",
  comms: "Communications",
  "email-history": "Email / SMS History",
  settings: "Settings",
};

/* ── Admin Component ── */
const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} />;
      case "revenue": return <AdminRevenue />;
      case "forecasting": return <AdminForecasting />;
      case "reports": return <AdminReports />;
      case "all-bookings": return <AdminAllBookings />;
      case "reviews": return <AdminReviewRequests />;
      case "fleet": return <AdminFleetManager />;
      case "calendar": return <AdminCalendar />;
      case "comms": return <AdminCustomerDirectory />;
      case "email-history": return <AdminEmailHistory />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className={`aura-admin ${isDark ? "" : "aura-light"} min-h-screen flex`}>
        {/* Animated mesh background */}
        <div className="aura-mesh">
          <div className="aura-mesh__orb aura-mesh__orb--1" />
          <div className="aura-mesh__orb aura-mesh__orb--2" />
          <div className="aura-mesh__orb aura-mesh__orb--3" />
          <div className="aura-mesh__orb aura-mesh__orb--4" />
          <div className="aura-mesh__orb aura-mesh__orb--5" />
        </div>

        {/* Sidebar */}
        <aside className={`aura-sidebar ${collapsed ? "collapsed" : ""}`}>
          {/* Brand */}
          <div className="aura-sidebar__brand">
            <div className="aura-sidebar__logo">G</div>
            <span className="aura-sidebar__brand-text">Gemscape</span>
          </div>

          {/* Nav */}
          <nav className="aura-sidebar__nav">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <span className="aura-sidebar__section-label">{section.label}</span>
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`aura-nav-item ${activeTab === item.key ? "active" : ""}`}
                  >
                    <span className="aura-nav-item__icon">{item.icon}</span>
                    <span className="aura-sidebar__text">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="aura-sidebar__footer">
            <button onClick={() => navigate("/")} className="aura-nav-item" style={{ marginBottom: 8 }}>
              <span className="aura-nav-item__icon"><ArrowLeft {...IC} /></span>
              <span className="aura-sidebar__text">Back to Site</span>
            </button>

            <div className="aura-sidebar__user">
              <div className="aura-sidebar__user-avatar">GA</div>
              <div className="aura-sidebar__user-info">
                <div className="aura-sidebar__user-name">Gemscape Admin</div>
                <div className="aura-sidebar__user-role">Administrator</div>
              </div>
            </div>

            {/* Theme toggle */}
            <button className="aura-theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="aura-sidebar__text">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Collapse toggle */}
            <button
              className="aura-theme-toggle"
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginTop: 4 }}
            >
              {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
              <span className="aura-sidebar__text">{collapsed ? "Expand" : "Collapse"}</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="aura-main">
          {/* Topbar */}
          <div className="aura-topbar">
            <span className="aura-topbar__title">{PAGE_TITLES[activeTab] || "Dashboard"}</span>
            <div className="aura-topbar__actions">
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--aura-text-muted)" }} />
                <input className="aura-topbar__search" placeholder="Search bookings..." />
              </div>
              <button className="aura-btn aura-btn--ghost">
                <Download size={14} />
                Export
              </button>
              <button className="aura-btn aura-btn--primary" onClick={() => setShowNewBooking(true)}>
                <Plus size={14} />
                New Booking
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="aura-content">
            <Suspense fallback={
              <div style={{ padding: 40, textAlign: "center", color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)", fontSize: 13 }}>
                Loading…
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* New Booking Modal */}
      {showNewBooking && <NewBookingModal onClose={() => setShowNewBooking(false)} />}
    </>
  );
};

/* ── New Booking Modal ── */
const NewBookingModal = ({ onClose }: { onClose: () => void }) => {
  const [bookingType, setBookingType] = useState<"tour" | "rental">("tour");
  const [vehicles, setVehicles] = useState<{ id: string; name: string; daily_rate: number }[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("vehicles").select("id, name, daily_rate").then(r => setVehicles(r.data || []));
  }, []);

  const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (bookingType === "tour") {
        const { error } = await supabase.from("bookings").insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || "",
          service_type: formData.service_type || "Circumnavigation Tour",
          tour_date: formData.start_date,
          party_size: Number(formData.party_size) || 1,
          total_estimate: Number(formData.total_amount) || null,
          special_requests: formData.special_requests || null,
          status: "confirmed",
        });
        if (error) throw error;
      } else {
        const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
        const { error } = await supabase.from("rental_bookings").insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || "",
          vehicle_id: formData.vehicle_id || null,
          pickup_date: formData.start_date,
          return_date: formData.end_date || formData.start_date,
          pickup_location: "Hotel",
          dropoff_location: "Hotel",
          driver_license: "N/A",
          license_country: "N/A",
          daily_rate: vehicle?.daily_rate || null,
          total_estimate: Number(formData.total_amount) || null,
          status: "confirmed",
        });
        if (error) throw error;
      }
      toast.success("Booking created successfully.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aura-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="aura-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="aura-heading aura-h2">New Booking</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--aura-text-muted)" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="aura-input-label">Booking Type</label>
            <div className="flex gap-2 mt-1">
              {(["tour", "rental"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBookingType(t)}
                  className={`aura-period-btn ${bookingType === t ? "active" : ""}`}
                  style={{ textTransform: "capitalize" }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="aura-input-label">Guest Name *</label>
            <input className="aura-input" required value={formData.full_name || ""} onChange={e => set("full_name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="aura-input-label">Email *</label>
              <input type="email" className="aura-input" required value={formData.email || ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label className="aura-input-label">WhatsApp</label>
              <input className="aura-input" value={formData.phone || ""} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          {bookingType === "tour" ? (
            <>
              <div>
                <label className="aura-input-label">Service *</label>
                <select className="aura-input" required value={formData.service_type || ""} onChange={e => set("service_type", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Circumnavigation Tour</option>
                  <option>Flight Concierge</option>
                  <option>Private Charter</option>
                  <option>Half-Day Tour</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="aura-input-label">Tour Date *</label>
                  <input type="date" className="aura-input" required value={formData.start_date || ""} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="aura-input-label">Party Size</label>
                  <input type="number" min="1" className="aura-input" value={formData.party_size || ""} onChange={e => set("party_size", e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="aura-input-label">Vehicle *</label>
                <select className="aura-input" required value={formData.vehicle_id || ""} onChange={e => set("vehicle_id", e.target.value)}>
                  <option value="">Select…</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — ${v.daily_rate}/day</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="aura-input-label">Pickup Date *</label>
                  <input type="date" className="aura-input" required value={formData.start_date || ""} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="aura-input-label">Return Date *</label>
                  <input type="date" className="aura-input" required value={formData.end_date || ""} onChange={e => set("end_date", e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="aura-input-label">Total Amount ($)</label>
            <input type="number" min="0" className="aura-input" value={formData.total_amount || ""} onChange={e => set("total_amount", e.target.value)} />
          </div>
          <div>
            <label className="aura-input-label">Special Requests</label>
            <textarea className="aura-input" style={{ minHeight: 64, resize: "vertical" }} value={formData.special_requests || ""} onChange={e => set("special_requests", e.target.value)} />
          </div>

          <div className="pt-3">
            <button type="submit" disabled={submitting} className="aura-btn aura-btn--primary w-full" style={{ padding: "12px 28px", justifyContent: "center" }}>
              {submitting ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Admin;
