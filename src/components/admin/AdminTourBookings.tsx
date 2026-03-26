import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Map } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import BookingDrawer from "./BookingDrawer";

type Booking = Tables<"bookings">;

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

const STATUS_CLASS: Record<string, string> = {
  pending: "admin-status-pending",
  confirmed: "admin-status-confirmed",
  completed: "admin-status-completed",
  cancelled: "admin-status-cancelled",
};

const AdminTourBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
    const timeout = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error: err } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (err) { setError(err.message); }
      setBookings(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.full_name.toLowerCase().includes(q) && !(b.booking_ref || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [bookings, search, statusFilter]);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (error) {
    return (
      <div>
        <div className="admin-card-elevated p-8 text-center">
          <p style={{ color: "#D4523A", fontSize: 14 }}>Error: {error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchBookings(); }} className="admin-btn-outline mt-4">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input placeholder="Search name or ref…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`admin-period-btn ${statusFilter === s ? "active" : ""}`} style={{ textTransform: "capitalize" }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
        {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Guest</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "#94a3b8" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8" style={{ color: "#94a3b8" }}>No bookings found</td></tr>
            ) : filtered.map((b) => (
              <tr key={b.id} onClick={() => setSelected(b)}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="admin-avatar">{getInitials(b.full_name)}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{b.full_name}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{b.booking_ref}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <Map size={13} style={{ color: "#94a3b8" }} />
                    <span style={{ fontSize: 12 }}>{b.service_type}</span>
                  </div>
                </td>
                <td>{b.tour_date ? format(new Date(b.tour_date), "MMM d, yyyy") : "—"}</td>
                <td style={{ fontWeight: 600 }}>${b.total_estimate || 0}</td>
                <td><span className={STATUS_CLASS[b.status || "pending"]}>{b.status || "pending"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDrawer
          booking={selected}
          type="tour"
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            setSelected(prev => prev ? { ...prev, status } : null);
          }}
        />
      )}
    </div>
  );
};

export default AdminTourBookings;
