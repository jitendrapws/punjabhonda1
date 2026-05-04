import { useState, useCallback, useMemo } from "react";

const initialState = {
  name: "", email: "", phone: "", city: "", pincode: "",
  vehicle_name: "", vehicle_slug: "",
  message: "", preferred_date: "", preferred_time: "", branch: "",
  policy_number: "", registration_number: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pure validation function — easier to test and reason about. */
function validateEnquiryForm(form) {
  if (!form.name.trim()) return "Name is required";
  if (!form.phone.trim()) return "Phone is required";
  if (form.email && !EMAIL_RE.test(form.email)) return "Invalid email";
  return null;
}

/** Custom hook: isolates enquiry form state, validation and submission logic. */
export default function useEnquiryForm({ vehicle, onSubmit }) {
  const [form, setForm] = useState({
    ...initialState,
    vehicle_name: vehicle?.name || "",
    vehicle_slug: vehicle?.slug || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setForm({
      ...initialState,
      vehicle_name: vehicle?.name || "",
      vehicle_slug: vehicle?.slug || "",
    });
    setSuccess(false);
    setError("");
    setLoading(false);
  }, [vehicle]);

  const setField = useCallback((key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }, []);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    const errMsg = validateEnquiryForm(form);
    if (errMsg) { setError(errMsg); return; }
    setLoading(true);
    try {
      await onSubmit(form);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form, onSubmit]);

  return useMemo(
    () => ({ form, setField, submit, loading, success, error, reset }),
    [form, setField, submit, loading, success, error, reset]
  );
}
