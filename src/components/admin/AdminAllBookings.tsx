import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StatusBadge } from "./AdminDashboard";
import { useCurrency } from "@/contexts/CurrencyContext";

interface UnifiedBooking {
  id: string; ref: string; date: string; guest: string; email: string; phone: string;
  service: string; type: "tour" | "rental"; status: string; value: number;
  details: any;
}

const AdminAllBookings = () => {
  const { format: fmt } = useCurrency();
  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<UnifiedBooking | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAll();
    const timeout = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchAll = async () => {
    try {
      const [tours, rentals] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("rental_bookings").select("*, vehicles(name)").order("created_at", { ascending: false }),
      ]);
      if (tours.error) console.error("All bookings - tours error:", tours.error);
      if (rentals.error) console.error("All bookings - rentals error:", rentals.error);
      if (tours.error && rentals.error) {
        setError(tours.error.message);
        setLoading(false);
        return;
      }
      const combined: UnifiedBooking[] = [
        ...(tours.data || []).map((b: any) => ({
          id: b.id, ref: b.booking_ref || "", date: b.tour_date, guest: b.full_name,
          email: b.email, phone: b.phone, service: b.service_type,
          type: "tour" as const, status: b.status || "pending", value: b.total_estimate || 0,
          details: b,
        })),
        ...(rentals.data || []).map((r: any) => ({
          id: r.id, ref: r.booking_ref || "", date: r.pickup_date, guest: r.full_name,
          email: r.email, phone: r.phone, service: r.vehicles?.name || "Rental",
          type: "rental" as const, status: r.status || "pending", value: r.total_estimate || 0,
          details: r,
        })),
      ].sort((a, b) => (b.details.created_at || "").localeCompare(a.details.created_at || ""));
      setBookings(combined);
    } catch (e: any) {
      console.error("All bookings exception:", e);
      setError(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => bookings.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.guest.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.ref.toLowerCase().includes(q);
    }
    return true;
  }), [bookings, search, statusFilter]);

  const updateStatus = async (booking: UnifiedBooking, newStatus: string) => {
    const table = booking.type === "tour" ? "bookings" : "rental_bookings";
    await supabase.from(table).update({ status: newStatus }).eq("id", booking.id);
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
    if (selected?.id === booking.id) setSelected({ ...selected, status: newStatus });
  };

  const saveNotes = async () => {
    if (!selected) return;
    const table = selected.type === "tour" ? "bookings" : "rental_bookings";
    await supabase.from(table).update({ notes }).eq("id", selected.id);
  };

  if (error) {
    return (
      <div className="relative">
        <h1 className="admin-page-title">All Bookings</h1>
        <div className="admin-card-elevated p-8 mt-6 text-center">
          <p style={{ color: "#D4523A", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Error: {error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchAll(); }} className="admin-btn-outline mt-4">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <h1 className="admin-page-title">All Bookings</h1>
      <p className="admin-page-sub">Combined view of tours and rentals</p>

      <div className="flex flex-wrap gap-3 my-6">
        <input placeholder="Search name, email, ref…" value={search} onChange={e => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-input">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Type</th><th>Ref</th><th>Date</th><th>Guest</th><th>Service</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState /></td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td><span style={{ padding: "3px 10px", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", background: b.type === "tour" ? "rgba(11,42,59,0.08)" : "rgba(78,201,201,0.12)", color: b.type === "tour" ? "hsl(var(--gem-navy))" : "hsl(var(--gem-teal))" }}>{b.type}</span></td>
                <td style={{ fontWeight: 500, color: "hsl(var(--gem-gold))" }}>{b.ref}</td>
                <td>{format(new Date(b.date), "MMM d, yyyy")}</td>
                <td>{b.guest}</td>
                <td>{b.service}</td>
                <td>{fmt(b.value)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td><button onClick={() => { setSelected(b); setNotes(b.details.notes || ""); }} className="admin-link">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-detail-overlay" onClick={() => setSelected(null)}>
          <div className="admin-detail-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="admin-section-title">{selected.ref}</h3>
                <span style={{ padding: "3px 10px", fontSize: 10, fontWeight: 500, textTransform: "uppercase", background: selected.type === "tour" ? "rgba(11,42,59,0.08)" : "rgba(78,201,201,0.12)", color: selected.type === "tour" ? "hsl(var(--gem-navy))" : "hsl(var(--gem-teal))", marginLeft: 8 }}>{selected.type}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ fontSize: 20, color: "rgba(11,42,59,0.4)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div className="admin-detail-grid">
              <DetailRow label="Guest" value={selected.guest} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Service" value={selected.service} />
              <DetailRow label="Date" value={selected.date} />
              <DetailRow label="Value" value={fmt(selected.value)} />
            </div>
            <div className="mt-6">
              <label className="admin-form-label">Status</label>
              <select value={selected.status} onChange={e => updateStatus(selected, e.target.value)} className="admin-filter-input w-full">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mt-6">
              <label className="admin-form-label">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} className="admin-filter-input w-full" style={{ minHeight: 80, resize: "vertical" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="admin-detail-row"><span className="admin-detail-label">{label}</span><span className="admin-detail-value">{value}</span></div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <span style={{ fontSize: 28, color: "hsl(var(--gem-sand))" }}>◆</span>
    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: 24, color: "hsl(var(--gem-navy))", marginTop: 8 }}>No bookings found</p>
    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(11,42,59,0.45)", marginTop: 4 }}>Try adjusting your filters or date range.</p>
  </div>
);

export default AdminAllBookings;
