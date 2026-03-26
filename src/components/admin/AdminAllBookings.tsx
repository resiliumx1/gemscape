import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Map, Car } from "lucide-react";
import BookingDrawer from "./BookingDrawer";

interface UnifiedBooking {
  id: string; ref: string; date: string; guest: string; email: string; phone: string;
  service: string; type: "tour" | "rental"; status: string; value: number; details: any;
}

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;
const TYPE_FILTERS = ["all", "tours", "rentals"] as const;
const STATUS_CLASS: Record<string, string> = {
  pending: "admin-status-pending", confirmed: "admin-status-confirmed",
  completed: "admin-status-completed", cancelled: "admin-status-cancelled",
};

const AdminAllBookings = () => {
  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<UnifiedBooking | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tours, rentals] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("rental_bookings").select("*, vehicles(name)").order("created_at", { ascending: false }),
      ]);
      if (tours.error && rentals.error) { setError(tours.error.message); setLoading(false); return; }
      const combined: UnifiedBooking[] = [
        ...(tours.data || []).map((b: any) => ({
          id: b.id, ref: b.booking_ref || "", date: b.tour_date, guest: b.full_name,
          email: b.email, phone: b.phone, service: b.service_type,
          type: "tour" as const, status: b.status || "pending", value: b.total_estimate || 0, details: b,
        })),
        ...(rentals.data || []).map((r: any) => ({
          id: r.id, ref: r.booking_ref || "", date: r.pickup_date, guest: r.full_name,
          email: r.email, phone: r.phone, service: r.vehicles?.name || "Rental",
          type: "rental" as const, status: r.status || "pending", value: r.total_estimate || 0, details: r,
        })),
      ].sort((a, b) => (b.details.created_at || "").localeCompare(a.details.created_at || ""));
      setBookings(combined);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => bookings.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter === "tours" && b.type !== "tour") return false;
    if (typeFilter === "rentals" && b.type !== "rental") return false;
    if (search) {
      const q = search.toLowerCase();
      return b.guest.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q);
    }
    return true;
  }), [bookings, search, statusFilter, typeFilter]);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (error) {
    return (
      <div className="admin-card-elevated p-8 text-center">
        <p style={{ color: "#D4523A", fontSize: 14 }}>Error: {error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchAll(); }} className="admin-btn-outline mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input placeholder="Search name or ref…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`admin-period-btn ${statusFilter === s ? "active" : ""}`} style={{ textTransform: "capitalize" }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`admin-period-btn ${typeFilter === t ? "active" : ""}`} style={{ textTransform: "capitalize" }}>
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
        {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Guest</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "#94a3b8" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "#94a3b8" }}>No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} onClick={() => setSelected(b)}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="admin-avatar">{getInitials(b.guest)}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{b.guest}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{b.ref}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {b.type === "tour" ? <Map size={13} style={{ color: "#94a3b8" }} /> : <Car size={13} style={{ color: "#94a3b8" }} />}
                    <span style={{ fontSize: 12 }}>{b.service}</span>
                  </div>
                </td>
                <td>{format(new Date(b.date), "MMM d, yyyy")}</td>
                <td style={{ fontWeight: 600 }}>${b.value}</td>
                <td><span className={STATUS_CLASS[b.status]}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDrawer
          booking={selected.details}
          type={selected.type}
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status, details: { ...b.details, status } } : b));
            setSelected(prev => prev ? { ...prev, status, details: { ...prev.details, status } } : null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAllBookings;
