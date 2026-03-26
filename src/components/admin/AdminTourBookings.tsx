import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StatusBadge } from "./AdminDashboard";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

const AdminTourBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchBookings();
    const timeout = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error: err } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (err) {
        console.error("Tour bookings fetch error:", err);
        setError(err.message);
      }
      setBookings(data || []);
    } catch (e: any) {
      console.error("Tour bookings exception:", e);
      setError(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (serviceFilter !== "all" && b.service_type !== serviceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.full_name.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q) && !(b.booking_ref || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, serviceFilter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    if (selected?.id === id) setSelected({ ...selected!, status });
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from("bookings").update({ notes }).eq("id", selected.id);
    setBookings((prev) => prev.map((b) => b.id === selected.id ? { ...b, notes } : b));
  };

  const exportCSV = () => {
    const headers = ["Ref", "Date", "Guest", "Email", "Service", "Party", "Status", "Estimate"];
    const rows = filtered.map((b) => [
      b.booking_ref, b.tour_date, b.full_name, b.email, b.service_type,
      (b.adults || 0) + (b.children || 0), b.status, b.total_estimate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tour-bookings.csv"; a.click();
  };

  if (error) {
    return (
      <div className="relative">
        <h1 className="admin-page-title">Tour Bookings</h1>
        <div className="admin-card-elevated p-8 mt-6 text-center">
          <p style={{ color: "#D4523A", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Error: {error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchBookings(); }} className="admin-btn-outline mt-4">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page-title">Tour Bookings</h1>
        <button onClick={exportCSV} className="admin-btn-outline">Export CSV</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input placeholder="Search name, email, ref…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-input">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="admin-filter-input">
          <option value="all">All Services</option>
          <option value="Island Circumnavigation">Circumnavigation</option>
          <option value="Flight Concierge">Concierge</option>
          <option value="Private Charter">Charter</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref</th><th>Date</th><th>Guest</th><th>Service</th><th>Party</th><th>Estimate</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>No bookings found</td></tr>
            ) : filtered.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 500, color: "hsl(var(--gem-gold))" }}>{b.booking_ref}</td>
                <td>{b.tour_date ? format(new Date(b.tour_date), "MMM d, yyyy") : "—"}</td>
                <td>{b.full_name}</td>
                <td>{b.service_type}</td>
                <td>{(b.adults || 0) + (b.children || 0)}</td>
                <td>${b.total_estimate || 0}</td>
                <td><StatusBadge status={b.status || "pending"} /></td>
                <td><button onClick={() => { setSelected(b); setNotes(b.notes || ""); }} className="admin-link">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-detail-overlay" onClick={() => setSelected(null)}>
          <div className="admin-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="admin-section-title">{selected.booking_ref}</h3>
              <button onClick={() => setSelected(null)} style={{ fontSize: 20, color: "rgba(11,42,59,0.4)", cursor: "pointer", background: "none", border: "none" }}>✕</button>
            </div>
            <div className="admin-detail-grid">
              <DetailRow label="Guest" value={selected.full_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Service" value={selected.service_type} />
              <DetailRow label="Tour Date" value={selected.tour_date} />
              <DetailRow label="Adults" value={String(selected.adults || 0)} />
              <DetailRow label="Children" value={String(selected.children || 0)} />
              <DetailRow label="Pickup" value={selected.pickup_location || "—"} />
              <DetailRow label="Country" value={selected.country || "—"} />
              <DetailRow label="Flight" value={selected.flight_details || "—"} />
              <DetailRow label="Estimate" value={`$${selected.total_estimate || 0}`} />
              <DetailRow label="Add-ons" value={(selected.add_ons || []).join(", ") || "None"} />
              <DetailRow label="Special Requests" value={selected.special_requests || "—"} />
            </div>
            <div className="mt-6">
              <label className="admin-form-label">Status</label>
              <select value={selected.status || "pending"} onChange={(e) => updateStatus(selected.id, e.target.value)} className="admin-filter-input w-full">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mt-6">
              <label className="admin-form-label">Admin Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} className="admin-filter-input w-full" style={{ minHeight: 80, resize: "vertical" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="admin-detail-row">
    <span className="admin-detail-label">{label}</span>
    <span className="admin-detail-value">{value}</span>
  </div>
);

export default AdminTourBookings;
