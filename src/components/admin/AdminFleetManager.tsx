import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;

const EMPTY_VEHICLE: Partial<Vehicle> = {
  name: "", category: "SUV", seats: 4, transmission: "Automatic", fuel_type: "Gasoline",
  luggage_capacity: 2, daily_rate: 0, weekly_rate: 0, description: "", features: [],
  image_url: "", image_url_2: "", image_url_3: "", available: true, ac: true, sort_order: 0,
};

const AdminFleetManager = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<Partial<Vehicle> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [featuresStr, setFeaturesStr] = useState("");

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*").order("sort_order", { ascending: true });
    setVehicles(data || []);
  };

  const toggleAvailability = async (v: Vehicle) => {
    await supabase.from("vehicles").update({ available: !v.available }).eq("id", v.id);
    setVehicles((prev) => prev.map((x) => x.id === v.id ? { ...x, available: !x.available } : x));
  };

  const openEdit = (v: Vehicle) => {
    setEditing({ ...v });
    setFeaturesStr((v.features || []).join(", "));
    setIsNew(false);
  };

  const openNew = () => {
    setEditing({ ...EMPTY_VEHICLE });
    setFeaturesStr("");
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name || "",
      category: editing.category || "SUV",
      seats: editing.seats || 4,
      transmission: editing.transmission || "Automatic",
      fuel_type: editing.fuel_type || "Gasoline",
      luggage_capacity: editing.luggage_capacity || 0,
      daily_rate: editing.daily_rate || 0,
      weekly_rate: editing.weekly_rate || null,
      description: editing.description || "",
      features: featuresStr.split(",").map((s) => s.trim()).filter(Boolean),
      image_url: editing.image_url || "",
      image_url_2: editing.image_url_2 || "",
      image_url_3: editing.image_url_3 || "",
      available: editing.available ?? true,
      ac: editing.ac ?? true,
      sort_order: editing.sort_order || 0,
    };

    if (isNew) {
      await supabase.from("vehicles").insert(payload);
    } else {
      await supabase.from("vehicles").update(payload).eq("id", editing.id!);
    }
    await fetchVehicles();
    setEditing(null);
    setSaving(false);
  };

  const setField = (key: string, value: any) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page-title">Fleet Manager</h1>
        <button onClick={openNew} className="admin-btn-primary">+ Add Vehicle</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((v) => (
          <div key={v.id} style={{ border: "1px solid hsl(var(--gem-sand))", backgroundColor: "white", overflow: "hidden" }}>
            {v.image_url && (
              <div style={{ aspectRatio: "16/10", overflow: "hidden" }}>
                <img src={v.image_url} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div className="p-4">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "hsl(var(--gem-gold))" }}>{v.category}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "hsl(var(--gem-navy))", marginTop: 4 }}>{v.name}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(11,42,59,0.55)", marginTop: 4 }}>
                {v.seats} seats · {v.transmission} · ${v.daily_rate}/day
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(v)} className="admin-btn-outline" style={{ flex: 1 }}>Edit</button>
                <button
                  onClick={() => toggleAvailability(v)}
                  className="admin-btn-outline"
                  style={{
                    flex: 1,
                    color: v.available ? "hsl(var(--gem-teal))" : "hsl(var(--gem-coral))",
                    borderColor: v.available ? "hsl(var(--gem-teal))" : "hsl(var(--gem-coral))",
                  }}
                >
                  {v.available ? "Available" : "Unavailable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="admin-detail-overlay" onClick={() => setEditing(null)}>
          <div className="admin-detail-panel" onClick={(e) => e.stopPropagation()} style={{ overflowY: "auto", maxHeight: "100vh" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="admin-section-title">{isNew ? "Add Vehicle" : "Edit Vehicle"}</h3>
              <button onClick={() => setEditing(null)} style={{ fontSize: 20, color: "rgba(11,42,59,0.4)", cursor: "pointer", background: "none", border: "none" }}>✕</button>
            </div>

            <div className="space-y-5">
              <Field label="Vehicle Name" value={editing.name || ""} onChange={(v) => setField("name", v)} />
              <div>
                <label className="admin-form-label">Category</label>
                <select value={editing.category || "SUV"} onChange={(e) => setField("category", e.target.value)} className="admin-filter-input w-full">
                  {["SUV", "Jeep", "Sedan", "Van", "Convertible"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Seats" type="number" value={String(editing.seats || 0)} onChange={(v) => setField("seats", parseInt(v) || 0)} />
                <div>
                  <label className="admin-form-label">Transmission</label>
                  <select value={editing.transmission || "Automatic"} onChange={(e) => setField("transmission", e.target.value)} className="admin-filter-input w-full">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-form-label">Fuel Type</label>
                  <select value={editing.fuel_type || "Gasoline"} onChange={(e) => setField("fuel_type", e.target.value)} className="admin-filter-input w-full">
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <Field label="Luggage Capacity" type="number" value={String(editing.luggage_capacity || 0)} onChange={(v) => setField("luggage_capacity", parseInt(v) || 0)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Daily Rate ($)" type="number" value={String(editing.daily_rate || 0)} onChange={(v) => setField("daily_rate", parseFloat(v) || 0)} />
                <Field label="Weekly Rate ($)" type="number" value={String(editing.weekly_rate || 0)} onChange={(v) => setField("weekly_rate", parseFloat(v) || 0)} />
              </div>
              <Field label="Description" value={editing.description || ""} onChange={(v) => setField("description", v)} textarea />
              <Field label="Features (comma-separated)" value={featuresStr} onChange={setFeaturesStr} />
              <Field label="Image URL 1" value={editing.image_url || ""} onChange={(v) => setField("image_url", v)} />
              <Field label="Image URL 2" value={editing.image_url_2 || ""} onChange={(v) => setField("image_url_2", v)} />
              <Field label="Image URL 3" value={editing.image_url_3 || ""} onChange={(v) => setField("image_url_3", v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sort Order" type="number" value={String(editing.sort_order || 0)} onChange={(v) => setField("sort_order", parseInt(v) || 0)} />
                <div>
                  <label className="admin-form-label">AC</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={editing.ac ?? true} onChange={(e) => setField("ac", e.target.checked)} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Air Conditioning</span>
                  </label>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="admin-btn-primary w-full mt-8">
              {saving ? "Saving…" : isNew ? "Add Vehicle" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) => (
  <div>
    <label className="admin-form-label">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="admin-filter-input w-full" style={{ minHeight: 80, resize: "vertical" }} />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="admin-filter-input w-full" />
    )}
  </div>
);

export default AdminFleetManager;
