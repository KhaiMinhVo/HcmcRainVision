/**
 * Central HTTP client: baseURL, timeout, default headers, Bearer token, 401 handling
 */
import { getToken, clearToken } from '../lib/authStorage';
import { API_TIMEOUT_MS } from '../constants';

/** Build-time default (fallback khi không có config runtime). */
const defaultBaseURL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://prointegration-continuous-graham.ngrok-free.dev';

/** Base URL: ưu tiên config runtime (config.json) để deploy trỏ đúng backend, tránh timeout. */
function getBaseURL(): string {
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  return defaultBaseURL;
}

export const apiBaseURL = defaultBaseURL;

export interface ApiError {
  status: number;
  message: string;
  body?: unknown;
}

function buildUrl(path: string): string {
  const base = getBaseURL().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function redirectToLogin(): void {
  clearToken();
  const returnUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname + window.location.search) : '';
  const to = returnUrl ? `/login?returnUrl=${returnUrl}` : '/login';
  if (typeof window !== 'undefined') {
    window.location.href = to;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout = API_TIMEOUT_MS, ...init } = options;
  const url = buildUrl(path);
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Ngrok free: bỏ qua trang cảnh báo trình duyệt, cho phép request từ FE chạy qua
  if (getBaseURL().includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (res.status === 401) {
      redirectToLogin();
      let message = 'Unauthorized';
      try {
        const data = await res.json().catch(() => ({}));
        if (data && typeof data === 'object' && 'message' in data) {
          message = String((data as { message: string }).message);
        }
      } catch {
        /* ignore */
      }
      const err: ApiError = { status: 401, message, body: undefined };
      if (typeof console !== 'undefined' && console.error) {
        console.error('[apiClient] 401', path, res.status, message);
      }
      throw err;
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && typeof data === 'object' && 'message' in data)
          ? String((data as { message: string }).message)
          : (data && typeof data === 'object' && 'title' in data)
            ? String((data as { title: string }).title)
            : `Request failed: ${res.status}`;
      if (typeof console !== 'undefined' && console.error) {
        console.error('[apiClient]', res.status, path, data);
      }
      throw { status: res.status, message, body: data } as ApiError;
    }

    return data as T;
  } catch (e) {
    clearTimeout(id);
    if (e && typeof e === 'object' && 'status' in e) throw e;
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        throw { status: 0, message: 'Request timeout', body: undefined } as ApiError;
      }
      throw { status: 0, message: e.message || 'Network error', body: undefined } as ApiError;
    }
    throw { status: 0, message: 'Network error', body: undefined } as ApiError;
  }
}

/** GET with optional retry (idempotent). Max 3 attempts, exponential backoff. */
export async function apiGet<T>(
  path: string,
  options?: { retries?: number; timeout?: number }
): Promise<T> {
  const retries = options?.retries ?? 0;
  let lastErr: ApiError | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiRequest<T>(path, { method: 'GET', timeout: options?.timeout });
    } catch (e) {
      lastErr = e as ApiError;
      if (attempt < retries && lastErr.status >= 500) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastErr ?? { status: 0, message: 'Unknown error', body: undefined };
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}
/** POST with FormData (multipart). Do not set Content-Type so browser sets boundary. */
export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const url = buildUrl(path);
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (getBaseURL().includes('ngrok')) headers.set('ngrok-skip-browser-warning', 'true');

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'POST', body: formData, headers, signal: controller.signal });
    clearTimeout(id);
    if (res.status === 401) {
      redirectToLogin();
      throw { status: 401, message: 'Unauthorized', body: undefined } as ApiError;
    }
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const message = (data && typeof data === 'object' && 'message' in data) ? String((data as { message: string }).message) : `Request failed: ${res.status}`;
      throw { status: res.status, message, body: data } as ApiError;
    }
    return data as T;
  } catch (e) {
    clearTimeout(id);
    if (e && typeof e === 'object' && 'status' in e) throw e;
    throw { status: 0, message: e instanceof Error ? e.message : 'Network error', body: undefined } as ApiError;
  }
}
