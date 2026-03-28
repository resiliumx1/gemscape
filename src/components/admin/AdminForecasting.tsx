import { useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

/* ── Glass tooltip ── */
const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,18,32,0.82)", backdropFilter: "blur(16px) saturate(1.3)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px",
      fontFamily: "var(--aura-font-body)", fontSize: 12, color: "#e2e8f0",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const FORECAST_DATA = [
  { name: "Jan", actual: 9800, forecast: null },
  { name: "Feb", actual: 11200, forecast: null },
  { name: "Mar", actual: 12400, forecast: null },
  { name: "Apr", actual: 14330, forecast: 14330 },
  { name: "May", actual: null, forecast: 15800 },
  { name: "Jun", actual: null, forecast: 16900 },
  { name: "Jul", actual: null, forecast: 18200 },
  { name: "Aug", actual: null, forecast: 19100 },
];

const AdminForecasting = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Q2 Highlight Banner */}
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, #3cc8b8, transparent)" }} />
        <div style={{ padding: "28px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Projected Q2
            </p>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 40, fontWeight: 800, color: "var(--aura-text)" }}>
              $48,200
            </p>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 600, color: "#40d8b8", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={15} /> +34% vs Q1
            </p>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(60,200,184,0.1)", color: "#3cc8b8",
          }}>
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="aura-glass" style={{ padding: "22px 24px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, color: "var(--aura-text)", marginBottom: 6 }}>
          Revenue Forecast
        </p>
        <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", marginBottom: 24 }}>
          Actual revenue vs projected forecast — April–August 2026
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="forecastGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4aa44" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#d4aa44" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis
              dataKey="name"
              tick={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<GlassTooltip />} />
            {/* Forecast area (gold dashed) */}
            <Area
              type="monotone" dataKey="forecast" stroke="#d4aa44" strokeWidth={2}
              strokeDasharray="6 4" fill="url(#forecastGoldGrad)" name="Forecast"
              dot={{ r: 4, fill: "#d4aa44", stroke: "#d4aa44" }}
              connectNulls={false}
            />
            {/* Actual line (teal solid) */}
            <Line
              type="monotone" dataKey="actual" stroke="#3cc8b8" strokeWidth={2.5}
              dot={{ r: 5, fill: "#3cc8b8", stroke: "rgba(10,18,32,0.6)", strokeWidth: 2 }}
              name="Actual" connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16, fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "#3cc8b8", borderRadius: 1 }} />
            <span style={{ color: "var(--aura-text-secondary)" }}>Actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "#d4aa44", borderRadius: 1, borderTop: "2px dashed #d4aa44" }} />
            <span style={{ color: "var(--aura-text-secondary)" }}>Forecast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForecasting;
