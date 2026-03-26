import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, startOfWeek, startOfYear, startOfQuarter, subMonths, subWeeks, subQuarters, subYears, eachDayOfInterval, eachMonthOfInterval, formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Map, Car, CalendarDays, Plus, Send, Truck, Calendar } from "lucide-react";

type Period = "today" | "week" | "month" | "quarter" | "year";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

type BookingFilter = "all" | "rentals" | "tours" | "concierge";

interface AdminDashboardProps {
  onNewBooking?: () => void;
}

const AdminDashboard = ({ onNewBooking }: AdminDashboardProps) => {
  const { format: formatPrice } = useCurrency();
  const [period, setPeriod] = useState<Period>("month");
  const [tourBookings, setTourBookings] = useState<any[]>([]);
  const [rentalBookings, setRentalBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showNewRental, setShowNewRental] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTourBookings(r.data || [])),
      supabase.from("rental_bookings").select("*, vehicles(name)").then(r => setRentalBookings(r.data || [])),
      supabase.from("vehicles").select("*").then(r => setVehicles(r.data || [])),
    ]);

    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        setTourBookings(prev => [payload.new as any, ...prev]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rental_bookings" }, (payload) => {
        setRentalBookings(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Date range logic
  const getDateRange = (p: Period) => {
    const now = new Date();
    const starts: Record<Period, Date> = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      week: startOfWeek(now, { weekStartsOn: 1 }),
      month: startOfMonth(now),
      quarter: startOfQuarter(now),
      year: startOfYear(now),
    };
    const prevStarts: Record<Period, Date> = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      week: subWeeks(starts.week, 1),
      month: subMonths(starts.month, 1),
      quarter: subQuarters(starts.quarter, 1),
      year: subYears(starts.year, 1),
    };
    return { start: starts[p], prevStart: prevStarts[p], prevEnd: starts[p] };
  };

  const { start, prevStart, prevEnd } = getDateRange(period);
  const startStr = start.toISOString();
  const prevStartStr = prevStart.toISOString();
  const prevEndStr = prevEnd.toISOString();

  const periodTours = tourBookings.filter(b => b.created_at >= startStr && b.status !== "cancelled");
  const periodRentals = rentalBookings.filter(b => b.created_at >= startStr && b.status !== "cancelled");
  const prevTours = tourBookings.filter(b => b.created_at >= prevStartStr && b.created_at < prevEndStr && b.status !== "cancelled");
  const prevRentals = rentalBookings.filter(b => b.created_at >= prevStartStr && b.created_at < prevEndStr && b.status !== "cancelled");

  const tourRevenue = periodTours.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const rentalRevenue = periodRentals.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const totalRevenue = tourRevenue + rentalRevenue;
  const prevRevenue = [...prevTours, ...prevRentals].reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const revTrend = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0;

  const activeBookings = [...tourBookings, ...rentalBookings].filter(b => b.status === "confirmed" || b.status === "active").length;
  const pendingBookings = [...tourBookings, ...rentalBookings].filter(b => b.status === "pending").length;

  const today = format(new Date(), "yyyy-MM-dd");
  const activeRentals = rentalBookings.filter(r => r.pickup_date <= today && r.return_date >= today).length;
  const fleetUtil = vehicles.length > 0 ? Math.round((activeRentals / vehicles.length) * 100) : 0;

  // Chart data
  const chartData = useMemo(() => {
    if (period === "year") {
      return eachMonthOfInterval({ start, end: new Date() }).map(month => {
        const monthStr = format(month, "yyyy-MM");
        const tRev = tourBookings.filter(b => b.created_at?.startsWith(monthStr) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
        const rRev = rentalBookings.filter(b => b.created_at?.startsWith(monthStr) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
        return { name: format(month, "MMM"), tours: tRev, rentals: rRev };
      });
    }
    const days = eachDayOfInterval({ start, end: new Date() });
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const tRev = tourBookings.filter(b => b.created_at?.startsWith(dayStr) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
      const rRev = rentalBookings.filter(b => b.created_at?.startsWith(dayStr) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
      return { name: format(day, "d"), tours: tRev, rentals: rRev };
    });
  }, [tourBookings, rentalBookings, period, start]);

  // Pipeline counts
  const pipeline = useMemo(() => {
    const all = [...tourBookings, ...rentalBookings];
    const counts = { enquiry: 0, pending: 0, confirmed: 0, active: 0, completed: 0 };
    all.forEach(b => {
      const s = b.status || "pending";
      if (s === "enquiry") counts.enquiry++;
      else if (s === "pending") counts.pending++;
      else if (s === "confirmed") counts.confirmed++;
      else if (s === "active") counts.active++;
      else if (s === "completed") counts.completed++;
    });
    return counts;
  }, [tourBookings, rentalBookings]);

  const pipelineMax = Math.max(1, ...Object.values(pipeline));

  // Recent bookings for table
  const recentBookings = useMemo(() => {
    const combined = [
      ...tourBookings.map(b => ({ ...b, _type: "tour" as const, _date: b.tour_date })),
      ...rentalBookings.map(b => ({ ...b, _type: "rental" as const, _date: b.pickup_date })),
    ];
    let filtered = combined;
    if (filter === "tours") filtered = combined.filter(b => b._type === "tour" && b.service_type !== "Flight Concierge");
    if (filter === "rentals") filtered = combined.filter(b => b._type === "rental");
    if (filter === "concierge") filtered = combined.filter(b => b.service_type === "Flight Concierge");
    return filtered.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 10);
  }, [tourBookings, rentalBookings, filter]);

  // Live activity
  const liveActivity = useMemo(() => {
    const all = [
      ...tourBookings.map(b => ({ name: b.full_name, type: "tour", status: b.status, date: b.created_at, service: b.service_type })),
      ...rentalBookings.map(b => ({ name: b.full_name, type: "rental", status: b.status, date: b.created_at, service: b.vehicles?.name || "Rental" })),
    ].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);
    return all;
  }, [tourBookings, rentalBookings]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  };

  // New booking/rental handlers
  const handleNewBooking = async (formData: any) => {
    const { error } = await supabase.from("bookings").insert({
      full_name: formData.full_name, email: formData.email, phone: formData.phone,
      service_type: formData.service_type, tour_date: formData.tour_date,
      party_size: Number(formData.party_size) || 1,
      special_requests: formData.special_requests || null,
      total_estimate: Number(formData.total_estimate) || null,
    });
    if (!error) {
      setShowNewBooking(false);
      const { data } = await supabase.from("bookings").select("*");
      setTourBookings(data || []);
    }
  };

  const handleNewRental = async (formData: any) => {
    const { error } = await supabase.from("rental_bookings").insert({
      full_name: formData.full_name, email: formData.email, phone: formData.phone,
      vehicle_id: formData.vehicle_id || null, pickup_date: formData.pickup_date,
      return_date: formData.return_date, pickup_location: formData.pickup_location || "Hotel",
      dropoff_location: formData.dropoff_location || "Hotel",
      driver_license: formData.driver_license || "N/A",
      license_country: formData.license_country || "N/A",
      daily_rate: Number(formData.daily_rate) || null,
      total_days: Number(formData.total_days) || null,
      total_estimate: Number(formData.total_estimate) || null,
    });
    if (!error) {
      setShowNewRental(false);
      const { data } = await supabase.from("rental_bookings").select("*, vehicles(name)");
      setRentalBookings(data || []);
    }
  };

  const METRIC_CARDS = [
    {
      label: "Total Revenue", value: formatPrice(totalRevenue),
      accent: "#1a8a9e", trend: revTrend, progress: Math.min(100, totalRevenue > 0 ? 65 : 0),
    },
    {
      label: "Active Bookings", value: activeBookings,
      accent: "#C9A84C", progress: Math.min(100, activeBookings * 10),
    },
    {
      label: "Pending Approval", value: pendingBookings,
      accent: "#f59e0b", alert: pendingBookings > 0,
      sub: pendingBookings > 0 ? "Needs attention" : "All clear",
      progress: Math.min(100, pendingBookings * 15),
    },
    {
      label: "Fleet Utilisation", value: `${fleetUtil}%`,
      accent: "#3b6d11", progress: fleetUtil,
    },
  ];

  return (
    <div>
      {/* Period selector */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`admin-period-btn ${period === p.key ? 'active' : ''}`}
          >{p.label}</button>
        ))}
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {METRIC_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="admin-card-elevated"
            style={{
              borderTop: `3px solid ${card.accent}`,
              background: card.alert ? "rgba(245,158,11,0.03)" : "white",
            }}
          >
            <p className="admin-metric-label">{card.label}</p>
            <p className="admin-metric-value" style={{ marginTop: 6 }}>{card.value}</p>
            {card.sub && (
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, marginTop: 4,
                color: card.alert ? "#f59e0b" : "#94a3b8", fontWeight: 500,
              }}>{card.sub}</p>
            )}
            {card.trend !== undefined && card.trend !== 0 && (
              <p style={{ marginTop: 4 }}>
                <span className="admin-trend-badge" style={{
                  background: card.trend > 0 ? "rgba(26,138,158,0.1)" : "rgba(239,68,68,0.1)",
                  color: card.trend > 0 ? "#1a8a9e" : "#ef4444",
                }}>
                  {card.trend > 0 ? "↑" : "↓"} {card.trend > 0 ? "+" : ""}{card.trend}% vs last period
                </span>
              </p>
            )}
            <div className="admin-progress-bar">
              <div className="admin-progress-bar-fill" style={{ width: `${card.progress}%`, background: card.accent }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Service Breakdown */}
      <div className="admin-card-elevated" style={{ marginTop: 14, padding: 16 }}>
        <p className="admin-section-title" style={{ marginBottom: 12 }}>Service Breakdown</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 3, height: 28, borderRadius: 2, background: "#1a8a9e" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#0f172a" }}>Tours</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94a3b8" }}>
                {periodTours.length} booking{periodTours.length !== 1 ? "s" : ""} &middot; {formatPrice(tourRevenue)}
              </p>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{periodTours.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 3, height: 28, borderRadius: 2, background: "#C9A84C" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#0f172a" }}>Rentals</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94a3b8" }}>
                {periodRentals.length} booking{periodRentals.length !== 1 ? "s" : ""} &middot; {formatPrice(rentalRevenue)}
              </p>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{periodRentals.length}</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-card-elevated" style={{ marginTop: 14, padding: "16px 16px 8px" }}>
        <p className="admin-section-title" style={{ marginBottom: 12 }}>Revenue Overview</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "#94a3b8" }} />
            <YAxis
              tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, border: "0.5px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Line type="monotone" dataKey="tours" name="Tours" stroke="#1a8a9e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rentals" name="Rentals" stroke="#C9A84C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column content */}
      <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
        {/* Left — Bookings table */}
        <div style={{ flex: 1 }}>
          <div className="admin-card-elevated" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "0.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="admin-section-title">Recent bookings</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {(["all", "tours", "rentals", "concierge"] as BookingFilter[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`admin-period-btn ${filter === f ? "active" : ""}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="admin-link" style={{ fontSize: 12 }}>View all →</button>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Guest</th><th>Type</th><th>Dates</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No bookings yet</td></tr>
                )}
                {recentBookings.map(b => (
                  <tr key={b.id} onClick={() => setSelectedBooking(b)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="admin-avatar">{getInitials(b.full_name)}</div>
                        <span style={{ fontWeight: 500, color: "#0f172a" }}>{b.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {b._type === "tour" ? <Map size={13} style={{ color: "#1a8a9e" }} /> : <Car size={13} style={{ color: "#C9A84C" }} />}
                        <span>{b._type === "tour" ? b.service_type : "Rental"}</span>
                      </div>
                    </td>
                    <td>{b._date ? format(new Date(b._date), "MMM d, yyyy") : "—"}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(b.total_estimate || 0)}</td>
                    <td><StatusPill status={b.status || "pending"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Panels */}
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Pipeline */}
          <div className="admin-card-elevated" style={{ padding: 16 }}>
            <p className="admin-section-title" style={{ marginBottom: 12 }}>Booking pipeline</p>
            {([
              { label: "Enquiry", count: pipeline.enquiry, color: "#C9A84C" },
              { label: "Pending", count: pipeline.pending, color: "#f59e0b" },
              { label: "Confirmed", count: pipeline.confirmed, color: "#1a8a9e" },
              { label: "Active", count: pipeline.active, color: "#3b6d11" },
              { label: "Completed", count: pipeline.completed, color: "#94a3b8" },
            ]).map(stage => (
              <div key={stage.label} className="admin-pipeline-row">
                <span className="admin-pipeline-label">{stage.label}</span>
                <div className="admin-pipeline-track">
                  <div className="admin-pipeline-fill" style={{ width: `${(stage.count / pipelineMax) * 100}%`, background: stage.color }} />
                </div>
                <span className="admin-pipeline-count">{stage.count}</span>
              </div>
            ))}
          </div>

          {/* Live activity */}
          <div className="admin-card-elevated" style={{ padding: 16 }}>
            <p className="admin-section-title" style={{ marginBottom: 10 }}>Live activity</p>
            {liveActivity.length === 0 && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8" }}>No recent activity</p>
            )}
            {liveActivity.map((item, i) => (
              <div key={i} className="admin-activity-item">
                <div className="admin-activity-dot" style={{ background: item.type === "tour" ? "#1a8a9e" : "#C9A84C" }} />
                <div>
                  <p className="admin-activity-text">
                    <strong>{item.name}</strong> booked {item.service}
                  </p>
                  <p className="admin-activity-time">
                    {item.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true }) : "recently"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="admin-card-elevated" style={{ padding: 16 }}>
            <p className="admin-section-title" style={{ marginBottom: 10 }}>Quick actions</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="admin-quick-action" onClick={onNewBooking}>
                <Plus size={16} style={{ color: "#64748b" }} />
                <span>New Booking</span>
              </button>
              <button className="admin-quick-action">
                <Send size={16} style={{ color: "#64748b" }} />
                <span>Send Confirmation</span>
              </button>
              <button className="admin-quick-action">
                <Truck size={16} style={{ color: "#64748b" }} />
                <span>Fleet Status</span>
              </button>
              <button className="admin-quick-action">
                <Calendar size={16} style={{ color: "#64748b" }} />
                <span>View Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Drawer */}
      {selectedBooking && (
        <div className="admin-detail-overlay" onClick={() => setSelectedBooking(null)}>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="admin-detail-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
                Booking Details
              </h3>
              <button onClick={() => setSelectedBooking(null)} style={{ fontSize: 18, color: "#94a3b8", cursor: "pointer", background: "none", border: "none" }}>✕</button>
            </div>
            <div className="admin-detail-grid">
              {[
                ["Guest", selectedBooking.full_name],
                ["Email", selectedBooking.email],
                ["Phone", selectedBooking.phone],
                ["Type", selectedBooking._type === "tour" ? selectedBooking.service_type : "Car Rental"],
                ["Date", selectedBooking._date ? format(new Date(selectedBooking._date), "MMM d, yyyy") : "—"],
                ["Status", selectedBooking.status || "pending"],
                ["Amount", formatPrice(selectedBooking.total_estimate || 0)],
                ["Ref", selectedBooking.booking_ref || "—"],
              ].map(([label, value]) => (
                <div key={label} className="admin-detail-row">
                  <span className="admin-detail-label">{label}</span>
                  <span className="admin-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBooking && (
        <QuickFormModal
          title="New Tour Booking"
          onClose={() => setShowNewBooking(false)}
          onSubmit={handleNewBooking}
          fields={[
            { key: "full_name", label: "Guest Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phone", label: "Phone", type: "text", required: true },
            { key: "service_type", label: "Service", type: "select", options: ["Circumnavigation Tour", "Flight Concierge", "Private Charter"], required: true },
            { key: "tour_date", label: "Tour Date", type: "date", required: true },
            { key: "party_size", label: "Party Size", type: "number", required: true },
            { key: "total_estimate", label: "Total Estimate ($)", type: "number" },
            { key: "special_requests", label: "Special Requests", type: "textarea" },
          ]}
        />
      )}

      {showNewRental && (
        <QuickFormModal
          title="New Rental Booking"
          onClose={() => setShowNewRental(false)}
          onSubmit={handleNewRental}
          fields={[
            { key: "full_name", label: "Guest Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phone", label: "Phone", type: "text", required: true },
            { key: "vehicle_id", label: "Vehicle", type: "select", options: vehicles.map(v => ({ value: v.id, label: v.name })), required: true },
            { key: "pickup_date", label: "Pickup Date", type: "date", required: true },
            { key: "return_date", label: "Return Date", type: "date", required: true },
            { key: "pickup_location", label: "Pickup Location", type: "text" },
            { key: "dropoff_location", label: "Dropoff Location", type: "text" },
            { key: "driver_license", label: "License #", type: "text" },
            { key: "license_country", label: "License Country", type: "text" },
            { key: "daily_rate", label: "Daily Rate ($)", type: "number" },
            { key: "total_days", label: "Total Days", type: "number" },
            { key: "total_estimate", label: "Total ($)", type: "number" },
          ]}
        />
      )}
    </div>
  );
};

// ── Status Pill ──
const StatusPill = ({ status }: { status: string }) => {
  const classMap: Record<string, string> = {
    pending: "admin-status-pending",
    confirmed: "admin-status-confirmed",
    completed: "admin-status-completed",
    cancelled: "admin-status-cancelled",
  };
  return <span className={classMap[status] || classMap.pending}>{status}</span>;
};

// ── Exported StatusBadge (for other admin pages) ──
export const StatusBadge = ({ status }: { status: string }) => <StatusPill status={status} />;

// ── Quick Form Modal ──
interface FormField {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "textarea" | "select";
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
}

const QuickFormModal = ({ title, onClose, onSubmit, fields }: { title: string; onClose: () => void; onSubmit: (data: any) => void; fields: FormField[] }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
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
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: 18, color: "#94a3b8", cursor: "pointer", background: "none", border: "none" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="admin-form-label">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="admin-filter-input w-full"
                  style={{ minHeight: 64, resize: "vertical" }}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="admin-filter-input w-full"
                  required={field.required}
                >
                  <option value="">Select…</option>
                  {(field.options || []).map((opt) =>
                    typeof opt === "string" ? (
                      <option key={opt} value={opt}>{opt}</option>
                    ) : (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="admin-filter-input w-full"
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="pt-3">
            <button type="submit" disabled={submitting} className="admin-btn-primary w-full">
              {submitting ? "Saving…" : "Create Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
