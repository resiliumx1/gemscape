import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

interface NavSection {
  label: string;
  items: { key: string; label: string; icon: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: "📊" }],
  },
  {
    label: "Bookings",
    items: [
      { key: "tour-bookings", label: "Tour Bookings", icon: "🗓" },
      { key: "rental-bookings", label: "Rental Bookings", icon: "🚗" },
      { key: "all-bookings", label: "All Bookings", icon: "📋" },
    ],
  },
  {
    label: "Customers",
    items: [
      { key: "customers", label: "Customer Directory", icon: "👥" },
      { key: "loyalty", label: "Loyalty & LTV", icon: "♦" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { key: "revenue", label: "Revenue Analytics", icon: "💰" },
      { key: "forecasting", label: "Forecasting", icon: "📈" },
    ],
  },
  {
    label: "Operations",
    items: [
      { key: "reviews", label: "Review Requests", icon: "🌟" },
      { key: "fleet", label: "Fleet Manager", icon: "🚙" },
      { key: "calendar", label: "Calendar View", icon: "📅" },
    ],
  },
  {
    label: "Communications",
    items: [
      { key: "email-history", label: "Email History", icon: "✉️" },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "settings", label: "Business Settings", icon: "⚙️" },
    ],
  },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close panels handled by child components
      }
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
      case "dashboard": return <AdminDashboard />;
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
      default: return <AdminDashboard />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="p-6">
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 22,
              color: "white",
              lineHeight: 1,
            }}>Gemscape</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>Admin</p>
          </div>

          <nav className="flex-1 px-3 mt-2" style={{ overflowY: "auto" }}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-4">
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 9,
                  fontWeight: 500,
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
                    <span className="mr-3" style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="px-3 pb-6">
            <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", margin: "8px 0 16px" }} />
            <button onClick={() => navigate("/")} className="admin-nav-item" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span className="mr-3">↩</span>
              Back to Site
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <Suspense fallback={<div className="admin-loading">Loading…</div>}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </>
  );
};

export default Admin;
