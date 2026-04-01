import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, eachMonthOfInterval, startOfYear, endOfYear, subYears } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(6,22,28,0.92)", backdropFilter: "blur(14px)",
      border: "1px solid var(--aura-glass-border)", borderRadius: 12, padding: "12px 16px",
      fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text)",
      boxShadow: "var(--aura-card-shadow)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 11, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: "var(--aura-font-mono)", fontWeight: 500 }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const BREAKDOWN_COLORS = { tours: "#2cb8a8", rentals: "#b8956a", packages: "#a07850", concierge: "#8b5cf6" };
const STORAGE_KEY = "gemscape-forecast-projections";

type ViewMode = "monthly" | "quarterly" | "yearly";

const AdminForecasting = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [tours, setTours] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [customProjections, setCustomProjections] = useState<Record<string, { tours: number; rentals: number; packages: number }>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTours(r.data || [])),
      supabase.from("rental_bookings").select("*").then(r => setRentals(r.data || [])),
      supabase.from("package_bookings").select("*").then(r => setPackages(r.data || [])),
    ]);
  }, []);

  const months = useMemo(() => eachMonthOfInterval({ start: startOfYear(new Date()), end: endOfYear(new Date()) }), []);

  const monthlyActuals = useMemo(() => {
    return months.map(m => {
      const ms = format(m, "yyyy-MM");
      const now = new Date();
      const isPast = m <= now;
      const tRev = tours.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
      const rRev = rentals.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
      const pRev = packages.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled").reduce((s, b) => s + (Number(b.total_price) || 0), 0);
      return { month: format(m, "MMM"), key: format(m, "yyyy-MM"), tours: tRev, rentals: rRev, packages: pRev, total: tRev + rRev + pRev, isPast };
    });
  }, [tours, rentals, packages, months]);

  // Auto-forecast: 3-month rolling average × 1.05
  const forecastData = useMemo(() => {
    const pastMonths = monthlyActuals.filter(m => m.isPast && m.total > 0);
    const lastThree = pastMonths.slice(-3);
    const avg = lastThree.length > 0 ? lastThree.reduce((s, m) => s + m.total, 0) / lastThree.length : 0;

    return monthlyActuals.map((m, i) => {
      const custom = customProjections[m.key];
      if (m.isPast && m.total > 0) {
        return { ...m, actual: m.total, forecast: null };
      }
      // Transition month (last actual)
      if (m.isPast && m.total === 0 && i > 0) {
        const fc = custom ? custom.tours + custom.rentals + custom.packages : Math.round(avg * Math.pow(1.05, i - pastMonths.length + 1));
        return { ...m, actual: null, forecast: fc };
      }
      const fc = custom ? custom.tours + custom.rentals + custom.packages : Math.round(avg * Math.pow(1.05, i - pastMonths.length + 1));
      return { ...m, actual: null, forecast: fc > 0 ? fc : null };
    });
  }, [monthlyActuals, customProjections]);

  // Aggregate for quarterly/yearly
  const chartData = useMemo(() => {
    if (viewMode === "monthly") return forecastData;
    if (viewMode === "quarterly") {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      return quarters.map((q, qi) => {
        const qMonths = forecastData.slice(qi * 3, qi * 3 + 3);
        const actual = qMonths.every(m => m.actual !== null) ? qMonths.reduce((s, m) => s + (m.actual || 0), 0) : null;
        const forecast = qMonths.some(m => m.forecast !== null) ? qMonths.reduce((s, m) => s + (m.forecast || 0), 0) : null;
        return { month: q, actual, forecast };
      });
    }
    // yearly - just show total
    const totalActual = forecastData.reduce((s, m) => s + (m.actual || 0), 0);
    const totalForecast = forecastData.reduce((s, m) => s + (m.forecast || 0), 0);
    return [{ month: "2026", actual: totalActual || null, forecast: totalForecast || null }];
  }, [forecastData, viewMode]);

  // KPIs
  const projectedAnnual = useMemo(() => forecastData.reduce((s, m) => s + (m.actual || m.forecast || 0), 0), [forecastData]);
  const bestMonth = useMemo(() => {
    const best = [...forecastData].sort((a, b) => (b.actual || b.forecast || 0) - (a.actual || a.forecast || 0))[0];
    return best ? { name: best.month, value: best.actual || best.forecast || 0 } : { name: "—", value: 0 };
  }, [forecastData]);
  const avgMonthly = useMemo(() => Math.round(projectedAnnual / 12), [projectedAnnual]);
  const pastMonthsData = monthlyActuals.filter(m => m.isPast && m.total > 0);
  const growthRate = useMemo(() => {
    if (pastMonthsData.length < 2) return 0;
    const last = pastMonthsData[pastMonthsData.length - 1].total;
    const prev = pastMonthsData[pastMonthsData.length - 2].total;
    return prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  }, [pastMonthsData]);

  // Breakdown for donut
  const breakdown = useMemo(() => {
    const t = monthlyActuals.reduce((s, m) => s + m.tours, 0);
    const r = monthlyActuals.reduce((s, m) => s + m.rentals, 0);
    const p = monthlyActuals.reduce((s, m) => s + m.packages, 0);
    return [
      { name: "Tours", value: t, color: BREAKDOWN_COLORS.tours },
      { name: "Rentals", value: r, color: BREAKDOWN_COLORS.rentals },
      { name: "Packages", value: p, color: BREAKDOWN_COLORS.packages },
    ].filter(d => d.value > 0);
  }, [monthlyActuals]);

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customProjections));
  };
  const resetProjections = () => {
    setCustomProjections({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const kpis = [
    { label: "Projected Annual", value: `$${projectedAnnual.toLocaleString()}`, icon: <DollarSign size={18} />, glow: "var(--aura-teal)" },
    { label: "Best Month", value: `${bestMonth.name} · $${bestMonth.value.toLocaleString()}`, icon: <TrendingUp size={18} />, glow: "var(--aura-gold)" },
    { label: "Avg Monthly", value: `$${avgMonthly.toLocaleString()}`, icon: <Calendar size={18} />, glow: "var(--aura-info)" },
    { label: "Growth Rate", value: `${growthRate >= 0 ? "+" : ""}${growthRate}%`, icon: growthRate >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />, glow: growthRate >= 0 ? "var(--aura-success)" : "var(--aura-danger)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
        {kpis.map((k, idx) => (
          <div key={k.label} className="aura-glass" style={{ padding: 0, overflow: "hidden", borderLeft: `3px solid ${k.glow}` }}>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{k.label}</p>
                  <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 22, fontWeight: 500, color: "var(--aura-text)", letterSpacing: "-0.02em" }}>{k.value}</p>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--aura-highlight)", color: k.glow }}>{k.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Chart */}
      <div className="aura-glass" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, fontWeight: 600, color: "var(--aura-text)", letterSpacing: "-0.02em" }}>Revenue Forecast</p>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)", marginTop: 4 }}>Actual revenue vs projected forecast — {new Date().getFullYear()}</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["monthly", "quarterly", "yearly"] as const).map(p => (
              <button key={p} onClick={() => setViewMode(p)} style={{
                fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: viewMode === p ? 600 : 400,
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${viewMode === p ? "rgba(60,200,184,0.4)" : "var(--aura-glass-border)"}`,
                background: viewMode === p ? "rgba(60,200,184,0.1)" : "transparent",
                color: viewMode === p ? "#3cc8b8" : "var(--aura-text-muted)", textTransform: "capitalize",
              }}>{p}</button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={isMobile ? 260 : 340}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fcTealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2cb8a8" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2cb8a8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fcBronzeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b8956a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#b8956a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--aura-grid-stroke)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "var(--aura-font-mono)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<GlassTooltip />} />
            <Area type="monotone" dataKey="forecast" stroke="#b8956a" strokeWidth={2} strokeDasharray="6 4" fill="url(#fcBronzeGrad)" name="Forecast" dot={{ r: 4, fill: "#b8956a", stroke: "#061a20", strokeWidth: 2 }} connectNulls={false} />
            <Area type="monotone" dataKey="actual" stroke="#2cb8a8" strokeWidth={2.5} fill="url(#fcTealGrad)" name="Actual" dot={{ r: 5, fill: "#2cb8a8", stroke: "#061a20", strokeWidth: 2 }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20, fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "#2cb8a8", borderRadius: 1 }} />
            <span style={{ color: "var(--aura-text-dim)" }}>Actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 0, borderTop: "2px dashed #b8956a" }} />
            <span style={{ color: "var(--aura-text-dim)" }}>Forecast</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Breakdown + Projection Editor */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        {/* Revenue Breakdown Donut */}
        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 20 }}>Revenue Breakdown</p>
          {breakdown.length === 0 ? (
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)", textAlign: "center", padding: 40 }}>No revenue data yet</p>
          ) : (
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
              <ResponsiveContainer width={isMobile ? "100%" : "50%"} height={200}>
                <PieChart>
                  <Pie data={breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" stroke="none">
                    {breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {breakdown.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                      <span style={{ color: "var(--aura-text-dim)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 500, color: "var(--aura-text)", fontFamily: "var(--aura-font-mono)" }}>${d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Projection Editor */}
        <div className="aura-glass" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)" }}>Custom Projections</p>
            <button onClick={() => setShowEditor(!showEditor)} style={{
              fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 8, cursor: "pointer",
              border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-muted)",
            }}>{showEditor ? "Collapse" : "Expand"}</button>
          </div>

          {showEditor && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Month", "Tours", "Rentals", "Packages", "Total"].map(h => (
                        <th key={h} style={{ padding: "8px 6px", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid var(--aura-glass-border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyActuals.filter(m => !m.isPast || m.total === 0).map(m => {
                      const cp = customProjections[m.key] || { tours: 0, rentals: 0, packages: 0 };
                      const setCP = (field: string, val: number) => {
                        setCustomProjections(prev => ({ ...prev, [m.key]: { ...cp, [field]: val } }));
                      };
                      return (
                        <tr key={m.key} style={{ borderBottom: "1px solid var(--aura-glass-border)" }}>
                          <td style={{ padding: "8px 6px", color: "var(--aura-text)" }}>{m.month}</td>
                          {["tours", "rentals", "packages"].map(f => (
                            <td key={f} style={{ padding: "4px 4px" }}>
                              <input type="number" value={(cp as any)[f] || ""} onChange={e => setCP(f, Number(e.target.value) || 0)} placeholder="0" style={{
                                width: "100%", padding: "6px 8px", borderRadius: 6, fontSize: 12,
                                fontFamily: "var(--aura-font-mono)", color: "var(--aura-text)",
                                background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none",
                              }} />
                            </td>
                          ))}
                          <td style={{ padding: "8px 6px", fontFamily: "var(--aura-font-mono)", fontWeight: 500, color: "var(--aura-text)" }}>
                            ${(cp.tours + cp.rentals + cp.packages).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={saveDraft} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, padding: "10px",
                  borderRadius: "var(--aura-radius-btn)", border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, var(--aura-teal), #1a9a8a)", color: "#fff", minHeight: 44,
                }}>Save Draft</button>
                <button onClick={resetProjections} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, padding: "10px",
                  borderRadius: "var(--aura-radius-btn)", border: "1px solid var(--aura-glass-border)",
                  background: "transparent", color: "var(--aura-text-dim)", cursor: "pointer", minHeight: 44,
                }}>Reset to Auto</button>
              </div>
            </>
          )}
          {!showEditor && (
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)" }}>
              Override auto-forecast values with your own projections for future months.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForecasting;
