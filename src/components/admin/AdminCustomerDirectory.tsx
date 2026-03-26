import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { X, Phone, ExternalLink, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

interface Customer {
  email: string; name: string; country: string; phone: string;
  totalBookings: number; totalSpend: number; lastBooking: string; firstBooking: string;
  preferredService: string; bookings: any[];
}

const SUGGESTED_TAGS = ["VIP", "Repeat", "Corporate", "Honeymoon", "Group", "Influencer"];

const AdminCustomerDirectory = () => {
  const { format: fmt } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [customerNotes, setCustomerNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [sortKey, setSortKey] = useState<"totalSpend" | "totalBookings" | "name">("totalSpend");
  const [sortAsc, setSortAsc] = useState(false);

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
        totalBookings: 0, totalSpend: 0, lastBooking: "", firstBooking: "9999", preferredService: "", bookings: [],
      };
      existing.totalBookings++;
      existing.totalSpend += Number(b.total_estimate) || 0;
      existing.name = b.full_name || existing.name;
      const date = b.tour_date || b.created_at;
      if (!existing.lastBooking || date > existing.lastBooking) existing.lastBooking = date;
      if (date < existing.firstBooking) existing.firstBooking = date;
      existing.preferredService = b.service_type || b.bookingType;
      existing.bookings.push(b);
      map.set(b.email, existing);
    });
    setCustomers(Array.from(map.values()));
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

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    let list = customers.filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
    list.sort((a, b) => {
      const v = sortKey === "name" ? a.name.localeCompare(b.name) : (a[sortKey] - b[sortKey]);
      return sortAsc ? v : -v;
    });
    return list;
  }, [customers, search, sortKey, sortAsc]);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const getWhatsApp = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
        {sorted.length} customer{sorted.length !== 1 ? "s" : ""}
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Country</th>
              <th style={{ cursor: "pointer" }} onClick={() => toggleSort("totalBookings")}>
                <span className="flex items-center gap-1">Bookings <ArrowUpDown size={11} /></span>
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => toggleSort("totalSpend")}>
                <span className="flex items-center gap-1">Total Spend <ArrowUpDown size={11} /></span>
              </th>
              <th>Last Booking</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8" style={{ color: "#94a3b8" }}>No customers found</td></tr>
            ) : sorted.map(c => (
              <tr key={c.email}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="admin-avatar">{getInitials(c.name)}</div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{c.email}</td>
                <td style={{ fontSize: 12 }}>{c.phone}</td>
                <td style={{ fontSize: 12 }}>{c.country || "—"}</td>
                <td>{c.totalBookings}</td>
                <td style={{ fontWeight: 600 }}>{fmt(c.totalSpend)}</td>
                <td style={{ fontSize: 12 }}>{c.lastBooking ? format(new Date(c.lastBooking), "MMM d, yyyy") : "—"}</td>
                <td>
                  <button onClick={() => { setSelected(c); fetchNotes(c.email); }} className="admin-link" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    View <ExternalLink size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Drawer */}
      {selected && (
        <div className="admin-detail-overlay" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="admin-detail-panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="admin-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{getInitials(selected.name)}</div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{selected.name}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={18} /></button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{fmt(selected.totalSpend)}</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Total Spend</p>
              </div>
              <div style={{ padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{selected.totalBookings}</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Bookings</p>
              </div>
            </div>

            <div className="admin-detail-grid" style={{ marginBottom: 16 }}>
              <div className="admin-detail-row"><span className="admin-detail-label">First Booking</span><span className="admin-detail-value">{selected.firstBooking !== "9999" ? format(new Date(selected.firstBooking), "MMM d, yyyy") : "—"}</span></div>
              <div className="admin-detail-row"><span className="admin-detail-label">Preferred Service</span><span className="admin-detail-value" style={{ textTransform: "capitalize" }}>{selected.preferredService}</span></div>
              <div className="admin-detail-row"><span className="admin-detail-label">Country</span><span className="admin-detail-value">{selected.country || "—"}</span></div>
            </div>

            {/* WhatsApp button */}
            <a href={getWhatsApp(selected.phone)} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "12px 20px", background: "#25D366", color: "white",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
              borderRadius: 8, textDecoration: "none", marginBottom: 20, border: "none",
            }}>
              <Phone size={15} /> WhatsApp
            </a>

            {/* Tags */}
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>Tags</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(tags[selected.email] || []).map(tag => (
                <span key={tag} style={{ padding: "4px 10px", background: "rgba(26,138,158,0.1)", color: "#1a8a9e", fontSize: 11, fontWeight: 500, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {tag}
                  <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 11 }}>×</button>
                </span>
              ))}
              {SUGGESTED_TAGS.filter(t => !(tags[selected.email] || []).includes(t)).slice(0, 3).map(tag => (
                <button key={tag} onClick={() => addTag(tag)} style={{ padding: "4px 10px", border: "0.5px dashed #e5e7eb", background: "none", cursor: "pointer", fontSize: 11, color: "#94a3b8", borderRadius: 10 }}>+ {tag}</button>
              ))}
            </div>

            {/* Booking History */}
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>Booking History</p>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 20 }}>
              {selected.bookings.sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || "")).map((b: any) => (
                <div key={b.id} style={{ padding: "8px 0", borderBottom: "0.5px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{b.service_type || "Rental"}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{format(new Date(b.tour_date || b.pickup_date), "MMM d, yyyy")}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{fmt(b.total_estimate || 0)}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>Notes</p>
            <div className="mb-3">
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note…" className="admin-filter-input w-full" style={{ minHeight: 50, resize: "vertical" }} />
              <button onClick={addNote} className="admin-btn-outline mt-2" disabled={!newNote.trim()}>Add Note</button>
            </div>
            {customerNotes.map((n: any) => (
              <div key={n.id} style={{ padding: "8px 0", borderBottom: "0.5px solid #f1f5f9" }}>
                <p style={{ fontSize: 13, color: "#334155" }}>{n.note}</p>
                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{format(new Date(n.created_at), "MMM d, yyyy h:mm a")}</p>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerDirectory;
