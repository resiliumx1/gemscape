import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StatusBadge } from "./AdminDashboard";

interface RentalBooking {
  id: string;
  booking_ref: string | null;
  full_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  dropoff_location: string;
  vehicle_id: string | null;
  daily_rate: number | null;
  total_days: number | null;
  total_estimate: number | null;
  add_ons: string[] | null;
  special_requests: string | null;
  status: string | null;
  notes: string | null;
  driver_license: string;
  license_country: string;
  country: string | null;
  vehicles?: { name: string } | null;
}

const AdminRentalBookings = () => {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<RentalBooking | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const { data } = await supabase.from("rental_bookings").select("*, vehicles(name)").order("created_at", { ascending: false });
    setBookings((data as any) || []);
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.full_name.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q) && !(b.booking_ref || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("rental_bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    if (selected?.id === id) setSelected({ ...selected!, status });
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from("rental_bookings").update({ notes }).eq("id", selected.id);
  };

  const exportCSV = () => {
    const headers = ["Ref", "Dates", "Guest", "Vehicle", "Days", "Total", "Status"];
    const rows = filtered.map((b) => [
      b.booking_ref, `${b.pickup_date} – ${b.return_date}`, b.full_name,
      b.vehicles?.name || "", b.total_days, b.total_estimate, b.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rental-bookings.csv"; a.click();
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page-title">Rental Bookings</h1>
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
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref</th><th>Dates</th><th>Guest</th><th>Vehicle</th><th>Days</th><th>Total</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>No bookings found</td></tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 500, color: "hsl(var(--gem-gold))" }}>{b.booking_ref}</td>
                <td>{format(new Date(b.pickup_date), "MMM d")} – {format(new Date(b.return_date), "MMM d")}</td>
                <td>{b.full_name}</td>
                <td>{b.vehicles?.name || "—"}</td>
                <td>{b.total_days}</td>
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
              <DetailRow label="Vehicle" value={selected.vehicles?.name || "—"} />
              <DetailRow label="Pickup" value={`${selected.pickup_date} @ ${selected.pickup_location}`} />
              <DetailRow label="Return" value={`${selected.return_date} @ ${selected.dropoff_location}`} />
              <DetailRow label="Days" value={String(selected.total_days || 0)} />
              <DetailRow label="Rate" value={`$${selected.daily_rate || 0}/day`} />
              <DetailRow label="Total" value={`$${selected.total_estimate || 0}`} />
              <DetailRow label="License" value={`${selected.driver_license} (${selected.license_country})`} />
              <DetailRow label="Add-ons" value={(selected.add_ons || []).join(", ") || "None"} />
              <DetailRow label="Requests" value={selected.special_requests || "—"} />
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

export default AdminRentalBookings;
