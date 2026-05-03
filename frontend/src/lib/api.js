import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
if (!BACKEND_URL) {
  // eslint-disable-next-line no-console
  console.error(
    "[Punjab Honda] REACT_APP_BACKEND_URL is not set. " +
    "On Netlify: Site settings → Environment variables → add REACT_APP_BACKEND_URL " +
    "pointing to your backend (e.g. https://your-app.preview.emergentagent.com), then redeploy."
  );
}
export const API = `${BACKEND_URL || ""}/api`;

export const api = axios.create({ baseURL: API });

const adminHeaders = (token) => ({ headers: { "X-Admin-Token": token } });

// Public
export const submitEnquiry = (payload) => api.post("/enquiries", payload).then(r => r.data);
export const fetchBikes = (category) => api.get("/bikes", { params: category ? { category } : {} }).then(r => r.data);
export const fetchBike = (slug) => api.get(`/bikes/${slug}`).then(r => r.data);
export const fetchBranches = () => api.get("/branches").then(r => r.data);
export const fetchHeroSlides = () => api.get("/hero-slides").then(r => r.data);
export const fetchTestimonials = () => api.get("/testimonials").then(r => r.data);
export const fetchServices = () => api.get("/services").then(r => r.data);
export const fetchSiteSettings = () => api.get("/site-settings").then(r => r.data);

// Admin: auth
export const verifyAdmin = (token) => api.post("/admin/verify", {}, adminHeaders(token)).then(r => r.data);
export const fetchEnquiries = (token, params = {}) => api.get("/admin/enquiries", { ...adminHeaders(token), params }).then(r => r.data);
export const fetchStats = (token) => api.get("/admin/stats", adminHeaders(token)).then(r => r.data);
export const updateEnquiryStatus = (token, id, status) => api.patch(`/admin/enquiries/${id}`, { status }, adminHeaders(token)).then(r => r.data);

// Admin: Cloudinary signature
export const fetchCloudinarySignature = (token, folder = "punjab-honda/uploads") =>
  api.get("/admin/cloudinary/signature", { ...adminHeaders(token), params: { folder } }).then(r => r.data);

export const uploadToCloudinary = async (token, file, folder = "punjab-honda/uploads") => {
  const sig = await fetchCloudinarySignature(token, folder);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.api_key);
  fd.append("timestamp", sig.timestamp);
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
  return data.secure_url;
};

// Admin: generic CMS
const crud = (resource) => ({
  list: (token) => api.get(`/admin/${resource}`, adminHeaders(token)).then(r => r.data),
  create: (token, payload) => api.post(`/admin/${resource}`, payload, adminHeaders(token)).then(r => r.data),
  update: (token, id, payload) => api.patch(`/admin/${resource}/${id}`, payload, adminHeaders(token)).then(r => r.data),
  remove: (token, id) => api.delete(`/admin/${resource}/${id}`, adminHeaders(token)).then(r => r.data),
});

export const adminBikes = crud("bikes");
export const adminHeroSlides = crud("hero-slides");
export const adminBranches = crud("branches");
export const adminTestimonials = crud("testimonials");
export const adminServices = crud("services");

export const updateSiteSettings = (token, payload) =>
  api.patch("/admin/site-settings", payload, adminHeaders(token)).then(r => r.data);
