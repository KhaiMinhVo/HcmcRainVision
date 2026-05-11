import { create } from "zustand";
import { setAuthToken } from "../api/client";
import { mockAlerts } from "../data/mockAlerts";
import { mockAreas } from "../data/mockAreas";
import { mockCameras } from "../data/mockCameras";
import { weatherService } from "../services/weather";
import { Alert, Area, Camera } from "../types";

// Types
export interface User {
  username: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  phoneNumber?: string | null;
  districtName?: string | null;
  wardId?: string | null;
  wardName?: string | null;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Store State Interface
interface AppState {
  // Authentication State
  isAuthenticated: boolean;
  token: string | null;

  // Onboarding & Permissions State
  hasOnboarded: boolean;
  notificationEnabled: boolean;
  locationPermissionChoice: "while_using" | "only_once" | "denied" | null;
  isOffline: boolean;

  // Settings State
  units: "metric" | "imperial";
  offlineMode: boolean;

  // User Data
  user: User | null;

  // Data State
  cameras: Camera[];
  areas: Area[];
  alerts: Alert[];
  favorites: Camera[];
  isLoading: boolean;
  error: string | null;
  userLocation: UserLocation | null;
  lastUpdated: Date;

  // Authentication Actions
  login: (userData: User, token: string) => void;
  logout: () => void;

  // Onboarding Actions
  completeOnboarding: () => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setLocationPermission: (
    choice: "while_using" | "only_once" | "denied",
  ) => void;
  setOffline: (offline: boolean) => void;

  // Settings Actions
  setUnits: (units: "metric" | "imperial") => void;
  setOfflineMode: (offlineMode: boolean) => void;
  clearCache: () => void;

  // User Actions
  updateUser: (userData: Partial<User>) => void;

  // Camera actions
  setCameras: (cameras: Camera[]) => void;
  toggleFavorite: (cameraId: string) => void;

  // Area actions
  setAreas: (areas: Area[]) => void;

  // Alert actions
  setAlerts: (alerts: Alert[]) => void;
  markAlertRead: (alertId: string) => void;
  markAlertAsRead: (alertId: string) => void;
  getUnreadAlertsCount: () => number;

  // App state actions
  setLoading: (isLoading: boolean) => void;
  updateLastUpdated: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setUserLocation: (location: UserLocation) => void;

  // Filters
  syncWeatherData: () => Promise<void>;
  getCamerasByWeatherStatus: (status: string) => Camera[];
  getAreasByWeatherStatus: (status: string) => Area[];
  getOnlineCameras: () => Camera[];
  getOfflineCameras: () => Camera[];
  getFavoriteCameras: () => Camera[];
  getCamerasByRainStatus: (status: string) => Camera[];
  getAreasByRainStatus: (status: string) => Area[];

