import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, startOfWeek, startOfYear, startOfQuarter, subMonths, subWeeks, subQuarters, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, endOfMonth } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

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

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTourBookings(r.data || [])),
      supabase.from("rental_bookings").select("*, vehicles(name)").then(r => setRentalBookings(r.data || [])),
      supabase.from("review_queue").select("*").then(r => setReviewQueue(r.data || [])),
      supabase.from("vehicles").select("*").then(r => setVehicles(r.data || [])),
    ]);
    fetchUpcoming();

    // Realtime subscriptions
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

  // Revenue chart data
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

  // Service breakdown donut
  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodTours.forEach(b => { map[b.service_type] = (map[b.service_type] || 0) + 1; });
    map["Car Rental"] = periodRentals.length;
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [periodTours, periodRentals]);

  const totalServiceCount = serviceBreakdown.reduce((s, d) => s + d.value, 0);

  // Alerts
  const unavailableVehicles = vehicles.filter(v => !v.available).length;
  const scheduledReviews = reviewQueue.filter(r => !r.sent_at && r.scheduled_send).length;
  const today = format(new Date(), "yyyy-MM-dd");
  const activeRentalsThisWeek = rentalBookings.filter(r => r.pickup_date <= today && r.return_date >= today).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="admin-page-title">Good morning, Gemscape.</h1>
          <p className="admin-page-sub">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <div className="flex gap-3">
          <button className="admin-btn-outline" style={{ borderColor: "hsl(var(--gem-gold))", color: "hsl(var(--gem-gold))" }}>New Booking +</button>
          <button className="admin-btn-outline" style={{ borderColor: "hsl(var(--gem-gold))", color: "hsl(var(--gem-gold))" }}>New Rental +</button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mt-6">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "8px 18px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              background: period === p.key ? "hsl(var(--gem-navy))" : "hsl(var(--gem-sand))",
              color: period === p.key ? "white" : "hsl(var(--gem-navy))",
              transition: "all 0.2s",
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        <KPICard label="Total Revenue" value={formatPrice(totalRevenue)} trend={revTrend} trendLabel="vs last period" sub={`Tour: ${formatPrice(tourRevenue)} · Rental: ${formatPrice(rentalRevenue)}`} />
        <KPICard label="Total Bookings" value={totalBookings} trend={bookingTrend} trendLabel="vs last period" sub={`Tours: ${periodTours.length} · Rentals: ${periodRentals.length}`} />
        <KPICard label="Average Booking Value" value={formatPrice(avgValue)} sub={`Tour avg: ${formatPrice(periodTours.length > 0 ? Math.round(tourRevenue / periodTours.length) : 0)} · Rental avg: ${formatPrice(periodRentals.length > 0 ? Math.round(rentalRevenue / periodRentals.length) : 0)}`} />
        <KPICard label="Pending Confirmations" value={totalPending} alert={totalPending > 0} sub={totalPending > 0 ? "Action needed" : "All clear"} />
        <KPICard label="Reviews Collected" value={periodReviews.length} sub={`Review rate: ${reviewRate}%`} />
        <KPICard label="Customer Satisfaction" value="—" sub="Awaiting data" />
      </div>

      {/* Revenue Chart */}
      <div className="mt-10 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", color: "hsl(var(--gem-gold))", marginBottom: 20 }}>Revenue Overview</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid hsl(var(--gem-sand))" }} />
            <Legend wrapperStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
            <Line type="monotone" dataKey="tours" name="Tour Revenue" stroke="#B8965A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="rentals" name="Rental Revenue" stroke="#4EC9C9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3 — Upcoming + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-3 admin-table-wrap">
          <div className="p-4" style={{ borderBottom: "1px solid hsl(var(--gem-sand))" }}>
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
                  <td>{b.guest}</td>
                  <td>{b.service}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>{formatPrice(b.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Service Breakdown */}
        <div className="lg:col-span-2 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-4">Service Breakdown</p>
          <div className="flex justify-center">
            <PieChart width={200} height={200}>
              <Pie data={serviceBreakdown} cx={100} cy={100} innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                {serviceBreakdown.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid hsl(var(--gem-sand))" }} />
            </PieChart>
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "hsl(var(--gem-navy))", marginTop: -120, position: "relative", zIndex: 1, pointerEvents: "none" }}>{totalServiceCount}</p>
          <div className="mt-16 space-y-2">
            {serviceBreakdown.map((s, i) => (
              <div key={s.name} className="flex justify-between items-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                <span className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, background: DONUT_COLORS[i % DONUT_COLORS.length], display: "inline-block" }} />
                  {s.name}
                </span>
                <span style={{ color: "rgba(11,42,59,0.55)" }}>{s.value} ({totalServiceCount > 0 ? Math.round((s.value / totalServiceCount) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-6 space-y-2">
        {totalPending > 0 && !dismissedAlerts.has("pending") && (
          <Alert color="hsl(var(--gem-gold))" text={`${totalPending} bookings pending confirmation`} action="Review Now →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("pending"))} />
        )}
        {scheduledReviews > 0 && !dismissedAlerts.has("reviews") && (
          <Alert color="hsl(var(--gem-teal))" text={`${scheduledReviews} review requests scheduled`} action="View Queue →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("reviews"))} />
        )}
        {activeRentalsThisWeek > 0 && !dismissedAlerts.has("rentals") && (
          <Alert color="hsl(var(--gem-navy))" text={`${activeRentalsThisWeek} rentals active right now`} action="View Calendar →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("rentals"))} />
        )}
        {unavailableVehicles > 0 && !dismissedAlerts.has("vehicles") && (
          <Alert color="hsl(var(--gem-coral))" text={`${unavailableVehicles} vehicles marked unavailable`} action="Update Fleet →" onDismiss={() => setDismissedAlerts(s => new Set(s).add("vehicles"))} />
        )}
      </div>
    </div>
  );
};

const KPICard = ({ label, value, trend, trendLabel, sub, alert }: { label: string; value: string | number; trend?: number; trendLabel?: string; sub?: string; alert?: boolean }) => (
  <div className="admin-metric-card" style={{ borderLeft: alert ? "3px solid hsl(var(--gem-coral))" : undefined }}>
    <p className="admin-metric-value" style={{ fontSize: 42 }}>{value}</p>
    <p className="admin-metric-label">{label}</p>
    {trend !== undefined && trend !== 0 && (
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, marginTop: 4 }}>
        <span style={{ display: "inline-block", padding: "2px 8px", fontSize: 10, fontWeight: 500, background: trend > 0 ? "rgba(26,107,107,0.12)" : "rgba(212,82,58,0.12)", color: trend > 0 ? "hsl(var(--gem-teal))" : "hsl(var(--gem-coral))" }}>
          {trend > 0 ? "+" : ""}{trend}{typeof trend === "number" && trendLabel?.includes("period") ? "%" : ""} {trendLabel}
        </span>
      </p>
    )}
    {sub && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(11,42,59,0.45)", marginTop: 6 }}>{sub}</p>}
  </div>
);

const Alert = ({ color, text, action, onDismiss }: { color: string; text: string; action: string; onDismiss: () => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "white", border: "1px solid hsl(var(--gem-sand))", borderLeft: `3px solid ${color}` }}>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: "hsl(var(--gem-navy))" }}>{text}</span>
    <div className="flex items-center gap-4">
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>{action}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(11,42,59,0.3)", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "rgba(201,148,58,0.12)", color: "hsl(var(--gem-gold))" },
    confirmed: { bg: "rgba(26,107,107,0.12)", color: "hsl(var(--gem-teal))" },
    completed: { bg: "rgba(11,42,59,0.08)", color: "hsl(var(--gem-navy))" },
    cancelled: { bg: "rgba(212,82,58,0.12)", color: "hsl(var(--gem-coral))" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ display: "inline-block", padding: "4px 12px", backgroundColor: s.bg, color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, textTransform: "capitalize", letterSpacing: "0.04em" }}>{status}</span>
  );
};

export default AdminDashboard;
