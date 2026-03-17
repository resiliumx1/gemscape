import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminTourBookings from "@/components/admin/AdminTourBookings";
import AdminRentalBookings from "@/components/admin/AdminRentalBookings";
import AdminReviewRequests from "@/components/admin/AdminReviewRequests";
import AdminFleetManager from "@/components/admin/AdminFleetManager";
import AdminSettings from "@/components/admin/AdminSettings";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "tour-bookings", label: "Tour Bookings", icon: "🗓" },
  { key: "rental-bookings", label: "Rental Bookings", icon: "🚗" },
  { key: "reviews", label: "Review Requests", icon: "🌟" },
  { key: "fleet", label: "Fleet Manager", icon: "🚙" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard />;
      case "tour-bookings": return <AdminTourBookings />;
      case "rental-bookings": return <AdminRentalBookings />;
      case "reviews": return <AdminReviewRequests />;
      case "fleet": return <AdminFleetManager />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
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

        <nav className="flex-1 px-3 mt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
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
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
