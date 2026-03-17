import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subMonths } from "date-fns";

interface Metrics {
  totalThisMonth: number;
  totalLastMonth: number;
  pending: number;
  revenue: number;
  reviewsCollected: number;
}

interface UpcomingBooking {
  id: string;
  date: string;
  guest: string;
  service: string;
  detail: string;
  status: string;
  type: "tour" | "rental";
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics>({ totalThisMonth: 0, totalLastMonth: 0, pending: 0, revenue: 0, reviewsCollected: 0 });
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);

  useEffect(() => {
    fetchMetrics();
    fetchUpcoming();
  }, []);

  const fetchMetrics = async () => {
    const now = new Date();
    const thisMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
    const lastMonthStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");

    const [tourThis, tourLast, rentalThis, rentalLast, tourPending, rentalPending, tourRev, rentalRev, reviews] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
      supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
      supabase.from("rental_bookings").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
      supabase.from("rental_bookings").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("rental_bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("bookings").select("total_estimate").neq("status", "cancelled").gte("created_at", thisMonthStart),
      supabase.from("rental_bookings").select("total_estimate").neq("status", "cancelled").gte("created_at", thisMonthStart),
      supabase.from("review_queue").select("id", { count: "exact", head: true }).eq("review_left", true),
    ]);

    const tourRevSum = (tourRev.data || []).reduce((s, r) => s + (Number(r.total_estimate) || 0), 0);
    const rentalRevSum = (rentalRev.data || []).reduce((s, r) => s + (Number(r.total_estimate) || 0), 0);

    setMetrics({
      totalThisMonth: (tourThis.count || 0) + (rentalThis.count || 0),
      totalLastMonth: (tourLast.count || 0) + (rentalLast.count || 0),
      pending: (tourPending.count || 0) + (rentalPending.count || 0),
      revenue: tourRevSum + rentalRevSum,
      reviewsCollected: reviews.count || 0,
    });
  };

  const fetchUpcoming = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [tours, rentals] = await Promise.all([
      supabase.from("bookings").select("*").gte("tour_date", today).order("tour_date", { ascending: true }).limit(10),
      supabase.from("rental_bookings").select("*, vehicles(name)").gte("pickup_date", today).order("pickup_date", { ascending: true }).limit(10),
    ]);

    const combined: UpcomingBooking[] = [
      ...(tours.data || []).map((b) => ({
        id: b.id,
        date: b.tour_date,
        guest: b.full_name,
        service: b.service_type,
        detail: `${(b.adults || 0) + (b.children || 0)} guests`,
        status: b.status || "pending",
        type: "tour" as const,
      })),
      ...(rentals.data || []).map((r: any) => ({
        id: r.id,
        date: r.pickup_date,
        guest: r.full_name,
        service: "Vehicle Rental",
        detail: r.vehicles?.name || "Vehicle",
        status: r.status || "pending",
        type: "rental" as const,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);

    setUpcoming(combined);
  };

  const trend = metrics.totalThisMonth - metrics.totalLastMonth;

  return (
    <div>
      <h1 className="admin-page-title">Good morning, Gemscape.</h1>
      <p className="admin-page-sub">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <MetricCard label="Bookings This Month" value={metrics.totalThisMonth} trend={trend} />
        <MetricCard label="Pending Confirmations" value={metrics.pending} />
        <MetricCard label="Revenue This Month" value={`$${metrics.revenue.toLocaleString()}`} />
        <MetricCard label="Reviews Collected" value={metrics.reviewsCollected} />
      </div>

      {/* Upcoming */}
      <h3 className="admin-section-title mt-12">Upcoming Bookings</h3>
      <div className="admin-table-wrap mt-4">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th><th>Guest</th><th>Service</th><th>Detail</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>No upcoming bookings</td></tr>
            )}
            {upcoming.map((b) => (
              <tr key={b.id}>
                <td>{format(new Date(b.date), "MMM d, yyyy")}</td>
                <td>{b.guest}</td>
                <td>{b.service}</td>
                <td>{b.detail}</td>
                <td><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend }: { label: string; value: string | number; trend?: number }) => (
  <div className="admin-metric-card">
    <p className="admin-metric-value">{value}</p>
    <p className="admin-metric-label">{label}</p>
    {trend !== undefined && trend !== 0 && (
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 4, color: trend > 0 ? "hsl(var(--gem-teal))" : "hsl(var(--gem-coral))" }}>
        {trend > 0 ? "+" : ""}{trend} from last month
      </p>
    )}
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
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      backgroundColor: s.bg,
      color: s.color,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      fontSize: 11,
      textTransform: "capitalize",
      letterSpacing: "0.04em",
    }}>{status}</span>
  );
};

export default AdminDashboard;
