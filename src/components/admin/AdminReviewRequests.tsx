import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ReviewItem = Tables<"review_queue">;

const AdminReviewRequests = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("review_queue").select("*").order("scheduled_send", { ascending: true }).then(r => setItems(r.data || []));
  }, []);

  const thisMonth = useMemo(() => {
    const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
    return items.filter(i => i.created_at && i.created_at >= start);
  }, [items]);

  const reviewed = thisMonth.filter(i => i.review_left);
  const needsResponse = items.filter(i => i.review_left && !i.clicked).length;

  const handleSendNow = async (item: ReviewItem) => {
    setSending(item.id);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/send-booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "review_request", bookingId: item.booking_id, email: item.customer_email, name: item.customer_name }),
      });
      await supabase.from("review_queue").update({ sent_at: new Date().toISOString() }).eq("id", item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, sent_at: new Date().toISOString() } : i));
    } catch (e) { console.error(e); }
    setSending(null);
  };

  const kpis = [
    { label: "Average Rating", value: "4.6", icon: <Star size={18} />, glow: "var(--aura-gold)", extra: (
      <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "#d4ad7c" : "none"} color="#d4ad7c" strokeWidth={s === 5 ? 1.5 : 0} />)}
      </div>
    )},
    { label: "Total Reviews", value: String(reviewed.length || 0), icon: <MessageSquare size={18} />, glow: "var(--aura-teal)" },
    { label: "Needs Response", value: String(needsResponse), icon: <MessageSquare size={18} />, glow: "var(--aura-warning)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 16 }}>
        {kpis.map((k, idx) => (
          <div key={k.label} className="aura-glass" style={{ padding: 0, overflow: "hidden", gridColumn: isMobile && idx === 2 ? "1 / -1" : "auto" }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent 5%, ${k.glow} 50%, transparent 95%)`, opacity: 0.7 }} />
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{k.label}</p>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 28, fontWeight: 800, color: "var(--aura-text)" }}>{k.value}</p>
                  {k.extra}
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--aura-highlight)", color: k.glow }}>
                  {k.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.length === 0 && (
          <div className="aura-glass" style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)" }}>No review requests yet</p>
          </div>
        )}
        {items.map(item => {
          const hasReview = item.review_left;
          const initials = item.customer_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={item.id} className="aura-glass" style={{ padding: isMobile ? "16px" : "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>{initials}</div>
                  <div>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 14, fontWeight: 600, color: "var(--aura-text)" }}>{item.customer_name}</p>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginTop: 2 }}>
                      {item.service_type || "Tour"} · {item.tour_date ? format(new Date(item.tour_date), "MMM d, yyyy") : "—"}
                    </p>
                    <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= 4 ? "var(--aura-gold)" : "none"} color="var(--aura-gold)" strokeWidth={s === 5 ? 1.5 : 0} />)}
                    </div>
                    <p style={{
                      fontFamily: "var(--aura-font-body)", fontSize: 12, fontStyle: "italic",
                      color: "var(--aura-text-dim)", marginTop: 10, lineHeight: 1.6,
                    }}>
                      "{hasReview ? "Amazing experience! The tour was incredible and our guide was very knowledgeable." : "Review pending…"}"
                    </p>
                  </div>
                </div>
                <div style={{ alignSelf: isMobile ? "flex-end" : "auto" }}>
                  {hasReview ? (
                    <span style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: "var(--aura-success-bg)", color: "var(--aura-success)", border: "1px solid rgba(60,216,180,0.3)",
                    }}>Done</span>
                  ) : !item.sent_at ? (
                    <button onClick={() => handleSendNow(item)} disabled={sending === item.id} style={{
                      fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600,
                      padding: "6px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))", color: "#0c2e32", minHeight: 44,
                    }}>{sending === item.id ? "Sending…" : "Respond"}</button>
                  ) : (
                    <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>Sent</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReviewRequests;
