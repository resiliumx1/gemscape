import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";

interface CalendarBooking {
  id: string; date: string; guest: string; service: string; status: string; type: "tour" | "rental";
}

const AdminCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const [tours, rentals] = await Promise.all([
      supabase.from("bookings").select("id, tour_date, full_name, service_type, status"),
      supabase.from("rental_bookings").select("id, pickup_date, return_date, full_name, status, vehicles(name)"),
    ]);
    const items: CalendarBooking[] = [
      ...(tours.data || []).map((b: any) => ({ id: b.id, date: b.tour_date, guest: b.full_name, service: b.service_type, status: b.status || "pending", type: "tour" as const })),
    ];
    // Expand rentals across their date ranges
    (rentals.data || []).forEach((r: any) => {
      const start = new Date(r.pickup_date);
      const end = new Date(r.return_date);
      const days = eachDayOfInterval({ start, end });
      days.forEach(d => {
        items.push({ id: r.id, date: format(d, "yyyy-MM-dd"), guest: r.full_name, service: (r as any).vehicles?.name || "Rental", status: r.status || "pending", type: "rental" });
      });
    });
    setBookings(items);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const bookingsByDay = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    bookings.forEach(b => { map[b.date] = [...(map[b.date] || []), b]; });
    return map;
  }, [bookings]);

  const dayBookings = selectedDay ? (bookingsByDay[selectedDay] || []) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page-title">Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="admin-btn-outline">←</button>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "hsl(var(--gem-navy))" }}>{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="admin-btn-outline">→</button>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <div className="grid grid-cols-7">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} style={{ padding: "12px 8px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "hsl(var(--gem-gold))", borderBottom: "1px solid hsl(var(--gem-sand))" }}>{d}</div>
          ))}
          {days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const dayItems = bookingsByDay[dayStr] || [];
            const isSelected = selectedDay === dayStr;
            const isToday = dayStr === format(new Date(), "yyyy-MM-dd");
            return (
              <div
                key={dayStr}
                onClick={() => setSelectedDay(isSelected ? null : dayStr)}
                style={{
                  minHeight: 80,
                  padding: "6px 8px",
                  borderBottom: "1px solid hsl(var(--gem-sand))",
                  borderRight: "1px solid hsl(var(--gem-sand))",
                  background: isSelected ? "rgba(201,148,58,0.06)" : isToday ? "rgba(78,201,201,0.04)" : !isCurrentMonth ? "rgba(11,42,59,0.02)" : "white",
                  cursor: dayItems.length > 0 ? "pointer" : "default",
                  opacity: isCurrentMonth ? 1 : 0.35,
                }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: isToday ? 600 : 300, color: isToday ? "hsl(var(--gem-teal))" : "hsl(var(--gem-navy))" }}>{format(day, "d")}</span>
                <div className="mt-1 space-y-1">
                  {dayItems.slice(0, 3).map((item, i) => (
                    <div key={i} style={{
                      fontSize: 9,
                      padding: "2px 4px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: item.type === "tour" ? "rgba(201,148,58,0.15)" : "rgba(78,201,201,0.15)",
                      color: item.type === "tour" ? "hsl(var(--gem-gold))" : "hsl(var(--gem-teal))",
                      borderLeft: item.status === "pending" ? "2px dashed" : "2px solid",
                      borderColor: item.type === "tour" ? "hsl(var(--gem-gold))" : "hsl(var(--gem-teal))",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>{item.guest.split(" ")[0]}</div>
                  ))}
                  {dayItems.length > 3 && <span style={{ fontSize: 9, color: "rgba(11,42,59,0.4)" }}>+{dayItems.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && dayBookings.length > 0 && (
        <div className="mt-4 p-4" style={{ background: "white", border: "1px solid hsl(var(--gem-sand))" }}>
          <p className="admin-section-title mb-3">{format(new Date(selectedDay), "EEEE, MMMM d, yyyy")}</p>
          {dayBookings.map((b, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: i < dayBookings.length - 1 ? "1px solid hsl(var(--gem-sand))" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "hsl(var(--gem-navy))" }}>{b.guest} · {b.service}</span>
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", padding: "3px 10px", background: b.type === "tour" ? "rgba(201,148,58,0.12)" : "rgba(78,201,201,0.12)", color: b.type === "tour" ? "hsl(var(--gem-gold))" : "hsl(var(--gem-teal))" }}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
