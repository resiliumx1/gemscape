import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Customer {
  email: string; name: string; country: string; totalBookings: number; totalSpend: number; lastBooking: string; firstBooking: string;
}

const LTV_BUCKETS = ["$0–100", "$100–300", "$300–600", "$600–1,000", "$1,000+"];
const LTV_RANGES = [[0, 100], [100, 300], [300, 600], [600, 1000], [1000, Infinity]];

const AdminLoyalty = () => {
  const { format: fmt } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [tours, rentals] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("rental_bookings").select("*"),
      ]);
      const all = [...(tours.data || []).map((b: any) => ({ ...b, d: b.tour_date })), ...(rentals.data || []).map((r: any) => ({ ...r, d: r.pickup_date }))];
      const map = new Map<string, Customer>();
      all.forEach(b => {
        const e = map.get(b.email) || { email: b.email, name: b.full_name, country: b.country || "Unknown", totalBookings: 0, totalSpend: 0, lastBooking: "", firstBooking: "9999" };
        e.totalBookings++;
        e.totalSpend += Number(b.total_estimate) || 0;
        if (b.d > e.lastBooking) e.lastBooking = b.d;
        if (b.d < e.firstBooking) e.firstBooking = b.d;
        e.name = b.full_name || e.name;
        map.set(b.email, e);
      });
      setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend));
    };
    fetch();
  }, []);

  // LTV Distribution
  const ltvData = useMemo(() => LTV_BUCKETS.map((label, i) => ({
    name: label,
    count: customers.filter(c => c.totalSpend >= LTV_RANGES[i][0] && c.totalSpend < LTV_RANGES[i][1]).length,
  })), [customers]);

  // Repeat vs New
  const repeatCount = customers.filter(c => c.totalBookings >= 2).length;
  const newCount = customers.length - repeatCount;
  const repeatPct = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0;

  // Geographic
  const geoData = useMemo(() => {
    const map: Record<string, number> = {};
    customers.forEach(c => { map[c.country] = (map[c.country] || 0) + c.totalBookings; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const top10 = customers.slice(0, 10);

  return (
    <div>
      <h1 className="admin-page-title">Loyalty & LTV</h1>
      <p className="admin-page-sub">Customer lifetime value intelligence</p>

      {/* LTV Distribution */}
      <div className="mt-8 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-4">Customer Lifetime Value Distribution</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ltvData}>
            <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <YAxis tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
            <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid hsl(var(--gem-sand))" }} />
            <Bar dataKey="count" fill="#B8965A" name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="mt-6 p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <p className="admin-section-title mb-4">Top Customers Leaderboard</p>
        <div className="admin-table-wrap" style={{ border: "none" }}>
          <table className="admin-table">
            <thead><tr><th>Rank</th><th>Customer</th><th>Country</th><th>Bookings</th><th>Lifetime Spend</th><th>Last Booking</th></tr></thead>
            <tbody>
              {top10.map((c, i) => (
                <tr key={c.email}>
                  <td><span style={{ color: i < 3 ? "hsl(var(--gem-gold))" : "rgba(11,42,59,0.45)" }}>{i < 3 ? "◆ " : ""}{i + 1}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.country}</td>
                  <td>{c.totalBookings}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(c.totalSpend)}</td>
                  <td>{c.lastBooking ? format(new Date(c.lastBooking), "MMM d, yyyy") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repeat vs New + Geographic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-4">Repeat vs New Customers</p>
          <div className="flex justify-center">
            <PieChart width={200} height={200}>
              <Pie data={[{ name: "New", value: newCount }, { name: "Repeat", value: repeatCount }]} cx={100} cy={100} innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                <Cell fill="#B8965A" /><Cell fill="#1A6B6B" />
              </Pie>
              <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
            </PieChart>
          </div>
          <div className="text-center mt-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(11,42,59,0.55)" }}>
            {repeatPct}% repeat rate · {repeatCount} returning, {newCount} new
          </div>
        </div>

        <div className="p-6" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-4">Geographic Breakdown</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={geoData} layout="vertical">
              <CartesianGrid stroke="rgba(11,42,59,0.06)" strokeDasharray="4 4" />
              <XAxis type="number" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} />
              <YAxis dataKey="name" type="category" tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fill: "rgba(11,42,59,0.45)" }} width={120} />
              <Tooltip contentStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
              <Bar dataKey="value" fill="#0B2A3B" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminLoyalty;
