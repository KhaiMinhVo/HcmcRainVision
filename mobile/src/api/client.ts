/**
 * Axios HTTP client pre-configured for the HCM City Rain Vision backend.
 *
 * Usage:
 *   import apiClient, { setAuthToken } from "../api/client";
 *
 *   // Set token once after login (called in useAppStore.login)
 *   setAuthToken(token);
 *
 *   // Make requests
 *   const data = await apiClient.get("/api/Camera");
 */

import axios, { AxiosError, AxiosResponse } from "axios";

// Ưu tiên dùng base URL từ biến môi trường Expo (được cấu hình trong `.env`)
// Fallback sang backend cũ nếu biến môi trường không tồn tại.
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://hcmcrainvision-backend-r84u.onrender.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ─── Auth token management ────────────────────────────────────────────────────

/** Call this after login / on app start if a token is stored. */
export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

// ─── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.warn(
        `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`,
      );
    } else if (error.request) {
      console.warn("[API] No response received:", error.message);
    } else {
      console.warn("[API] Request setup error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
