import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  email: { bg: "rgba(96,184,240,0.12)", text: "#60b8f0" },
  sms: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  delivered: { bg: "rgba(255,255,255,0.06)", text: "var(--aura-text-muted)", border: "var(--aura-glass-border)" },
  sent: { bg: "rgba(255,255,255,0.06)", text: "var(--aura-text-muted)", border: "var(--aura-glass-border)" },
  opened: { bg: "rgba(64,216,184,0.12)", text: "#40d8b8", border: "rgba(64,216,184,0.3)" },
  clicked: { bg: "rgba(64,216,184,0.12)", text: "#40d8b8", border: "rgba(64,216,184,0.3)" },
  failed: { bg: "rgba(240,104,104,0.12)", text: "#f06868", border: "rgba(240,104,104,0.3)" },
  bounced: { bg: "rgba(240,104,104,0.12)", text: "#f06868", border: "rgba(240,104,104,0.3)" },
};

const AdminEmailHistory = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.from("email_log").select("*").order("created_at", { ascending: false }).then(r => setEmails(r.data || []));
  }, []);

  const filtered = useMemo(() =>
    filter === "all" ? emails : emails.filter(e => filter === "email" ? e.email_type !== "sms" : e.email_type === "sms"),
    [emails, filter]
  );

  const filters = [
    { key: "all", label: "All" },
    { key: "email", label: "EMAIL" },
    { key: "sms", label: "SMS" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: filter === f.key ? 600 : 400,
            padding: "8px 16px", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${filter === f.key ? "rgba(60,200,184,0.4)" : "var(--aura-glass-border)"}`,
            background: filter === f.key ? "rgba(60,200,184,0.1)" : "var(--aura-glass)",
            color: filter === f.key ? "#3cc8b8" : "var(--aura-text-muted)",
            backdropFilter: "blur(12px)", transition: "all 0.2s", minHeight: isMobile ? 44 : "auto",
          }}>{f.label}</button>
        ))}
      </div>

      {isMobile ? (
        /* Mobile: Card layout */
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div className="aura-glass">
              <div className="aura-empty-state">
                <div className="aura-empty-state__blob" />
                <p className="aura-empty-state__title">No communications yet</p>
                <p className="aura-empty-state__text">Your email and SMS history will appear here once messages are sent</p>
                <button className="aura-empty-state__action">
                  Send your first message <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : filtered.map(e => {
            const tc = TYPE_COLORS[e.email_type === "sms" ? "sms" : "email"];
            const sc = STATUS_COLORS[e.status] || STATUS_COLORS.delivered;
            return (
              <div key={e.id} className="aura-glass" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 500, color: "var(--aura-text)" }}>{e.recipient_email}</p>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                    background: tc.bg, color: tc.text, textTransform: "uppercase",
                  }}>{e.email_type === "sms" ? "SMS" : "EMAIL"}</span>
                </div>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-dim)", marginBottom: 4 }}>{e.subject || "—"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)" }}>
                    {e.created_at ? format(new Date(e.created_at), "MMM d, h:mm a") : "—"}
                  </span>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "capitalize",
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                  }}>{e.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop: Table */
        <div className="aura-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--aura-font-body)", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--aura-glass-border)" }}>
                  {["To", "Type", "Subject", "Date", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 500,
                      color: "var(--aura-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--aura-text-muted)" }}>No emails found</td></tr>
                ) : filtered.map(e => {
                  const tc = TYPE_COLORS[e.email_type === "sms" ? "sms" : "email"];
                  const sc = STATUS_COLORS[e.status] || STATUS_COLORS.delivered;
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = "var(--aura-teal-dim)")}
                      onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "12px 16px", color: "var(--aura-text)" }}>{e.recipient_email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                          background: tc.bg, color: tc.text, textTransform: "uppercase",
                        }}>{e.email_type === "sms" ? "SMS" : "EMAIL"}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--aura-text-dim)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.subject || "—"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--aura-text-muted)", fontSize: 12 }}>
                        {e.created_at ? format(new Date(e.created_at), "MMM d, h:mm a") : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "capitalize",
                          background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        }}>{e.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailHistory;
