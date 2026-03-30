import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, DollarSign, TrendingUp, FileText, Briefcase,
  Star, Truck, CalendarDays, MessageSquare, Mail, Settings,
  Sun, Moon, PanelLeftClose, PanelLeft, Menu, Home,
} from "lucide-react";
import { AdminHeader, NewBookingModal } from "@/components/admin/AdminHeader";
import "@/styles/admin-aura.css";

const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminAllBookings = lazy(() => import("@/components/admin/AdminAllBookings"));
const AdminCustomerDirectory = lazy(() => import("@/components/admin/AdminCustomerDirectory"));
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

const IC = { size: 22, strokeWidth: 1.5 };

const NAV_SECTIONS: NavSection[] = [
  { label: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: <LayoutDashboard {...IC} /> }] },
  { label: "Finance", items: [
    { key: "revenue", label: "Revenue Analytics", icon: <DollarSign {...IC} /> },
    { key: "forecasting", label: "Forecasting", icon: <TrendingUp {...IC} /> },
    { key: "reports", label: "Reports", icon: <FileText {...IC} /> },
  ]},
  { label: "Operations", items: [
    { key: "all-bookings", label: "Operations", icon: <Briefcase {...IC} /> },
    { key: "reviews", label: "Review Requests", icon: <Star {...IC} /> },
    { key: "fleet", label: "Fleet Manager", icon: <Truck {...IC} /> },
    { key: "calendar", label: "Calendar", icon: <CalendarDays {...IC} /> },
  ]},
  { label: "Communications", items: [
    { key: "comms", label: "Communications", icon: <MessageSquare {...IC} /> },
    { key: "email-history", label: "Email / SMS History", icon: <Mail {...IC} /> },
  ]},
  { label: "System", items: [{ key: "settings", label: "Settings", icon: <Settings {...IC} /> }] },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard", revenue: "Revenue Analytics", forecasting: "Forecasting",
  reports: "Reports", "all-bookings": "Operations", reviews: "Review Requests",
  fleet: "Fleet Manager", calendar: "Calendar", comms: "Communications",
  "email-history": "Email / SMS History", settings: "Settings",
};

/* ── Admin Component ── */
const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);
  const [isDark, setIsDark] = useState(true);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavClick = (key: string) => {
    setActiveTab(key);
    if (isMobile) setCollapsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const triggerUpload = () => fileInputRef.current?.click();
  const removeProfilePic = () => setProfilePic(null);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} isMobile={isMobile} setNav={setActiveTab} />;
      case "revenue": return <AdminRevenue isMobile={isMobile} />;
      case "forecasting": return <AdminForecasting />;
      case "reports": return <AdminReports isMobile={isMobile} />;
      case "all-bookings": return <AdminAllBookings isMobile={isMobile} />;
      case "reviews": return <AdminReviewRequests isMobile={isMobile} />;
      case "fleet": return <AdminFleetManager isMobile={isMobile} />;
      case "calendar": return <AdminCalendar isMobile={isMobile} />;
      case "comms": return <AdminCustomerDirectory isMobile={isMobile} />;
      case "email-history": return <AdminEmailHistory isMobile={isMobile} />;
      case "settings": return <AdminSettings isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} isMobile={isMobile} profilePic={profilePic} onProfileUpload={triggerUpload} onProfileRemove={removeProfilePic} />;
      default: return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} isMobile={isMobile} setNav={setActiveTab} />;
    }
  };

  const sidebarContent = (
    <>
      <div className="aura-sidebar__brand" onClick={() => setCollapsed(!collapsed)} style={{ cursor: "pointer" }}>
        {profilePic ? (
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
            <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div className="aura-sidebar__logo">G</div>
        )}
        <span className="aura-sidebar__brand-text">Gemscape</span>
      </div>

      <nav className="aura-sidebar__nav sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && <span className="aura-sidebar__section-label">{section.label}</span>}
            {section.items.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`aura-nav-item ${activeTab === item.key ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="aura-nav-item__icon">{item.icon}</span>
                <span className="aura-sidebar__text">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="aura-sidebar__scroll-fade" />
      </nav>

      <div className="aura-sidebar__footer">
        <div className="aura-sidebar__user">
          <div className="aura-sidebar__user-avatar">GA</div>
          <div className="aura-sidebar__user-info">
            <div className="aura-sidebar__user-name">Gemscape Admin</div>
            <div className="aura-sidebar__user-role">Administrator</div>
          </div>
        </div>
        <button className="aura-theme-toggle" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span className="aura-sidebar__text">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button className="aura-theme-toggle" onClick={() => setCollapsed(!collapsed)} style={{ marginTop: 4 }}>
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          <span className="aura-sidebar__text">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Admin — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />

      <div className={`aura-admin ${isDark ? "" : "aura-light"}`} style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <div className="aura-mesh">
          <div className="aura-mesh__orb aura-mesh__orb--1" />
          <div className="aura-mesh__orb aura-mesh__orb--2" />
          <div className="aura-mesh__orb aura-mesh__orb--3" />
          <div className="aura-mesh__orb aura-mesh__orb--4" />
          <div className="aura-mesh__orb aura-mesh__orb--5" />
        </div>

        <aside className={`aura-sidebar ${collapsed ? "collapsed" : ""}`}>
          {sidebarContent}
        </aside>

        <main className="aura-main">
          <AdminHeader
            pageTitle={PAGE_TITLES[activeTab] || "Dashboard"}
            onNewBooking={() => setShowNewBooking(true)}
            isMobile={isMobile}
            onMenuToggle={() => setCollapsed(!collapsed)}
            onNavigateSettings={() => setActiveTab("settings")}
            onNavigateDashboard={() => setActiveTab("dashboard")}
            profilePic={profilePic}
            onProfileUpload={triggerUpload}
            onProfileRemove={removeProfilePic}
          />
          <div className="aura-content">
            <Suspense fallback={
              <div style={{ padding: 40, textAlign: "center", color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)", fontSize: 13 }}>Loading…</div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </main>

        {showNewBooking && <NewBookingModal onClose={() => setShowNewBooking(false)} isMobile={isMobile} />}

        {/* Mobile sidebar overlay */}
        {isMobile && !collapsed && (
          <div
            className="aura-sidebar-overlay"
            onClick={() => setCollapsed(true)}
          />
        )}
      </div>
    </>
  );
};

export default Admin;
