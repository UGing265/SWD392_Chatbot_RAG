import axios from "axios";

// Client for Go Backend (RAG, Chat, Document Approval)
export const ragApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8080/api",
});

// Client for Hono Backend (Better Auth endpoints)
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000/api",
});

// Request Interceptor: Automatically attach the Bearer token if it exists in localStorage
const tokenInterceptor = (config: any) => {
  if (typeof window !== "undefined") {
    // Better Auth store tokens in cookie or custom key, but let's read the stored JWT or cookie
    // If the frontend stores a custom token in localStorage, attach it
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

ragApi.interceptors.request.use(tokenInterceptor);
authApi.interceptors.request.use(tokenInterceptor);

// Response Interceptor: Globally handle 401 Unauthorized errors by redirecting to login
const responseErrorInterceptor = (error: any) => {
  if (error.response && error.response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Only redirect if not already on the login page to avoid redirect loops
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }
  return Promise.reject(error);
};

ragApi.interceptors.response.use((res: any) => res, responseErrorInterceptor);
authApi.interceptors.response.use((res: any) => res, responseErrorInterceptor);
