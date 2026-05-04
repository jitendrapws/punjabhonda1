import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchEnquiries, fetchStats, updateEnquiryStatus,
  adminBikes, adminHeroSlides, adminBranches, adminTestimonials, adminServices } from "../lib/api";
import { Loader2, LogOut, ShieldCheck, Bike, Image, MapPin, MessageSquare, Wrench, Settings, Inbox } from "lucide-react";
import useAdminAuth from "../hooks/useAdminAuth";
import CrudManager from "../components/admin/CrudManager";
import SettingsManager from "../components/admin/SettingsManager";

const TYPE_LABELS = {
  product_enquiry: "Product Enquiry", test_ride: "Test Ride", quote: "On-Road Quote",
  service_booking: "Service Booking", insurance: "Insurance", contact: "Contact", amc: "AMC",
};
const STATUSES = ["new", "contacted", "closed"];

const TABS = [
  { key: "enquiries", label: "Enquiries", icon: Inbox },
  { key: "bikes", label: "Bikes", icon: Bike },
  { key: "hero", label: "Hero Slides", icon: Image },
  { key: "branches", label: "Branches", icon: MapPin },
  { key: "testimonials", label: "Testimonials", icon: MessageSquare },
  { key: "services", label: "Services", icon: Wrench },
  { key: "settings", label: "Site Settings", icon: Settings },
];

// ----- Module-level constants for CRUD panel configs -----
// (Hoisted out of Dashboard component so React doesn't recreate these arrays each render)
const CATEGORY_OPTIONS = [
  { value: "motorcycle", label: "Motorcycle" }, { value: "scooter", label: "Scooter" },
  { value: "ev", label: "Electric (EV)" }, { value: "bigwing", label: "Big Wing" },
];

const BRANCH_TYPE_OPTIONS = [
  { value: "showroom_service", label: "Showroom + Service" },
  { value: "showroom", label: "Showroom Only" },
  { value: "service", label: "Service Only" },
];

const ICON_OPTIONS = ["Wrench", "ShieldCheck", "RefreshCw", "Truck", "Award", "Bell", "Bike"]
  .map(i => ({ value: i, label: i }));

const BIKE_FIELDS = [
  { key: "name", label: "Display Name", required: true },
  { key: "slug", label: "URL Slug (unique, lowercase, hyphens)", required: true, placeholder: "e.g. activa-125" },
  { key: "category", label: "Category", type: "select", options: CATEGORY_OPTIONS },
  { key: "price_from", label: "Ex-Showroom Price (₹)", type: "number" },
  { key: "engine", label: "Engine (e.g. 109.51 cc)" },
  { key: "power", label: "Power (e.g. 7.65 bhp)" },
  { key: "mileage", label: "Mileage (e.g. 55 kmpl)" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "image", label: "Photo", type: "image" },
  { key: "color_options", label: "Color Options (one per line)", type: "string-list",
    helpText: "Enter each color name on a new line (e.g. Pearl Igneous Black)" },
  { key: "specifications", label: "Technical Specifications (Key: Value per line)", type: "kv-map",
    helpText: "Format: 'Displacement: 109.51 cc' — one entry per line" },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "active", label: "Visible", type: "boolean" },
];
const BIKE_COLUMNS = [
  { key: "image", label: "Photo" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "price_from", label: "Price", render: (b) => `₹${(b.price_from || 0).toLocaleString("en-IN")}` },
  { key: "active", label: "Status" },
];
const NEW_BIKE = () => ({ slug: "", name: "", category: "motorcycle", price_from: 0, engine: "", power: "", mileage: "", description: "", image: "", color_options: [], specifications: {}, sort_order: 0, active: true });

const HERO_FIELDS = [
  { key: "tag", label: "Tag (small label above title)", required: true },
  { key: "title", label: "Title (large heading)", required: true },
  { key: "subtitle", label: "Subtitle", type: "textarea" },
  { key: "accent", label: "Accent text (e.g. SAVE UPTO ₹8,000)" },
  { key: "cta", label: "Button Label" },
  { key: "cta_link", label: "Button Link", placeholder: "/bikes or /bikes/activa-125" },
  { key: "image", label: "Banner Image (1600×600 recommended)", type: "image" },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "active", label: "Visible", type: "boolean" },
];
const HERO_COLUMNS = [
  { key: "image", label: "Image" },
  { key: "tag", label: "Tag" },
  { key: "title", label: "Title" },
  { key: "active", label: "Status" },
];
const NEW_HERO = () => ({ tag: "", title: "", subtitle: "", cta: "Explore", cta_link: "/bikes", image: "", accent: "", sort_order: 0, active: true });

