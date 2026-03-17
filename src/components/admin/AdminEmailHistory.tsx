import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { StatusBadge } from "./AdminDashboard";

const EMAIL_TYPES = ["All", "booking_confirmation", "owner_notification", "rental_confirmation", "review_request"];

const AdminEmailHistory = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("email_log").select("*").order("created_at", { ascending: false }).then(r => setEmails(r.data || []));
  }, []);

  const filtered = useMemo(() => emails.filter(e => {
    if (typeFilter !== "All" && e.email_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (e.recipient_email || "").toLowerCase().includes(q) || (e.booking_ref || "").toLowerCase().includes(q) || (e.subject || "").toLowerCase().includes(q);
    }
    return true;
  }), [emails, typeFilter, search]);

  const statusColors: Record<string, { bg: string; color: string }> = {
    sent: { bg: "rgba(26,107,107,0.12)", color: "hsl(var(--gem-teal))" },
    delivered: { bg: "rgba(26,107,107,0.12)", color: "hsl(var(--gem-teal))" },
    opened: { bg: "rgba(201,148,58,0.12)", color: "hsl(var(--gem-gold))" },
    clicked: { bg: "rgba(11,42,59,0.08)", color: "hsl(var(--gem-navy))" },
    bounced: { bg: "rgba(212,82,58,0.12)", color: "hsl(var(--gem-coral))" },
    failed: { bg: "rgba(212,82,58,0.12)", color: "hsl(var(--gem-coral))" },
  };

  return (
    <div>
      <h1 className="admin-page-title">Email History</h1>
      <p className="admin-page-sub">{emails.length} emails sent</p>

      <div className="flex flex-wrap gap-3 my-6">
        <input placeholder="Search email, ref, subject…" value={search} onChange={e => setSearch(e.target.value)} className="admin-filter-input" style={{ minWidth: 220 }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="admin-filter-input">
          {EMAIL_TYPES.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Recipient</th><th>Type</th><th>Subject</th><th>Ref</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6}>
                <div className="text-center py-12">
                  <span style={{ fontSize: 28, color: "hsl(var(--gem-sand))" }}>◆</span>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: "italic", fontSize: 24, color: "hsl(var(--gem-navy))", marginTop: 8 }}>No emails found</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(11,42,59,0.45)", marginTop: 4 }}>Emails will appear here once your Resend integration is active.</p>
                </div>
              </td></tr>
            )}
            {filtered.map(e => {
              const s = statusColors[e.status] || statusColors.sent;
              return (
                <tr key={e.id}>
                  <td>{e.created_at ? format(new Date(e.created_at), "MMM d, h:mm a") : "—"}</td>
                  <td>{e.recipient_email}</td>
                  <td style={{ fontSize: 11 }}>{(e.email_type || "").replace(/_/g, " ")}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject || "—"}</td>
                  <td style={{ fontWeight: 500, color: "hsl(var(--gem-gold))" }}>{e.booking_ref || "—"}</td>
                  <td>
                    <span style={{ display: "inline-block", padding: "4px 12px", background: s.bg, color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, textTransform: "capitalize" }}>{e.status}</span>
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

export default AdminEmailHistory;
