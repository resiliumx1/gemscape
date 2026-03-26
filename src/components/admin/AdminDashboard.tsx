import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, startOfWeek, startOfYear, startOfQuarter, subMonths, subWeeks, subQuarters, subYears, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";

type Period = "today" | "week" | "month" | "quarter" | "year";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
];

const DONUT_COLORS = ["#B8965A", "#4EC9C9", "#1A6B6B", "#0B2A3B"];

interface UpcomingBooking {
  id: string; date: string; guest: string; service: string; status: string; value: number; type: "tour" | "rental";
}

const AdminDashboard = () => {
  const { format: formatPrice } = useCurrency();
  const [period, setPeriod] = useState<Period>("month");
  const [tourBookings, setTourBookings] = useState<any[]>([]);
  const [rentalBookings, setRentalBookings] = useState<any[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showNewRental, setShowNewRental] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTourBookings(r.data || [])),
      supabase.from("rental_bookings").select("*, vehicles(name)").then(r => setRentalBookings(r.data || [])),
      supabase.from("review_queue").select("*").then(r => setReviewQueue(r.data || [])),
      supabase.from("vehicles").select("*").then(r => setVehicles(r.data || [])),
    ]);
    fetchUpcoming();

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

  const fetchUpcoming = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [tours, rentals] = await Promise.all([
      supabase.from("bookings").select("*").gte("tour_date", today).order("tour_date").limit(8),
      supabase.from("rental_bookings").select("*, vehicles(name)").gte("pickup_date", today).order("pickup_date").limit(8),
    ]);
    const combined: UpcomingBooking[] = [
      ...(tours.data || []).map((b: any) => ({ id: b.id, date: b.tour_date, guest: b.full_name, service: b.service_type, status: b.status || "pending", value: b.total_estimate || 0, type: "tour" as const })),
      ...(rentals.data || []).map((r: any) => ({ id: r.id, date: r.pickup_date, guest: r.full_name, service: r.vehicles?.name || "Rental", status: r.status || "pending", value: r.total_estimate || 0, type: "rental" as const })),
    ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
    setUpcoming(combined);
  };

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

  const totalBookings = periodTours.length + periodRentals.length;
  const prevBookings = prevTours.length + prevRentals.length;
  const bookingTrend = prevBookings > 0 ? totalBookings - prevBookings : 0;

  const avgValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  const pendingTours = tourBookings.filter(b => b.status === "pending").length;
  const pendingRentals = rentalBookings.filter(b => b.status === "pending").length;
  const totalPending = pendingTours + pendingRentals;

  const periodReviews = reviewQueue.filter(r => r.review_left && r.created_at >= startStr);
  const periodSent = reviewQueue.filter(r => r.sent_at && r.created_at >= startStr);
  const reviewRate = periodSent.length > 0 ? Math.round((periodReviews.length / periodSent.length) * 100) : 0;

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

  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodTours.forEach(b => { map[b.service_type] = (map[b.service_type] || 0) + 1; });
    map["Car Rental"] = periodRentals.length;
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [periodTours, periodRentals]);

  const totalServiceCount = serviceBreakdown.reduce((s, d) => s + d.value, 0);

  const unavailableVehicles = vehicles.filter(v => !v.available).length;
  const scheduledReviews = reviewQueue.filter(r => !r.sent_at && r.scheduled_send).length;
  const today = format(new Date(), "yyyy-MM-dd");
  const activeRentalsThisWeek = rentalBookings.filter(r => r.pickup_date <= today && r.return_date >= today).length;

  // New Booking handler
  const handleNewBooking = async (formData: any) => {
    const { error } = await supabase.from("bookings").insert({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      service_type: formData.service_type,
      tour_date: formData.tour_date,
      party_size: Number(formData.party_size) || 1,
      special_requests: formData.special_requests || null,
      total_estimate: Number(formData.total_estimate) || null,
    });
    if (!error) {
      setShowNewBooking(false);
      // Refresh
      const { data } = await supabase.from("bookings").select("*");
      setTourBookings(data || []);
      fetchUpcoming();
    }
  };

  // New Rental handler
  const handleNewRental = async (formData: any) => {
    const { error } = await supabase.from("rental_bookings").insert({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      vehicle_id: formData.vehicle_id || null,
      pickup_date: formData.pickup_date,
      return_date: formData.return_date,
      pickup_location: formData.pickup_location || "Hotel",
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
      fetchUpcoming();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="admin-page-title">Good morning, Gemscape.</h1>
          <p className="admin-page-sub">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewBooking(true)}
            className="admin-btn-gold"
          >
            + New Booking
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewRental(true)}
            className="admin-btn-teal"
          >
            + New Rental
          </motion.button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mt-6 flex-wrap">
        {PERIODS.map(p => (
          <motion.button
            key={p.key}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPeriod(p.key)}
            className={`admin-period-btn ${period === p.key ? 'active' : ''}`}
          >{p.label}</motion.button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        <KPICard index={0} label="Total Revenue" value={formatPrice(totalRevenue)} trend={revTrend} trendLabel="vs last period" sub={`Tour: ${formatPrice(tourRevenue)} · Rental: ${formatPrice(rentalRevenue)}`} />
        <KPICard index={1} label="Total Bookings" value={totalBookings} trend={bookingTrend} trendLabel="vs last period" sub={`Tours: ${periodTours.length} · Rentals: ${periodRentals.length}`} />
        <KPICard index={2} label="Average Booking Value" value={formatPrice(avgValue)} sub={`Tour avg: ${formatPrice(periodTours.length > 0 ? Math.round(tourRevenue / periodTours.length) : 0)} · Rental avg: ${formatPrice(periodRentals.length > 0 ? Math.round(rentalRevenue / periodRentals.length) : 0)}`} />
        <KPICard index={3} label="Pending Confirmations" value={totalPending} alert={totalPending > 0} sub={totalPending > 0 ? "Action needed" : "All clear"} />
        <KPICard index={4} label="Reviews Collected" value={periodReviews.length} sub={`Review rate: ${reviewRate}%`} />
        <KPICard index={5} label="Customer Satisfaction" value="—" sub="Awaiting data" />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="admin-card-elevated mt-10 p-6"
      >
        <p className="admin-section-title" style={{ marginBottom: 20 }}>Revenue Overview</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid hsl(37 38% 54% / 0.25)", borderRadius: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
            <Legend wrapperStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
            <Line type="monotone" dataKey="tours" name="Tour Revenue" stroke="#B8965A" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="rentals" name="Rental Revenue" stroke="#4EC9C9" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Row 3 — Upcoming + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-3 admin-card-elevated overflow-hidden"
        >
          <div className="p-4" style={{ borderBottom: "1px solid rgba(184,150,90,0.15)" }}>
            <p className="admin-section-title">Upcoming Bookings</p>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Guest</th><th>Service</th><th>Status</th><th>Value</th></tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && <tr><td colSpan={5} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>No upcoming bookings</td></tr>}
              {upcoming.map(b => (
                <tr key={b.id}>
                  <td>{format(new Date(b.date), "MMM d")}</td>
                  <td style={{ fontWeight: 400 }}>{b.guest}</td>
                  <td>{b.service}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(b.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2 admin-card-elevated p-6"
        >
          <p className="admin-section-title mb-4">Service Breakdown</p>
          {serviceBreakdown.length > 0 ? (
            <>
              <div className="flex justify-center">
                <PieChart width={200} height={200}>
                  <Pie data={serviceBreakdown} cx={100} cy={100} innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                    {serviceBreakdown.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid rgba(184,150,90,0.25)", borderRadius: 0 }} />
                </PieChart>
              </div>
              <p style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "hsl(var(--gem-navy))", marginTop: -120, position: "relative", zIndex: 1, pointerEvents: "none" }}>{totalServiceCount}</p>
              <div className="mt-16 space-y-2">
                {serviceBreakdown.map((s, i) => (
                  <div key={s.name} className="flex justify-between items-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400 }}>
                    <span className="flex items-center gap-2">
                      <span style={{ width: 10, height: 10, background: DONUT_COLORS[i % DONUT_COLORS.length], display: "inline-block" }} />
                      {s.name}
                    </span>
                    <span style={{ color: "rgba(11,42,59,0.55)", fontWeight: 500 }}>{s.value} ({totalServiceCount > 0 ? Math.round((s.value / totalServiceCount) * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                <span style={{ width: 4, height: 36, background: "#4EC9C9", display: "inline-block", borderRadius: 2 }} />
                <div>
                  <p style={{ fontWeight: 500, color: "hsl(var(--gem-navy))" }}>Tours</p>
                  <p style={{ color: "rgba(11,42,59,0.5)", fontSize: 13 }}>0 bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                <span style={{ width: 4, height: 36, background: "#B8965A", display: "inline-block", borderRadius: 2 }} />
                <div>
                  <p style={{ fontWeight: 500, color: "hsl(var(--gem-navy))" }}>Rentals</p>
                  <p style={{ color: "rgba(11,42,59,0.5)", fontSize: 13 }}>0 bookings</p>
                </div>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(11,42,59,0.35)", marginTop: 12, fontStyle: "italic" }}>Data will appear once bookings are created.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Alerts */}
      <div className="mt-6 space-y-2">
        {totalPending > 0 && !dismissedAlerts.has("pending") && (
          <Alert color="#B8965A" text={`${totalPending} bookings pending confirmation`} action="Review Now →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("pending"))} />
        )}
        {scheduledReviews > 0 && !dismissedAlerts.has("reviews") && (
          <Alert color="#4EC9C9" text={`${scheduledReviews} review requests scheduled`} action="View Queue →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("reviews"))} />
        )}
        {activeRentalsThisWeek > 0 && !dismissedAlerts.has("rentals") && (
          <Alert color="#0B2A3B" text={`${activeRentalsThisWeek} rentals active right now`} action="View Calendar →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("rentals"))} />
        )}
        {unavailableVehicles > 0 && !dismissedAlerts.has("vehicles") && (
          <Alert color="#D4523A" text={`${unavailableVehicles} vehicles marked unavailable`} action="Update Fleet →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("vehicles"))} />
        )}
      </div>

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

      {/* New Rental Modal */}
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

// ── KPI Card ──
const KPICard = ({ label, value, trend, trendLabel, sub, alert, index = 0 }: { label: string; value: string | number; trend?: number; trendLabel?: string; sub?: string; alert?: boolean; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 + index * 0.06, duration: 0.45, ease: "easeOut" }}
    whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
    className="admin-card-elevated"
    style={{ padding: 28, borderLeft: alert ? "3px solid #D4523A" : undefined, cursor: "default" }}
  >
    <p className="admin-metric-value" style={{ fontSize: 42 }}>{value}</p>
    <p className="admin-metric-label">{label}</p>
    {trend !== undefined && trend !== 0 && (
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, marginTop: 6 }}>
        <span className="admin-trend-badge" style={{
          background: trend > 0 ? "rgba(26,107,107,0.12)" : "rgba(212,82,58,0.12)",
          color: trend > 0 ? "#1A6B6B" : "#D4523A",
        }}>
          {trend > 0 ? "↑" : "↓"} {trend > 0 ? "+" : ""}{trend}{typeof trend === "number" && trendLabel?.includes("period") ? "%" : ""} {trendLabel}
        </span>
      </p>
    )}
    {sub && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(11,42,59,0.45)", marginTop: 6, fontWeight: 400 }}>{sub}</p>}
  </motion.div>
);

// ── Alert ──
const Alert = ({ color, text, action, onDismiss }: { color: string; text: string; action: string; onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    className="admin-card-elevated"
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderLeft: `3px solid ${color}` }}
  >
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: "hsl(var(--gem-navy))" }}>{text}</span>
    <div className="flex items-center gap-4">
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>{action}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(11,42,59,0.3)", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  </motion.div>
);

// ── Status Badge ──
export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "rgba(201,148,58,0.12)", color: "#B8965A" },
    confirmed: { bg: "rgba(26,107,107,0.12)", color: "#1A6B6B" },
    completed: { bg: "rgba(11,42,59,0.08)", color: "#0B2A3B" },
    cancelled: { bg: "rgba(212,82,58,0.12)", color: "#D4523A" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ display: "inline-block", padding: "4px 14px", backgroundColor: s.bg, color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, textTransform: "capitalize", letterSpacing: "0.06em" }}>{status}</span>
  );
};

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
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="admin-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "hsl(var(--gem-navy))" }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: 22, color: "rgba(11,42,59,0.4)", cursor: "pointer", background: "none", border: "none" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="admin-form-label">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="admin-filter-input w-full"
                  style={{ minHeight: 72, resize: "vertical" }}
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
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="admin-btn-primary w-full"
            >
              {submitting ? "Saving…" : "Create Booking"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
