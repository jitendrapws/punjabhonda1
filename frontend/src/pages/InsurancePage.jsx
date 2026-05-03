import { useState } from "react";
import { Loader2, CheckCircle2, ShieldCheck, FileText, Clock } from "lucide-react";
import { submitEnquiry } from "../lib/api";

export default function InsurancePage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", vehicle_name: "", registration_number: "", policy_number: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: false, err: "" });
  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setStatus({ loading: false, ok: false, err: "Name and phone required" }); return; }
    setStatus({ loading: true, ok: false, err: "" });
    try { await submitEnquiry({ type: "insurance", ...form }); setStatus({ loading: false, ok: true, err: "" }); }
    catch (e) { setStatus({ loading: false, ok: false, err: "Submission failed" }); }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-honda to-honda-dark text-white py-14" data-testid="insurance-hero">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">Buy Insurance Online</div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mt-2">Insurance Made Easy</h1>
            <p className="mt-3 opacity-90 max-w-md">Renew, claim, or buy new — Punjab Honda handles your two-wheeler insurance end-to-end.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Pill icon={ShieldCheck} title="100% Genuine" />
            <Pill icon={FileText} title="Hassle-Free Claims" />
            <Pill icon={Clock} title="Same-Day Issuance" />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          {status.ok ? (
            <div className="border-2 border-green-600 bg-green-50 p-10 text-center" data-testid="insurance-success">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
              <h3 className="font-display font-bold text-2xl mt-4">Request Received</h3>
              <p className="text-gray-700 mt-2">Our insurance team will reach out within 24 hours with the best plan for you.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="border border-gray-200 p-8 space-y-5" data-testid="insurance-form">
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">Send your details</h2>
              <p className="text-sm text-gray-600 -mt-3">Fill the form — we'll call you with a tailored quote.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name *" value={form.name} onChange={handle("name")} testid="ins-name" />
                <Input label="Phone *" type="tel" value={form.phone} onChange={handle("phone")} testid="ins-phone" />
                <Input label="Email" type="email" value={form.email} onChange={handle("email")} testid="ins-email" />
                <Input label="City" value={form.city} onChange={handle("city")} testid="ins-city" />
                <Input label="Vehicle Model" value={form.vehicle_name} onChange={handle("vehicle_name")} testid="ins-vehicle" placeholder="e.g. Shine 125" />
                <Input label="Registration No." value={form.registration_number} onChange={handle("registration_number")} testid="ins-reg" placeholder="GJ-01-XX-1234" />
                <Input label="Existing Policy No." value={form.policy_number} onChange={handle("policy_number")} testid="ins-policy" />
              </div>
              <div>
                <Label>Notes</Label>
                <textarea value={form.message} onChange={handle("message")} rows={3} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid="ins-message" />
              </div>
              {status.err && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="ins-error">{status.err}</div>}
              <button type="submit" disabled={status.loading} className="w-full bg-honda text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center justify-center gap-2" data-testid="ins-submit">
                {status.loading && <Loader2 className="w-4 h-4 animate-spin" />} {status.loading ? "Submitting..." : "Send Details"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>;
const Input = ({ label, testid, ...p }) => (<div><Label>{label}</Label><input {...p} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid={testid} /></div>);
const Pill = ({ icon: Icon, title }) => (
  <div className="bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
    <Icon className="w-6 h-6 mx-auto" />
    <div className="text-[11px] font-bold uppercase tracking-wider mt-2">{title}</div>
  </div>
);
