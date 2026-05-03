import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { submitEnquiry, fetchBikes } from "../../lib/api";
import useEnquiryForm from "../../hooks/useEnquiryForm";

const TYPE_LABELS = {
  product_enquiry: "Product Enquiry",
  test_ride: "Book a Test Ride",
  quote: "Get On-Road Price Quote",
  service_booking: "Service Booking",
  insurance: "Insurance Enquiry",
  contact: "Contact Us",
  amc: "AMC Enquiry",
};

const BRANCHES = ["Ashram Road (HO)", "Maninagar", "Bopal", "Naroda"];

const Label = ({ children }) => (
  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">{children}</label>
);

const Field = ({ label, value, onChange, type = "text", testid, placeholder }) => (
  <div>
    <Label>{label}</Label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none focus:border-honda" data-testid={testid} />
  </div>
);

function SuccessScreen({ onClose }) {
  return (
    <div className="p-10 text-center" data-testid="enquiry-success-screen">
      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
      <h3 className="font-display font-bold text-xl mt-4">Thank you!</h3>
      <p className="text-gray-600 mt-2 text-sm">Your enquiry has been received. Our team will call you within 24 hours.</p>
      <button onClick={onClose} className="mt-6 bg-gray-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider" data-testid="enquiry-done-btn">Done</button>
    </div>
  );
}

function ScheduleFields({ form, setField }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Preferred Date" type="date" value={form.preferred_date} onChange={setField("preferred_date")} testid="enquiry-date-input" />
      <Field label="Preferred Time" type="time" value={form.preferred_time} onChange={setField("preferred_time")} testid="enquiry-time-input" />
    </div>
  );
}

function BranchField({ form, setField }) {
  return (
    <div>
      <Label>Preferred Branch</Label>
      <select value={form.branch} onChange={setField("branch")} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none bg-white" data-testid="enquiry-branch-select">
        <option value="">Select branch</option>
        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
    </div>
  );
}

function InsuranceFields({ form, setField }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Registration Number" value={form.registration_number} onChange={setField("registration_number")} testid="enquiry-reg-input" />
      <Field label="Existing Policy Number (optional)" value={form.policy_number} onChange={setField("policy_number")} testid="enquiry-policy-input" />
    </div>
  );
}

function VehicleDropdown({ form, setField, bikes }) {
  const grouped = bikes.reduce((acc, b) => {
    (acc[b.category] = acc[b.category] || []).push(b);
    return acc;
  }, {});
  const labels = { motorcycle: "Motorcycles", scooter: "Scooters", ev: "Electric (EV)", bigwing: "Big Wing" };
  const order = ["motorcycle", "scooter", "ev", "bigwing"];

  const onChange = (e) => {
    const slug = e.target.value;
    const bike = bikes.find(b => b.slug === slug);
    setField("vehicle_slug")({ target: { value: slug } });
    setField("vehicle_name")({ target: { value: bike?.name || "" } });
  };

  return (
    <div>
      <Label>Select Honda Model *</Label>
      <select
        value={form.vehicle_slug || ""}
        onChange={onChange}
        className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none bg-white focus:border-honda"
        data-testid="enquiry-vehicle-select"
      >
        <option value="">— Pick a model —</option>
        {order.filter(c => grouped[c]).map(c => (
          <optgroup key={c} label={labels[c]}>
            {grouped[c].map(b => (
              <option key={b.slug} value={b.slug}>{b.name} — ₹{b.price_from.toLocaleString("en-IN")}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function EnquiryFormBody({ type, vehicle, form, setField, submit, loading, error, bikes }) {
  const showVehicleDropdown = !vehicle && (type === "product_enquiry" || type === "quote" || type === "test_ride");
  return (
    <form onSubmit={submit} noValidate className="p-6 space-y-4" data-testid="enquiry-form">
      <Field label="Full Name *" value={form.name} onChange={setField("name")} testid="enquiry-name-input" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone *" type="tel" value={form.phone} onChange={setField("phone")} testid="enquiry-phone-input" />
        <Field label="Email" type="email" value={form.email} onChange={setField("email")} testid="enquiry-email-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" value={form.city} onChange={setField("city")} testid="enquiry-city-input" />
        <Field label="Pincode" value={form.pincode} onChange={setField("pincode")} testid="enquiry-pincode-input" />
      </div>

      {(type === "test_ride" || type === "service_booking") && <ScheduleFields form={form} setField={setField} />}
      {type === "service_booking" && <BranchField form={form} setField={setField} />}
      {type === "insurance" && <InsuranceFields form={form} setField={setField} />}

      {showVehicleDropdown && <VehicleDropdown form={form} setField={setField} bikes={bikes} />}

      <div>
        <Label>Message / Requirement</Label>
        <textarea value={form.message} onChange={setField("message")} rows={3} className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-none resize-none" data-testid="enquiry-message-input" />
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
  );
}

export default function EnquiryModal({ open, onClose, type = "product_enquiry", title, vehicle }) {
  const [bikes, setBikes] = useState([]);
  const { form, setField, submit, loading, success, error, reset } = useEnquiryForm({
    vehicle,
    onSubmit: (values) => submitEnquiry({ type, ...values }),
  });

  // Reset whenever modal opens or vehicle changes
  useEffect(() => { if (open) reset(); }, [open, vehicle, reset]);

  // Lazy-load bikes for the vehicle dropdown
  useEffect(() => {
    if (open && bikes.length === 0 && !vehicle) {
      fetchBikes().then(setBikes).catch(() => {});
    }
  }, [open, vehicle, bikes.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" data-testid="enquiry-modal">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto relative animate-in">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1 hover:bg-gray-100" data-testid="enquiry-close-btn">
          <X className="w-5 h-5" />
        </button>
        <div className="bg-honda text-white p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Punjab Honda</div>
          <h2 className="font-display font-black text-2xl mt-1 uppercase tracking-tight">{title || TYPE_LABELS[type]}</h2>
          {vehicle && <div className="text-sm mt-1 opacity-90">For: {vehicle.name}</div>}
        </div>

        {success ? (
          <SuccessScreen onClose={onClose} />
        ) : (
          <EnquiryFormBody type={type} vehicle={vehicle} form={form} setField={setField} submit={submit} loading={loading} error={error} bikes={bikes} />
        )}
      </div>
    </div>
  );
}
