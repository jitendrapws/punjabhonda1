import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchEnquiries, fetchStats, updateEnquiryStatus } from "../lib/api";
import { Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import useAdminAuth from "../hooks/useAdminAuth";

const TYPE_LABELS = {
  product_enquiry: "Product Enquiry", test_ride: "Test Ride", quote: "On-Road Quote",
  service_booking: "Service Booking", insurance: "Insurance", contact: "Contact", amc: "AMC",
};

const STATUSES = ["new", "contacted", "closed"];

function LoginForm({ onSubmit }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    const ok = await onSubmit(pwd);
    if (!ok) setErr("Invalid token");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F5F7] py-12">
      <form onSubmit={handle} className="bg-white border border-gray-200 p-8 w-full max-w-md" data-testid="admin-login-form">
        <ShieldCheck className="w-10 h-10 text-honda" />
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mt-3">Admin Access</h1>
        <p className="text-sm text-gray-600 mt-1">Enter your admin token to view enquiries.</p>
        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mt-6 mb-1.5">Admin Token</label>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} className="w-full border border-gray-300 px-3 py-3 text-sm rounded-none" data-testid="admin-token-input" />
        {err && <div className="text-sm text-red-600 mt-2" data-testid="admin-login-error">{err}</div>}
        <button type="submit" className="mt-5 w-full bg-honda text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark" data-testid="admin-login-btn">Sign In</button>
      </form>
    </div>
  );
}

function StatsRow({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="admin-stats">
      <Kpi label="Total Enquiries" value={stats.total} />
      <Kpi label="New / Pending" value={stats.new} accent />
      <Kpi label="Today" value={stats.today} />
      <Kpi label="Test Rides" value={stats.by_type.test_ride || 0} />
    </div>
  );
}

function EnquiriesTable({ rows, onStatusChange }) {
  // Memoize rendered rows to avoid recomputation on unrelated re-renders
  const renderedRows = useMemo(() => rows.map(e => (
    <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`admin-row-${e.id}`}>
      <td className="p-3 text-xs text-gray-500 font-mono">{new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
      <td className="p-3"><span className="bg-honda/10 text-honda px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{TYPE_LABELS[e.type] || e.type}</span></td>
      <td className="p-3 font-bold">{e.name}</td>
      <td className="p-3 font-mono text-xs"><a href={`tel:${e.phone}`} className="hover:text-honda">{e.phone}</a></td>
      <td className="p-3 text-xs">{e.vehicle_name || e.branch || e.city || "—"}</td>
      <td className="p-3"><StatusPill status={e.status} /></td>
      <td className="p-3">
        <select value={e.status} onChange={ev => onStatusChange(e.id, ev.target.value)} className="border border-gray-300 px-2 py-1 text-xs rounded-none bg-white" data-testid={`admin-status-${e.id}`}>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </td>
    </tr>
  )), [rows, onStatusChange]);

  return (
    <div className="overflow-x-auto" data-testid="admin-enquiries-table">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold">
          <tr>
            <th className="text-left p-3">When</th>
            <th className="text-left p-3">Type</th>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Phone</th>
            <th className="text-left p-3">Vehicle / Branch</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState({ type: "", status: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([fetchStats(token), fetchEnquiries(token, f)]);
      setStats(s); setEnquiries(e);
    } finally { setLoading(false); }
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const handleFilter = useCallback((key) => (v) => {
    const next = { ...filter, [key]: v };
    setFilter(next);
    load(next);
  }, [filter, load]);

  const updateStatus = useCallback(async (id, status) => {
    // Optimistic update
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    try {
      await updateEnquiryStatus(token, id, status);
    } catch {
      // Revert on failure
      load();
    }
  }, [token, load]);

  return (
    <div className="bg-[#F5F5F7] min-h-[80vh] py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Punjab Honda</div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} className="bg-white border border-gray-300 px-4 py-2 text-xs font-bold uppercase flex items-center gap-2" data-testid="admin-refresh"><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button onClick={onLogout} className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase flex items-center gap-2" data-testid="admin-logout"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>

        <StatsRow stats={stats} />

        <div className="bg-white border border-gray-200">
          <div className="p-5 flex flex-wrap gap-3 items-center border-b border-gray-200">
            <Select value={filter.type} onChange={handleFilter("type")} options={Object.keys(TYPE_LABELS)} placeholder="All types" testid="admin-filter-type" labels={TYPE_LABELS} />
            <Select value={filter.status} onChange={handleFilter("status")} options={STATUSES} placeholder="All statuses" testid="admin-filter-status" />
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
          ) : enquiries.length === 0 ? (
            <div className="p-10 text-center text-gray-500" data-testid="admin-empty">No enquiries found.</div>
          ) : (
            <EnquiriesTable rows={enquiries} onStatusChange={updateStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { token, authed, checking, verify, logout } = useAdminAuth();
  if (checking) {
    return <div className="min-h-[60vh] flex items-center justify-center" data-testid="admin-checking"><Loader2 className="w-6 h-6 animate-spin text-honda" /></div>;
  }
  if (!authed) return <LoginForm onSubmit={verify} />;
  return <Dashboard token={token} onLogout={logout} />;
}

const Kpi = ({ label, value, accent }) => (
  <div className={`border ${accent ? "border-honda" : "border-gray-200"} bg-white p-5`}>
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">{label}</div>
    <div className={`font-mono font-black text-3xl mt-1 ${accent ? "text-honda" : "text-gray-900"}`}>{value}</div>
  </div>
);
const StatusPill = ({ status }) => {
  const c = status === "new" ? "bg-blue-100 text-blue-700" : status === "contacted" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700";
  return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>{status}</span>;
};
const Select = ({ value, onChange, options, placeholder, testid, labels = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="border border-gray-300 px-3 py-2 text-xs bg-white rounded-none" data-testid={testid}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{labels[o] || o}</option>)}
  </select>
);
