import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Customer {
  email: string; name: string; country: string; phone: string;
  totalBookings: number; totalSpend: number; lastBooking: string;
  bookings: any[];
}

const SUGGESTED_TAGS = ["VIP", "Repeat", "Corporate", "Honeymoon", "Group", "Influencer"];

const AdminCustomerDirectory = () => {
  const { format: fmt } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [customerNotes, setCustomerNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => { fetchCustomers(); fetchTags(); }, []);

  const fetchCustomers = async () => {
    const [tours, rentals] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("rental_bookings").select("*").order("created_at", { ascending: false }),
    ]);
    const allBookings = [
      ...(tours.data || []).map((b: any) => ({ ...b, bookingType: "tour" })),
      ...(rentals.data || []).map((r: any) => ({ ...r, bookingType: "rental", tour_date: r.pickup_date })),
    ];
    const map = new Map<string, Customer>();
    allBookings.forEach(b => {
      const existing = map.get(b.email) || {
        email: b.email, name: b.full_name, country: b.country || "", phone: b.phone,
        totalBookings: 0, totalSpend: 0, lastBooking: "", bookings: [],
      };
      existing.totalBookings++;
      existing.totalSpend += Number(b.total_estimate) || 0;
      existing.name = b.full_name || existing.name;
      const date = b.tour_date || b.created_at;
      if (!existing.lastBooking || date > existing.lastBooking) existing.lastBooking = date;
      existing.bookings.push(b);
      map.set(b.email, existing);
    });
    setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend));
  };

  const fetchTags = async () => {
    const { data } = await supabase.from("customer_tags").select("*");
    const map: Record<string, string[]> = {};
    (data || []).forEach((t: any) => { map[t.email] = [...(map[t.email] || []), t.tag]; });
    setTags(map);
  };

  const fetchNotes = async (email: string) => {
    const { data } = await supabase.from("customer_notes").select("*").eq("email", email).order("created_at", { ascending: false });
    setCustomerNotes(data || []);
  };

  const addNote = async () => {
    if (!selected || !newNote.trim()) return;
    await supabase.from("customer_notes").insert({ email: selected.email, note: newNote.trim() });
    setNewNote("");
    fetchNotes(selected.email);
  };

  const addTag = async (tag: string) => {
    if (!selected) return;
    await supabase.from("customer_tags").insert({ email: selected.email, tag });
    setTags(prev => ({ ...prev, [selected.email]: [...(prev[selected.email] || []), tag] }));
  };

  const removeTag = async (tag: string) => {
    if (!selected) return;
    await supabase.from("customer_tags").delete().eq("email", selected.email).eq("tag", tag);
    setTags(prev => ({ ...prev, [selected.email]: (prev[selected.email] || []).filter(t => t !== tag) }));
  };

  const getStatus = (lastBooking: string) => {
    const days = differenceInDays(new Date(), new Date(lastBooking));
    if (days <= 90) return { label: "Recent", color: "hsl(var(--gem-teal))", bg: "rgba(26,107,107,0.12)" };
    if (days <= 180) return { label: "Lapsed", color: "hsl(var(--gem-gold))", bg: "rgba(201,148,58,0.12)" };
    return { label: "Lost", color: "hsl(var(--gem-coral))", bg: "rgba(212,82,58,0.12)" };
  };

  const filtered = useMemo(() => customers.filter(c => {
    if (statusFilter !== "all") {
      const s = getStatus(c.lastBooking).label.toLowerCase();
      if (s !== statusFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  }), [customers, search, statusFilter]);

  if (selected) {
    const s = getStatus(selected.lastBooking);
    const emailTags = tags[selected.email] || [];
    return (
      <div>
        <button onClick={() => setSelected(null)} className="admin-link mb-6">← Back to Directory</button>
        <div className="flex items-center gap-4 mb-8">
          <div style={{ width: 56, height: 56, background: "hsl(var(--gem-teal))", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600 }}>
            {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h1 className="admin-page-title" style={{ fontSize: 32 }}>{selected.name}</h1>
            <p className="admin-page-sub">{selected.email} · {selected.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="admin-metric-card">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "hsl(var(--gem-gold))" }}>{fmt(selected.totalSpend)}</p>
            <p className="admin-metric-label">Lifetime Value</p>
          </div>
          <div className="admin-metric-card">
            <p className="admin-metric-value" style={{ fontSize: 36 }}>{selected.totalBookings}</p>
            <p className="admin-metric-label">Total Bookings</p>
          </div>
          <div className="admin-metric-card">
            <p className="admin-metric-value" style={{ fontSize: 36 }}>{format(new Date(selected.lastBooking), "MMM d, yyyy")}</p>
            <p className="admin-metric-label">Last Active</p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="admin-section-title mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {emailTags.map(tag => (
              <span key={tag} style={{ padding: "4px 12px", background: "rgba(201,148,58,0.12)", color: "hsl(var(--gem-gold))", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--gem-coral))", fontSize: 12 }}>×</button>
              </span>
            ))}
            {SUGGESTED_TAGS.filter(t => !emailTags.includes(t)).map(tag => (
              <button key={tag} onClick={() => addTag(tag)} style={{ padding: "4px 12px", border: "1px dashed hsl(var(--gem-sand))", background: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(11,42,59,0.4)" }}>+ {tag}</button>
            ))}
          </div>
        </div>

        {/* Booking History */}
        <p className="admin-section-title mb-3">Booking History</p>
        <div className="admin-table-wrap mb-8">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Type</th><th>Service</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {selected.bookings.sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || "")).map((b: any) => (
                <tr key={b.id}>
                  <td>{format(new Date(b.tour_date || b.pickup_date), "MMM d, yyyy")}</td>
                  <td>{b.bookingType}</td>
                  <td>{b.service_type || "Rental"}</td>
                  <td><span style={{ color: "hsl(var(--gem-teal))", fontSize: 12, textTransform: "capitalize" }}>{b.status}</span></td>
                  <td>{fmt(b.total_estimate || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <p className="admin-section-title mb-3">Notes</p>
        <div className="mb-4">
          <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note about this customer…" className="admin-filter-input w-full" style={{ minHeight: 60, resize: "vertical" }} />
          <button onClick={addNote} className="admin-btn-outline mt-2" disabled={!newNote.trim()}>Add Note</button>
        </div>
        {customerNotes.map((n: any) => (
          <div key={n.id} style={{ padding: "12px 0", borderBottom: "1px solid hsl(var(--gem-sand))" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: "hsl(var(--gem-navy))" }}>{n.note}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(11,42,59,0.35)", marginTop: 4 }}>{format(new Date(n.created_at), "MMM d, yyyy h:mm a")}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="admin-page-title">Customer Directory</h1>
      <p className="admin-page-sub">{customers.length} unique customers</p>

      <div className="flex flex-wrap gap-3 my-6">
        <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-input">
          <option value="all">All Customers</option>
          <option value="recent">Recent (90 days)</option>
          <option value="lapsed">Lapsed (90-180)</option>
          <option value="lost">Lost (180+)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const s = getStatus(c.lastBooking);
          return (
            <div key={c.email} style={{ background: "white", border: "1px solid hsl(var(--gem-sand))", padding: 24, cursor: "pointer" }} onClick={() => { setSelected(c); fetchNotes(c.email); }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 36, height: 36, background: "hsl(var(--gem-teal))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500 }}>
                  {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: "hsl(var(--gem-navy))" }}>{c.name}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(11,42,59,0.45)" }}>{c.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                <span style={{ color: "rgba(11,42,59,0.55)" }}>{c.totalBookings} bookings · {fmt(c.totalSpend)}</span>
                <span style={{ padding: "3px 10px", fontSize: 10, fontWeight: 500, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
              </div>
              {(tags[c.email] || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(tags[c.email] || []).map(tag => (
                    <span key={tag} style={{ padding: "2px 8px", fontSize: 9, fontWeight: 500, background: "rgba(201,148,58,0.12)", color: "hsl(var(--gem-gold))", textTransform: "uppercase", letterSpacing: "0.08em" }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCustomerDirectory;
