import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { submitEnquiry } from "../../lib/api";

const typeLabels = {
  product_enquiry: "Product Enquiry",
  test_ride: "Book a Test Ride",
  quote: "Get On-Road Price Quote",
  service_booking: "Service Booking",
  insurance: "Insurance Enquiry",
  contact: "Contact Us",
  amc: "AMC Enquiry",
};

export default function EnquiryModal({ open, onClose, type = "product_enquiry", title, vehicle }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", pincode: "",
    vehicle_name: vehicle?.name || "", vehicle_slug: vehicle?.slug || "",
    message: "", preferred_date: "", preferred_time: "", branch: "",
    policy_number: "", registration_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSuccess(false); setError("");
      setForm(f => ({ ...f, vehicle_name: vehicle?.name || "", vehicle_slug: vehicle?.slug || "" }));
    }
  }, [open, vehicle]);

  if (!open) return null;

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone) {
      setError("Name and phone are required");
      return;
    }
    setLoading(true);
    try {
      await submitEnquiry({ type, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" data-testid="enquiry-modal">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto relative animate-in">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1 hover:bg-gray-100" data-testid="enquiry-close-btn">
          <X className="w-5 h-5" />
        </button>
        <div className="bg-honda text-white p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Punjab Honda</div>
          <h2 className="font-display font-black text-2xl mt-1 uppercase tracking-tight">{title || typeLabels[type]}</h2>
          {vehicle && <div className="text-sm mt-1 opacity-90">For: {vehicle.name}</div>}
        </div>

        {success ? (
          <div className="p-10 text-center" data-testid="enquiry-success-screen">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="font-display font-bold text-xl mt-4">Thank you!</h3>
            <p className="text-gray-600 mt-2 text-sm">Your enquiry has been received. Our team will call you within 24 hours.</p>
            <button onClick={onClose} className="mt-6 bg-gray-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider" data-testid="enquiry-done-btn">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4" data-testid="enquiry-form">
            <Field label="Full Name *" value={form.name} onChange={handle("name")} testid="enquiry-name-input" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone *" type="tel" value={form.phone} onChange={handle("phone")} testid="enquiry-phone-input" />
              <Field label="Email" type="email" value={form.email} onChange={handle("email")} testid="enquiry-email-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" value={form.city} onChange={handle("city")} testid="enquiry-city-input" />
              <Field label="Pincode" value={form.pincode} onChange={handle("pincode")} testid="enquiry-pincode-input" />
            </div>

            {(type === "test_ride" || type === "service_booking") && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Preferred Date" type="date" value={form.preferred_date} onChange={handle("preferred_date")} testid="enquiry-date-input" />
                <Field label="Preferred Time" type="time" value={form.preferred_time} onChange={handle("preferred_time")} testid="enquiry-time-input" />
              </div>
            )}

            {type === "service_booking" && (
              <div>
                <Label>Preferred Branch</Label>
                <select value={form.branch} onChange={handle("branch")} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none bg-white" data-testid="enquiry-branch-select">
                  <option value="">Select branch</option>
                  <option>Ashram Road (HO)</option>
                  <option>Maninagar</option>
                  <option>Bopal</option>
                  <option>Naroda</option>
                </select>
              </div>
            )}

            {type === "insurance" && (
              <div className="grid grid-cols-1 gap-4">
                <Field label="Registration Number" value={form.registration_number} onChange={handle("registration_number")} testid="enquiry-reg-input" />
                <Field label="Existing Policy Number (optional)" value={form.policy_number} onChange={handle("policy_number")} testid="enquiry-policy-input" />
              </div>
            )}

            {!vehicle && (type === "product_enquiry" || type === "quote" || type === "test_ride") && (
              <Field label="Vehicle of Interest" value={form.vehicle_name} onChange={handle("vehicle_name")} testid="enquiry-vehicle-input" placeholder="e.g. Activa 125, Shine 125" />
            )}

            <div>
              <Label>Message / Requirement</Label>
              <textarea value={form.message} onChange={handle("message")} rows={3} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none resize-none" data-testid="enquiry-message-input" />
            </div>

            {error && <div className="text-sm text-red-600 border-l-2 border-red-600 pl-3" data-testid="enquiry-error">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-honda text-white py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-honda-dark disabled:opacity-60 flex items-center justify-center gap-2"
              data-testid="enquiry-submit-btn"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Enquiry"}
            </button>
            <p className="text-[11px] text-gray-500 text-center">By submitting, you agree to be contacted by Punjab Honda.</p>
          </form>
        )}
      </div>
    </div>
  );
}

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>;

const Field = ({ label, value, onChange, type = "text", testid, placeholder }) => (
  <div>
    <Label>{label}</Label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none focus:border-honda" data-testid={testid} />
  </div>
);
