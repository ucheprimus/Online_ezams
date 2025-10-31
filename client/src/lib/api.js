import axios from "axios";

// Create a pre-configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", // ✅ no trailing /api
  timeout: 10000,
  withCredentials: false, // ✅ important: not needed for token auth
});

// === REQUEST INTERCEPTOR ===
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized — token invalid or expired");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login"; // ✅ redirect safely
    }
    return Promise.reject(error);
  }
);

// === COURSE API METHODS ===
export const courseAPI = {
  getInstructorCourses: () => API.get("/api/courses/instructor"),
  getAll: () => API.get("/api/courses"),
  get: (id) => API.get(`/api/courses/${id}`),
  create: (data) => API.post("/api/courses", data),
  update: (id, data) => API.put(`/api/courses/${id}`, data),
  delete: (id) => API.delete(`/api/courses/${id}`),
};

// === PROFILE API METHODS ===
export const profileAPI = {
  getProfile: () => API.get("/api/profile"),
};

// === AUTH API METHODS ===
export const authAPI = {
  login: (data) => API.post("/api/auth/login", data),
  signup: (data) => API.post("/api/auth/signup", data),
};

// Default export
export default API;
