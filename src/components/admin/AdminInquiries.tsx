import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Mail, Phone, Calendar, Users } from "lucide-react";

type InquiryKind = "itinerary" | "contact" | "concierge";

interface BaseRow {
  id: string;
  created_at: string;
  email: string;
  status?: string;
  [k: string]: any;
}

const STATUS_OPTIONS = ["new", "in_review", "responded", "converted", "closed"];

const TABS: { key: InquiryKind; label: string; table: string; hasStatus: boolean }[] = [
  { key: "itinerary", label: "Itinerary Requests", table: "itinerary_requests", hasStatus: true },
  { key: "contact",   label: "Contact Messages",   table: "contact_enquiries",  hasStatus: false },
  { key: "concierge", label: "Concierge Enquiries", table: "concierge_enquiries", hasStatus: true },
];

const STATUS_COLOR: Record<string, string> = {
  new: "#2cb8a8",
  in_review: "#C9A84C",
  responded: "#1a8a9e",
  converted: "#7dd3a8",
  closed: "#7a7a7a",
};

const AdminInquiries = ({ isMobile }: { isMobile: boolean }) => {
  const [tab, setTab] = useState<InquiryKind>("itinerary");
  const [rows, setRows] = useState<BaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const tabConfig = TABS.find((t) => t.key === tab)!;

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(tabConfig.table as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(`Failed to load ${tabConfig.label.toLowerCase()}`);
      console.error(error);
      setRows([]);
    } else {
      setRows((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setExpanded(null);
    setStatusFilter("all");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from(tabConfig.table as any)
      .update({ status } as any)
      .eq("id", id);
    if (error) toast.error("Failed to update status");
    else {
      toast.success("Status updated");
      load();
    }
  };

  const filtered = rows.filter(
    (r) => !tabConfig.hasStatus || statusFilter === "all" || r.status === statusFilter
  );

  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--aura-border)",
              background:
                tab === t.key
                  ? "linear-gradient(135deg, rgba(26,138,158,0.25), rgba(44,184,168,0.15))"
                  : "var(--aura-card)",
              color: tab === t.key ? "#2cb8a8" : "var(--aura-text)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--aura-font-body)",
              cursor: "pointer",
              transition: "all .25s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      {tabConfig.hasStatus && (
        <div style={{ marginBottom: 20 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: "var(--aura-card)",
              color: "var(--aura-text)",
              border: "1px solid var(--aura-border)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
            }}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--aura-text-muted)", fontSize: 13 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--aura-text-muted)", fontSize: 13 }}>
          No {tabConfig.label.toLowerCase()} found.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => {
            const isOpen = expanded === r.id;
            const name = r.full_name || r.name || r.email;
            const status = (r.status as string) || "new";
            const color = STATUS_COLOR[status] || "#2cb8a8";

            return (
              <div
                key={r.id}
                style={{
                  background: "var(--aura-card)",
                  border: "1px solid var(--aura-border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    cursor: "pointer",
                  }}
                >
                  {tabConfig.hasStatus && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        background: `${color}22`,
                        color,
                      }}
                    >
                      {status.replace("_", " ")}
                    </span>
                  )}
                  <span
                    style={{
                      color: "var(--aura-text)",
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    {name}
                  </span>
                  <span style={{ color: "var(--aura-text-muted)", fontSize: 12 }}>
                    {r.email}
                  </span>
                  <span
                    style={{
                      color: "var(--aura-text-muted)",
                      fontSize: 12,
                      marginLeft: "auto",
                    }}
                  >
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} style={{ color: "var(--aura-text-muted)" }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: "var(--aura-text-muted)" }} />
                  )}
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 20px",
                      borderTop: "1px solid var(--aura-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 14,
                        marginTop: 16,
                      }}
                    >
                      <Detail icon={<Mail size={13} />} label="Email" value={r.email} link={`mailto:${r.email}`} />
                      {(r.phone || r.whatsapp) && (
                        <Detail
                          icon={<Phone size={13} />}
                          label={r.whatsapp ? "WhatsApp" : "Phone"}
                          value={r.phone || r.whatsapp}
                          link={`tel:${(r.phone || r.whatsapp).replace(/\s/g, "")}`}
                        />
                      )}
                      {r.destination && <Detail label="Destination" value={r.destination} />}
                      {r.travel_dates && (
                        <Detail icon={<Calendar size={13} />} label="Travel Dates" value={r.travel_dates} />
                      )}
                      {r.travelers != null && (
                        <Detail icon={<Users size={13} />} label="Travelers" value={String(r.travelers)} />
                      )}
                      {r.guests != null && (
                        <Detail icon={<Users size={13} />} label="Guests" value={String(r.guests)} />
                      )}
                      {r.experience_type && <Detail label="Experience" value={r.experience_type} />}
                      {r.budget_range && <Detail label="Budget" value={r.budget_range} />}
                      {r.service_interest && <Detail label="Service Interest" value={r.service_interest} />}
                      {r.flight_number && <Detail label="Flight #" value={r.flight_number} />}
                      {r.arrival_date && <Detail label="Arrival" value={r.arrival_date} />}
                      {r.departure_date && <Detail label="Departure" value={r.departure_date} />}
                    </div>

                    {r.services_needed && Array.isArray(r.services_needed) && r.services_needed.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--aura-text-muted)", display: "block", marginBottom: 8 }}>
                          Services Needed
                        </span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {r.services_needed.map((s: string) => (
                            <span
                              key={s}
                              style={{
                                background: "rgba(44,184,168,0.1)",
                                color: "#2cb8a8",
                                padding: "3px 10px",
                                borderRadius: 12,
                                fontSize: 12,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(r.message || r.requirements) && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--aura-text-muted)", display: "block", marginBottom: 4 }}>
                          {r.message ? "Message" : "Requirements"}
                        </span>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--aura-text)",
                            lineHeight: 1.65,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {r.message || r.requirements}
                        </p>
                      </div>
                    )}

                    {tabConfig.hasStatus && (
                      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, color: "var(--aura-text-muted)" }}>Status:</span>
                        <select
                          value={status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                          style={{
                            background: "var(--aura-card)",
                            color: "var(--aura-text)",
                            border: "1px solid var(--aura-border)",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 13,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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

const Detail = ({
  icon,
  label,
  value,
  link,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) => (
  <div>
    <span
      style={{
        fontSize: 11,
        color: "var(--aura-text-muted)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: ".06em",
      }}
    >
      {icon} {label}
    </span>
    {link ? (
      <a href={link} style={{ fontSize: 14, color: "#2cb8a8", textDecoration: "none" }}>
        {value}
      </a>
    ) : (
      <span style={{ fontSize: 14, color: "var(--aura-text)" }}>{value}</span>
    )}
  </div>
);

export default AdminInquiries;
