import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Map, Car, CalendarDays, Users, TrendingUp,
  BarChart2, LineChart, Star, ArrowLeft, Settings, Mail, Truck,
  Calendar, Search, Plus, Download, X
} from "lucide-react";

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

const ICON_PROPS = { size: 16, strokeWidth: 1.5 };

interface NavItem { key: string; label: string; icon: React.ReactNode }
interface NavSection { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: <LayoutDashboard {...ICON_PROPS} /> }],
  },
  {
    label: "Bookings",
    items: [
      { key: "tour-bookings", label: "Tour Bookings", icon: <Map {...ICON_PROPS} /> },
      { key: "rental-bookings", label: "Rental Bookings", icon: <Car {...ICON_PROPS} /> },
      { key: "all-bookings", label: "All Bookings", icon: <CalendarDays {...ICON_PROPS} /> },
    ],
  },
  {
    label: "Customers",
    items: [
      { key: "customers", label: "Customer Directory", icon: <Users {...ICON_PROPS} /> },
      { key: "loyalty", label: "Loyalty & LTV", icon: <TrendingUp {...ICON_PROPS} /> },
    ],
  },
  {
    label: "Revenue",
    items: [
      { key: "revenue", label: "Revenue Analytics", icon: <BarChart2 {...ICON_PROPS} /> },
      { key: "forecasting", label: "Forecasting", icon: <LineChart {...ICON_PROPS} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { key: "reviews", label: "Review Requests", icon: <Star {...ICON_PROPS} /> },
      { key: "fleet", label: "Fleet Manager", icon: <Truck {...ICON_PROPS} /> },
      { key: "calendar", label: "Calendar View", icon: <Calendar {...ICON_PROPS} /> },
    ],
  },
  {
    label: "Communications",
    items: [
      { key: "email-history", label: "Email History", icon: <Mail {...ICON_PROPS} /> },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "settings", label: "Business Settings", icon: <Settings {...ICON_PROPS} /> },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "tour-bookings": "Tour Bookings",
  "rental-bookings": "Rental Bookings",
  "all-bookings": "All Bookings",
  customers: "Customer Directory",
  loyalty: "Loyalty & LTV",
  revenue: "Revenue Analytics",
  forecasting: "Forecasting",
  reviews: "Review Requests",
  fleet: "Fleet Manager",
  calendar: "Calendar View",
  "email-history": "Email History",
  settings: "Business Settings",
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPending = async () => {
      const [tours, rentals] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("rental_bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setPendingCount((tours.count || 0) + (rentals.count || 0));
    };
    fetchPending();
  }, [activeTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setActiveTab("all-bookings");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} />;
      case "tour-bookings": return <AdminTourBookings />;
      case "rental-bookings": return <AdminRentalBookings />;
      case "all-bookings": return <AdminAllBookings />;
      case "customers": return <AdminCustomerDirectory />;
      case "loyalty": return <AdminLoyalty />;
      case "revenue": return <AdminRevenue />;
      case "forecasting": return <AdminForecasting />;
      case "reviews": return <AdminReviewRequests />;
      case "fleet": return <AdminFleetManager />;
      case "calendar": return <AdminCalendar />;
      case "email-history": return <AdminEmailHistory />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} />;
    }
  };

  // Badge keys that should show pending count
  const badgeKeys = new Set(["tour-bookings", "rental-bookings", "all-bookings"]);

  return (
    <>
      <Helmet>
        <title>Admin — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: "20px 16px 16px" }}>
            <div className="flex flex-col items-center gap-1">
              <img src="/images/gemscape-logo.png" alt="Gemscape" className="bg-transparent" style={{ height: 40, width: "auto", objectFit: "contain", background: "none", backgroundColor: "transparent", mixBlendMode: "normal" }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: ".12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginTop: 4 }}>
                Admin Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 mt-1" style={{ overflowY: "auto" }}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-3">
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10, fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.25)",
                  padding: "8px 12px 4px",
                }}>{section.label}</p>
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
                  >
                    <span className="mr-3 flex-shrink-0" style={{ display: "flex" }}>{item.icon}</span>
                    {item.label}
                    {badgeKeys.has(item.key) && pendingCount > 0 && (
                      <span className="admin-nav-badge">{pendingCount}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="px-3 pb-4">
            <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "8px 0 12px" }} />
            <button onClick={() => navigate("/")} className="admin-nav-item" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span className="mr-3 flex-shrink-0" style={{ display: "flex" }}><ArrowLeft {...ICON_PROPS} /></span>
              Back to Site
            </button>
            <div className="flex items-center gap-3 mt-3 px-3">
              <div className="admin-avatar">GA</div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Gemscape Admin</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* Topbar */}
          <div className="admin-topbar">
            <span className="admin-topbar-title">{PAGE_TITLES[activeTab] || "Dashboard"}</span>
            <div className="admin-topbar-right">
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="admin-topbar-search" placeholder="Search bookings..." style={{ paddingLeft: 30 }} />
              </div>
              <button className="admin-topbar-btn-export">
                <Download size={14} />
                Export
              </button>
              <button className="admin-topbar-btn-new" onClick={() => setShowNewBooking(true)}>
                <Plus size={14} />
                New Booking
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="admin-content">
            <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Loading…</div>}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Global New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal onClose={() => setShowNewBooking(false)} />
      )}
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
    <div className="admin-detail-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="admin-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>New Booking</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Type */}
          <div>
            <label className="admin-form-label">Booking Type</label>
            <div className="flex gap-2 mt-1">
              {(["tour", "rental"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBookingType(t)}
                  className={`admin-period-btn ${bookingType === t ? "active" : ""}`}
                  style={{ textTransform: "capitalize" }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-form-label">Guest Name *</label>
            <input className="admin-filter-input w-full" required value={formData.full_name || ""} onChange={e => set("full_name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-form-label">Email *</label>
              <input type="email" className="admin-filter-input w-full" required value={formData.email || ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label className="admin-form-label">WhatsApp</label>
              <input className="admin-filter-input w-full" value={formData.phone || ""} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          {bookingType === "tour" ? (
            <>
              <div>
                <label className="admin-form-label">Service *</label>
                <select className="admin-filter-input w-full" required value={formData.service_type || ""} onChange={e => set("service_type", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Circumnavigation Tour</option>
                  <option>Flight Concierge</option>
                  <option>Private Charter</option>
                  <option>Half-Day Tour</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-form-label">Tour Date *</label>
                  <input type="date" className="admin-filter-input w-full" required value={formData.start_date || ""} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Party Size</label>
                  <input type="number" min="1" className="admin-filter-input w-full" value={formData.party_size || ""} onChange={e => set("party_size", e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="admin-form-label">Vehicle *</label>
                <select className="admin-filter-input w-full" required value={formData.vehicle_id || ""} onChange={e => set("vehicle_id", e.target.value)}>
                  <option value="">Select…</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — ${v.daily_rate}/day</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-form-label">Pickup Date *</label>
                  <input type="date" className="admin-filter-input w-full" required value={formData.start_date || ""} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Return Date *</label>
                  <input type="date" className="admin-filter-input w-full" required value={formData.end_date || ""} onChange={e => set("end_date", e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="admin-form-label">Total Amount ($)</label>
            <input type="number" min="0" className="admin-filter-input w-full" value={formData.total_amount || ""} onChange={e => set("total_amount", e.target.value)} />
          </div>
          <div>
            <label className="admin-form-label">Special Requests</label>
            <textarea className="admin-filter-input w-full" style={{ minHeight: 64, resize: "vertical" }} value={formData.special_requests || ""} onChange={e => set("special_requests", e.target.value)} />
          </div>

          <div className="pt-3">
            <button type="submit" disabled={submitting} className="admin-btn-primary w-full">
              {submitting ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Admin;
