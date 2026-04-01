import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth } from "date-fns";
import { Star, MessageSquare, Plus, ExternalLink, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type ReviewItem = Tables<"review_queue">;
type ExternalReview = { id: string; platform: string; reviewer: string; rating: number; text: string; date: string };

const EXTERNAL_STORAGE_KEY = "gemscape-external-reviews";
const FILTER_OPTIONS = ["All", "Good (4-5★)", "Great (5★)", "Needs Attention (1-3★)"] as const;

const AdminReviewRequests = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [respondModal, setRespondModal] = useState<ReviewItem | null>(null);
  const [responseText, setResponseText] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [externalReviews, setExternalReviews] = useState<ExternalReview[]>(() => {
    try { return JSON.parse(localStorage.getItem(EXTERNAL_STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [extForm, setExtForm] = useState({ platform: "Google", reviewer: "", rating: 5, text: "", date: format(new Date(), "yyyy-MM-dd") });

  useEffect(() => {
    supabase.from("review_queue").select("*").order("scheduled_send", { ascending: true }).then(r => setItems(r.data || []));
  }, []);

  const thisMonth = useMemo(() => {
    const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
    return items.filter(i => i.created_at && i.created_at >= start);
  }, [items]);

  const reviewed = thisMonth.filter(i => i.review_left);
  const needsResponse = items.filter(i => i.review_left && !i.clicked).length;

  const openRespond = (item: ReviewItem) => {
    const template = `Hi ${item.customer_name},\n\nThank you so much for joining us on ${item.service_type || "your tour"}${item.tour_date ? ` on ${format(new Date(item.tour_date), "MMMM d, yyyy")}` : ""}! We're thrilled you had a wonderful experience.\n\nWe'd love it if you could share your thoughts on one of our review platforms — it helps other travelers discover us!\n\nWarm regards,\nGemscape Travel & Tours`;
    setResponseText(template);
    setRespondModal(item);
  };

  const handleSendResponse = async () => {
    if (!respondModal) return;
    setSending(respondModal.id);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/send-booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "review_request", bookingId: respondModal.booking_id, email: respondModal.customer_email, name: respondModal.customer_name, customMessage: responseText }),
      });
      await supabase.from("review_queue").update({ sent_at: new Date().toISOString() }).eq("id", respondModal.id);
      setItems(prev => prev.map(i => i.id === respondModal.id ? { ...i, sent_at: new Date().toISOString() } : i));
    } catch (e) { console.error(e); }
    setSending(null);
    setRespondModal(null);
  };

  const toggleApproval = async (item: ReviewItem) => {
    const newVal = !item.clicked;
    await supabase.from("review_queue").update({ clicked: newVal }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, clicked: newVal } : i));
  };

  const saveExternal = () => {
    const review: ExternalReview = { ...extForm, id: crypto.randomUUID() };
    const updated = [...externalReviews, review];
    setExternalReviews(updated);
    localStorage.setItem(EXTERNAL_STORAGE_KEY, JSON.stringify(updated));
    setShowAddExternal(false);
    setExtForm({ platform: "Google", reviewer: "", rating: 5, text: "", date: format(new Date(), "yyyy-MM-dd") });
  };

  const kpis = [
    { label: "Average Rating", value: "4.6", icon: <Star size={18} />, glow: "var(--aura-gold)", extra: (
      <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= 4 ? "#d4ad7c" : "none"} color="#d4ad7c" strokeWidth={s === 5 ? 1.5 : 0} />)}
      </div>
    )},
    { label: "Total Reviews", value: String(reviewed.length + externalReviews.length), icon: <MessageSquare size={18} />, glow: "var(--aura-teal)" },
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
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--aura-highlight)", color: k.glow }}>{k.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Reviews */}
      {externalReviews.length > 0 && (
        <div className="aura-glass" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 18, color: "var(--aura-text)" }}>Published Reviews</p>
            <button onClick={() => setShowAddExternal(true)} style={{
              fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
              border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-dim)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}><Plus size={12} /> Add Review</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
            {externalReviews.map(r => (
              <div key={r.id} style={{ padding: 16, borderRadius: 12, border: "1px solid var(--aura-glass-border)", background: "var(--aura-highlight)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, color: "var(--aura-text)" }}>{r.reviewer}</span>
                  <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", padding: "2px 8px", borderRadius: 6, background: "rgba(44,184,168,0.08)" }}>{r.platform}</span>
                </div>
                <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? "#d4ad7c" : "none"} color="#d4ad7c" strokeWidth={s > r.rating ? 1 : 0} />)}
                </div>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add External Review Button (if no reviews yet) */}
      {externalReviews.length === 0 && (
        <button onClick={() => setShowAddExternal(true)} className="aura-glass" style={{
          padding: "16px 24px", border: "1px dashed var(--aura-glass-border)", cursor: "pointer",
          fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent",
        }}><Plus size={14} /> Add External Review (Google / TripAdvisor)</button>
      )}

      {/* Filter Pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: filter === f ? 600 : 400,
            padding: "7px 16px", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${filter === f ? "rgba(60,200,184,0.4)" : "var(--aura-glass-border)"}`,
            background: filter === f ? "rgba(60,200,184,0.1)" : "transparent",
            color: filter === f ? "#3cc8b8" : "var(--aura-text-muted)",
          }}>{f}</button>
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
          const approved = item.clicked;
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
                      {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= 4 ? "#d4ad7c" : "none"} color="#d4ad7c" strokeWidth={s === 5 ? 1.5 : 0} />)}
                    </div>
                    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, fontStyle: "italic", color: "var(--aura-text-dim)", marginTop: 10, lineHeight: 1.6 }}>
                      "{hasReview ? "Amazing experience! The tour was incredible and our guide was very knowledgeable." : "Review pending…"}"
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: isMobile ? "flex-end" : "auto", alignItems: "flex-end" }}>
                  {/* Approved Badge */}
                  {hasReview && (
                    <button onClick={() => toggleApproval(item)} style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: "none", display: "flex", alignItems: "center", gap: 4,
                      background: approved ? "var(--aura-success-bg)" : "rgba(245,158,11,0.1)",
                      color: approved ? "var(--aura-success)" : "#F59E0B",
                    }}>
                      {approved ? <><Check size={11} /> Approved</> : "Pending Review"}
                    </button>
                  )}
                  {/* Action */}
                  {hasReview ? (
                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "var(--aura-success-bg)", color: "var(--aura-success)", border: "1px solid rgba(60,216,180,0.3)" }}>Done</span>
                  ) : !item.sent_at ? (
                    <button onClick={() => openRespond(item)} disabled={sending === item.id} style={{
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

      {/* Respond Modal */}
      <AnimatePresence>
        {respondModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,16,20,0.7)", backdropFilter: "blur(14px)" }}
            onClick={() => setRespondModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="aura-modal-panel"
              style={{ width: isMobile ? "96%" : 520, background: "var(--aura-modal-bg)", backdropFilter: "var(--aura-blur)", border: "1px solid var(--aura-glass-border)", borderRadius: 18, padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
              <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, color: "var(--aura-text)", marginBottom: 6 }}>Reply to {respondModal.customer_name}</p>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", marginBottom: 20 }}>{respondModal.customer_email}</p>

              <textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={10} style={{
                width: "100%", padding: "14px", borderRadius: 12, fontSize: 13, fontFamily: "var(--aura-font-body)",
                color: "var(--aura-text)", background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)",
                outline: "none", resize: "vertical", lineHeight: 1.6,
              }} />

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <a href="https://g.page/review" target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-dim)",
                  textDecoration: "none", fontFamily: "var(--aura-font-body)", minHeight: 44,
                }}><ExternalLink size={13} /> Google Review</a>
                <a href="https://www.tripadvisor.com/UserReview" target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-dim)",
                  textDecoration: "none", fontFamily: "var(--aura-font-body)", minHeight: 44,
                }}><ExternalLink size={13} /> TripAdvisor</a>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setRespondModal(null)} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, padding: "10px", borderRadius: 10,
                  border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-muted)", cursor: "pointer", minHeight: 44,
                }}>Cancel</button>
                <button onClick={handleSendResponse} disabled={!!sending} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, padding: "10px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))", color: "#0c2e32", cursor: "pointer", minHeight: 44,
                }}>{sending ? "Sending…" : "Send Response"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add External Review Modal */}
      <AnimatePresence>
        {showAddExternal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,16,20,0.7)", backdropFilter: "blur(14px)" }}
            onClick={() => setShowAddExternal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="aura-modal-panel"
              style={{ width: isMobile ? "96%" : 440, background: "var(--aura-modal-bg)", backdropFilter: "var(--aura-blur)", border: "1px solid var(--aura-glass-border)", borderRadius: 18, padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
              <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, color: "var(--aura-text)", marginBottom: 20 }}>Add External Review</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Platform</label>
                  <select value={extForm.platform} onChange={e => setExtForm(p => ({ ...p, platform: e.target.value }))} style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                    background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
                  }}>
                    <option value="Google">Google</option>
                    <option value="TripAdvisor">TripAdvisor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Reviewer Name</label>
                  <input value={extForm.reviewer} onChange={e => setExtForm(p => ({ ...p, reviewer: e.target.value }))} style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                    background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
                  }} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Rating</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setExtForm(p => ({ ...p, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        <Star size={20} fill={s <= extForm.rating ? "#d4ad7c" : "none"} color="#d4ad7c" strokeWidth={s > extForm.rating ? 1.5 : 0} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Review Text</label>
                  <textarea value={extForm.text} onChange={e => setExtForm(p => ({ ...p, text: e.target.value }))} rows={4} style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                    background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", resize: "none",
                  }} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Date</label>
                  <input type="date" value={extForm.date} onChange={e => setExtForm(p => ({ ...p, date: e.target.value }))} style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                    background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowAddExternal(false)} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, padding: "10px", borderRadius: 10,
                  border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-muted)", cursor: "pointer", minHeight: 44,
                }}>Cancel</button>
                <button onClick={saveExternal} disabled={!extForm.reviewer.trim() || !extForm.text.trim()} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, padding: "10px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg, var(--aura-teal), #1a9a8a)", color: "#fff", cursor: "pointer", minHeight: 44,
                  opacity: extForm.reviewer.trim() && extForm.text.trim() ? 1 : 0.5,
                }}>Save Review</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReviewRequests;
