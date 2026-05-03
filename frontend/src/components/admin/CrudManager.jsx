import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import CrudField from "./CrudField";

const renderCellValue = (item, column) => {
  if (column.render) return column.render(item);
  if (column.key === "image" && item[column.key]) {
    return <img src={item[column.key]} alt="" className="w-12 h-9 object-cover" />;
  }
  if (column.key === "active") {
    const cls = item[column.key] ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600";
    return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${cls}`}>{item[column.key] ? "Active" : "Hidden"}</span>;
  }
  return (item[column.key] ?? "—").toString().slice(0, 80);
};

function ListTable({ items, columns, onEdit, onDelete }) {
  return (
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
              <td key={c.key} className="p-3 text-xs">{renderCellValue(it, c)}</td>
            ))}
            <td className="p-3 text-right">
              <button onClick={() => onEdit(it)} className="text-blue-600 hover:text-blue-800 mr-3" data-testid={`crud-edit-${it.id}`}><Pencil className="w-4 h-4 inline" /></button>
              <button onClick={() => onDelete(it.id)} className="text-red-600 hover:text-red-800" data-testid={`crud-delete-${it.id}`}><Trash2 className="w-4 h-4 inline" /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EditDrawer({ title, editing, fields, token, imageFolder, saving, err, onChange, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex justify-end" data-testid="crud-edit-modal">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        <div className="bg-gray-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-honda">{title}</div>
            <h3 className="font-display font-bold text-lg">{editing.id ? "Edit" : "Add"} {title.replace(/s$/, "")}</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-800" data-testid="crud-modal-close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          {fields.map(f => (
            <CrudField
              key={f.key}
              field={f}
              value={editing[f.key]}
              onChange={(v) => onChange(f.key, v)}
              token={token}
              imageFolder={imageFolder}
            />
          ))}
          {err && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="crud-modal-error">{err}</div>}
          <div className="flex gap-3 pt-3 border-t border-gray-200">
            <button onClick={onSave} disabled={saving} className="bg-honda text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center gap-2" data-testid="crud-modal-save">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={onCancel} className="border border-gray-300 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-100" data-testid="crud-modal-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic CRUD manager for any resource. Renders a table + add/edit drawer-style modal.
 * Field types supported: text (default), textarea, number, select, boolean, image, string-list, kv-map.
 */
export default function CrudManager({ token, title, api, fields, columns, getNewItem, imageFolder = "punjab-honda/uploads" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
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
      if (editing.id) await api.update(token, editing.id, editing);
      else await api.create(token, editing);
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
        {loading && (
          <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-honda mx-auto" /></div>
        )}
        {!loading && items.length === 0 && (
          <div className="p-10 text-center text-gray-500" data-testid="crud-empty">No items yet. Click "Add New" to start.</div>
        )}
        {!loading && items.length > 0 && (
          <ListTable items={items} columns={columns} onEdit={(it) => setEditing({ ...it })} onDelete={onDelete} />
        )}
      </div>

      {editing && (
        <EditDrawer
          title={title}
          editing={editing}
          fields={fields}
          token={token}
          imageFolder={imageFolder}
          saving={saving}
          err={err}
          onChange={setField}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
