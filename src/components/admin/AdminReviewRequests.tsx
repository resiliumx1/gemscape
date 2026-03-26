import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type ReviewItem = Tables<"review_queue">;

const AdminReviewRequests = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("review_queue").select("*").order("scheduled_send", { ascending: true });
    setItems(data || []);
  };

  const thisMonth = useMemo(() => {
    const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
    return items.filter((i) => i.created_at && i.created_at >= start);
  }, [items]);

  const sent = thisMonth.filter((i) => i.sent_at);
  const opened = thisMonth.filter((i) => i.opened);
  const clicked = thisMonth.filter((i) => i.clicked);
  const reviewed = thisMonth.filter((i) => i.review_left);

  const handleSendNow = async (item: ReviewItem) => {
    setSending(item.id);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/send-booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "review_request", bookingId: item.booking_id, email: item.customer_email, name: item.customer_name }),
      });
      await supabase.from("review_queue").update({ sent_at: new Date().toISOString() }).eq("id", item.id);
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, sent_at: new Date().toISOString() } : i));
    } catch (e) {
      console.error(e);
    }
    setSending(null);
  };

  const getStatusLabel = (item: ReviewItem) => {
    if (item.review_left) return { label: "Reviewed", cls: "admin-status-completed" };
    if (item.clicked) return { label: "Clicked", cls: "admin-status-confirmed" };
    if (item.opened) return { label: "Opened", cls: "admin-status-confirmed" };
    if (item.sent_at) return { label: "Sent", cls: "admin-status-pending" };
    return { label: "Scheduled", cls: "admin-status-cancelled" };
  };

  const maxBar = Math.max(sent.length, 1);

  const bars = [
    { label: "Sent", value: sent.length, color: "#C9A84C" },
    { label: "Opened", value: opened.length, color: "#1a8a9e" },
    { label: "Clicked", value: clicked.length, color: "#0f172a" },
    { label: "Reviewed", value: reviewed.length, color: "#3b6d11" },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Sent This Month" value={sent.length} />
        <StatCard label="Open Rate" value={sent.length ? `${Math.round((opened.length / sent.length) * 100)}%` : "—"} />
        <StatCard label="Click Rate" value={sent.length ? `${Math.round((clicked.length / sent.length) * 100)}%` : "—"} />
        <StatCard label="Reviews Confirmed" value={reviewed.length} />
      </div>

      {/* Funnel Bars */}
      <div className="admin-card-elevated p-5 mb-6">
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 16 }}>Funnel (This Month)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bars.map((bar) => (
            <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 64, fontSize: 12, color: "#64748b", flexShrink: 0 }}>{bar.label}</span>
              <div style={{ flex: 1, height: 32, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${Math.max((bar.value / maxBar) * 100, 4)}%`,
                  height: "100%", background: bar.color, borderRadius: 6,
                  transition: "width 0.5s", display: "flex", alignItems: "center", paddingLeft: 10,
                }}>
                  {bar.value > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{bar.value}</span>}
                </div>
              </div>
              <span style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#334155" }}>{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Guest</th><th>Service</th><th>Tour Date</th><th>Scheduled</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "#94a3b8" }}>No review requests</td></tr>
            )}
            {items.map((item) => {
              const st = getStatusLabel(item);
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.customer_name}</td>
                  <td>{item.service_type || "—"}</td>
                  <td>{item.tour_date ? format(new Date(item.tour_date), "MMM d, yyyy") : "—"}</td>
                  <td>{item.scheduled_send ? format(new Date(item.scheduled_send), "MMM d, h:mm a") : "—"}</td>
                  <td><span className={st.cls}>{st.label}</span></td>
                  <td>
                    {!item.sent_at ? (
                      <button onClick={() => handleSendNow(item)} disabled={sending === item.id} className="admin-btn-teal" style={{ padding: "6px 14px", fontSize: 11 }}>
                        {sending === item.id ? "Sending…" : "Send Now"}
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>Sent</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="admin-card-elevated" style={{ padding: "14px 16px" }}>
    <p style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>{value}</p>
    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{label}</p>
  </div>
);

export default AdminReviewRequests;
