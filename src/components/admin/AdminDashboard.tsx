import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, startOfWeek, startOfYear, subMonths, eachDayOfInterval, eachMonthOfInterval, formatDistanceToNow } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import {
  DollarSign, CalendarDays, UserPlus, Compass, GripVertical,
  ArrowUp, ArrowDown, Download, Star, Check, Plus,
  CreditCard, UserCheck, XCircle, MessageSquare, FileText,
} from "lucide-react";

type ChartRange = "week" | "month" | "year";

interface AdminDashboardProps {
  onNewBooking?: () => void;
  isMobile?: boolean;
  setNav?: (key: string) => void;
}

/* ── Drag-and-Drop Hook ── */
const useDragReorder = (initialOrder: string[]) => {
  const [order, setOrder] = useState(initialOrder);
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  const onDragStart = (id: string) => { dragItem.current = id; };
  const onDragEnter = (id: string) => { dragOver.current = id; };
  const onDragEnd = () => {
    if (dragItem.current && dragOver.current && dragItem.current !== dragOver.current) {
      setOrder(prev => {
        const copy = [...prev];
        const fromIdx = copy.indexOf(dragItem.current!);
        const toIdx = copy.indexOf(dragOver.current!);
        copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, dragItem.current!);
        return copy;
      });
    }
    dragItem.current = null;
    dragOver.current = null;
  };

  return { order, onDragStart, onDragEnter, onDragEnd };
};

/* ── DragHandle ── */
const DragHandle = ({ hidden }: { hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <div style={{
      position: "absolute", top: 14, left: 14, opacity: 0.3,
      cursor: "grab", color: "var(--aura-text-muted)",
    }}>
      <GripVertical size={16} />
    </div>
  );
};

/* ── Glass Card Wrapper ── */
const DashCard = ({
  id, children, onDragStart, onDragEnter, onDragEnd, style, isMobile,
}: {
  id: string; children: React.ReactNode;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
  style?: React.CSSProperties;
  isMobile?: boolean;
}) => (
  <div
    draggable={!isMobile}
    onDragStart={() => !isMobile && onDragStart(id)}
    onDragEnter={() => !isMobile && onDragEnter(id)}
    onDragEnd={() => !isMobile && onDragEnd()}
    onDragOver={(e) => e.preventDefault()}
    className="aura-card"
    style={{ position: "relative", cursor: "default", ...style }}
  >
    <DragHandle hidden={isMobile} />
    <div style={{ paddingLeft: isMobile ? 0 : 20 }}>{children}</div>
  </div>
);

/* ── KPI Card — Left border accent, monospace metrics ── */
const KpiCard = ({ label, value, change, accentColor }: {
  icon: React.ReactNode; label: string; value: string | number;
  change: number; glowColor: string; accentColor: string;
}) => (
  <div className="aura-card" style={{ position: "relative", overflow: "hidden", padding: "20px 20px 16px", borderLeft: `3px solid ${accentColor}` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <p style={{
        fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
        color: "var(--aura-text-muted)", textTransform: "uppercase",
        letterSpacing: "0.05em", margin: 0,
      }}>
        {label}
      </p>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        fontFamily: "var(--aura-font-mono)", fontSize: 11, fontWeight: 500,
        color: change >= 0 ? "var(--aura-success)" : "var(--aura-danger)",
      }}>
        {change >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
        {Math.abs(change)}%
      </div>
    </div>
    <p style={{
      fontFamily: "var(--aura-font-mono)", fontSize: 28, fontWeight: 500,
      color: "var(--aura-text)", lineHeight: 1, margin: 0, letterSpacing: "-0.01em",
    }}>
      {value}
    </p>
  </div>
);

/* ── Activity Item Icons ── */
const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  booking: { icon: <CalendarDays size={14} />, color: "var(--aura-teal)" },
  payment: { icon: <CreditCard size={14} />, color: "var(--aura-success)" },
  client: { icon: <UserCheck size={14} />, color: "var(--aura-info)" },
  cancel: { icon: <XCircle size={14} />, color: "var(--aura-danger)" },
  review: { icon: <MessageSquare size={14} />, color: "var(--aura-gold)" },
};

