import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Settings {
  id: string;
  owner_email: string;
  whatsapp_number: string;
  business_name: string;
  review_delay_hours: number;
  review_reminder_enabled: boolean;
  review_platforms: {
    google: { enabled: boolean; url: string };
    tripadvisor: { enabled: boolean; url: string };
    facebook: { enabled: boolean; url: string };
  };
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*").limit(1).single();
    if (data) setSettings(data as any);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from("site_settings").update({
      owner_email: settings.owner_email,
      whatsapp_number: settings.whatsapp_number,
      business_name: settings.business_name,
      review_delay_hours: settings.review_delay_hours,
      review_reminder_enabled: settings.review_reminder_enabled,
      review_platforms: settings.review_platforms as any,
      updated_at: new Date().toISOString(),
    }).eq("id", settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setField = (key: keyof Settings, value: any) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const setPlatform = (platform: string, field: string, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        review_platforms: {
          ...prev.review_platforms,
          [platform]: { ...prev.review_platforms[platform as keyof typeof prev.review_platforms], [field]: value },
        },
      };
    });
  };

  if (!settings) return <p style={{ color: "rgba(11,42,59,0.4)" }}>Loading settings…</p>;

  return (
    <div>
      <h1 className="admin-page-title">Settings</h1>
      <p className="admin-page-sub">Business configuration</p>

      <div className="mt-8 space-y-8" style={{ maxWidth: 600 }}>
        {/* Business Info */}
        <section>
          <h3 className="admin-section-title mb-4">Business Information</h3>
          <div className="space-y-5">
            <div>
              <label className="admin-form-label">Business Name</label>
              <input value={settings.business_name} onChange={(e) => setField("business_name", e.target.value)} className="admin-filter-input w-full" />
            </div>
            <div>
              <label className="admin-form-label">Owner Email (notifications)</label>
              <input type="email" value={settings.owner_email} onChange={(e) => setField("owner_email", e.target.value)} className="admin-filter-input w-full" />
            </div>
            <div>
              <label className="admin-form-label">WhatsApp Number</label>
              <input value={settings.whatsapp_number} onChange={(e) => setField("whatsapp_number", e.target.value)} className="admin-filter-input w-full" placeholder="+1268..." />
            </div>
          </div>
        </section>

        {/* Review Settings */}
        <section>
          <h3 className="admin-section-title mb-4">Review Request Settings</h3>
          <div className="space-y-5">
            <div>
              <label className="admin-form-label">Send Review Request After</label>
              <select value={settings.review_delay_hours} onChange={(e) => setField("review_delay_hours", parseInt(e.target.value))} className="admin-filter-input w-full">
                <option value={0}>Same day (evening)</option>
                <option value={24}>24 hours after tour</option>
                <option value={48}>48 hours after tour</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.review_reminder_enabled} onChange={(e) => setField("review_reminder_enabled", e.target.checked)} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Send a reminder 3 days later if no review left</span>
            </label>
          </div>
        </section>

        {/* Platforms */}
        <section>
          <h3 className="admin-section-title mb-4">Review Platforms</h3>
          <div className="space-y-5">
            {(["google", "tripadvisor", "facebook"] as const).map((p) => (
              <div key={p} className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.review_platforms[p]?.enabled ?? false}
                    onChange={(e) => setPlatform(p, "enabled", e.target.checked)}
                  />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, textTransform: "capitalize" }}>{p === "tripadvisor" ? "TripAdvisor" : p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </label>
                {settings.review_platforms[p]?.enabled && (
                  <input
                    value={settings.review_platforms[p]?.url || ""}
                    onChange={(e) => setPlatform(p, "url", e.target.value)}
                    placeholder={`Direct review URL for ${p}`}
                    className="admin-filter-input w-full"
                    style={{ marginLeft: 28 }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <button onClick={handleSave} disabled={saving} className="admin-btn-primary">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
