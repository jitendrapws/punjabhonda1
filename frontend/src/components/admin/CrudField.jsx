import ImageUploader from "./ImageUploader";

const Label = ({ children }) => (
  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>
);

const inputClass = "w-full border border-gray-300 px-3 py-2 text-sm rounded-none";
const monoTextarea = `${inputClass} font-mono`;

function TextField({ field, value, onChange }) {
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder}
      className={inputClass}
      data-testid={`crud-field-${field.key}`}
    />
  );
}

function TextAreaField({ field, value, onChange }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={field.rows || 3}
      className={inputClass}
      data-testid={`crud-field-${field.key}`}
    />
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} bg-white`}
      data-testid={`crud-field-${field.key}`}
    >
      {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function BooleanField({ field, value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={`crud-field-${field.key}`}
        className="accent-honda"
      />
      <span className="text-sm text-gray-700">{field.helpText || "Visible on site"}</span>
    </label>
  );
}

function ImageField({ field, value, onChange, token, imageFolder }) {
  return (
    <ImageUploader
      token={token}
      value={value ?? ""}
      onChange={onChange}
      folder={imageFolder}
      testid={`crud-image-${field.key}`}
    />
  );
}

function StringListField({ field, value, onChange }) {
  return (
    <textarea
      value={Array.isArray(value) ? value.join("\n") : ""}
      onChange={(e) => onChange(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
      rows={5}
      placeholder="One value per line"
      className={monoTextarea}
      data-testid={`crud-field-${field.key}`}
    />
  );
}

function KvMapField({ field, value, onChange }) {
  const text = value && typeof value === "object"
    ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";

  const parse = (raw) => {
    const obj = {};
    raw.split("\n").forEach(line => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k) obj[k] = v;
      }
    });
    return obj;
  };

  return (
    <textarea
      value={text}
      onChange={(e) => onChange(parse(e.target.value))}
      rows={10}
      placeholder="Key: Value (one per line)"
      className={monoTextarea}
      data-testid={`crud-field-${field.key}`}
    />
  );
}

const RENDERERS = {
  textarea: TextAreaField,
  select: SelectField,
  boolean: BooleanField,
  image: ImageField,
  "string-list": StringListField,
  "kv-map": KvMapField,
};

/** Renders a single field row inside the CRUD edit drawer. */
export default function CrudField({ field, value, onChange, token, imageFolder }) {
  const Renderer = RENDERERS[field.type] || TextField;
  return (
    <div>
      <Label>{field.label}{field.required && " *"}</Label>
      <Renderer field={field} value={value} onChange={onChange} token={token} imageFolder={imageFolder} />
      {field.helpText && field.type !== "boolean" && (
        <div className="text-[11px] text-gray-500 mt-1">{field.helpText}</div>
      )}
    </div>
  );
}
