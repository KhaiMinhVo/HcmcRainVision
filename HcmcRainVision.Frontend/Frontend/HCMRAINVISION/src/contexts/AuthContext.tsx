/**
 * AuthContext – JWT auth with backend API
 * login (username + password), signup, logout, forgotPassword, resetPassword, getMe
 */
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { setToken, clearToken, getToken } from '../lib/authStorage';
import * as authApi from '../services/authApi';
import type { UserProfileDto } from '../types/api';
import type { ApiError } from '../services/apiClient';

function profileToUser(p: UserProfileDto & { role?: string }): User {
  const role = p.Role ?? p.role;
  return {
    id: p.Id,
    username: p.Username,
    email: p.Email,
    name: p.FullName ?? p.Username,
    role: role ?? undefined,
    avatar: p.AvatarUrl ?? undefined,
    fullName: p.FullName,
    phoneNumber: p.PhoneNumber,
  };
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (body: { FullName?: string | null; PhoneNumber?: string | null; AvatarUrl?: string | null }) => Promise<void>;
  changePassword: (body: { OldPassword: string; NewPassword: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    return parsed && (parsed.id !== undefined && parsed.username) ? parsed : null;
  } catch {
    return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const profile = await authApi.getMe();
      const u = profileToUser(profile);
      setUser(u);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
      } catch {
        /* ignore */
      }
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      refreshUser();
    }, 0);
    return () => clearTimeout(t);
  }, [refreshUser]);
  useEffect(() => {
    if (!user || !getToken()) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude: Latitude, longitude: Longitude } = pos.coords;
        authApi.updateLocation({ Latitude, Longitude }).catch(() => {});
      },
      () => {},
      { maximumAge: 60000, timeout: 10000 }
    );
    return () => { cancelled = true; };
  }, [user?.id]);

  const login = useCallback(
    async (username: string, password: string, rememberMe = false) => {
      const res = await authApi.login({ Username: username.trim(), Password: password });
      setToken(res.token, rememberMe);
      const profile = await authApi.getMe();
      const u = profileToUser(profile);
      setUser(u);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    // Backend has no Google OAuth; show message or keep mock for demo
    throw new Error('Đăng nhập Google chưa được hỗ trợ. Vui lòng dùng tên đăng nhập và mật khẩu.');
  }, []);

  const signup = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register({
        Username: username.trim(),
        Email: email.trim(),
        Password: password,
      });
      // Do not auto-login; user must log in
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword({ Email: email.trim() });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await authApi.resetPassword({ Token: token, NewPassword: newPassword });
  }, []);

  const updateProfile = useCallback(async (body: { FullName?: string | null; PhoneNumber?: string | null; AvatarUrl?: string | null }) => {
    await authApi.updateProfile(body);
    await refreshUser();
  }, [refreshUser]);

  const changePassword = useCallback(async (body: { OldPassword: string; NewPassword: string }) => {
    await authApi.changePassword(body);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      loginWithGoogle,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      changePassword,
      refreshUser,
    }),
    [user, login, loginWithGoogle, signup, logout, forgotPassword, resetPassword, updateProfile, changePassword, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

/** Helper to get user-friendly message from API error */
export function getAuthErrorMessage(err: unknown): string {
  const e = err as ApiError | undefined;
  if (e && typeof e === 'object' && typeof e.message === 'string') return e.message;
  if (e && e.body && typeof e.body === 'object' && 'message' in e.body)
    return String((e.body as { message: string }).message);
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
