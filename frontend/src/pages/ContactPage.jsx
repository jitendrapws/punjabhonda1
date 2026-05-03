import { useState } from "react";
import { Loader2, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { submitEnquiry } from "../lib/api";
import ShowroomSection from "../components/site/ShowroomSection";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: false, err: "" });
  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setStatus({ loading: false, ok: false, err: "Name and phone required" }); return; }
    setStatus({ loading: true, ok: false, err: "" });
    try { await submitEnquiry({ type: "contact", ...form }); setStatus({ loading: false, ok: true, err: "" }); }
    catch (e) { setStatus({ loading: false, ok: false, err: "Submission failed" }); }
  };

  return (
    <>
      <section className="bg-gray-950 text-white py-14" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Get in Touch</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mt-2">Contact Punjab Honda</h1>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-5">
            <ContactCard icon={Phone} title="Call Sales" value="+91 9925 11 51 51" href="tel:9925115151" />
            <ContactCard icon={Phone} title="Call Service" value="+91 9879 78 88 77" href="tel:9879788877" />
            <ContactCard icon={Mail} title="Email" value="customercare@punjabhonda.com" href="mailto:customercare@punjabhonda.com" />
            <ContactCard icon={MapPin} title="Head Office" value="Ashram Road, Ahmedabad - 380014" />
          </div>
          <div className="lg:col-span-2">
            {status.ok ? (
              <div className="border-2 border-green-600 bg-green-50 p-10 text-center" data-testid="contact-success">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
                <h3 className="font-display font-bold text-2xl mt-4">Message Received</h3>
                <p className="text-gray-700 mt-2">We'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="border border-gray-200 p-8 space-y-5" data-testid="contact-form">
                <h2 className="font-display font-black text-2xl uppercase tracking-tight">Send a message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name *" value={form.name} onChange={handle("name")} testid="contact-name" />
                  <Input label="Phone *" type="tel" value={form.phone} onChange={handle("phone")} testid="contact-phone" />
                  <Input label="Email" type="email" value={form.email} onChange={handle("email")} testid="contact-email" />
                  <Input label="City" value={form.city} onChange={handle("city")} testid="contact-city" />
                </div>
                <div>
                  <Label>Message</Label>
                  <textarea value={form.message} onChange={handle("message")} rows={5} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid="contact-message" />
                </div>
                {status.err && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="contact-error">{status.err}</div>}
                <button type="submit" disabled={status.loading} className="bg-honda text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center gap-2" data-testid="contact-submit">
                  {status.loading && <Loader2 className="w-4 h-4 animate-spin" />} Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <ShowroomSection />
    </>
  );
}

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>;
const Input = ({ label, testid, ...p }) => (<div><Label>{label}</Label><input {...p} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none" data-testid={testid} /></div>);
const ContactCard = ({ icon: Icon, title, value, href }) => {
  const inner = (
    <div className="border border-gray-200 p-6 hover:border-honda transition-colors flex items-start gap-4">
      <div className="w-10 h-10 bg-honda/10 text-honda flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">{title}</div>
        <div className="font-bold mt-1">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
};
