import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const submitEnquiry = (payload) => api.post("/enquiries", payload).then(r => r.data);
export const fetchBikes = (category) => api.get("/bikes", { params: category ? { category } : {} }).then(r => r.data);
export const fetchBike = (slug) => api.get(`/bikes/${slug}`).then(r => r.data);
export const fetchBranches = () => api.get("/branches").then(r => r.data);

// admin
export const verifyAdmin = (token) => api.post("/admin/verify", {}, { headers: { "X-Admin-Token": token }}).then(r => r.data);
export const fetchEnquiries = (token, params = {}) => api.get("/admin/enquiries", { headers: { "X-Admin-Token": token }, params }).then(r => r.data);
export const fetchStats = (token) => api.get("/admin/stats", { headers: { "X-Admin-Token": token }}).then(r => r.data);
export const updateEnquiryStatus = (token, id, status) => api.patch(`/admin/enquiries/${id}`, { status }, { headers: { "X-Admin-Token": token }}).then(r => r.data);
