import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Map, Car, CalendarDays, Users, TrendingUp,
  BarChart2, LineChart, Star, ArrowLeft, Settings, Mail, Truck,
  Calendar, Search, Plus, Download
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
            <div className="flex items-center gap-3">
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#1a8a9e", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 9L12 16L22 9L12 2Z" fill="white" opacity="0.9" />
                  <path d="M2 17L12 24L22 17" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
                  <path d="M2 13L12 20L22 13" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "white", lineHeight: 1 }}>
                  Gemscape
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  Admin Portal
                </p>
              </div>
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
    </>
  );
};

export default Admin;
