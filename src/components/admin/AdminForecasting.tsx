import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowUp } from "lucide-react";

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
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden", borderLeft: "3px solid var(--aura-teal)" }}>
        <div style={{ padding: "28px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Projected Q2
            </p>
            <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 40, fontWeight: 500, color: "var(--aura-text)", letterSpacing: "-0.02em" }}>
              $48,200
            </p>
            <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 13, fontWeight: 500, color: "var(--aura-success)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowUp size={14} /> +34% vs Q1
            </p>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="aura-glass" style={{ padding: "24px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, fontWeight: 600, color: "var(--aura-text)", marginBottom: 4, letterSpacing: "-0.02em" }}>
          Revenue Forecast
        </p>
        <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)", marginBottom: 28 }}>
          Actual revenue vs projected forecast — April–August 2026
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="forecastBronzeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b8956a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#b8956a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--aura-grid-stroke)" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: "var(--aura-font-mono)", fontSize: 11, fill: "var(--aura-text-muted)" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<GlassTooltip />} />
            <Area
              type="monotone" dataKey="forecast" stroke="#b8956a" strokeWidth={2}
              strokeDasharray="6 4" fill="url(#forecastBronzeGrad)" name="Forecast"
              dot={{ r: 4, fill: "#b8956a", stroke: "#061a20", strokeWidth: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone" dataKey="actual" stroke="#2cb8a8" strokeWidth={2.5}
              dot={{ r: 5, fill: "#2cb8a8", stroke: "#061a20", strokeWidth: 2 }}
              name="Actual" connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20, fontFamily: "var(--aura-font-body)", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "#2cb8a8", borderRadius: 1 }} />
            <span style={{ color: "var(--aura-text-dim)" }}>Actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "#b8956a", borderRadius: 1, borderTop: "2px dashed #b8956a" }} />
            <span style={{ color: "var(--aura-text-dim)" }}>Forecast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForecasting;
