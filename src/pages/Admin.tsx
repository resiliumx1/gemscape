import { useState, useEffect, lazy, Suspense } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavClick = (key: string) => {
    setActiveTab(key);
    if (isMobile) setDrawerOpen(false);
  };

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
      case "settings": return <AdminSettings isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} isMobile={isMobile} />;
      default: return <AdminDashboard onNewBooking={() => setShowNewBooking(true)} isMobile={isMobile} setNav={setActiveTab} />;
    }
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="aura-sidebar__brand" onClick={() => !isMobile && setCollapsed(!collapsed)} style={{ cursor: isMobile ? "default" : "pointer" }}>
        <div className="aura-sidebar__logo">G</div>
        <span className="aura-sidebar__brand-text">Gemscape</span>
      </div>

      {/* Nav */}
      <nav className="aura-sidebar__nav">
        {/* Mobile: Home link */}
        {isMobile && (
          <button
            onClick={() => { setDrawerOpen(false); navigate("/"); }}
            className="aura-nav-item"
          >
            <span className="aura-nav-item__icon"><Home size={18} strokeWidth={1.5} /></span>
            <span className="aura-sidebar__text">Back to Home</span>
          </button>
        )}
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <span className="aura-sidebar__section-label">{section.label}</span>
            {section.items.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
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

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            className="aura-theme-toggle"
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginTop: 4 }}
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            <span className="aura-sidebar__text">{collapsed ? "Expand" : "Collapse"}</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Admin — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className={`aura-admin ${isDark ? "" : "aura-light"} min-h-screen flex`} style={{ overflowX: "hidden" }}>
        {/* Animated mesh background */}
        <div className="aura-mesh">
          <div className="aura-mesh__orb aura-mesh__orb--1" />
          <div className="aura-mesh__orb aura-mesh__orb--2" />
          <div className="aura-mesh__orb aura-mesh__orb--3" />
          <div className="aura-mesh__orb aura-mesh__orb--4" />
          <div className="aura-mesh__orb aura-mesh__orb--5" />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <>
            <div className={`aura-sidebar-backdrop ${drawerOpen ? "visible" : ""}`} onClick={() => setDrawerOpen(false)} />
            <aside className={`aura-sidebar aura-sidebar--mobile ${drawerOpen ? "open" : ""}`} style={{ width: 260 }}>
              {sidebarContent}
            </aside>
          </>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className={`aura-sidebar ${collapsed ? "collapsed" : ""}`}>
            {sidebarContent}
          </aside>
        )}

        {/* Main */}
        <main className="aura-main">
          {/* Global Header */}
          <AdminHeader
            pageTitle={PAGE_TITLES[activeTab] || "Dashboard"}
            onNewBooking={() => setShowNewBooking(true)}
            isMobile={isMobile}
            onMenuToggle={() => setDrawerOpen(!drawerOpen)}
            onNavigateSettings={() => setActiveTab("settings")}
            onNavigateDashboard={() => setActiveTab("dashboard")}
          />

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

      {/* New Booking Glass Modal */}
      {showNewBooking && <NewBookingModal onClose={() => setShowNewBooking(false)} isMobile={isMobile} />}
    </>
  );
};

export default Admin;
