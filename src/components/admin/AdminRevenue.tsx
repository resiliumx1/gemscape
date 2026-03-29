import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachMonthOfInterval, startOfYear, subYears } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DollarSign } from "lucide-react";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(17, 24, 39, 0.95)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: 12, padding: "12px 16px",
      fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 11, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: "var(--aura-font-mono)", fontWeight: 500 }}>{p.name}: ${p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

const WEEKLY_DATA = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => ({
  name: d, revenue: Math.round(1200 + Math.random() * 2800),
}));
const MONTHLY_DATA = ["W1", "W2", "W3", "W4"].map(w => ({
  name: w, revenue: Math.round(3000 + Math.random() * 5000),
}));

const DONUT_DATA = [
  { name: "Catamaran", value: 35 },
  { name: "Dockyard", value: 25 },
  { name: "Fishing", value: 18 },
  { name: "Rainforest", value: 12 },
  { name: "Other", value: 10 },
];
const DONUT_COLORS = ["#2DD4BF", "#D4AF37", "#60A5FA", "#A78BFA", "#6B7280"];

const AdminRevenue = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { format: fmt } = useCurrency();
  const [tours, setTours] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTours(r.data || [])),
      supabase.from("rental_bookings").select("*").then(r => setRentals(r.data || [])),
    ]);
  }, []);

  const months = eachMonthOfInterval({ start: subYears(startOfYear(new Date()), 0), end: new Date() });

  const yearlyData = useMemo(() => months.map(m => {
    const ms = format(m, "yyyy-MM");
    const tRev = tours.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    const rRev = rentals.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), revenue: tRev + rRev };
  }), [tours, rentals, months]);

  const barData = useMemo(() => months.slice(0, 6).map(m => {
    const ms = format(m, "yyyy-MM");
    const rev = [...tours, ...rentals].filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
    return { name: format(m, "MMM"), revenue: rev };
  }), [tours, rentals, months]);

  const trendData = trendPeriod === "week" ? WEEKLY_DATA : trendPeriod === "month" ? MONTHLY_DATA : yearlyData;

  const kpis = [
    { label: "Monthly Revenue", value: "$14,330", change: "+22%", positive: true, glow: "#2DD4BF" },
    { label: "Avg Booking Value", value: "$520", change: "+8%", positive: true, glow: "#D4AF37" },
    { label: "Conversion Rate", value: "68%", change: "-2%", positive: false, glow: "#60A5FA" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 16 }}>
        {kpis.map((k, idx) => (
          <div key={k.label} className="aura-glass" style={{ padding: "0", overflow: "hidden", gridColumn: isMobile && idx === 2 ? "1 / -1" : "auto", borderLeft: `3px solid ${k.glow}` }}>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{k.label}</p>
                <span style={{
                  fontFamily: "var(--aura-font-mono)", fontSize: 11, fontWeight: 500,
                  color: k.positive ? "var(--aura-success)" : "var(--aura-danger)",
                }}>
                  {k.change}
                </span>
              </div>
              <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 28, fontWeight: 500, color: "var(--aura-text)", margin: 0, letterSpacing: "-0.01em" }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <div className="aura-glass" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)" }}>Revenue Trend</p>
          <div style={{ display: "flex", gap: 4 }}>
            {(["week", "month", "year"] as const).map(p => (
              <button key={p} onClick={() => setTrendPeriod(p)} className={`aura-period-btn ${trendPeriod === p ? "active" : ""}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3cc8b8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3cc8b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--aura-grid-stroke)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
            <Tooltip content={<GlassTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#3cc8b8" strokeWidth={2} fill="url(#tealGrad)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Bar + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 20 }}>Monthly Breakdown</p>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
            <BarChart data={barData}>
              <CartesianGrid stroke="var(--aura-grid-stroke)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="revenue" fill="#3cc8b8" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 20 }}>Revenue by Tour Type</p>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
            <ResponsiveContainer width={isMobile ? "100%" : "50%"} height={220}>
              <PieChart>
                <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                  {DONUT_DATA.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, width: "100%" }}>
              {DONUT_DATA.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: DONUT_COLORS[i] }} />
                    <span style={{ color: "var(--aura-text-dim)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--aura-text)" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
