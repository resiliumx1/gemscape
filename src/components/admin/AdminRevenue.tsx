import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachMonthOfInterval, startOfYear, subYears } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

const DONUT_COLORS = ["#1a8a9e", "#C9A84C", "#0f172a", "#3b6d11"];

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

  const monthlyData = useMemo(() => months.map(m => {
    const ms = format(m, "yyyy-MM");
    const tRev = tours.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    const rRev = rentals.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), tours: tRev, rentals: rRev, total: tRev + rRev };
  }), [tours, rentals, months]);

  const bestMonth = monthlyData.reduce((best, m) => m.total > best.total ? m : best, { name: "", total: 0, tours: 0, rentals: 0 });

  const serviceRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    tours.filter(b => b.status !== "cancelled").forEach(b => { map[b.service_type] = (map[b.service_type] || 0) + (Number(b.total_estimate) || 0); });
    map["Car Rental"] = rentals.filter(b => b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [tours, rentals]);

  const totalServiceRev = serviceRevenue.reduce((s, e) => s + e.value, 0);

  const abvData = useMemo(() => months.map(m => {
    const ms = format(m, "yyyy-MM");
    const allInMonth = [...tours, ...rentals].filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled");
    const total = allInMonth.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), abv: allInMonth.length > 0 ? Math.round(total / allInMonth.length) : 0 };
  }), [tours, rentals, months]);

  const cancelled = [...tours, ...rentals].filter(b => b.status === "cancelled");
  const totalAll = tours.length + rentals.length;
  const cancelRate = totalAll > 0 ? Math.round((cancelled.length / totalAll) * 100) : 0;
  const lostRevenue = cancelled.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);

  const currencyFormatter = (v: number) => "$" + v.toLocaleString();

  return (
    <div>
      {/* Monthly Revenue */}
      <div className="admin-card-elevated p-5 mb-5">
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 4 }}>Monthly Revenue Trend</p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Best month: {bestMonth.name} ({fmt(bestMonth.total)})</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, "auto"]} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 13, border: "0.5px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="tours" stackId="a" fill="#1a8a9e" name="Tours" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rentals" stackId="a" fill="#C9A84C" name="Rentals" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Revenue by Service — Donut + Legend */}
        <div className="admin-card-elevated p-5">
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Revenue by Service</p>
          <div className="flex justify-center">
            <PieChart width={200} height={200}>
              <Pie data={serviceRevenue} cx={100} cy={100} innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {serviceRevenue.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 13 }} />
            </PieChart>
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {serviceRevenue.map((s, i) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span style={{ color: "#334155" }}>{s.name}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{fmt(s.value)}</span>
                  <span style={{ color: "#94a3b8" }}>{totalServiceRev > 0 ? Math.round((s.value / totalServiceRev) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ABV Trend */}
        <div className="admin-card-elevated p-5">
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Average Booking Value Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={abvData}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, "auto"]} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="abv" name="ABV" stroke="#1a8a9e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cancellation Analysis */}
      <div className="admin-card-elevated p-5">
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Cancellation Analysis</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{cancelled.length}</p>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Cancelled Bookings</p>
          </div>
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#991b1b" }}>{cancelRate}%</p>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Cancellation Rate</p>
          </div>
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#991b1b" }}>{fmt(lostRevenue)}</p>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Revenue Lost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
