import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Diamond, Repeat, DollarSign, Users, Hash } from "lucide-react";

interface Customer {
  email: string; name: string; country: string; totalBookings: number; totalSpend: number; lastBooking: string; firstBooking: string;
}

const LTV_BUCKETS = ["$0–100", "$100–300", "$300–600", "$600–1k", "$1k+"];
const LTV_RANGES = [[0, 100], [100, 300], [300, 600], [600, 1000], [1000, Infinity]];

const AdminLoyalty = () => {
  const { format: fmt } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
      setLoaded(true);
    };
    fetchData();
  }, []);

  const repeatCount = customers.filter(c => c.totalBookings >= 2).length;
  const newCount = customers.length - repeatCount;
  const repeatPct = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0;
  const avgLTV = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.totalSpend, 0) / customers.length) : 0;
  const topGuest = customers[0];
  const avgBookings = customers.length > 0 ? (customers.reduce((s, c) => s + c.totalBookings, 0) / customers.length).toFixed(1) : "0";

  const ltvData = useMemo(() => LTV_BUCKETS.map((label, i) => ({
    name: label,
    count: customers.filter(c => c.totalSpend >= LTV_RANGES[i][0] && c.totalSpend < LTV_RANGES[i][1]).length,
  })), [customers]);

  const geoData = useMemo(() => {
    const map: Record<string, number> = {};
    customers.forEach(c => { map[c.country] = (map[c.country] || 0) + c.totalBookings; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const top10 = customers.slice(0, 10);
  const hasData = customers.length > 0;

  const MetricCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
    <div className="admin-card-elevated" style={{ padding: "16px 18px" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: "#1a8a9e" }} />
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{hasData ? value : "—"}</p>
      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{hasData ? (sub || "") : "Awaiting data"}</p>
    </div>
  );

  if (!loaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#1a8a9e", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard icon={Repeat} label="Repeat Rate" value={`${repeatPct}%`} sub={`${repeatCount} returning`} />
        <MetricCard icon={DollarSign} label="Avg Lifetime Value" value={fmt(avgLTV)} />
        <MetricCard icon={Users} label="Top Guest" value={topGuest?.name || "—"} sub={topGuest ? fmt(topGuest.totalSpend) : ""} />
        <MetricCard icon={Hash} label="Avg Bookings/Guest" value={avgBookings} />
      </div>

      {hasData ? (
        <>
          {/* LTV Distribution */}
          <div className="admin-card-elevated p-5 mb-5">
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Customer Lifetime Value Distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ltvData}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 13, border: "0.5px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#1a8a9e" name="Customers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Table */}
          <div className="admin-card-elevated p-5 mb-5">
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Top 10 Guests by LTV</p>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead><tr><th>Rank</th><th>Guest</th><th>Bookings</th><th>Total Spend</th><th>Last Booking</th></tr></thead>
              <tbody>
                {top10.map((c, i) => (
                  <tr key={c.email}>
                    <td style={{ color: i < 3 ? "#C9A84C" : "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.totalBookings}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(c.totalSpend)}</td>
                    <td>{c.lastBooking ? format(new Date(c.lastBooking), "MMM d, yyyy") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Repeat vs New */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="admin-card-elevated p-5">
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Repeat vs New</p>
              <div className="flex justify-center">
                <PieChart width={180} height={180}>
                  <Pie data={[{ name: "New", value: newCount }, { name: "Repeat", value: repeatCount }]} cx={90} cy={90} innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                    <Cell fill="#e5e7eb" /><Cell fill="#1a8a9e" />
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 13 }} />
                </PieChart>
              </div>
              <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 8 }}>{repeatPct}% repeat · {repeatCount} returning, {newCount} new</p>
            </div>

            <div className="admin-card-elevated p-5">
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12 }}>Geographic Breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={geoData} layout="vertical">
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 13 }} />
                  <Bar dataKey="value" fill="#0f172a" name="Bookings" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="admin-card-elevated" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
          <Diamond size={36} style={{ color: "#e5e7eb", marginBottom: 16 }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Your top guests will appear here</p>
          <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 360 }}>Loyalty metrics and lifetime value analysis will populate after your first confirmed bookings.</p>
        </div>
      )}
    </div>
  );
};

export default AdminLoyalty;