/* ── Dashboard ── */
const AdminDashboard = ({ onNewBooking, isMobile = false, setNav }: AdminDashboardProps) => {
  const { format: formatPrice } = useCurrency();
  const [chartRange, setChartRange] = useState<ChartRange>("month");
  const [tourBookings, setTourBookings] = useState<any[]>([]);
  const [rentalBookings, setRentalBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState([
    { id: "1", text: "Confirm Johnson tour pickup", done: false },
    { id: "2", text: "Send invoice for rental #GR-2847", done: false },
    { id: "3", text: "Update fleet availability", done: true },
    { id: "4", text: "Review concierge request", done: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const { order, onDragStart, onDragEnter, onDragEnd } = useDragReorder([
    "kpi", "revenue", "activity", "tasks", "tours", "reports"
  ]);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").then(r => setTourBookings(r.data || [])),
      supabase.from("rental_bookings").select("*, vehicles(name)").then(r => setRentalBookings(r.data || [])),
    ]);

    const channel = supabase
      .channel("admin-dashboard-v2")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        setTourBookings(prev => [payload.new as any, ...prev]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rental_bookings" }, (payload) => {
        setRentalBookings(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  /* Computed metrics */
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const prevMonthStart = subMonths(startOfMonth(now), 1).toISOString();

  const allBookings = [...tourBookings, ...rentalBookings];
  const periodBookings = allBookings.filter(b => b.created_at >= monthStart && b.status !== "cancelled");
  const prevBookings = allBookings.filter(b => b.created_at >= prevMonthStart && b.created_at < monthStart && b.status !== "cancelled");

  const totalRevenue = periodBookings.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const prevRevenue = prevBookings.reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
  const revChange = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 12;

  const activeBookings = allBookings.filter(b => b.status === "confirmed" || b.status === "active").length;

  const thisMonthEmails = new Set(periodBookings.map(b => b.email));
  const prevEmails = new Set(prevBookings.map(b => b.email));
  const newClients = [...thisMonthEmails].filter(e => !prevEmails.has(e)).length;

  const activeTours = tourBookings.filter(b => b.status === "confirmed" || b.status === "active").length;

  /* Chart data */
  const chartData = useMemo(() => {
    const start = chartRange === "year" ? startOfYear(now) :
                  chartRange === "month" ? startOfMonth(now) :
                  startOfWeek(now, { weekStartsOn: 0 });

    if (chartRange === "year") {
      return eachMonthOfInterval({ start, end: now }).map(month => {
        const ms = format(month, "yyyy-MM");
        const rev = allBookings.filter(b => b.created_at?.startsWith(ms) && b.status !== "cancelled")
          .reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
        return { name: format(month, "MMM"), revenue: rev };
      });
    }

    const days = eachDayOfInterval({ start, end: now });
    if (chartRange === "week") {
      return days.map(day => {
        const ds = format(day, "yyyy-MM-dd");
        const rev = allBookings.filter(b => b.created_at?.startsWith(ds) && b.status !== "cancelled")
          .reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
        return { name: format(day, "EEE"), revenue: rev };
      });
    }

    const weeks: { name: string; revenue: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const wStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7);
      const wEnd = new Date(wStart.getTime() + 7 * 86400000);
      const rev = allBookings.filter(b => {
        const d = b.created_at;
        return d >= wStart.toISOString() && d < wEnd.toISOString() && b.status !== "cancelled";
      }).reduce((s, b) => s + (Number(b.total_estimate) || 0), 0);
      weeks.push({ name: `W${w + 1}`, revenue: rev });
    }
    return weeks;
  }, [tourBookings, rentalBookings, chartRange]);

  /* Activity feed */
  const activityFeed = useMemo(() => {
    return allBookings
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 6)
      .map(b => ({
        type: b.status === "cancelled" ? "cancel" : "booking",
        text: `${b.full_name} booked ${b.service_type || "Rental"}`,
        detail: b.email,
        time: b.created_at ? formatDistanceToNow(new Date(b.created_at), { addSuffix: true }) : "recently",
      }));
  }, [tourBookings, rentalBookings]);

  /* Tasks */
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };
  const remaining = tasks.filter(t => !t.done).length;

  /* Top tours */
  const topTours = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    tourBookings.forEach(b => {
      const key = b.service_type || "Tour";
      if (!counts[key]) counts[key] = { count: 0, revenue: 0 };
      counts[key].count++;
      counts[key].revenue += Number(b.total_estimate) || 0;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([name, data]) => ({ name, ...data, rating: 4.5 + Math.random() * 0.5 }));
  }, [tourBookings]);

  /* Generate report handler */
  const handleGenerate = (title: string) => {
    toast("Report generating…", { description: `Preparing ${title}` });
    setTimeout(() => toast.success(`${title} ready!`), 2000);
  };

  /* Render cards by order */
  const cardMap: Record<string, React.ReactNode> = {
    kpi: (
      <div key="kpi" style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 14 }}>
        <KpiCard icon={<DollarSign size={18} color="var(--aura-teal)" />} label="Total Revenue" value={formatPrice(totalRevenue)} change={revChange} glowColor="rgba(44,184,168,0.2)" accentColor="var(--aura-teal)" />
        <KpiCard icon={<CalendarDays size={18} color="var(--aura-gold)" />} label="Active Bookings" value={activeBookings} change={8} glowColor="rgba(184,149,106,0.2)" accentColor="var(--aura-gold)" />
        <KpiCard icon={<UserPlus size={18} color="var(--aura-info)" />} label="New Clients" value={newClients || 3} change={15} glowColor="rgba(88,184,232,0.2)" accentColor="var(--aura-info)" />
        <KpiCard icon={<Compass size={18} color="var(--aura-teal-bright, #48dac8)" />} label="Active Tours" value={activeTours} change={-5} glowColor="rgba(72,218,200,0.2)" accentColor="var(--aura-teal-bright, #48dac8)" />
      </div>
    ),

    revenue: (
      <DashCard key="revenue" id="revenue" onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} isMobile={isMobile}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="aura-heading aura-h3">Revenue Overview</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {(["week", "month", "year"] as ChartRange[]).map(r => (
              <button key={r} onClick={() => setChartRange(r)} className={`aura-period-btn ${chartRange === r ? "active" : ""}`}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="auraRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2cb8a8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2cb8a8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--aura-grid-stroke)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "var(--aura-font-mono)", fontSize: 11, fill: "var(--aura-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{
                background: "rgba(6,22,28,0.92)", backdropFilter: "blur(14px)",
                border: "1px solid var(--aura-glass-border)", borderRadius: 12,
                fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text)",
                boxShadow: "var(--aura-card-shadow)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#2cb8a8" strokeWidth={2} fill="url(#auraRevGrad)" dot={{ r: 3, fill: "#2cb8a8", stroke: "#061a20", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </DashCard>
    ),

    activity: (
      <DashCard key="activity" id="activity" onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} isMobile={isMobile}>
        <h3 className="aura-heading aura-h3" style={{ marginBottom: 14 }}>Recent Activity</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {activityFeed.length === 0 && (
            <p className="aura-body" style={{ color: "var(--aura-text-muted)" }}>No recent activity</p>
          )}
          {activityFeed.map((item, i) => {
            const cfg = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.booking;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--aura-border-light, rgba(120,200,200,0.07))" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: cfg.color, flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text)", lineHeight: 1.3 }}>
                    {item.text}
                  </p>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginTop: 2 }}>
                    {item.detail}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 10, color: "var(--aura-text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </DashCard>
    ),

    tasks: (
      <DashCard key="tasks" id="tasks" onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} isMobile={isMobile}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="aura-heading aura-h3">Tasks</h3>
          <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>
            {remaining} remaining
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                cursor: "pointer", borderBottom: "1px solid var(--aura-border-light, rgba(120,200,200,0.07))",
                minHeight: isMobile ? 44 : "auto",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: t.done ? "none" : "1.5px solid var(--aura-glass-border)",
                background: t.done ? "var(--aura-teal)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
              }}>
                {t.done && <Check size={12} color="#fff" />}
              </div>
              <span style={{
                fontFamily: "var(--aura-font-body)", fontSize: 12,
                color: t.done ? "var(--aura-text-muted)" : "var(--aura-text)",
                textDecoration: t.done ? "line-through" : "none",
                transition: "all 0.2s",
              }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            className="aura-input"
            style={{ flex: 1, fontSize: 12, minHeight: isMobile ? 44 : "auto" }}
            placeholder="Add a task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
          />
          <button onClick={addTask} disabled={!newTask.trim()} className="aura-btn aura-btn--primary" style={{ padding: "8px 14px", opacity: newTask.trim() ? 1 : 0.5, minHeight: isMobile ? 44 : "auto" }}>
            <Plus size={14} />
          </button>
        </div>
      </DashCard>
    ),

    tours: (
      <DashCard key="tours" id="tours" onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} isMobile={isMobile}>
        <h3 className="aura-heading aura-h3" style={{ marginBottom: 14 }}>Top Tours</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
          {(topTours.length > 0 ? topTours : [
            { name: "Circumnavigation Tour", count: 0, revenue: 0, rating: 4.8 },
            { name: "Private Charter", count: 0, revenue: 0, rating: 4.9 },
            { name: "Half-Day Tour", count: 0, revenue: 0, rating: 4.6 },
          ]).map((tour, i) => (
            <div key={i} style={{
              background: "var(--aura-highlight)", border: "1px solid var(--aura-glass-border)",
              borderRadius: 14, padding: 16, textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: "var(--aura-text)", marginBottom: 6 }}>
                {tour.name}
              </p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 18, fontWeight: 800, color: "var(--aura-teal)" }}>
                {formatPrice(tour.revenue)}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 }}>
                <Star size={12} color="var(--aura-gold)" fill="var(--aura-gold)" />
                <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-dim)" }}>
                  {tour.rating.toFixed(1)}
                </span>
                <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 10, color: "var(--aura-text-muted)", marginLeft: 4 }}>
                  {tour.count} bookings
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    ),

    reports: (
      <DashCard key="reports" id="reports" onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} isMobile={isMobile}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="aura-heading aura-h3">Quick Reports</h3>
          {setNav && (
            <button onClick={() => setNav("reports")} className="aura-btn aura-btn--ghost" style={{ fontSize: 11, padding: "4px 12px" }}>
              Full Reports
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
          {[
            { icon: <FileText size={18} color="var(--aura-teal)" />, title: "Weekly Summary", desc: "Revenue, bookings & trends" },
            { icon: <UserPlus size={18} color="var(--aura-info)" />, title: "Client Report", desc: "New & returning guests" },
            { icon: <Compass size={18} color="var(--aura-gold)" />, title: "Tour Performance", desc: "Ratings & occupancy" },
          ].map((report, i) => (
            <div key={i} style={{
              background: "var(--aura-highlight)", border: "1px solid var(--aura-glass-border)",
              borderRadius: 14, padding: 16,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10,
              }}>
                {report.icon}
              </div>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: "var(--aura-text)", marginBottom: 4 }}>
                {report.title}
              </p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginBottom: 12, lineHeight: 1.4 }}>
                {report.desc}
              </p>
              <button onClick={() => handleGenerate(report.title)} className="aura-btn aura-btn--ghost" style={{ fontSize: 11, padding: "6px 14px", width: "100%", justifyContent: "center" }}>
                <Download size={12} />
                Generate
              </button>
            </div>
          ))}
        </div>
      </DashCard>
    ),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {order.map(id => cardMap[id])}
    </div>
  );
};

/* ── Status Badge (exported for other admin components) ── */
const StatusPill = ({ status }: { status: string }) => {
  const classMap: Record<string, string> = {
    pending: "aura-status--pending",
    confirmed: "aura-status--confirmed",
    completed: "aura-status--completed",
    cancelled: "aura-status--cancelled",
  };
  return <span className={`aura-status ${classMap[status] || classMap.pending}`}>{status}</span>;
};

export const StatusBadge = ({ status }: { status: string }) => <StatusPill status={status} />;

export default AdminDashboard;
