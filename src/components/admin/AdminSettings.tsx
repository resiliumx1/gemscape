import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon, Camera, X } from "lucide-react";
import { toast } from "sonner";

interface SettingsProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  isMobile?: boolean;
  profilePic?: string | null;
  onProfileUpload?: () => void;
  onProfileRemove?: () => void;
}

interface SiteSettings {
  id: string;
  owner_email: string;
  whatsapp_number: string;
  business_name: string;
}

const AdminSettings = ({ isDark = true, onToggleTheme, isMobile = false, profilePic = null, onProfileUpload, onProfileRemove }: SettingsProps) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).single().then(({ data }) => {
      if (data) setSettings(data as any);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from("site_settings").update({
      owner_email: settings.owner_email,
      whatsapp_number: settings.whatsapp_number,
      business_name: settings.business_name,
      updated_at: new Date().toISOString(),
    }).eq("id", settings.id);
    setSaving(false);
    toast.success("Settings saved");
  };

  const setField = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (!settings) return (
    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)" }}>Loading settings…</p>
  );

  return (
    <div style={{ maxWidth: isMobile ? "100%" : 520, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Profile Section */}
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)", marginBottom: 20 }}>Profile</p>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
              border: profilePic ? "3px solid var(--aura-teal)" : "none",
              ...(profilePic ? {} : {
                background: "linear-gradient(135deg, var(--aura-teal), var(--aura-gold))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }),
            }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 28, fontWeight: 700, color: "#fff" }}>GA</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={onProfileUpload} style={{
              fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 500,
              padding: "8px 16px", borderRadius: 10, border: "1px solid var(--aura-glass-border)",
              background: "var(--aura-glass)", color: "var(--aura-text-dim)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, minHeight: 36,
            }}>
              <Camera size={14} /> Upload Photo
            </button>
            {profilePic && (
              <button onClick={onProfileRemove} style={{
                fontFamily: "var(--aura-font-body)", fontSize: 12,
                background: "none", border: "none", color: "var(--aura-danger)",
                cursor: "pointer", padding: 0, textAlign: "left",
              }}>Remove</button>
            )}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <GlassInput label="Name" value={adminName} onChange={setAdminName} />
        </div>
      </div>

      {/* Business Profile */}
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)", marginBottom: 20 }}>Business Profile</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassInput label="Business Name" value={settings.business_name} onChange={v => setField("business_name", v)} />
          <GlassInput label="Email" value={settings.owner_email} onChange={v => setField("owner_email", v)} type="email" />
          <GlassInput label="Phone" value={settings.whatsapp_number} onChange={v => setField("whatsapp_number", v)} />
          <GlassInput label="Location" value="Antigua & Barbuda" onChange={() => {}} />
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", marginTop: 20, fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
          padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))", color: "#fff", minHeight: 44,
        }}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>

      {/* Appearance */}
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)", marginBottom: 20 }}>Appearance</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={() => isDark && onToggleTheme?.()} style={{
            padding: "20px", borderRadius: 14, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1,
            border: `2px solid ${!isDark ? "rgba(44,184,168,0.5)" : "var(--aura-glass-border)"}`,
            background: !isDark ? "var(--aura-teal-dim)" : "var(--aura-glass)",
            color: !isDark ? "var(--aura-teal)" : "var(--aura-text-muted)",
            transition: "all 0.2s", minHeight: 44,
          }}>
            <Sun size={24} />
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600 }}>Light</span>
          </button>
          <button onClick={() => !isDark && onToggleTheme?.()} style={{
            padding: "20px", borderRadius: 14, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1,
            border: `2px solid ${isDark ? "rgba(44,184,168,0.5)" : "var(--aura-glass-border)"}`,
            background: isDark ? "var(--aura-teal-dim)" : "var(--aura-glass)",
            color: isDark ? "var(--aura-teal)" : "var(--aura-text-muted)",
            transition: "all 0.2s", minHeight: 44,
          }}>
            <Moon size={24} />
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600 }}>Dark</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const GlassInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, color: "var(--aura-text-muted)", marginBottom: 6 }}>{label}</p>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="aura-input" />
  </div>
);

export default AdminSettings;
