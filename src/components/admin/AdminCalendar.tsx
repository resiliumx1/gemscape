import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  startOfWeek, endOfWeek, isSameMonth, isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarBooking {
  id: string; date: string; guest: string; service: string; status: string;
  time: string; guests: number; amount: number; email: string;
}

const STATUS_PILL: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "rgba(16,185,129,0.1)", text: "var(--aura-success)", border: "rgba(16,185,129,0.2)" },
  pending: { bg: "rgba(245,158,11,0.1)", text: "var(--aura-warning)", border: "rgba(245,158,11,0.2)" },
  cancelled: { bg: "rgba(239,68,68,0.1)", text: "var(--aura-danger)", border: "rgba(239,68,68,0.2)" },
  completed: { bg: "rgba(96,165,250,0.1)", text: "var(--aura-info)", border: "rgba(96,165,250,0.2)" },
};

const STATUS_DOT: Record<string, string> = {
  confirmed: "var(--aura-success)",
  pending: "var(--aura-warning)",
  cancelled: "var(--aura-danger)",
  completed: "var(--aura-info)",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AdminCalendar = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const bookingsByDay = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    bookings.forEach(b => { map[b.date] = [...(map[b.date] || []), b]; });
    return map;
  }, [bookings]);

  const dayBookings = selectedDay ? (bookingsByDay[selectedDay] || []) : [];
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 24, color: "var(--aura-text)" }}>
          {format(currentMonth, "MMMM yyyy")}
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)", color: "var(--aura-text-muted)", cursor: "pointer",
            minWidth: 44, minHeight: 44,
          }}><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--aura-glass)", border: "1px solid var(--aura-glass-border)", color: "var(--aura-text-muted)", cursor: "pointer",
            minWidth: 44, minHeight: 44,
          }}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--aura-glass-border)" }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: "12px 8px", textAlign: "center",
              fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 500,
              color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const dayItems = bookingsByDay[dayStr] || [];
            const isSelected = selectedDay === dayStr;

            return (
              <div
                key={dayStr}
                onClick={() => setSelectedDay(isSelected ? null : dayStr)}
                style={{
                  minHeight: isMobile ? 48 : 80, padding: "6px 8px", cursor: "pointer",
                  borderBottom: "1px solid var(--aura-glass-border)",
                  borderRight: "1px solid var(--aura-glass-border)",
                  background: isSelected ? "rgba(60,200,184,0.06)" : "transparent",
                  opacity: inMonth ? 1 : 0.3,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--aura-highlight)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "var(--aura-font-body)", fontSize: isMobile ? 11 : 12, fontWeight: today ? 700 : 400,
                    color: today ? "#060e1a" : "var(--aura-text-dim)",
                    ...(today ? {
                      background: "#3cc8b8", borderRadius: 6, padding: "1px 7px",
                    } : {}),
                  }}>{format(day, "d")}</span>
                </div>
                {isMobile ? (
                  /* Mobile: colored dots only */
                  dayItems.length > 0 && (
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {dayItems.slice(0, 4).map((item, i) => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: STATUS_DOT[item.status] || STATUS_DOT.pending,
                        }} />
                      ))}
                      {dayItems.length > 4 && (
                        <span style={{ fontSize: 8, color: "var(--aura-text-muted)" }}>+{dayItems.length - 4}</span>
                      )}
                    </div>
                  )
                ) : (
                  /* Desktop: text pills */
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayItems.slice(0, 2).map((item, i) => {
                      const sc = STATUS_PILL[item.status] || STATUS_PILL.pending;
                      return (
                        <div key={i} style={{
                          fontSize: 9, padding: "2px 5px", borderRadius: 4,
                          fontFamily: "var(--aura-font-body)", fontWeight: 500,
                          background: sc.bg, color: sc.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {item.time.slice(0, 5)} {item.guest.split(" ")[0]}
                        </div>
                      );
                    })}
                    {dayItems.length > 2 && (
                      <span style={{ fontSize: 9, color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)" }}>
                        +{dayItems.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && dayBookings.length > 0 && (
        <div className="aura-glass" style={{ marginTop: 16, padding: isMobile ? "16px" : "20px 24px" }}>
          <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 19, color: "var(--aura-text)", marginBottom: 16 }}>
            {format(new Date(selectedDay + "T12:00:00"), "EEEE, MMMM d, yyyy")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {dayBookings.map((b, i) => {
              const sc = STATUS_PILL[b.status] || STATUS_PILL.pending;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between", gap: isMobile ? 8 : 0,
                  padding: "12px 0",
                  borderBottom: i < dayBookings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "linear-gradient(135deg, #3cc8b8, #d4aa44)", fontSize: 11, fontWeight: 700, color: "#060e1a",
                    }}>{getInitials(b.guest)}</div>
                    <div>
                      <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 500, color: "var(--aura-text)" }}>{b.guest}</p>
                      <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>{b.service}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, fontFamily: "var(--aura-font-body)", fontSize: 12, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--aura-text-dim)" }}>{b.time}</span>
                    <span style={{ color: "var(--aura-text-dim)" }}>{b.guests} guest{b.guests !== 1 ? "s" : ""}</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: "capitalize",
                    }}>{b.status}</span>
                    <span style={{ fontWeight: 600, color: "var(--aura-text)" }}>${b.amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay && dayBookings.length === 0 && (
        <div className="aura-glass" style={{ marginTop: 16, padding: "30px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)" }}>
            No bookings on {format(new Date(selectedDay + "T12:00:00"), "MMMM d, yyyy")}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
