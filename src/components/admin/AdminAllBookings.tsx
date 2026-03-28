import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MessageSquare, Check, X as XIcon, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Booking = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  tour_date: string;
  party_size: number;
  total_estimate: number | null;
  status: string | null;
  booking_ref: string | null;
  created_at: string | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "rgba(64,216,184,0.12)", text: "#40d8b8", border: "rgba(64,216,184,0.3)" },
  pending: { bg: "rgba(232,192,64,0.12)", text: "#e8c040", border: "rgba(232,192,64,0.3)" },
  cancelled: { bg: "rgba(240,104,104,0.12)", text: "#f06868", border: "rgba(240,104,104,0.3)" },
  completed: { bg: "rgba(96,184,240,0.12)", text: "#60b8f0", border: "rgba(96,184,240,0.3)" },
};

const AdminAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [msgModal, setMsgModal] = useState<Booking | null>(null);
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");
  const [msgText, setMsgText] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("rental_bookings").select("*").order("created_at", { ascending: false }),
    ]).then(([t, r]) => {
      const tours = (t.data || []).map((b: any) => ({ ...b, service_type: b.service_type || "Tour" }));
      const rents = (r.data || []).map((b: any) => ({
        ...b, service_type: "Car Rental", tour_date: b.pickup_date, party_size: 1,
      }));
      setBookings([...tours, ...rents].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()));
      setLoading(false);
    });
    const tm = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(tm);
  }, []);

  const counts = useMemo(() => ({
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  const filtered = useMemo(() =>
    filter === "all" ? bookings : bookings.filter(b => b.status === filter),
    [bookings, filter]
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await supabase.from("rental_bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); setMsgModal(null); setMsgText(""); }, 2000);
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const filters = [
    { key: "all", label: "All", count: bookings.length },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: filter === f.key ? 600 : 400,
            padding: "8px 16px", borderRadius: 10,
            border: `1px solid ${filter === f.key ? "rgba(60,200,184,0.4)" : "rgba(255,255,255,0.08)"}`,
            background: filter === f.key ? "rgba(60,200,184,0.1)" : "rgba(255,255,255,0.04)",
            color: filter === f.key ? "#3cc8b8" : "var(--aura-text-muted)", cursor: "pointer",
            backdropFilter: "blur(12px)", transition: "all 0.2s",
          }}>
            {f.label} <span style={{ marginLeft: 6, opacity: 0.6 }}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--aura-font-body)", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Client", "Tour", "Date & Time", "Guests", "Amount", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 500,
                    color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--aura-text-muted)" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--aura-text-muted)" }}>No bookings found</td></tr>
              ) : filtered.map(b => {
                const sc = STATUS_COLORS[b.status || "pending"] || STATUS_COLORS.pending;
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "default" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                          background: "linear-gradient(135deg, #3cc8b8, #d4aa44)", fontSize: 11, fontWeight: 700, color: "#060e1a",
                        }}>{getInitials(b.full_name)}</div>
                        <div>
                          <p style={{ fontWeight: 500, color: "var(--aura-text)", fontSize: 13 }}>{b.full_name}</p>
                          <p style={{ fontSize: 11, color: "var(--aura-text-muted)" }}>{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--aura-text-secondary)" }}>{b.service_type}</td>
                    <td style={{ padding: "12px 16px", color: "var(--aura-text-secondary)" }}>
                      {b.tour_date ? format(new Date(b.tour_date), "MMM d, yyyy") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--aura-text-secondary)" }}>{b.party_size}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--aura-text)" }}>
                      ${b.total_estimate?.toLocaleString() || "0"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: "capitalize",
                      }}>{b.status || "pending"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setMsgModal(b)} title="Message" style={{
                          width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)", color: "#60b8f0", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)",
                        }}><MessageSquare size={14} /></button>
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "confirmed")} title="Confirm" style={{
                            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(64,216,184,0.2)",
                            background: "rgba(64,216,184,0.08)", color: "#40d8b8", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}><Check size={14} /></button>
                        )}
                        {b.status !== "cancelled" && (
                          <button onClick={() => updateStatus(b.id, "cancelled")} title="Cancel" style={{
                            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(240,104,104,0.2)",
                            background: "rgba(240,104,104,0.08)", color: "#f06868", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}><XIcon size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messaging Modal */}
      <AnimatePresence>
        {msgModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,14,26,0.6)", backdropFilter: "blur(14px)",
            }}
            onClick={() => { setMsgModal(null); setSent(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 440, background: "rgba(12,20,36,0.85)", backdropFilter: "blur(22px) saturate(1.4)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "28px 28px 24px",
              }}
            >
              {sent ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(64,216,184,0.12)", color: "#40d8b8",
                  }}><Check size={24} /></div>
                  <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, color: "var(--aura-text)" }}>Message Sent</p>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", marginTop: 6 }}>
                    Your {channel} has been sent to {msgModal.full_name}
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, color: "var(--aura-text)", marginBottom: 6 }}>
                    Message {msgModal.full_name}
                  </p>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", marginBottom: 20 }}>
                    {msgModal.email}
                  </p>

                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {(["email", "sms", "push"] as const).map(c => (
                      <button key={c} onClick={() => setChannel(c)} style={{
                        fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: channel === c ? 600 : 400,
                        padding: "6px 14px", borderRadius: 8, textTransform: "capitalize",
                        border: `1px solid ${channel === c ? "rgba(60,200,184,0.4)" : "rgba(255,255,255,0.08)"}`,
                        background: channel === c ? "rgba(60,200,184,0.1)" : "transparent",
                        color: channel === c ? "#3cc8b8" : "var(--aura-text-muted)", cursor: "pointer",
                      }}>{c}</button>
                    ))}
                  </div>

                  <textarea
                    value={msgText} onChange={e => setMsgText(e.target.value)}
                    placeholder="Type your message…"
                    rows={4}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "12px 14px", color: "var(--aura-text)", resize: "none",
                      fontFamily: "var(--aura-font-body)", fontSize: 13, outline: "none",
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                    <button onClick={() => setMsgModal(null)} style={{
                      fontFamily: "var(--aura-font-body)", fontSize: 12, padding: "8px 18px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "var(--aura-text-muted)", cursor: "pointer",
                    }}>Cancel</button>
                    <button onClick={handleSend} style={{
                      fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, padding: "8px 18px", borderRadius: 10,
                      border: "none", background: "linear-gradient(135deg, #d4aa44, #c49a38)", color: "#060e1a",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}><Send size={13} /> Send</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAllBookings;
