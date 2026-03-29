import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon } from "lucide-react";

interface SettingsProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  isMobile?: boolean;
}

interface SiteSettings {
  id: string;
  owner_email: string;
  whatsapp_number: string;
  business_name: string;
}

const AdminSettings = ({ isDark = true, onToggleTheme, isMobile = false }: SettingsProps) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setField = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (!settings) return (
    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, color: "var(--aura-text-muted)" }}>Loading settings…</p>
  );

  return (
    <div style={{ maxWidth: isMobile ? "100%" : 520, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Business Profile */}
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)", marginBottom: 20 }}>
          Business Profile
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassInput label="Business Name" value={settings.business_name} onChange={v => setField("business_name", v)} />
          <GlassInput label="Email" value={settings.owner_email} onChange={v => setField("owner_email", v)} type="email" />
          <GlassInput label="Phone" value={settings.whatsapp_number} onChange={v => setField("whatsapp_number", v)} />
          <GlassInput label="Location" value="Antigua & Barbuda" onChange={() => {}} />
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", marginTop: 20, fontFamily: "var(--aura-font-body)", fontSize: 12, fontWeight: 600,
          padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #d4aa44, #c49a38)", color: "#060e1a", minHeight: 44,
        }}>{saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}</button>
      </div>

      {/* Appearance */}
      <div className="aura-glass" style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 21, color: "var(--aura-text)", marginBottom: 20 }}>
          Appearance
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={() => isDark && onToggleTheme?.()} style={{
            padding: "20px", borderRadius: 14, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1,
            border: `2px solid ${!isDark ? "rgba(60,200,184,0.5)" : "var(--aura-glass-border)"}`,
            background: !isDark ? "rgba(60,200,184,0.08)" : "var(--aura-glass)",
            color: !isDark ? "#3cc8b8" : "var(--aura-text-muted)",
            transition: "all 0.2s", minHeight: 44,
          }}>
            <Sun size={24} />
            <span style={{ fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600 }}>Light</span>
          </button>
          <button onClick={() => !isDark && onToggleTheme?.()} style={{
            padding: "20px", borderRadius: 14, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1,
            border: `2px solid ${isDark ? "rgba(60,200,184,0.5)" : "var(--aura-glass-border)"}`,
            background: isDark ? "rgba(60,200,184,0.08)" : "var(--aura-glass)",
            color: isDark ? "#3cc8b8" : "var(--aura-text-muted)",
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
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
      fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
      background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
    }} />
  </div>
);

export default AdminSettings;
