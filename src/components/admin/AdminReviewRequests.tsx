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
    if (item.review_left) return { label: "Reviewed ◆", color: "hsl(var(--gem-teal))" };
    if (item.clicked) return { label: "Clicked", color: "hsl(var(--gem-navy))" };
    if (item.opened) return { label: "Opened", color: "hsl(var(--gem-teal))" };
    if (item.sent_at) return { label: "Sent", color: "hsl(var(--gem-gold))" };
    return { label: "Scheduled", color: "rgba(11,42,59,0.4)" };
  };

  return (
    <div>
      <h1 className="admin-page-title">Review Requests</h1>
      <p className="admin-page-sub">Manage post-experience review requests</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <StatCard label="Sent This Month" value={sent.length} />
        <StatCard label="Open Rate" value={sent.length ? `${Math.round((opened.length / sent.length) * 100)}%` : "—"} />
        <StatCard label="Click Rate" value={sent.length ? `${Math.round((clicked.length / sent.length) * 100)}%` : "—"} />
        <StatCard label="Reviews Confirmed" value={reviewed.length} />
      </div>

      {/* Bar Chart */}
      <div className="mt-8 p-6" style={{ backgroundColor: "white", border: "1px solid hsl(var(--gem-sand))" }}>
        <h4 className="admin-section-title mb-4">Sent vs Reviewed (This Month)</h4>
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          <Bar label="Sent" value={sent.length} max={Math.max(sent.length, 1)} color="hsl(var(--gem-gold))" />
          <Bar label="Opened" value={opened.length} max={Math.max(sent.length, 1)} color="hsl(var(--gem-teal))" />
          <Bar label="Clicked" value={clicked.length} max={Math.max(sent.length, 1)} color="hsl(var(--gem-navy))" />
          <Bar label="Reviewed" value={reviewed.length} max={Math.max(sent.length, 1)} color="hsl(var(--gem-aqua))" />
        </div>
      </div>

      {/* Queue Table */}
      <div className="admin-table-wrap mt-8">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Guest</th><th>Service</th><th>Tour Date</th><th>Scheduled</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "rgba(11,42,59,0.4)" }}>No review requests</td></tr>
            )}
            {items.map((item) => {
              const st = getStatusLabel(item);
              return (
                <tr key={item.id}>
                  <td>{item.customer_name}</td>
                  <td>{item.service_type || "—"}</td>
                  <td>{item.tour_date ? format(new Date(item.tour_date), "MMM d, yyyy") : "—"}</td>
                  <td>{item.scheduled_send ? format(new Date(item.scheduled_send), "MMM d, h:mm a") : "—"}</td>
                  <td><span style={{ color: st.color, fontWeight: 500, fontSize: 12 }}>{st.label}</span></td>
                  <td>
                    {!item.sent_at ? (
                      <button
                        onClick={() => handleSendNow(item)}
                        disabled={sending === item.id}
                        className="admin-link"
                      >
                        {sending === item.id ? "Sending…" : "Send Now"}
                      </button>
                    ) : (
                      <span style={{ color: "rgba(11,42,59,0.3)", fontSize: 12 }}>Sent ✓</span>
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
  <div className="admin-metric-card">
    <p className="admin-metric-value" style={{ fontSize: 36 }}>{value}</p>
    <p className="admin-metric-label">{label}</p>
  </div>
);

const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div className="flex flex-col items-center flex-1">
    <div style={{ width: "100%", height: `${Math.max((value / max) * 100, 4)}%`, backgroundColor: color, minHeight: 4, transition: "height 0.5s" }} />
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(11,42,59,0.5)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: "hsl(var(--gem-navy))" }}>{value}</span>
  </div>
);

export default AdminReviewRequests;
