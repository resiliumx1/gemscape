import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, eachDayOfInterval, eachMonthOfInterval, startOfYear, startOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

const AdminForecasting = () => {
  const { format: fmt } = useCurrency();
  const [tours, setTours] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTours(r.data || [])),
      supabase.from("rental_bookings").select("*").then(r => setRentals(r.data || [])),
    ]);
  }, []);

  // Next 30 days pipeline
  const today = new Date();
  const next30 = eachDayOfInterval({ start: today, end: addDays(today, 30) });

  const pipelineData = useMemo(() => next30.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const confirmed = tours.filter(b => b.tour_date === dayStr && b.status === "confirmed").length +
      rentals.filter(r => r.pickup_date <= dayStr && r.return_date >= dayStr && r.status === "confirmed").length;
    const pending = tours.filter(b => b.tour_date === dayStr && b.status === "pending").length +
      rentals.filter(r => r.pickup_date <= dayStr && r.return_date >= dayStr && r.status === "pending").length;
    return { name: format(day, "d"), confirmed, pending };
  }), [tours, rentals, next30]);

  // Projected revenue
  const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
  const confirmedRev = [...tours, ...rentals].filter(b => (b.tour_date || b.pickup_date) >= monthStart && b.status === "confirmed").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const pendingRev = [...tours, ...rentals].filter(b => (b.tour_date || b.pickup_date) >= monthStart && b.status === "pending").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const closeRate = 0.75;
  const projectedTotal = confirmedRev + Math.round(pendingRev * closeRate);

  // Seasonal demand
  const seasonalData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startOfYear(today), end: today });
    return months.map(m => {
      const ms = format(m, "yyyy-MM");
      const count = tours.filter(b => b.tour_date?.startsWith(ms)).length + rentals.filter(r => r.pickup_date?.startsWith(ms)).length;
      return { name: format(m, "MMM"), bookings: count };
    });
  }, [tours, rentals]);

  return (
    <div>
      <h1 className="admin-page-title">Forecasting</h1>
      <p className="admin-page-sub">Forward-looking business intelligence</p>

      {/* Pipeline */}
      <div className="mt-8 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-4">Next 30 Days Pipeline</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={pipelineData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
            <Legend wrapperStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }} />
            <Bar dataKey="confirmed" fill="#0B2A3B" name="Confirmed" />
            <Bar dataKey="pending" fill="#B8965A" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Projected Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        <div className="admin-metric-card">
          <p className="admin-metric-value" style={{ fontSize: 36 }}>{fmt(confirmedRev)}</p>
          <p className="admin-metric-label">Confirmed Revenue (this month)</p>
        </div>
        <div className="admin-metric-card">
          <p className="admin-metric-value" style={{ fontSize: 36, color: "hsl(var(--gem-gold))" }}>+{fmt(Math.round(pendingRev * closeRate))}</p>
          <p className="admin-metric-label">Pending (at {Math.round(closeRate * 100)}% close rate)</p>
        </div>
        <div className="admin-metric-card" style={{ borderLeft: "3px solid hsl(var(--gem-teal))" }}>
          <p className="admin-metric-value" style={{ fontSize: 36 }}>{fmt(projectedTotal)}</p>
          <p className="admin-metric-label">Projected Total</p>
        </div>
      </div>

      {/* Seasonal Demand */}
      <div className="mt-6 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-4">Seasonal Demand</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={seasonalData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
            <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#1A6B6B" strokeWidth={2} dot={{ fill: "#1A6B6B" }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(11,42,59,0.45)", marginTop: 8, textAlign: "center" }}>
          Peak season: December–April. Plan staffing and fleet availability accordingly.
        </p>
      </div>
    </div>
  );
};

export default AdminForecasting;
