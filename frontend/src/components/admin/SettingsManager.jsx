import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "../../lib/api";
import ImageUploader from "./ImageUploader";

const TEXT_FIELDS = [
  { key: "brand_name", label: "Brand Name" },
  { key: "tagline", label: "Tagline" },
  { key: "sales_phone", label: "Sales Phone" },
  { key: "service_phone", label: "Service Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "facebook", label: "Facebook URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "insurance_banner_title", label: "Insurance Page Banner Title" },
  { key: "insurance_banner_subtitle", label: "Insurance Page Banner Subtitle", textarea: true },
];

export default function SettingsManager({ token }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchSiteSettings().then(setSettings); }, []);

  const setField = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const next = await updateSiteSettings(token, settings);
      setSettings(next);
      setMsg("Saved successfully");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg(e?.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="settings-manager">
      <h2 className="font-display font-black text-xl uppercase tracking-tight mb-4">Site Settings</h2>
      <div className="bg-white border border-gray-200 p-6 space-y-5 max-w-3xl">
        {TEXT_FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={settings[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none"
                data-testid={`settings-${f.key}`}
              />
            ) : (
              <input
                type="text"
                value={settings[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none"
                data-testid={`settings-${f.key}`}
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">Insurance Page Banner Image</label>
          <ImageUploader
            token={token}
            value={settings.insurance_banner_image}
            onChange={(v) => setField("insurance_banner_image", v)}
            folder="punjab-honda/banners"
            testid="settings-insurance-banner-image"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button onClick={save} disabled={saving} className="bg-honda text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center gap-2" data-testid="settings-save">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {msg && <span className={`text-sm ${msg.includes("fail") ? "text-red-600" : "text-green-600"}`} data-testid="settings-msg">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
