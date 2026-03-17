import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachMonthOfInterval, startOfYear, subYears } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

const DONUT_COLORS = ["#C9943A", "#4EC9C9", "#1A6B6B", "#0B2A3B"];

const AdminRevenue = () => {
  const { format: fmt } = useCurrency();
  const [tours, setTours] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTours(r.data || [])),
      supabase.from("rental_bookings").select("*").then(r => setRentals(r.data || [])),
    ]);
  }, []);

  const months = eachMonthOfInterval({ start: subYears(startOfYear(new Date()), 0), end: new Date() });

  // Monthly revenue trend
  const monthlyData = useMemo(() => months.map(m => {
    const ms = format(m, "yyyy-MM");
    const tRev = tours.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    const rRev = rentals.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), tours: tRev, rentals: rRev, total: tRev + rRev };
  }), [tours, rentals, months]);

  const bestMonth = monthlyData.reduce((best, m) => m.total > best.total ? m : best, { name: "", total: 0, tours: 0, rentals: 0 });

  // Revenue by service
  const serviceRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    tours.filter(b => b.status !== "cancelled").forEach(b => { map[b.service_type] = (map[b.service_type] || 0) + (Number(b.total_estimate) || 0); });
    map["Car Rental"] = rentals.filter(b => b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [tours, rentals]);

  // ABV trend
  const abvData = useMemo(() => months.map(m => {
    const ms = format(m, "yyyy-MM");
    const allInMonth = [...tours, ...rentals].filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled");
    const total = allInMonth.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), abv: allInMonth.length > 0 ? Math.round(total / allInMonth.length) : 0 };
  }), [tours, rentals, months]);

  // Add-on revenue
  const addOnRevenue = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    [...tours, ...rentals].forEach(b => {
      (b.add_ons || []).forEach((addon: string) => {
        const name = addon.replace(/^[^:]+:/, "");
        if (!map[name]) map[name] = { count: 0, revenue: 0 };
        map[name].count++;
      });
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count);
  }, [tours, rentals]);

  // Cancellations
  const cancelled = [...tours, ...rentals].filter(b => b.status === "cancelled");
  const totalAll = tours.length + rentals.length;
  const cancelRate = totalAll > 0 ? Math.round((cancelled.length / totalAll) * 100) : 0;
  const lostRevenue = cancelled.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);

  return (
    <div>
      <h1 className="admin-page-title">Revenue Analytics</h1>
      <p className="admin-page-sub">Financial intelligence for your business</p>

      {/* Monthly Revenue */}
      <div className="mt-8 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-1">Monthly Revenue Trend</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(11,42,59,0.45)", marginBottom: 16 }}>Best month: {bestMonth.name} ({fmt(bestMonth.total)})</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid hsl(var(--gem-sand))" }} />
            <Legend wrapperStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
            <Bar dataKey="tours" stackId="a" fill="#C9943A" name="Tours" />
            <Bar dataKey="rentals" stackId="a" fill="#4EC9C9" name="Rentals" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue by Service */}
        <div className="p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-4">Revenue by Service</p>
          <PieChart width={220} height={200}>
            <Pie data={serviceRevenue} cx={110} cy={100} innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
              {serviceRevenue.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
          </PieChart>
          <div className="space-y-2 mt-4">
            {serviceRevenue.map((s, i) => (
              <div key={s.name} className="flex justify-between" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                <span className="flex items-center gap-2"><span style={{ width: 8, height: 8, background: DONUT_COLORS[i % DONUT_COLORS.length], display: "inline-block" }} />{s.name}</span>
                <span>{fmt(s.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ABV Trend */}
        <div className="p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-4">Average Booking Value Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={abvData}>
              <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
              <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
              <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
              <Line type="monotone" dataKey="abv" name="ABV" stroke="#1A6B6B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cancellation Analysis */}
      <div className="mt-6 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-4">Cancellation Analysis</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="admin-metric-card" style={{ border: "none", padding: 0 }}>
            <p className="admin-metric-value" style={{ fontSize: 36 }}>{cancelled.length}</p>
            <p className="admin-metric-label">Cancelled Bookings</p>
          </div>
          <div className="admin-metric-card" style={{ border: "none", padding: 0 }}>
            <p className="admin-metric-value" style={{ fontSize: 36, color: "hsl(var(--gem-coral))" }}>{cancelRate}%</p>
            <p className="admin-metric-label">Cancellation Rate</p>
          </div>
          <div className="admin-metric-card" style={{ border: "none", padding: 0 }}>
            <p className="admin-metric-value" style={{ fontSize: 36, color: "hsl(var(--gem-coral))" }}>{fmt(lostRevenue)}</p>
            <p className="admin-metric-label">Revenue Lost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
