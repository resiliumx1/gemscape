import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachMonthOfInterval, startOfYear, subYears } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DollarSign, TrendingUp, Target } from "lucide-react";

/* ── Glass tooltip ── */
const GlassTooltip = ({ active, payload, label, fmt }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,18,32,0.82)", backdropFilter: "blur(16px) saturate(1.3)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px",
      fontFamily: "var(--aura-font-body)", fontSize: 12, color: "#e2e8f0",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {fmt ? fmt(p.value) : `$${p.value.toLocaleString()}`}</p>
      ))}
    </div>
  );
};

/* ── Sample data generators ── */
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
const DONUT_COLORS = ["#3cc8b8", "#d4aa44", "#60b8f0", "#a78bfa", "#94a3b8"];

const AdminRevenue = () => {
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
    { label: "Monthly Revenue", value: "$14,330", change: "+22%", positive: true, icon: <DollarSign size={18} />, glow: "#3cc8b8" },
    { label: "Avg Booking Value", value: "$520", change: "+8%", positive: true, icon: <TrendingUp size={18} />, glow: "#d4aa44" },
    { label: "Conversion Rate", value: "68%", change: "-2%", positive: false, icon: <Target size={18} />, glow: "#60b8f0" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {kpis.map(k => (
          <div key={k.label} className="aura-glass" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${k.glow}, transparent)` }} />
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{k.label}</p>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 28, fontWeight: 800, color: "var(--aura-text)" }}>{k.value}</p>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", color: k.glow }}>
                  {k.icon}
                </div>
              </div>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, color: k.positive ? "#40d8b8" : "#f06868", marginTop: 8 }}>
                {k.change} <span style={{ fontWeight: 400, color: "var(--aura-text-muted)", fontSize: 11 }}>vs last month</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <div className="aura-glass" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, color: "var(--aura-text)" }}>Revenue Trend</p>
          <div style={{ display: "flex", gap: 4 }}>
            {(["week", "month", "year"] as const).map(p => (
              <button key={p} onClick={() => setTrendPeriod(p)} style={{
                fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: trendPeriod === p ? 600 : 400,
                padding: "6px 14px", borderRadius: 8, border: "1px solid",
                borderColor: trendPeriod === p ? "rgba(60,200,184,0.4)" : "rgba(255,255,255,0.08)",
                background: trendPeriod === p ? "rgba(60,200,184,0.12)" : "transparent",
                color: trendPeriod === p ? "#3cc8b8" : "var(--aura-text-muted)", cursor: "pointer",
                transition: "all 0.2s",
              }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3cc8b8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3cc8b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
            <Tooltip content={<GlassTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#3cc8b8" strokeWidth={2} fill="url(#tealGrad)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Bar + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Monthly Bar */}
        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 20 }}>Monthly Breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="revenue" fill="#3cc8b8" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 20 }}>Revenue by Tour Type</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                  {DONUT_DATA.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {DONUT_DATA.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: DONUT_COLORS[i] }} />
                    <span style={{ color: "var(--aura-text-secondary)" }}>{d.name}</span>
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
