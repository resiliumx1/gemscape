import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface PackageBooking {
  id: string;
  booking_ref: string;
  package_type: string;
  full_name: string;
  email: string;
  phone: string | null;
  travel_dates: string | null;
  party_size: number;
  experience_interests: string[] | null;
  special_requests: string | null;
  status: string;
  total_price: number | null;
  created_at: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
const PKG_COLORS: Record<string, string> = {
  explorer: "#2cb8a8",
  experience: "#C9A84C",
  elite: "#b8956a",
};

const AdminPackageBookings = ({ isMobile }: { isMobile: boolean }) => {
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPkg, setFilterPkg] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("package_bookings" as any).select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load package bookings"); console.error(error); }
    else setBookings((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("package_bookings" as any).update({ status, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (error) toast.error("Failed to update status");
    else { toast.success("Status updated"); fetchBookings(); }
  };

  const filtered = bookings.filter(b =>
    (filterPkg === "all" || b.package_type === filterPkg) &&
    (filterStatus === "all" || b.status === filterStatus)
  );

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <Filter size={16} style={{ color: "var(--aura-text-muted)" }} />
        <select value={filterPkg} onChange={e => setFilterPkg(e.target.value)}
          style={{ background: "var(--aura-card)", color: "var(--aura-text)", border: "1px solid var(--aura-border)", borderRadius: 6, padding: "6px 12px", fontSize: 13 }}>
          <option value="all">All Packages</option>
          <option value="explorer">Explorer</option>
          <option value="experience">Experience</option>
          <option value="elite">Elite</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: "var(--aura-card)", color: "var(--aura-text)", border: "1px solid var(--aura-border)", borderRadius: 6, padding: "6px 12px", fontSize: 13 }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--aura-text-muted)", fontSize: 13, fontFamily: "var(--aura-font-body)" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--aura-text-muted)", fontSize: 13, fontFamily: "var(--aura-font-body)" }}>No package bookings found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(b => {
            const expanded = expandedId === b.id;
            const color = PKG_COLORS[b.package_type] || "#2cb8a8";
            return (
              <div key={b.id} style={{
                background: "var(--aura-card)", border: "1px solid var(--aura-border)", borderRadius: 10, overflow: "hidden",
                transition: "all 0.3s ease",
              }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : b.id)}>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                    background: `${color}22`, color, fontFamily: "var(--aura-font-body)", textTransform: "capitalize",
                  }}>
                    {b.package_type}
                  </span>
                  <span style={{ color: "var(--aura-text)", fontWeight: 500, fontSize: 14, fontFamily: "var(--aura-font-body)" }}>{b.full_name}</span>
                  <span style={{ color: "var(--aura-text-muted)", fontSize: 12, fontFamily: "var(--aura-font-body)" }}>{b.booking_ref}</span>
                  <span style={{ color: "var(--aura-text-muted)", fontSize: 12, marginLeft: "auto", fontFamily: "var(--aura-font-body)" }}>
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  {expanded ? <ChevronUp size={16} style={{ color: "var(--aura-text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--aura-text-muted)" }} />}
                </div>

                {expanded && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--aura-border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginTop: 16 }}>
                      <Detail label="Email" value={b.email} />
                      <Detail label="Phone" value={b.phone || "—"} />
                      <Detail label="Travel Dates" value={b.travel_dates || "—"} />
                      <Detail label="Party Size" value={String(b.party_size)} />
                    </div>
                    {b.experience_interests && b.experience_interests.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)", display: "block", marginBottom: 8 }}>Interests</span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {b.experience_interests.map(i => (
                            <span key={i} style={{ background: "rgba(44,184,168,0.1)", color: "#2cb8a8", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontFamily: "var(--aura-font-body)" }}>{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {b.special_requests && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)", display: "block", marginBottom: 4 }}>Special Requests</span>
                        <p style={{ fontSize: 13, color: "var(--aura-text)", fontFamily: "var(--aura-font-body)", lineHeight: 1.6 }}>{b.special_requests}</p>
                      </div>
                    )}
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)" }}>Status:</span>
                      <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                        style={{ background: "var(--aura-card)", color: "var(--aura-text)", border: "1px solid var(--aura-border)", borderRadius: 6, padding: "4px 10px", fontSize: 13, fontFamily: "var(--aura-font-body)" }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span style={{ fontSize: 12, color: "var(--aura-text-muted)", fontFamily: "var(--aura-font-body)", display: "block", marginBottom: 2 }}>{label}</span>
    <span style={{ fontSize: 14, color: "var(--aura-text)", fontFamily: "var(--aura-font-body)" }}>{value}</span>
  </div>
);

export default AdminPackageBookings;
