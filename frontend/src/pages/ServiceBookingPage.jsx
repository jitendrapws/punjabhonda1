import { useState } from "react";
import { Loader2, CheckCircle2, Wrench, Clock, MapPin } from "lucide-react";
import { submitEnquiry } from "../lib/api";

const branches = ["Ashram Road (HO)", "Maninagar", "Bopal", "Naroda"];
const slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
const BRANCH_OPTIONS = ["", ...branches];
const SLOT_OPTIONS = ["", ...slots];

export default function ServiceBookingPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle_name: "", registration_number: "", branch: "", preferred_date: "", preferred_time: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: false, err: "" });

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: false, err: "" });
    if (!form.name || !form.phone || !form.branch || !form.preferred_date) {
      setStatus({ loading: false, ok: false, err: "Name, phone, branch and date are required." });
      return;
    }
    try {
      await submitEnquiry({ type: "service_booking", ...form });
      setStatus({ loading: false, ok: true, err: "" });
    } catch (err) {
      setStatus({ loading: false, ok: false, err: "Submission failed. Try again." });
    }
  };

  return (
    <>
      <section className="bg-gray-950 text-white py-14 relative overflow-hidden" data-testid="service-hero">
        <img src="https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Online Service Booking</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mt-2">Book Your Service Slot</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">Free or paid service, between 8 AM and 6 PM. Our trained technicians use only genuine Honda parts.</p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <aside className="lg:col-span-1 space-y-5">
            <div className="border border-gray-200 p-6">
              <Wrench className="w-7 h-7 text-honda" />
              <h3 className="font-display font-bold mt-3">Genuine Care</h3>
              <p className="text-sm text-gray-600 mt-1">Honda-trained technicians, OEM parts, no shortcuts.</p>
            </div>
            <div className="border border-gray-200 p-6">
              <Clock className="w-7 h-7 text-honda" />
              <h3 className="font-display font-bold mt-3">Quick Turnaround</h3>
              <p className="text-sm text-gray-600 mt-1">Most services completed same-day. Live status updates.</p>
            </div>
            <div className="border border-gray-200 p-6">
              <MapPin className="w-7 h-7 text-honda" />
              <h3 className="font-display font-bold mt-3">Free Drop</h3>
              <p className="text-sm text-gray-600 mt-1">Free pickup/drop within 5 km of any service centre.</p>
            </div>
          </aside>

          <div className="lg:col-span-2">
            {status.ok ? (
              <div className="border-2 border-green-600 bg-green-50 p-10 text-center" data-testid="service-success">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
                <h3 className="font-display font-bold text-2xl mt-4">Booking Confirmed</h3>
                <p className="text-gray-700 mt-2">We'll call you on {form.phone} within 24 hours to confirm your slot.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="border border-gray-200 p-8 space-y-5" data-testid="service-form">
                <h2 className="font-display font-black text-2xl uppercase tracking-tight">Service Booking Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name *" value={form.name} onChange={handle("name")} testid="service-name" />
                  <Input label="Phone *" type="tel" value={form.phone} onChange={handle("phone")} testid="service-phone" />
                  <Input label="Email" type="email" value={form.email} onChange={handle("email")} testid="service-email" />
                  <Input label="Vehicle Model" value={form.vehicle_name} onChange={handle("vehicle_name")} testid="service-vehicle" placeholder="e.g. Activa 125" />
                  <Input label="Registration No." value={form.registration_number} onChange={handle("registration_number")} testid="service-reg" placeholder="GJ-01-XX-1234" />
                  <Select label="Preferred Branch *" value={form.branch} onChange={handle("branch")} testid="service-branch" options={BRANCH_OPTIONS} />
                  <Input label="Preferred Date *" type="date" value={form.preferred_date} onChange={handle("preferred_date")} testid="service-date" />
                  <Select label="Preferred Time" value={form.preferred_time} onChange={handle("preferred_time")} testid="service-time" options={SLOT_OPTIONS} />
                </div>
                <div>
                  <Label>Issue / Notes</Label>
                  <textarea value={form.message} onChange={handle("message")} rows={3} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid="service-message" />
                </div>
                {status.err && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="service-error">{status.err}</div>}
                <button type="submit" disabled={status.loading} className="w-full bg-honda text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center justify-center gap-2" data-testid="service-submit">
                  {status.loading && <Loader2 className="w-4 h-4 animate-spin" />} {status.loading ? "Booking..." : "Confirm Booking"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>;
const Input = ({ label, testid, ...p }) => (<div><Label>{label}</Label><input {...p} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid={testid} /></div>);
const Select = ({ label, options, testid, ...p }) => (
  <div><Label>{label}</Label>
    <select {...p} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none bg-white" data-testid={testid}>
      {options.map(o => <option key={o} value={o}>{o || "Select..."}</option>)}
    </select>
  </div>
);
