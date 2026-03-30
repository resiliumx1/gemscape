import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  startOfWeek, endOfWeek, isSameMonth, isToday, addDays, subDays, addWeeks, subWeeks,
  isSameDay, getHours,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, MessageSquare, Check, X, Users } from "lucide-react";

interface CalendarBooking {
  id: string; date: string; guest: string; service: string; status: string;
  time: string; guests: number; amount: number; email: string;
}

type CalView = "month" | "week" | "day";

const STATUS_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: "rgba(60,216,180,0.15)", border: "var(--aura-success)", text: "#fff" },
  pending: { bg: "rgba(224,184,76,0.15)", border: "var(--aura-warning)", text: "#fff" },
  cancelled: { bg: "rgba(232,96,96,0.15)", border: "var(--aura-danger)", text: "#fff" },
  completed: { bg: "rgba(88,184,232,0.15)", border: "var(--aura-info)", text: "#fff" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6AM - 9PM

const AdminCalendar = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [calView, setCalView] = useState<CalView>("month");
  const [calDate, setCalDate] = useState(new Date(2026, 3, 1));
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [msgTarget, setMsgTarget] = useState<CalendarBooking | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*"),
      supabase.from("rental_bookings").select("*, vehicles(name)"),
    ]).then(([t, r]) => {
      const items: CalendarBooking[] = [];
      (t.data || []).forEach((b: any) => {
        items.push({
          id: b.id, date: b.tour_date, guest: b.full_name, service: b.service_type,
          status: b.status || "pending", time: "9:00 AM", guests: b.party_size || 1,
          amount: b.total_estimate || 0, email: b.email,
        });
      });
      (r.data || []).forEach((b: any) => {
        const start = new Date(b.pickup_date);
        const end = new Date(b.return_date);
        eachDayOfInterval({ start, end }).forEach(d => {
          items.push({
            id: b.id, date: format(d, "yyyy-MM-dd"), guest: b.full_name,
            service: b.vehicles?.name || "Rental", status: b.status || "pending",
            time: "All day", guests: 1, amount: b.total_estimate || 0, email: b.email,
          });
        });
      });
      setBookings(items);
    });
  }, []);

  const bookingsByDay = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    bookings.forEach(b => { map[b.date] = [...(map[b.date] || []), b]; });
    return map;
  }, [bookings]);

  const navigate = (dir: 1 | -1) => {
    if (calView === "month") setCalDate(dir === 1 ? addMonths(calDate, 1) : subMonths(calDate, 1));
    else if (calView === "week") setCalDate(dir === 1 ? addWeeks(calDate, 1) : subWeeks(calDate, 1));
    else setCalDate(dir === 1 ? addDays(calDate, 1) : subDays(calDate, 1));
  };

  const goToday = () => setCalDate(new Date());

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const headerLabel = () => {
    if (calView === "month") return format(calDate, "MMMM yyyy");
    if (calView === "week") {
      const ws = startOfWeek(calDate, { weekStartsOn: 0 });
      const we = endOfWeek(calDate, { weekStartsOn: 0 });
      return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
    }
    return format(calDate, "EEEE, MMMM d, yyyy");
  };

  const navBtnStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)", color: "var(--aura-text-muted)",
    cursor: "pointer", minWidth: 36, minHeight: 36,
  };

  /* ── MONTH VIEW ── */
  const renderMonth = () => {
    const monthStart = startOfMonth(calDate);
    const monthEnd = endOfMonth(calDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--aura-glass-border)" }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: "12px 8px", textAlign: "center",
              fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500,
              color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{d}</div>
          ))}
        </div>
        <div className="aura-calendar-scroll" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, calDate);
            const today = isToday(day);
            const dayItems = bookingsByDay[dayStr] || [];

            return (
              <div
                key={dayStr}
                onClick={() => { setCalDate(day); setCalView("day"); }}
                style={{
                  minHeight: isMobile ? 48 : 90, padding: "6px 6px", cursor: "pointer",
                  borderBottom: "1px solid var(--aura-border-light)",
                  borderRight: "1px solid var(--aura-border-light)",
                  opacity: inMonth ? 1 : 0.3,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,200,200,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "var(--aura-font-mono)", fontSize: isMobile ? 11 : 12, fontWeight: today ? 600 : 400,
                    color: today ? "#0B0F19" : "var(--aura-text-dim)",
                    ...(today ? {
                      background: "var(--aura-teal)", borderRadius: "50%", width: 26, height: 26,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    } : {}),
                  }}>{format(day, "d")}</span>
                  {dayItems.length > 0 && !today && (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--aura-teal)" }} />
                  )}
                </div>
                {!isMobile && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayItems.slice(0, 2).map((item, i) => {
                      const sc = STATUS_COLOR[item.status] || STATUS_COLOR.pending;
                      return (
                        <div key={i} onClick={e => { e.stopPropagation(); setMsgTarget(item); }} style={{
                          width: "100%", height: 18, borderRadius: 4,
                          background: sc.bg, display: "flex", alignItems: "center",
                          padding: "0 5px", overflow: "hidden",
                        }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: sc.text,
                            fontFamily: "var(--aura-font-body)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {item.time.slice(0, 5)} {item.guest.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                    {dayItems.length > 2 && (
                      <span style={{ fontSize: 10, color: "var(--aura-teal)", fontFamily: "var(--aura-font-body)", fontWeight: 500 }}>
                        +{dayItems.length - 2} more
                      </span>
                    )}
                  </div>
                )}
                {isMobile && dayItems.length > 0 && (
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {dayItems.slice(0, 4).map((_, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: (STATUS_COLOR[dayItems[i].status] || STATUS_COLOR.pending).border }} />
                    ))}
                    {dayItems.length > 4 && <span style={{ fontSize: 8, color: "var(--aura-text-muted)" }}>+{dayItems.length - 4}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    );
  };

  /* ── WEEK VIEW ── */
  const renderWeek = () => {
    const ws = startOfWeek(calDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

    return (
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid var(--aura-glass-border)" }}>
          <div style={{ padding: 12 }} />
          {weekDays.map(d => {
            const today = isToday(d);
            return (
              <div key={d.toISOString()} style={{
                padding: "10px 8px", textAlign: "center",
                fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500,
                color: today ? "var(--aura-teal)" : "var(--aura-text-muted)",
                borderLeft: "1px solid var(--aura-border-light)",
              }}>
                {format(d, "EEE d")}
              </div>
            );
          })}
        </div>
        {/* Time grid */}
        <div className="aura-calendar-scroll">
          {HOURS.map(hour => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", minHeight: 48, borderBottom: "1px solid var(--aura-border-light)" }}>
              <div style={{
                padding: "4px 8px", fontFamily: "var(--aura-font-mono)", fontSize: 10,
                color: "var(--aura-text-muted)", textAlign: "right",
              }}>
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
              </div>
              {weekDays.map(d => {
                const dayStr = format(d, "yyyy-MM-dd");
                const dayItems = (bookingsByDay[dayStr] || []).filter(b => {
                  const h = parseInt(b.time) || 9;
                  return h === hour || (b.time === "All day" && hour === 9);
                });
                return (
                  <div key={d.toISOString()} style={{
                    borderLeft: "1px solid var(--aura-border-light)", padding: 2, position: "relative",
                  }}
                  onDoubleClick={() => { setCalDate(d); }}
                  >
                    {dayItems.map((item, i) => {
                      const sc = STATUS_COLOR[item.status] || STATUS_COLOR.pending;
                      return (
                        <div key={i} onClick={() => setMsgTarget(item)} style={{
                          background: sc.bg, borderLeft: `3px solid ${sc.border}`,
                          borderRadius: 4, padding: "3px 6px", marginBottom: 2, cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = sc.bg.replace("0.15", "0.25"); }}
                        onMouseLeave={e => { e.currentTarget.style.background = sc.bg; }}
                        >
                          <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 10, fontWeight: 600, color: "var(--aura-text)", lineHeight: 1.2 }}>
                            {item.service}
                          </p>
                          <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 9, color: "var(--aura-text-muted)" }}>
                            {item.guest.split(" ")[0]} · {item.time}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── DAY VIEW ── */
  const renderDay = () => {
    const dayStr = format(calDate, "yyyy-MM-dd");
    const dayItems = bookingsByDay[dayStr] || [];

    if (dayItems.length === 0) {
      return (
        <div className="aura-glass">
          <div className="aura-empty-state" style={{ padding: "60px 24px" }}>
            <div className="aura-empty-state__blob" style={{ width: 80, height: 80 }} />
            <p className="aura-empty-state__title">No bookings scheduled</p>
            <p className="aura-empty-state__text" style={{ fontSize: 13 }}>
              No bookings on {format(calDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ maxHeight: isMobile ? 500 : 700, overflowY: "auto" }}>
          {HOURS.map(hour => {
            const hourItems = dayItems.filter(b => {
              const h = parseInt(b.time) || 9;
              return h === hour || (b.time === "All day" && hour === 9);
            });
            return (
              <div key={hour} style={{
                display: "flex", minHeight: 64, borderBottom: "1px solid var(--aura-border-light)",
              }}>
                <div style={{
                  width: 60, padding: "8px", fontFamily: "var(--aura-font-mono)", fontSize: 11,
                  color: "var(--aura-text-muted)", textAlign: "right", flexShrink: 0,
                }}>
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
                <div style={{ flex: 1, padding: "4px 8px", borderLeft: "1px solid var(--aura-border-light)" }}>
                  {hourItems.map((item, i) => {
                    const sc = STATUS_COLOR[item.status] || STATUS_COLOR.pending;
                    return (
                      <div key={i} className="aura-glass" style={{
                        padding: 12, marginBottom: 4, display: "flex", alignItems: isMobile ? "flex-start" : "center",
                        flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 10,
                        background: sc.bg, borderLeft: `3px solid ${sc.border}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
                            fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                          }}>{getInitials(item.guest)}</div>
                          <div>
                            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 500, color: "var(--aura-text)" }}>{item.guest}</p>
                            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>
                              {item.service} · {item.time}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-dim)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Users size={12} /> {item.guests}
                          </span>
                          <span style={{ fontFamily: "var(--aura-font-mono)", fontSize: 12, fontWeight: 600, color: "var(--aura-text)" }}>
                            ${item.amount.toLocaleString()}
                          </span>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                            background: sc.bg, color: sc.border, border: `1px solid ${sc.border}`,
                            textTransform: "capitalize", fontFamily: "var(--aura-font-body)",
                          }}>{item.status}</span>
                          <button onClick={() => setMsgTarget(item)} style={{
                            width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)",
                            cursor: "pointer", color: "var(--aura-text-dim)",
                          }}><MessageSquare size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(-1)} style={navBtnStyle}><ChevronLeft size={16} /></button>
          <button onClick={() => navigate(1)} style={navBtnStyle}><ChevronRight size={16} /></button>
          <button onClick={goToday} style={{
            ...navBtnStyle, width: "auto", padding: "0 14px",
            fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500,
          }}>Today</button>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: isMobile ? 20 : 24, color: "var(--aura-text)", margin: 0 }}>
            {headerLabel()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["month", "week", "day"] as CalView[]).map(v => (
            <button key={v} onClick={() => setCalView(v)} className={`aura-period-btn ${calView === v ? "active" : ""}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {calView === "month" && renderMonth()}
      {calView === "week" && renderWeek()}
      {calView === "day" && renderDay()}

      {/* Message Modal */}
      {msgTarget && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: "rgba(4,16,20,0.85)",
          backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setMsgTarget(null)}>
          <div onClick={e => e.stopPropagation()} className="aura-modal-panel" style={{
            width: isMobile ? "92%" : 400, background: "var(--aura-modal-bg)",
            border: "1px solid var(--aura-glass-border)", borderRadius: 20, padding: 28,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, color: "var(--aura-text)", margin: 0 }}>Quick Contact</h3>
              <button onClick={() => setMsgTarget(null)} style={{
                width: 32, height: 32, borderRadius: 10, background: "var(--aura-highlight)",
                border: "1px solid var(--aura-glass-border)", color: "var(--aura-text-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><X size={14} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff",
              }}>{getInitials(msgTarget.guest)}</div>
              <div>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 500, color: "var(--aura-text)" }}>{msgTarget.guest}</p>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>{msgTarget.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)" }}>
                <strong>Service:</strong> {msgTarget.service}
              </p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)" }}>
                <strong>Date:</strong> {msgTarget.date} · {msgTarget.time}
              </p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)" }}>
                <strong>Guests:</strong> {msgTarget.guests} · <strong>Amount:</strong> ${msgTarget.amount.toLocaleString()}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <a href={`mailto:${msgTarget.email}`} style={{
                flex: 1, textDecoration: "none", textAlign: "center",
                padding: "10px", borderRadius: 12, fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600,
                background: "linear-gradient(135deg, var(--aura-teal), #1a9a8a)", color: "#fff",
              }}>Email</a>
              <a href={`https://wa.me/${msgTarget.email}`} style={{
                flex: 1, textDecoration: "none", textAlign: "center",
                padding: "10px", borderRadius: 12, fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600,
                background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)", color: "var(--aura-text-dim)",
              }}>WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