  // AI rain prediction per camera (from /api/Weather/test-ai)
  aiByCameraId: Record<string, { prediction: string; confidenceScore: string }>;
  setAiForCamera: (
    cameraId: string | number,
    data: { prediction: string; confidenceScore: string },
  ) => void;
}

const statusPriority: Record<string, number> = {
  none: 0,
  light: 1,
  medium: 2,
  heavy: 3,
};

const normalizeWeatherStatus = (value: any): string => {
  const raw = String(value || "").toLowerCase();
  if (["heavy", "high", "storm", "severe"].some((k) => raw.includes(k))) {
    return "heavy";
  }
  if (["medium", "moderate"].some((k) => raw.includes(k))) {
    return "medium";
  }
  if (["light", "drizzle", "low"].some((k) => raw.includes(k))) {
    return "light";
  }
  if (["none", "dry", "clear", "no-rain"].some((k) => raw.includes(k))) {
    return "none";
  }
  return "none";
};

const normalizeFromBoolean = (isRaining: any): string => {
  return isRaining ? "heavy" : "none";
};

const resolveWeatherStatus = (item: any): string => {
  if (typeof item?.isRaining === "boolean") {
    return normalizeFromBoolean(item.isRaining);
  }

  if (item?.weatherStatus) {
    return normalizeWeatherStatus(item.weatherStatus);
  }

  if (item?.rainStatus) {
    return normalizeWeatherStatus(item.rainStatus);
  }

  if (item?.intensity !== undefined) {
    if (typeof item.intensity === "number") {
      if (item.intensity >= 0.7) return "heavy";
      if (item.intensity >= 0.4) return "medium";
      if (item.intensity > 0) return "light";
      return "none";
    }
    return normalizeWeatherStatus(item.intensity);
  }

  return "none";
};

const useAppStore = create<AppState>((set, get) => ({
  // Authentication State
  isAuthenticated: false,
  token: null,

  // Onboarding & Permissions State
  hasOnboarded: false,
  notificationEnabled: true,
  locationPermissionChoice: null,
  isOffline: false,

  // Settings State
  units: "metric",
  offlineMode: false,

  // User Data
  user: null,

  // Data State
  cameras: mockCameras,
  areas: mockAreas,
  alerts: mockAlerts,
  favorites: [],
  isLoading: false,
  error: null,
  userLocation: null,
  lastUpdated: new Date(),

  aiByCameraId: {},

  // Authentication Actions
  login: (userData, token) => {
    setAuthToken(token);
    set({
      isAuthenticated: true,
      hasOnboarded: true,
      user: userData,
      token: token,
    });
  },

  logout: () => {
    setAuthToken(null);
    set({
      isAuthenticated: false,
      hasOnboarded: false,
      user: null,
      token: null,
    });
  },

  // Onboarding Actions
  completeOnboarding: () => set({ hasOnboarded: true }),
  setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),
  setLocationPermission: (choice) => set({ locationPermissionChoice: choice }),
  setOffline: (offline) => set({ isOffline: offline }),

  // Settings Actions
  setUnits: (units) => set({ units }),
  setOfflineMode: (offlineMode) => set({ offlineMode }),
  clearCache: () => {
    console.log("Cache cleared");
    // In real app, clear cached data
  },

  // User Actions
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  // Camera actions
  setCameras: (cameras) => set({ cameras }),

  toggleFavorite: (cameraId) =>
    set((state) => {
      const updatedCameras = state.cameras.map((c) =>
        c.id === cameraId ? { ...c, isFavorite: !c.isFavorite } : c,
      );
      const favorites = updatedCameras.filter((c) => c.isFavorite);
      return { cameras: updatedCameras, favorites };
    }),

  // Area actions
  setAreas: (areas) => set({ areas }),

  // Alert actions
  setAlerts: (alerts) => set({ alerts }),

  markAlertRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a,
      ),
    })),

  markAlertAsRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a,
      ),
    })),

  getUnreadAlertsCount: () => {
    const { alerts } = get();
    return alerts.filter((a) => !a.isRead).length;
  },

  // App state actions
  setLoading: (isLoading) => set({ isLoading }),
  updateLastUpdated: () => set({ lastUpdated: new Date() }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setUserLocation: (location) => set({ userLocation: location }),

  // Weather synchronization
  syncWeatherData: async () => {
    set({ isLoading: true });

    try {
      const { token, cameras, areas, alerts } = get();
      const [latestResult, heatmapResult] = await Promise.all([
        weatherService.getLatest(token || undefined),
        weatherService.getHeatmap(token || undefined),
      ]);

      const latestPayload = latestResult.success ? latestResult.data : null;
      const latestItems = Array.isArray(latestPayload)
        ? latestPayload
        : Array.isArray(latestPayload?.items)
          ? latestPayload.items
          : latestPayload
            ? [latestPayload]
            : [];

      const weatherByCameraId = new Map<string, string>();
      latestItems.forEach((item: any) => {
        const cameraId = item?.cameraId || item?.camera?.id || item?.id;
        if (!cameraId) return;
        weatherByCameraId.set(String(cameraId), resolveWeatherStatus(item));
      });

      const nextCameras = cameras.map((camera: any) => {
        const weatherStatus =
          weatherByCameraId.get(String(camera.id)) ||
          camera.weatherStatus ||
          camera.rainStatus ||
          "none";

        return {
          ...camera,
          weatherStatus,
          rainStatus: weatherStatus,
        };
      });

      const nextAreas = areas.map((area: any) => {
        const areaCameras = nextCameras.filter(
          (camera: any) =>
            camera.area === area.name || camera.areaId === area.id,
        );

        const topCameraStatus = areaCameras.reduce(
          (maxStatus: string, camera: any) => {
            const status = camera.weatherStatus || camera.rainStatus || "none";
            return statusPriority[status] > statusPriority[maxStatus]
              ? status
              : maxStatus;
          },
          "none",
        );

        return {
          ...area,
          weatherStatus: topCameraStatus,
          rainStatus: topCameraStatus,
        };
      });

      const weatherAlerts = nextAreas
        .filter((area: any) => ["heavy", "medium"].includes(area.weatherStatus))
        .map((area: any) => {
          const severity = area.weatherStatus === "heavy" ? "high" : "medium";
          return {
            id: `weather-${area.id}-${area.weatherStatus}`,
            title:
              area.weatherStatus === "heavy"
                ? "Severe Weather Warning"
                : "Weather Advisory",
            message:
              area.weatherStatus === "heavy"
                ? `Heavy rain detected in ${area.name}. Please stay cautious.`
                : `Moderate rain detected in ${area.name}.`,
            area: area.name,
            severity,
            timestamp: new Date(),
            isRead: false,
            weatherStatus: area.weatherStatus,
            type: "weather",
          } as Alert;
        });

      const existingRead = new Set(
        alerts.filter((a: any) => a.isRead).map((a: any) => a.id),
      );

      const mergedAlerts = weatherAlerts.map((alert: any) => ({
        ...alert,
        isRead: existingRead.has(alert.id),
      }));

      if (heatmapResult.success) {
        console.log("Weather heatmap points:", heatmapResult.data?.length || 0);
      }

      set({
        cameras: nextCameras,
        areas: nextAreas,
        alerts: mergedAlerts,
        isLoading: false,
        error: latestResult.success ? null : latestResult.error || null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.message || "Failed to sync weather data",
      });
    }
  },

  // Filters
  getCamerasByWeatherStatus: (status) => {
    const { cameras } = get();
    return cameras.filter(
      (c: any) => (c.weatherStatus || c.rainStatus || "none") === status,
    );
  },

  getAreasByWeatherStatus: (status) => {
    const { areas } = get();
    return areas.filter(
      (a: any) => (a.weatherStatus || a.rainStatus || "none") === status,
    );
  },

  getOnlineCameras: () => {
    const { cameras } = get();
    return cameras.filter((c) => c.isOnline);
  },

  getOfflineCameras: () => {
    const { cameras } = get();
    return cameras.filter((c) => !c.isOnline);
  },

  getFavoriteCameras: () => {
    const { cameras } = get();
    return cameras.filter((c) => c.isFavorite);
  },

  getCamerasByRainStatus: (status) => {
    const { getCamerasByWeatherStatus } = get();
    return getCamerasByWeatherStatus(status);
  },

  getAreasByRainStatus: (status) => {
    const { getAreasByWeatherStatus } = get();
    return getAreasByWeatherStatus(status);
  },

  setAiForCamera: (cameraId, data) =>
    set((state) => ({
      aiByCameraId: {
        ...state.aiByCameraId,
        [String(cameraId)]: data,
      },
    })),
}));

export default useAppStore;