const BRANCH_FIELDS = [
  { key: "name", label: "Branch Name", required: true },
  { key: "address", label: "Address", type: "textarea" },
  { key: "phone", label: "Phone" },
  { key: "type", label: "Type", type: "select", options: BRANCH_TYPE_OPTIONS },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "active", label: "Visible", type: "boolean" },
];
const BRANCH_COLUMNS = [
  { key: "name", label: "Name" }, { key: "type", label: "Type" },
  { key: "phone", label: "Phone" }, { key: "active", label: "Status" },
];
const NEW_BRANCH = () => ({ name: "", address: "", phone: "", type: "showroom_service", sort_order: 0, active: true });

const TESTIMONIAL_FIELDS = [
  { key: "name", label: "Customer Name", required: true },
  { key: "text", label: "Review Text", type: "textarea", rows: 4 },
  { key: "rating", label: "Rating (1-5)", type: "number" },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "active", label: "Visible", type: "boolean" },
];
const TESTIMONIAL_COLUMNS = [
  { key: "name", label: "Name" }, { key: "rating", label: "Rating" },
  { key: "text", label: "Text" }, { key: "active", label: "Status" },
];
const NEW_TESTIMONIAL = () => ({ name: "", text: "", rating: 5, sort_order: 0, active: true });

const SERVICE_FIELDS = [
  { key: "title", label: "Service Title", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon name (lucide)", type: "select", options: ICON_OPTIONS },
  { key: "cta_label", label: "Button Label" },
  { key: "cta_link", label: "Button Link" },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "active", label: "Visible", type: "boolean" },
];
const SERVICE_COLUMNS = [
  { key: "title", label: "Title" }, { key: "icon", label: "Icon" },
  { key: "description", label: "Description" }, { key: "active", label: "Status" },
];
const NEW_SERVICE = () => ({ title: "", description: "", icon: "Wrench", cta_label: "Know More", cta_link: "/contact", sort_order: 0, active: true });

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (ex) {
      setErr(ex?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F7] py-12">
      <form onSubmit={handle} className="bg-white border border-gray-200 p-8 w-full max-w-md" data-testid="admin-login-form">
        <ShieldCheck className="w-10 h-10 text-honda" />
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mt-3">Admin Access</h1>
        <p className="text-sm text-gray-600 mt-1">Sign in to manage the Punjab Honda site.</p>

        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mt-6 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          className="w-full border border-gray-300 px-3 py-3 text-sm rounded-none"
          data-testid="admin-email-input"
          required
        />

        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mt-4 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full border border-gray-300 px-3 py-3 text-sm rounded-none"
          data-testid="admin-password-input"
          required
        />

        {err && <div className="text-sm text-red-600 mt-3" data-testid="admin-login-error">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-honda text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center justify-center gap-2"
          data-testid="admin-login-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

function StatusPill({ status }) {
  const c = status === "new" ? "bg-blue-100 text-blue-700" : status === "contacted" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700";
  return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>{status}</span>;
}

function EnquiriesPanel({ token }) {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState({ type: "", status: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([fetchStats(token), fetchEnquiries(token, f)]);
      setStats(s); setRows(e);
    } finally { setLoading(false); }
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id, status) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try { await updateEnquiryStatus(token, id, status); }
    catch { load(); }
  }, [token, load]);

  const renderedRows = useMemo(() => rows.map(e => (
    <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`admin-row-${e.id}`}>
      <td className="p-3 text-xs text-gray-500 font-mono">{new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
      <td className="p-3"><span className="bg-honda/10 text-honda px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{TYPE_LABELS[e.type] || e.type}</span></td>
      <td className="p-3 font-bold">{e.name}</td>
      <td className="p-3 font-mono text-xs"><a href={`tel:${e.phone}`} className="hover:text-honda">{e.phone}</a></td>
      <td className="p-3 text-xs">{e.vehicle_name || e.branch || e.city || "—"}</td>
      <td className="p-3 text-xs text-gray-600 max-w-[220px] truncate" title={e.message}>{e.message || "—"}</td>
      <td className="p-3"><StatusPill status={e.status} /></td>
      <td className="p-3">
        <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value)} className="border border-gray-300 px-2 py-1 text-xs rounded-none bg-white" data-testid={`admin-status-${e.id}`}>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </td>
    </tr>
  )), [rows, updateStatus]);

  return (
    <div data-testid="enquiries-panel">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="admin-stats">
          <Kpi label="Total Enquiries" value={stats.total} />
          <Kpi label="New / Pending" value={stats.new} accent />
          <Kpi label="Today" value={stats.today} />
          <Kpi label="Test Rides" value={stats.by_type.test_ride || 0} />
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniKpi label="Service Bookings" value={stats?.by_type?.service_booking || 0} />
        <MiniKpi label="Insurance" value={stats?.by_type?.insurance || 0} />
        <MiniKpi label="AMC" value={stats?.by_type?.amc || 0} />
        <MiniKpi label="On-Road Quotes" value={stats?.by_type?.quote || 0} />
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-5 flex flex-wrap gap-3 items-center border-b border-gray-200">
          <Select value={filter.type} onChange={(v) => { const f = { ...filter, type: v }; setFilter(f); load(f); }} options={Object.keys(TYPE_LABELS)} placeholder="All types" testid="admin-filter-type" labels={TYPE_LABELS} />
          <Select value={filter.status} onChange={(v) => { const f = { ...filter, status: v }; setFilter(f); load(f); }} options={STATUSES} placeholder="All statuses" testid="admin-filter-status" />
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500" data-testid="admin-empty">No enquiries found.</div>
        ) : (
          <div className="overflow-x-auto" data-testid="admin-enquiries-table">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Vehicle / Branch</th>
                  <th className="text-left p-3">Message</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>{renderedRows}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState("enquiries");

  const bikePanel = (
    <CrudManager token={token} title="Bikes" api={adminBikes} imageFolder="punjab-honda/bikes"
      getNewItem={NEW_BIKE} fields={BIKE_FIELDS} columns={BIKE_COLUMNS} />
  );
  const heroPanel = (
    <CrudManager token={token} title="Hero Slides" api={adminHeroSlides} imageFolder="punjab-honda/hero"
      getNewItem={NEW_HERO} fields={HERO_FIELDS} columns={HERO_COLUMNS} />
  );
  const branchPanel = (
    <CrudManager token={token} title="Branches" api={adminBranches}
      getNewItem={NEW_BRANCH} fields={BRANCH_FIELDS} columns={BRANCH_COLUMNS} />
  );
  const testimonialPanel = (
    <CrudManager token={token} title="Testimonials" api={adminTestimonials}
      getNewItem={NEW_TESTIMONIAL} fields={TESTIMONIAL_FIELDS} columns={TESTIMONIAL_COLUMNS} />
  );
  const servicePanel = (
    <CrudManager token={token} title="Services" api={adminServices}
      getNewItem={NEW_SERVICE} fields={SERVICE_FIELDS} columns={SERVICE_COLUMNS} />
  );

  return (
    <div className="bg-[#F5F5F7] min-h-[80vh] py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Punjab Honda</div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tight">Admin Dashboard</h1>
            {user?.email && <div className="text-xs text-gray-500 mt-1" data-testid="admin-user-email">Signed in as <span className="font-bold">{user.email}</span></div>}
          </div>
          <button onClick={onLogout} className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase flex items-center gap-2" data-testid="admin-logout"><LogOut className="w-4 h-4" /> Logout</button>
        </div>

        <div className="bg-white border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${active ? "border-honda text-honda" : "border-transparent text-gray-700 hover:text-gray-900"}`}
                  data-testid={`admin-tab-${t.key}`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {tab === "enquiries" && <EnquiriesPanel token={token} />}
          {tab === "bikes" && bikePanel}
          {tab === "hero" && heroPanel}
          {tab === "branches" && branchPanel}
          {tab === "testimonials" && testimonialPanel}
          {tab === "services" && servicePanel}
          {tab === "settings" && <SettingsManager token={token} />}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { token, user, authed, checking, login, logout } = useAdminAuth();
  if (checking) return <div className="min-h-[60vh] flex items-center justify-center" data-testid="admin-checking"><Loader2 className="w-6 h-6 animate-spin text-honda" /></div>;
  if (!authed) return <LoginForm onSubmit={login} />;
  return <Dashboard token={token} user={user} onLogout={logout} />;
}

const Kpi = ({ label, value, accent }) => (
  <div className={`border ${accent ? "border-honda" : "border-gray-200"} bg-white p-5`}>
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">{label}</div>
    <div className={`font-mono font-black text-3xl mt-1 ${accent ? "text-honda" : "text-gray-900"}`}>{value}</div>
  </div>
);
const MiniKpi = ({ label, value }) => (
  <div className="border border-gray-200 bg-white p-4">
    <div className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-500">{label}</div>
    <div className="font-mono font-bold text-xl mt-0.5">{value}</div>
  </div>
);
const Select = ({ value, onChange, options, placeholder, testid, labels = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="border border-gray-300 px-3 py-2 text-xs bg-white rounded-none" data-testid={testid}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{labels[o] || o}</option>)}
  </select>
);
