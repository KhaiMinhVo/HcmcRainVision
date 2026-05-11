/**
 * Token storage for API client. AuthContext writes here; apiClient reads.
 */
import { STORAGE_KEYS } from '../constants';

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
}

export function setToken(token: string, persist: boolean): void {
  inMemoryToken = token;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch {
      /* ignore */
    }
  } else {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch {
      /* ignore */
    }
  }
}

export function clearToken(): void {
  inMemoryToken = null;
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch {
    /* ignore */
  }
}
