import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import ImageUploader from "./ImageUploader";

const Label = ({ children }) => (
  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>
);

/**
 * Generic CRUD manager. Renders a table + add/edit drawer-style modal.
 * fields: [{ key, label, type: 'text'|'textarea'|'number'|'select'|'image'|'boolean', options? }]
 */
export default function CrudManager({ token, title, api, fields, columns, getNewItem, imageFolder = "punjab-honda/uploads" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {…} = edit
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.list(token)); }
    finally { setLoading(false); }
  }, [api, token]);

  useEffect(() => { load(); }, [load]);

  const onSave = async () => {
    setSaving(true); setErr("");
    try {
      if (editing.id) {
        await api.update(token, editing.id, editing);
      } else {
        await api.create(token, editing);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    await api.remove(token, id);
    await load();
  };

  const setField = (k, v) => setEditing(prev => ({ ...prev, [k]: v }));

  return (
    <div data-testid={`crud-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display font-black text-xl uppercase tracking-tight">{title}</h2>
        <button
          onClick={() => setEditing({ ...getNewItem() })}
          className="bg-honda text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark flex items-center gap-2"
          data-testid="crud-add-btn"
        >
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-honda mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-500" data-testid="crud-empty">No items yet. Click "Add New" to start.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold">
              <tr>
                {columns.map(c => <th key={c.key} className="text-left p-3">{c.label}</th>)}
                <th className="text-right p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`crud-row-${it.id}`}>
                  {columns.map(c => (
                    <td key={c.key} className="p-3 text-xs">
                      {c.render ? c.render(it) : (
                        c.key === "image" && it[c.key]
                          ? <img src={it[c.key]} alt="" className="w-12 h-9 object-cover" />
                          : c.key === "active"
                            ? <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${it[c.key] ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{it[c.key] ? "Active" : "Hidden"}</span>
                            : (it[c.key] ?? "—").toString().slice(0, 80)
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing({ ...it })} className="text-blue-600 hover:text-blue-800 mr-3" data-testid={`crud-edit-${it.id}`}><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => onDelete(it.id)} className="text-red-600 hover:text-red-800" data-testid={`crud-delete-${it.id}`}><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-end" data-testid="crud-edit-modal">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
            <div className="bg-gray-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-honda">{title}</div>
                <h3 className="font-display font-bold text-lg">{editing.id ? "Edit" : "Add"} {title.replace(/s$/, "")}</h3>
              </div>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-gray-800" data-testid="crud-modal-close"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              {fields.map(f => (
                <div key={f.key}>
                  <Label>{f.label}{f.required && " *"}</Label>
                  {f.type === "textarea" && (
                    <textarea
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                      rows={f.rows || 3}
                      className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none"
                      data-testid={`crud-field-${f.key}`}
                    />
                  )}
                  {f.type === "select" && (
                    <select
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none bg-white"
                      data-testid={`crud-field-${f.key}`}
                    >
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                  {f.type === "boolean" && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!editing[f.key]}
                        onChange={(e) => setField(f.key, e.target.checked)}
                        data-testid={`crud-field-${f.key}`}
                        className="accent-honda"
                      />
                      <span className="text-sm text-gray-700">{f.helpText || "Visible on site"}</span>
                    </label>
                  )}
                  {f.type === "image" && (
                    <ImageUploader
                      token={token}
                      value={editing[f.key] ?? ""}
                      onChange={(v) => setField(f.key, v)}
                      folder={imageFolder}
                      testid={`crud-image-${f.key}`}
                    />
                  )}
                  {f.type === "string-list" && (
                    <textarea
                      value={Array.isArray(editing[f.key]) ? editing[f.key].join("\n") : ""}
                      onChange={(e) => setField(f.key, e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                      rows={5}
                      placeholder="One value per line"
                      className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none font-mono"
                      data-testid={`crud-field-${f.key}`}
                    />
                  )}
                  {f.type === "kv-map" && (
                    <textarea
                      value={editing[f.key] && typeof editing[f.key] === "object"
                        ? Object.entries(editing[f.key]).map(([k, v]) => `${k}: ${v}`).join("\n")
                        : ""}
                      onChange={(e) => {
                        const obj = {};
                        e.target.value.split("\n").forEach(line => {
                          const idx = line.indexOf(":");
                          if (idx > 0) {
                            const k = line.slice(0, idx).trim();
                            const v = line.slice(idx + 1).trim();
                            if (k) obj[k] = v;
                          }
                        });
                        setField(f.key, obj);
                      }}
                      rows={10}
                      placeholder="Key: Value (one per line)"
                      className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none font-mono"
                      data-testid={`crud-field-${f.key}`}
                    />
                  )}
                  {f.helpText && <div className="text-[11px] text-gray-500 mt-1">{f.helpText}</div>}
                  {(f.type === "text" || f.type === "number" || !f.type) && (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-300 px-3 py-2 text-sm rounded-none"
                      data-testid={`crud-field-${f.key}`}
                    />
                  )}
                </div>
              ))}
              {err && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="crud-modal-error">{err}</div>}
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button onClick={onSave} disabled={saving} className="bg-honda text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center gap-2" data-testid="crud-modal-save">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="border border-gray-300 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-100" data-testid="crud-modal-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
