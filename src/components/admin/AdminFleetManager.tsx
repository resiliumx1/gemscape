import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Fuel } from "lucide-react";

type Vehicle = Tables<"vehicles">;

const FUEL_LABELS: Record<string, number> = { Empty: 0, Low: 15, Quarter: 25, Half: 50, "Three-Quarter": 75, Full: 100 };
const FUEL_STORAGE_KEY = "gemscape-fleet-fuel-levels";
const CATEGORIES = ["SUV", "Jeep", "Sedan", "Van", "Convertible"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const FUEL_TYPES = ["Gasoline", "Diesel", "Hybrid", "Electric"];

const AdminFleetManager = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<Partial<Vehicle> & { licensePlate?: string; year?: string; fuelLevel?: string }>  | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [featuresStr, setFeaturesStr] = useState("");
  const [fuelLevels, setFuelLevels] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(FUEL_STORAGE_KEY) || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    supabase.from("vehicles").select("*").order("sort_order", { ascending: true }).then(r => setVehicles(r.data || []));
  }, []);

  const toggleAvailability = async (v: Vehicle) => {
    await supabase.from("vehicles").update({ available: !v.available }).eq("id", v.id);
    setVehicles(prev => prev.map(x => x.id === v.id ? { ...x, available: !x.available } : x));
  };

  const openEdit = (v: Vehicle) => {
    setEditing({ ...v, fuelLevel: fuelLevels[v.id] || "Half" });
    setFeaturesStr((v.features || []).join(", "));
    setIsNew(false);
  };
  const openNew = () => {
    setEditing({ name: "", category: "SUV", seats: 4, transmission: "Automatic", fuel_type: "Gasoline", daily_rate: 0, available: true, ac: true, fuelLevel: "Full" });
    setFeaturesStr("");
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name || "", category: editing.category || "SUV", seats: editing.seats || 4,
      transmission: editing.transmission || "Automatic", fuel_type: editing.fuel_type || "Gasoline",
      daily_rate: editing.daily_rate || 0, available: editing.available ?? true, ac: editing.ac ?? true,
      features: featuresStr.split(",").map(s => s.trim()).filter(Boolean),
      image_url: editing.image_url || "", description: editing.description || "",
      luggage_capacity: editing.luggage_capacity || null,
    };
    let vehicleId = editing.id;
    if (isNew) {
      const { data } = await supabase.from("vehicles").insert(payload).select("id").single();
      vehicleId = data?.id;
    } else {
      await supabase.from("vehicles").update(payload).eq("id", editing.id!);
    }
    // Save fuel level
    if (vehicleId && editing.fuelLevel) {
      const updated = { ...fuelLevels, [vehicleId]: editing.fuelLevel };
      setFuelLevels(updated);
      localStorage.setItem(FUEL_STORAGE_KEY, JSON.stringify(updated));
    }
    const { data } = await supabase.from("vehicles").select("*").order("sort_order", { ascending: true });
    setVehicles(data || []);
    setEditing(null);
    setSaving(false);
  };

  const setField = (key: string, value: any) => setEditing(prev => prev ? { ...prev, [key]: value } : prev);

  const getFuel = (id: string) => {
    const level = fuelLevels[id] || "Half";
    return FUEL_LABELS[level] ?? 50;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={openNew} style={{
          fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, padding: "10px 20px",
          borderRadius: "var(--aura-radius-btn)", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--aura-gold), var(--aura-gold-hover))", color: "#0c2e32", minHeight: 44,
        }}>+ Add Vehicle</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        {vehicles.map(v => {
          const fuel = getFuel(v.id);
          const fuelColor = fuel > 60 ? "var(--aura-success)" : fuel > 30 ? "var(--aura-warning)" : "var(--aura-danger)";
          const statusPill = v.available
            ? { bg: "var(--aura-success-bg)", text: "var(--aura-success)", border: "rgba(60,216,180,0.25)", label: "Active" }
            : { bg: "var(--aura-warning-bg)", text: "var(--aura-warning)", border: "rgba(224,184,76,0.25)", label: "Maintenance" };

          return (
            <div key={v.id} className="aura-glass" style={{ padding: "24px", cursor: "pointer" }} onClick={() => openEdit(v)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 20, fontWeight: 600, color: "var(--aura-text)", letterSpacing: "-0.02em" }}>{v.name}</p>
                  <p style={{ fontFamily: "var(--aura-font-mono)", fontSize: 12, color: "var(--aura-text-muted)", marginTop: 6 }}>
                    {v.seats} seats · {v.transmission} · ${v.daily_rate}/day
                  </p>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  background: statusPill.bg, color: statusPill.text, border: `1px solid ${statusPill.border}`,
                  fontFamily: "var(--aura-font-body)", display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusPill.text }} />
                  {statusPill.label}
                </span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)", marginBottom: 2 }}>
                  {v.category} · {v.fuel_type}
                </p>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 12, color: "var(--aura-text-muted)" }}>
                  Fuel: {fuelLevels[v.id] || "Half"}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Fuel size={14} style={{ color: "var(--aura-text-muted)" }} />
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(120,200,200,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${fuel}%`, height: "100%", borderRadius: 2, background: fuelColor, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontFamily: "var(--aura-font-mono)", fontSize: 10, fontWeight: 500, color: fuelColor, minWidth: 30 }}>{fuel}%</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={e => { e.stopPropagation(); toggleAvailability(v); }} style={{
                  flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 12, padding: "8px 0", borderRadius: "var(--aura-radius-btn)", cursor: "pointer",
                  border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-dim)", minHeight: 44,
                }}>{v.available ? "Set Maintenance" : "Set Active"}</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,16,20,0.7)", backdropFilter: "blur(14px)" }}
          onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="aura-modal-panel" style={{
            width: isMobile ? "96%" : 520, maxHeight: "90vh", overflowY: "auto",
            background: "var(--aura-modal-bg)", backdropFilter: "var(--aura-blur)",
            border: "1px solid var(--aura-glass-border)", borderRadius: "var(--aura-radius-card)", padding: "28px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}>
            <p style={{ fontFamily: "var(--aura-font-heading)", fontSize: 22, fontWeight: 600, color: "var(--aura-text)", marginBottom: 24, letterSpacing: "-0.02em" }}>
              {isNew ? "Add Vehicle" : "Edit Vehicle"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Row 1: Name + Category */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                <GlassInput label="Vehicle Name" value={editing.name || ""} onChange={v => setField("name", v)} />
                <GlassSelect label="Category" value={editing.category || "SUV"} options={CATEGORIES} onChange={v => setField("category", v)} />
              </div>
              {/* Row 2: Seats + Daily Rate */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <GlassInput label="Seats" type="number" value={String(editing.seats || 0)} onChange={v => setField("seats", parseInt(v) || 0)} />
                <GlassInput label="Daily Rate ($)" type="number" value={String(editing.daily_rate || 0)} onChange={v => setField("daily_rate", parseFloat(v) || 0)} />
              </div>
              {/* Row 3: Transmission + Fuel Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <GlassSelect label="Transmission" value={editing.transmission || "Automatic"} options={TRANSMISSIONS} onChange={v => setField("transmission", v)} />
                <GlassSelect label="Fuel Type" value={editing.fuel_type || "Gasoline"} options={FUEL_TYPES} onChange={v => setField("fuel_type", v)} />
              </div>
              {/* Row 4: Luggage + AC */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <GlassInput label="Luggage Capacity" type="number" value={String(editing.luggage_capacity || 0)} onChange={v => setField("luggage_capacity", parseInt(v) || 0)} />
                <div>
                  <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>AC</p>
                  <button onClick={() => setField("ac", !editing.ac)} style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--aura-radius-input)", fontSize: 13,
                    fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                    background: editing.ac ? "rgba(44,184,168,0.12)" : "var(--aura-input-bg)",
                    border: `1px solid ${editing.ac ? "rgba(44,184,168,0.3)" : "var(--aura-input-border)"}`, cursor: "pointer", minHeight: 44,
                  }}>{editing.ac ? "Yes ✓" : "No"}</button>
                </div>
              </div>
              {/* Row 5: Image URL */}
              <GlassInput label="Image URL" value={editing.image_url || ""} onChange={v => setField("image_url", v)} />
              {/* Row 6: Description */}
              <div>
                <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</p>
                <textarea value={editing.description || ""} onChange={e => setField("description", e.target.value)} rows={3} style={{
                  width: "100%", padding: "10px 14px", borderRadius: "var(--aura-radius-input)", fontSize: 13,
                  fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
                  background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", resize: "none",
                }} />
              </div>
              {/* Row 7: Features */}
              <GlassInput label="Features (comma-separated)" value={featuresStr} onChange={setFeaturesStr} />
              {/* Row 8: Fuel Level */}
              <GlassSelect label="Fuel Level" value={editing.fuelLevel || "Half"} options={Object.keys(FUEL_LABELS)} onChange={v => setField("fuelLevel", v)} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setEditing(null)} style={{
                flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 13, padding: "10px", borderRadius: "var(--aura-radius-btn)",
                border: "1px solid var(--aura-glass-border)", background: "transparent", color: "var(--aura-text-dim)", cursor: "pointer", minHeight: 44,
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, fontFamily: "var(--aura-font-body)", fontSize: 13, fontWeight: 600, padding: "10px", borderRadius: "var(--aura-radius-btn)",
                border: "none", background: "linear-gradient(135deg, var(--aura-teal), #1a9a8a)", color: "#fff", cursor: "pointer", minHeight: 44,
              }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GlassInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "10px 14px", borderRadius: "var(--aura-radius-input)", fontSize: 13,
      fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
      background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
    }} />
  </div>
);

const GlassSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div>
    <p style={{ fontFamily: "var(--aura-font-body)", fontSize: 11, fontWeight: 600, color: "var(--aura-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "10px 14px", borderRadius: "var(--aura-radius-input)", fontSize: 13,
      fontFamily: "var(--aura-font-body)", color: "var(--aura-text)",
      background: "var(--aura-input-bg)", border: "1px solid var(--aura-input-border)", outline: "none", minHeight: 44,
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default AdminFleetManager;
