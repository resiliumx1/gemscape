import { useState } from "react";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";

const AdminCustomerDirectory = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!to.trim() || !message.trim()) return;
    setSent(true);
    toast.success("Message sent successfully");
    setTimeout(() => { setSent(false); setTo(""); setSubject(""); setMessage(""); }, 2500);
  };

  return (
    <div style={{ maxWidth: isMobile ? "100%" : 600, margin: "0 auto" }}>
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, color: "var(--aura-text)", marginBottom: 20 }}>
          Compose Message
        </p>

        {/* Channel selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["email", "sms", "push"] as const).map(c => (
            <button key={c} onClick={() => setChannel(c)} style={{
              fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: channel === c ? 600 : 400,
              padding: "8px 18px", borderRadius: 10, textTransform: "capitalize", cursor: "pointer",
              border: `1px solid ${channel === c ? "rgba(44,184,168,0.4)" : "var(--aura-glass-border)"}`,
              background: channel === c ? "var(--aura-teal-dim)" : "transparent",
              color: channel === c ? "var(--aura-teal)" : "var(--aura-text-muted)",
              transition: "all 0.2s", flex: isMobile ? 1 : "none", minHeight: 44,
            }}>{c}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginBottom: 6 }}>To</p>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder={channel === "email" ? "email@example.com" : "+1268..."} style={{
              width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
              fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
              background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
            }} />
          </div>

          {channel === "email" && (
            <div>
              <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginBottom: 6 }}>Subject</p>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject" style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
              }} />
            </div>
          )}

          <div>
            <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginBottom: 6 }}>Message</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Type your message…" style={{
              width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 13, resize: "none",
              fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
              background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none",
            }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          {sent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, color: "var(--aura-success)" }}>
              <Check size={16} /> Message sent successfully
            </div>
          ) : (
            <button onClick={handleSend} disabled={!to.trim() || !message.trim()} style={{
              fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600, padding: "10px 24px",
              borderRadius: 10, border: "none", cursor: to.trim() && message.trim() ? "pointer" : "not-allowed",
              background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))", color: "#0c2e32",
              display: "flex", alignItems: "center", gap: 6,
              opacity: to.trim() && message.trim() ? 1 : 0.5, minHeight: 44,
            }}><Send size={13} /> Send</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDirectory;
